"""Build the translated sites (/en/, /zh/ ...) from the Vietnamese public web root.

Usage:
  python -I tools/build_en_site.py --web <vi web root> --out <output dir> --products <api products json>
         --version <cache tag> [--strict] [--report report.json]

Output dir receives:
  en/**            English pages, English copies of shared JS (URL-rewritten only), en-dict.js, en-runtime.js
  lang-switch.js   language switcher used by both languages
  <vi pages>.html  Vietnamese pages with hreflang + switcher script added (only those changed)
  sitemap.xml      Vietnamese + English URLs

Vietnamese source pages are never modified in place.
"""
import argparse
import html
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import jslex  # noqa: E402
from en_i18n import Translator, has_vi, norm, LETTERS  # noqa: E402

SITE = 'https://maylehuong.com'
# Translated languages. Path prefix is /<key>/ ; dictionaries live in i18n/<key>/.
LANGS = {
    'en': {'html': 'en', 'hreflang': 'en', 'og': 'en_US', 'js_locale': 'en-US', 'joiner': ' '},
    'zh': {'html': 'zh-CN', 'hreflang': 'zh-Hans', 'og': 'zh_CN', 'js_locale': 'zh-CN', 'joiner': ''},
}
SKIP_PAGES = {'product-detail-sg.html', 'product-detail-tre.html', 'product-detail-vn.html',
              'phu-kien-detail.html', 'blazer.html'}
JS_COPIES = ['nav-component.js', 'footer-component.js', 'product-api.js', 'cta-widget.js',
             'site-data.js', 'luxury-animations.js', 'back-to-top.js']
TEXT_ATTRS = {'alt', 'title', 'placeholder', 'aria-label', 'data-tooltip', 'label'}
META_TEXT = {'description', 'keywords', 'og:title', 'og:description', 'og:image:alt', 'og:site_name',
             'twitter:title', 'twitter:description', 'twitter:image:alt', 'apple-mobile-web-app-title',
             'application-name'}
URL_ATTRS = {'href', 'src', 'srcset', 'poster', 'data-src', 'data-srcset', 'action', 'data-href', 'imagesrcset'}
JSONLD_KEEP = {'@type', '@context', '@id', 'url', 'item', 'image', 'logo', 'sameAs', 'telephone', 'email',
               'priceCurrency', 'price', 'streetAddress', 'addressLocality', 'addressRegion', 'postalCode',
               'addressCountry', 'latitude', 'longitude', 'availability', 'itemCondition', 'unitCode',
               'returnPolicyCategory', 'returnMethod', 'returnFees', 'applicableCountry', 'contentUrl',
               'thumbnailUrl', 'hasMap', 'openingHours', 'dayOfWeek', 'opens', 'closes', 'validFrom',
               'priceValidUntil', 'datePublished', 'dateModified', 'sku', 'gtin', 'mpn', 'currency',
               'target', 'urlTemplate', 'query-input', 'founder', 'legalName'}

TAG_RE = re.compile(r'<([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^\s=/>"\']+(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>"\']+))?)*)\s*(/?)>', re.S)
ATTR_RE = re.compile(r'(\s+)([^\s=/>"\']+)(?:(\s*=\s*)("[^"]*"|\'[^\']*\'|[^\s>"\']+))?', re.S)


# ====================================================================== HTML scanner
def scan(src):
    """Yield (kind, text) with kind in text|comment|doctype|endtag|tag|raw. Concatenation == src."""
    i, n = 0, len(src)
    while i < n:
        j = src.find('<', i)
        if j < 0:
            yield 'text', src[i:]
            return
        if j > i:
            yield 'text', src[i:j]
        i = j
        if src.startswith('<!--', i):
            k = src.find('-->', i + 4)
            k = n if k < 0 else k + 3
            yield 'comment', src[i:k]; i = k; continue
        if src.startswith('<!', i):
            k = src.find('>', i)
            k = n if k < 0 else k + 1
            yield 'doctype', src[i:k]; i = k; continue
        if src.startswith('</', i):
            k = src.find('>', i)
            k = n if k < 0 else k + 1
            yield 'endtag', src[i:k]; i = k; continue
        m = TAG_RE.match(src, i)
        if not m:
            yield 'text', '<'; i += 1; continue
        yield 'tag', m.group(0)
        i = m.end()
        name = m.group(1).lower()
        if name in ('script', 'style', 'textarea') and not m.group(3):
            close = re.compile(r'</' + name + r'\s*>', re.I).search(src, i)
            k = n if not close else close.start()
            yield 'raw:' + name, src[i:k]
            i = k


def parse_attrs(tag):
    m = TAG_RE.match(tag)
    return m.group(1).lower(), [(a.group(1), a.group(2), a.group(3), a.group(4)) for a in ATTR_RE.finditer(m.group(2))]


def attr_value(raw):
    if raw is None:
        return None
    if raw[:1] in '"\'':
        raw = raw[1:-1]
    return html.unescape(raw)


def build_tag(tag, attrs, selfclose):
    m = TAG_RE.match(tag)
    parts = ['<', m.group(1)]
    for ws, k, eq, v in attrs:
        parts.append(ws + k)
        if eq is not None:
            parts.append(eq + v)
    ws_before = re.search(r'(\s*)/?>$', tag).group(1)
    parts.append(ws_before + ('/>' if m.group(3) else '>'))
    return ''.join(parts)


def q(v):
    return '"' + v.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;') + '"'


def esc_text(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def decode_js(s):
    if '\\' not in s:
        return s

    def rep(m):
        t = m.group(1)
        if t[0] == 'u':
            return chr(int(t[2:-1] if t[1] == '{' else t[1:], 16))
        if t[0] == 'x':
            return chr(int(t[1:], 16))
        return {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}.get(t, t)
    return re.sub(r'\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)', rep, s, flags=re.S)


# ====================================================================== builder
class Builder:
    def __init__(self, web, out, products, i18n_dir, version, lang='en', all_langs=('en',)):
        self.web, self.out, self.version = Path(web), Path(out), version
        self.lang, self.L, self.all_langs = lang, LANGS[lang], list(all_langs)
        self.pfx = '/' + lang
        self.products = products
        names = [p.get('name') for p in products]
        codes = [c for p in products for c in [p.get('sku'), p.get('legacyId')] + list(p.get('kiot_codes') or []) if c]
        self.tr = Translator(i18n_dir, names, codes, joiner=self.L['joiner'])
        self.pages = sorted(p.name for p in self.web.glob('*.html')
                            if p.name not in SKIP_PAGES and not p.name.startswith('zalo_verifier'))
        self.product_pages = sorted(p.name for p in (self.web / 'san-pham').glob('*.html'))
        self.page_set = set(self.pages)
        self.report = {'pages': [], 'vi_left': {}, 'js_url_rewrites': {}}

    # ------------------------------------------------------------------ URLs
    def en_page_url(self, path, pfx=None):
        """Map a Vietnamese site path ('/', '/x.html', '/san-pham/y.html') to the translated one, else None."""
        pfx = pfx or self.pfx
        m = re.match(r'([^?#]*)(.*)$', path, re.S)
        base, tail = m.group(1), m.group(2)
        if base == '/' or base in ('/index.html', '/index-mobile.html'):
            return pfx + '/' + tail
        m = re.fullmatch(r'/([a-z0-9-]+)(\.html)?', base)
        if m and (m.group(1) + '.html') in self.page_set:
            return pfx + '/' + m.group(1) + (m.group(2) or '') + tail
        if re.fullmatch(r'/san-pham/([A-Za-z0-9_-]+\.html)?', base):
            return pfx + base + tail
        return None

    def rewrite_href(self, v, tag):
        s = v.strip()
        if not s or s.startswith(('#', 'tel:', 'mailto:', 'javascript:', 'data:', 'sms:', 'zalo:', 'viber:')):
            return v
        if re.match(r'https?://(www\.)?(maylehuong\.com|dzuongtailor\.com)(/|$)', s):
            path = re.sub(r'^https?://[^/]+', '', s) or '/'
            en = self.en_page_url(path)
            return (SITE + en) if en else v
        if re.match(r'[a-z]+:', s) or s.startswith('//'):
            return v
        if s.startswith('/'):
            if s.startswith(('/api/', '/admin', '/q/', '/uploads/', '/images/', '/videos/', '/assets/performance/')):
                return v
            en = self.en_page_url(s)
            if en:
                return en
            mjs = re.fullmatch(r'/([a-z0-9-]+\.js)(\?.*)?', s)
            if mjs and mjs.group(1) in JS_COPIES:
                return self.pfx + s
            if s.startswith('/assets/brand-20261017/') and re.search(r'\.js(\?|$)', s):
                return self.pfx + s
            return v
        # relative
        base = s.split('?')[0].split('#')[0]
        if base.endswith('.html'):
            name = base.split('/')[-1]
            if base.startswith('san-pham/') or name in self.page_set or base in self.page_set:
                return v
            return self._abs(s)
        if base in JS_COPIES:
            return v  # resolves to /en/<copy>
        return self._abs(s)

    def rewrite_res(self, v):
        """Resource attribute (src etc.) – make relative paths absolute."""
        s = v.strip()
        if not s or re.match(r'[a-z]+:', s) or s.startswith(('/', '#', '//')):
            if s.startswith('/'):
                mjs = re.fullmatch(r'/([a-z0-9-]+\.js)(\?.*)?', s)
                if mjs and mjs.group(1) in JS_COPIES:
                    return self.pfx + s
                if s.startswith('/assets/brand-20261017/') and re.search(r'\.js(\?|$)', s):
                    return self.pfx + s
            return v
        if s.split('?')[0] in JS_COPIES:
            return v
        return self._abs(s)

    def _abs(self, s):
        import posixpath
        d = getattr(self, 'cur_dir', '')
        return posixpath.normpath('/' + (d + '/' if d else '') + s) + ('/' if s.endswith('/') and s != '/' else '')

    def rewrite_srcset(self, v):
        out = []
        for part in v.split(','):
            p = part.strip()
            if not p:
                continue
            bits = p.split(None, 1)
            bits[0] = self.rewrite_res(bits[0])
            out.append(' '.join(bits))
        return ', '.join(out)

    def css_urls(self, css):
        return re.sub(r'url\(\s*([\'"]?)(?!data:|https?:|/|#)([^\'")]+)\1\s*\)', lambda m: 'url(%s%s%s)' % (m.group(1), self._abs(m.group(2)), m.group(1)), css)

    # ------------------------------------------------------------------ JS (URL rewrite only)
    def js_url_rewrite(self, src, where):
        lits = jslex.literals(src)
        out, pos, n = [], 0, 0
        for l in lits:
            content = src[l['start']:l['end']]
            new = self.js_literal_url(content, l)
            if new != content:
                out.append(src[pos:l['start']]); out.append(new); pos = l['end']; n += 1
        out.append(src[pos:])
        if n:
            self.report['js_url_rewrites'][where] = self.report['js_url_rewrites'].get(where, 0) + n
        return ''.join(out)

    def js_literal_url(self, c, l):
        if c in ('vi-VN',):
            return self.L['js_locale']
        if c == 'vi_VN':
            return self.L['og']
        m = re.fullmatch(r'(https://maylehuong\.com)?(/[^\s\'"`<>\\]*)', c)
        if m:
            host, path = m.group(1) or '', m.group(2)
            if path == '/' and not host:
                return c  # bare '/' is used as a path separator in code
            if path.startswith('/san-pham/'):
                return host + self.pfx + path
            en = self.en_page_url(path)
            return host + en if en else c
        # HTML-ish literals: rewrite href="/x.html" inside markup
        if '<' in c or 'href=' in c:
            return re.sub(r'(href\s*=\s*\\?["\'])(/[^"\'\\\s>]*)',
                          lambda mm: mm.group(1) + (self.en_page_url(mm.group(2)) or mm.group(2)), c)
        return c

    # ------------------------------------------------------------------ JSON-LD
    def jsonld(self, raw, is_product):
        try:
            data = json.loads(raw)
        except Exception:
            return raw

        def walk(o, key=None):
            if isinstance(o, dict):
                o.pop('aggregateRating', None)
                o.pop('review', None)
                return {k: walk(v, k) for k, v in o.items()}
            if isinstance(o, list):
                return [walk(x, key) for x in o]
            if isinstance(o, str):
                if key in ('url', 'item', '@id') and o.startswith(SITE):
                    path = o[len(SITE):] or '/'
                    frag = ''
                    if '#' in path:
                        path, _, f = path.partition('#'); frag = '#' + f
                    if frag and path in ('', '/') :
                        return o  # organization / website / store entity ids stay shared
                    en = self.en_page_url(path or '/')
                    return SITE + en + frag if en else o
                if key == 'inLanguage':
                    return self.L['html']
                if key in JSONLD_KEEP:
                    return o
                if has_vi(o) or (LETTERS.search(o) and norm(o) in self.tr.units):
                    return self.tr.translate(o, context='[json-ld:%s] %s' % (key, o[:120]))
            return o
        data = walk(data)
        if isinstance(data, dict) and '@graph' in data:
            data['@graph'] = [g for g in data['@graph'] if not (isinstance(g, dict) and g.get('@type') == 'Review')]
        return json.dumps(data, ensure_ascii=False)

    # ------------------------------------------------------------------ page
    def build_page(self, rel, src, is_product):
        """Return English HTML for the page at site path rel ('vest-nu.html' or 'san-pham/p01.html')."""
        self.cur_dir = rel.rsplit('/', 1)[0] if '/' in rel else ''
        if is_product:
            src = self.strip_reviews(src)
        vi_url = self.vi_url(rel)
        en_url = self.en_url(rel)
        noindex = bool(re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', src, re.I))
        out = []
        stack = []
        skip_depth = None
        head_done = False
        for kind, tok in scan(src):
            if kind == 'tag':
                name, attrs = parse_attrs(tok)
                selfclose = tok.rstrip().endswith('/>')
                d = {k.lower(): attr_value(v) for _, k, _, v in attrs}
                new_attrs = []
                for ws, k, eq, v in attrs:
                    kl = k.lower()
                    val = attr_value(v)
                    if val is not None:
                        nv = val
                        if name == 'html' and kl == 'lang':
                            nv = self.L['html']
                        elif kl in TEXT_ATTRS and LETTERS.search(val):
                            nv = self.tr.translate(val, context='[%s@%s] %s' % (name, kl, rel))
                        elif kl == 'content' and name == 'meta' and (d.get('name') in META_TEXT or d.get('property') in META_TEXT):
                            nv = self.tr.translate(val, context='[meta %s] %s' % (d.get('name') or d.get('property'), rel))
                        elif kl == 'content' and name == 'meta' and d.get('property') == 'og:locale':
                            nv = self.L['og']
                        elif kl == 'content' and name == 'meta' and d.get('property') == 'og:url':
                            nv = SITE + en_url
                        elif kl == 'value' and name in ('input', 'button') and (d.get('type') in ('submit', 'button', 'reset')):
                            nv = self.tr.translate(val, context='[input value] ' + rel)
                        elif kl == 'href' and name == 'link' and (d.get('rel') or '').lower() == 'canonical':
                            nv = SITE + en_url
                        elif kl in ('href', 'action', 'data-href'):
                            nv = self.rewrite_href(val, name)
                        elif kl in ('srcset', 'data-srcset', 'imagesrcset'):
                            nv = self.rewrite_srcset(val)
                        elif kl in URL_ATTRS:
                            nv = self.rewrite_res(val)
                        elif kl == 'style':
                            nv = self.css_urls(val)
                        elif kl.startswith('on'):
                            nv = self.js_url_rewrite(val, rel + ' @' + kl)
                        if nv != val:
                            v = q(nv)
                    new_attrs.append((ws, k, eq, v))
                tok = build_tag(tok, new_attrs, False)
                # hreflang + runtime into <head>
                if name == 'link' and (d.get('rel') or '').lower() == 'canonical' and not noindex:
                    tok += self.hreflang(rel)
                if name == 'meta' and (d.get('property') == 'og:locale'):
                    tok += ''.join('\n  <meta property="og:locale:alternate" content="%s" />' % o
                                   for o in ['vi_VN'] + [LANGS[x]['og'] for x in self.all_langs if x != self.lang])
                if name == 'head' and not head_done:
                    head_done = True
                    tok += ('\n  <script src="%s/%s-dict.js?v=%s"></script>'
                            '\n  <script src="%s/%s-runtime.js?v=%s"></script>') % (
                                self.pfx, self.lang, self.version, self.pfx, self.lang, self.version)
                out.append(tok)
                continue
            if kind == 'text':
                if LETTERS.search(tok):
                    raw = html.unescape(tok)
                    tr = self.tr.translate(raw, context=rel)
                    if tr != raw:
                        tok = esc_text(tr)
                    elif not has_vi(raw):
                        self.tr.ascii_seen.setdefault(norm(raw), rel)
                out.append(tok)
                continue
            if kind == 'raw:script':
                out.append(self.script_body(tok, out, rel, is_product))
                continue
            if kind == 'raw:style':
                out.append(self.css_urls(tok))
                continue
            if kind == 'raw:textarea':
                out.append(tok)
                continue
            out.append(tok)
        page = ''.join(out)
        if '</body>' in page:
            page = page.replace('</body>', '<script src="/lang-switch.js?v=%s" defer></script>\n</body>' % self.version, 1)
        return page

    def script_body(self, body, out, rel, is_product):
        # find the opening tag just emitted
        open_tag = out[-1] if out else ''
        if re.search(r'type\s*=\s*["\']application/ld\+json', open_tag, re.I):
            return self.jsonld(body, is_product)
        if re.search(r'type\s*=\s*["\'](text/plain|text/template|application/json)', open_tag, re.I):
            return body
        return self.js_url_rewrite(body, rel + ' <script>')

    def strip_reviews(self, page):
        i = page.find('<div id="tab-reviews"')
        if i < 0:
            return page
        j = page.find('<!-- RELATED PRODUCTS', i)
        seg = page[i:j]
        # Generated reviews are not carried into English; keep only the showroom / warranty box.
        p = seg.find('>Showroom mayLEHUONG Bi')
        k = seg.rfind('<div', 0, p) if p > 0 else -1
        if k <= 0:
            raise AssertionError('review panel layout changed')
        cut_start = seg.find('>') + 1
        self.report['reviews_removed'] = self.report.get('reviews_removed', 0) + 1
        return page[:i] + seg[:cut_start] + '\n' + seg[k:] + page[j:]

    def hreflang(self, rel):
        vi = SITE + self.vi_url(rel)
        out = '\n  <link rel="alternate" hreflang="vi" href="%s" />' % vi
        for x in self.all_langs:
            out += '\n  <link rel="alternate" hreflang="%s" href="%s" />' % (LANGS[x]['hreflang'], SITE + self.en_url(rel, '/' + x))
        return out + '\n  <link rel="alternate" hreflang="x-default" href="%s" />' % vi

    def vi_url(self, rel):
        if rel in ('index.html', 'index-mobile.html'):
            return '/'
        return '/' + rel

    def en_url(self, rel, pfx=None):
        pfx = pfx or self.pfx
        if rel in ('index.html', 'index-mobile.html'):
            return pfx + '/'
        return pfx + '/' + rel

    # ------------------------------------------------------------------ VI page patch
    def patch_vi(self, rel, src):
        noindex = bool(re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', src, re.I))
        new = src
        if not noindex and 'rel="alternate" hreflang=' not in src:
            m = re.search(r'<link\s+rel=["\']canonical["\'][^>]*>', new)
            if m:
                ins = self.hreflang(rel)
                if '\r\n' in src:
                    ins = ins.replace('\n', '\r\n')
                new = new[:m.end()] + ins + new[m.end():]
        if '/lang-switch.js' not in new and '</body>' in new:
            new = new.replace('</body>', '<script src="/lang-switch.js?v=%s" defer></script>\n</body>' % self.version, 1)
        return new

    # ------------------------------------------------------------------ runtime dictionary
    PRODUCT_SKIP = {'img', 'images', 'url', 'link', 'slug', 'id', 'updated_by', 'created_by', 'imported_from',
                    'legacyId', 'sku', 'kiot_codes', 'category', 'subcategory', 'status', 'availability',
                    'stock_reason', 'updated_at', 'created_at', 'imported_at', 'stock_updated_at', 'option_id'}

    def runtime_strings(self, extra=()):
        out = []

        def add(v):
            if isinstance(v, str) and (has_vi(v) or norm(v) in self.tr.units):
                out.append(v)

        def walk(o, key=None):
            if key in self.PRODUCT_SKIP:
                return
            if isinstance(o, dict):
                for k, v in o.items():
                    add(k)
                    walk(v, k)
            elif isinstance(o, list):
                for x in o:
                    walk(x, key)
            else:
                add(o)
        for p in self.products:
            walk(p)
        files = [self.web / js for js in JS_COPIES] + sorted((self.web / 'assets/brand-20261017').glob('home-app-*.js'))
        for f in files:
            src = rd(f)
            for l in jslex.literals(src):
                lit = decode_js(src[l['start']:l['end']])
                if not has_vi(lit) and norm(lit) not in self.tr.units:
                    continue
                if '<' in lit:
                    for kind, tok in scan(lit):
                        if kind == 'text':
                            add(html.unescape(tok))
                        elif kind == 'tag':
                            for _, k, _, v in parse_attrs(tok)[1]:
                                if k.lower() in TEXT_ATTRS:
                                    add(attr_value(v))
                else:
                    add(lit)
        for s in extra:
            add(s)
        return out

    def write_runtime(self, extra):
        self.tr.hits = set()
        seen = set()
        for s in self.runtime_strings(extra):
            k = norm(s)
            if k in seen:
                continue
            seen.add(k)
            self.tr.translate(s, context='[runtime] ' + k[:100])
        units = {k: self.tr.units[k] for kind, k in sorted(self.tr.hits) if kind == 'u' and k in self.tr.units}
        names = dict(sorted(self.tr.names.items()))
        payload = json.dumps({'v': self.version, 'l': self.lang, 'p': self.pfx, 'j': self.L['joiner'], 'loc': self.L['js_locale'],
                              'u': units, 'n': names, 'c': list(self.tr.codes)}, ensure_ascii=False, separators=(',', ':'))
        (self.out / self.lang / (self.lang + '-dict.js')).write_bytes(('window.MLH_I18N=' + payload + ';\n').encode('utf-8'))
        self.report['runtime_units'] = len(units)
        self.report['runtime_bytes'] = len(payload.encode('utf-8'))
        return len(seen)

    # ------------------------------------------------------------------ runtime dictionary
    PRODUCT_SKIP = {'img', 'images', 'url', 'link', 'slug', 'id', 'updated_by', 'created_by', 'imported_from',
                    'legacyId', 'sku', 'kiot_codes', 'category', 'subcategory', 'status', 'availability',
                    'stock_reason', 'updated_at', 'created_at', 'imported_at', 'stock_updated_at', 'option_id'}

    def runtime_strings(self, extra=()):
        out = []

        def add(v):
            if isinstance(v, str) and (has_vi(v) or norm(v) in self.tr.units):
                out.append(v)

        def walk(o, key=None):
            if key in self.PRODUCT_SKIP:
                return
            if isinstance(o, dict):
                for k, v in o.items():
                    add(k)
                    walk(v, k)
            elif isinstance(o, list):
                for x in o:
                    walk(x, key)
            else:
                add(o)
        for p in self.products:
            walk(p)
        files = [self.web / js for js in JS_COPIES] + sorted((self.web / 'assets/brand-20261017').glob('home-app-*.js'))
        for f in files:
            src = rd(f)
            for l in jslex.literals(src):
                lit = decode_js(src[l['start']:l['end']])
                if not has_vi(lit) and norm(lit) not in self.tr.units:
                    continue
                if '<' in lit:
                    for kind, tok in scan(lit):
                        if kind == 'text':
                            add(html.unescape(tok))
                        elif kind == 'tag':
                            for _, k, _, v in parse_attrs(tok)[1]:
                                if k.lower() in TEXT_ATTRS:
                                    add(attr_value(v))
                else:
                    add(lit)
        for s in extra:
            add(s)
        return out

    def write_runtime(self, extra):
        self.tr.hits = set()
        seen = set()
        for s in self.runtime_strings(extra):
            k = norm(s)
            if k in seen:
                continue
            seen.add(k)
            self.tr.translate(s, context='[runtime] ' + k[:100])
        units = {k: self.tr.units[k] for kind, k in sorted(self.tr.hits) if kind == 'u' and k in self.tr.units}
        names = dict(sorted(self.tr.names.items()))
        payload = json.dumps({'v': self.version, 'l': self.lang, 'p': self.pfx, 'j': self.L['joiner'], 'loc': self.L['js_locale'],
                              'u': units, 'n': names, 'c': list(self.tr.codes)}, ensure_ascii=False, separators=(',', ':'))
        (self.out / self.lang / (self.lang + '-dict.js')).write_bytes(('window.MLH_I18N=' + payload + ';\n').encode('utf-8'))
        self.report['runtime_units'] = len(units)
        self.report['runtime_bytes'] = len(payload.encode('utf-8'))
        return len(seen)

    # ------------------------------------------------------------------ sitemap
    def sitemap(self):
        src = rd(self.web / 'sitemap.xml')
        assert 'xmlns:xhtml' not in src, 'sitemap already has alternates'
        head, sep, body = src.partition('<url>')
        blocks = re.findall(r'<url>.*?</url>', src, re.S)
        out = []
        added = 0
        for blk in blocks:
            loc = re.search(r'<loc>([^<]+)</loc>', blk).group(1)
            path = loc[len(SITE):] if loc.startswith(SITE) else None
            en = self.en_page_url(path) if path else None
            if not en:
                out.append(blk)
                continue
            alt = ('\n    <xhtml:link rel="alternate" hreflang="vi" href="%s"/>'
                   '\n    <xhtml:link rel="alternate" hreflang="en" href="%s"/>'
                   '\n    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>') % (loc, SITE + en, loc)
            vi_blk = blk.replace('</loc>', '</loc>' + alt, 1)
            en_blk = vi_blk.replace('<loc>%s</loc>' % loc, '<loc>%s</loc>' % (SITE + en), 1)
            out.append(vi_blk)
            out.append(en_blk)
            added += 1
        head = head.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')
        tail = src[src.rfind('</url>') + len('</url>'):]
        (self.out / 'sitemap.xml').write_bytes((head + '\n  '.join(out) + tail).encode('utf-8'))
        self.report['sitemap_en_urls'] = added

    # ------------------------------------------------------------------ run
    def run(self, patch_vi=True):
        en_root = self.out / self.lang
        en_root.mkdir(parents=True, exist_ok=True)
        (en_root / 'san-pham').mkdir(exist_ok=True)
        written = []
        for name in self.pages:
            src = rd(self.web / name)
            (en_root / name).write_bytes(self.build_page(name, src, False).encode('utf-8'))
            written.append(self.lang + '/' + name)
            vi = self.patch_vi(name, src) if patch_vi else src
            if vi != src:
                (self.out / name).write_bytes(vi.encode('utf-8'))
                written.append(name)
        for name in self.product_pages:
            rel = 'san-pham/' + name
            src = rd(self.web / rel)
            (en_root / rel).write_bytes(self.build_page(rel, src, True).encode('utf-8'))
            written.append(self.lang + '/' + rel)
            vi = self.patch_vi(rel, src) if patch_vi else src
            if vi != src:
                (self.out / 'san-pham').mkdir(exist_ok=True)
                (self.out / rel).write_bytes(vi.encode('utf-8'))
                written.append(rel)
        # JS copies (URL rewrite only)
        for js in JS_COPIES:
            src = rd(self.web / js)
            (en_root / js).write_bytes(self.js_url_rewrite(src, js).encode('utf-8'))
            written.append(self.lang + '/' + js)
        for b in sorted((self.web / 'assets/brand-20261017').glob('home-app-*.js')):
            dst = en_root / 'assets/brand-20261017' / b.name
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_bytes(self.js_url_rewrite(rd(b), b.name).encode('utf-8'))
            written.append(self.lang + '/assets/brand-20261017/' + b.name)
        self.report['written'] = len(written)
        return written


def sitemap(b0, out, langs):
    src = rd(b0.web / 'sitemap.xml')
    assert 'xmlns:xhtml' not in src, 'sitemap already has alternates'
    head = src.partition('<url>')[0]
    blocks = re.findall(r'<url>.*?</url>', src, re.S)
    res, added = [], 0
    for blk in blocks:
        loc = re.search(r'<loc>([^<]+)</loc>', blk).group(1)
        path = loc[len(SITE):] if loc.startswith(SITE) else None
        urls = {x: b0.en_page_url(path, '/' + x) for x in langs} if path else {}
        if not path or not all(urls.values()):
            res.append(blk)
            continue
        alt = '\n    <xhtml:link rel="alternate" hreflang="vi" href="%s"/>' % loc
        for x in langs:
            alt += '\n    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (LANGS[x]['hreflang'], SITE + urls[x])
        alt += '\n    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % loc
        vi_blk = blk.replace('</loc>', '</loc>' + alt, 1)
        res.append(vi_blk)
        for x in langs:
            res.append(vi_blk.replace('<loc>%s</loc>' % loc, '<loc>%s</loc>' % (SITE + urls[x]), 1))
        added += 1
    head = head.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')
    tail = src[src.rfind('</url>') + len('</url>'):]
    (out / 'sitemap.xml').write_bytes((head + '\n  '.join(res) + tail).encode('utf-8'))
    return added


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--web', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--products', required=True)
    ap.add_argument('--langs', default='en', help='comma separated, e.g. en,zh')
    ap.add_argument('--i18n-root', default=str(HERE.parent / 'i18n'))
    ap.add_argument('--version', required=True)
    ap.add_argument('--report')
    ap.add_argument('--strict', action='store_true')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    langs = [x.strip() for x in a.langs.split(',') if x.strip()]
    for x in langs:
        assert x in LANGS, 'unknown language ' + x
    products = json.loads(rd(Path(a.products)))
    out = Path(a.out)
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    reps, full, fail = {}, {}, False
    b0 = None
    for n, x in enumerate(langs):
        i18n = Path(a.i18n_root) / x
        b = Builder(a.web, out, products, i18n, a.version, x, langs)
        b0 = b0 or b
        written = b.run(patch_vi=(n == 0))
        seen_file = Path(a.i18n_root) / 'en' / 'runtime-seen.json'
        extra = json.loads(rd(seen_file)) if seen_file.exists() else []
        n_rt = b.write_runtime(extra)
        (out / x / (x + '-runtime.js')).write_bytes(rd(HERE / 'en_assets' / 'en-runtime.js').encode('utf-8'))
        reps[x] = {'written': len(written), 'runtime_strings': n_rt, 'runtime_units': b.report.get('runtime_units'),
                   'runtime_bytes': b.report.get('runtime_bytes'), 'reviews_removed': b.report.get('reviews_removed'),
                   'missing_units': len(b.tr.missing), 'missing_names': len(b.tr.missing_names),
                   'js_url_rewrites': sum(b.report['js_url_rewrites'].values())}
        full[x] = {'missing': b.tr.missing, 'missing_names': b.tr.missing_names, 'ascii_seen': b.tr.ascii_seen}
        fail = fail or bool(b.tr.missing or b.tr.missing_names)
    (out / 'lang-switch.js').write_bytes(rd(HERE / 'en_assets' / 'lang-switch.js').encode('utf-8'))
    reps['sitemap_urls_per_lang'] = sitemap(b0, out, langs)
    if a.report:
        Path(a.report).write_text(json.dumps({'summary': reps, **full}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(reps, ensure_ascii=False, indent=1))
    if a.strict and fail:
        sys.exit(2)


if __name__ == '__main__':
    main()
