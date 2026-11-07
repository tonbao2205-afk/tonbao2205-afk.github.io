"""Point the website at the WebP copies of its product/menu images (08/11/2026, owner: GitHub beta first).

Scan 07/11 found pages load PNG/JPG originals of 1-2.4 MB each while the server already holds a WebP file
with the same name next to every one of them (573/573 refs checked by HEAD + WebP header; 90 samples across
all 12 folder groups compared pixel-wise: mean diff <= 0.7/255, same aspect ratio). This tool only swaps the
extension of refs listed in the allowlist; it never invents a path.

Scope
  * every .html/.js/.css under <web> except admin/ and assets/ (sitemap.xml and absolute
    https://maylehuong.com/... SEO metadata are left alone)
  * the two current home-app bundles (escaped \\uXXXX paths are decoded for the lookup). Bundles are immutable:
    edited copies get suffix -20261108-webp.js and index.html / index-mobile.html point to them
  * --products-in/--products-out: same swap inside every string of the products JSON (API snapshot)
  * ?v= of every edited top-level .js is set to 20261108-webp on every page that loads it

Usage: python -X utf8 -I tools/webp_refs_20261108.py <web> --allow tools/webp_allowlist_20261108.json
         [--products-in api.json --products-out api-webp.json] [--dry-run]
Idempotent; writes nothing unless every check passes. Refs not in the allowlist are reported, not changed.
"""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote

RX = re.compile(r'(?<![\w/.%:-])/?images/(?:\\u[0-9A-Fa-f]{4}|\\x[0-9A-Fa-f]{2}|[^"\'()<>,\n\\])+?\.(png|jpe?g)(?![A-Za-z0-9])', re.I)
ESC = re.compile(r'\\u([0-9A-Fa-f]{4})|\\x([0-9A-Fa-f]{2})')
SUFFIX = '-20261108-webp.js'
VER = '20261108-webp'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def key(raw):
    s = ESC.sub(lambda m: chr(int(m.group(1) or m.group(2), 16)), raw)
    if not s.startswith('/'):
        s = '/' + s
    return unquote(s)


class Swapper:
    def __init__(self, allow):
        self.allow = {unquote(a) for a in allow}
        self.unknown = {}
        self.count = 0

    def text(self, t, where):
        def f(m):
            raw = m.group(0)
            if key(raw) in self.allow:
                self.count += 1
                return raw[:-len(m.group(1))] + 'webp'
            self.unknown.setdefault(key(raw), set()).add(where)
            return raw
        return RX.sub(f, t)

    def obj(self, o, where):
        if isinstance(o, str):
            return self.text(o, where)
        if isinstance(o, list):
            return [self.obj(x, where) for x in o]
        if isinstance(o, dict):
            return {k: self.obj(v, where) for k, v in o.items()}
        return o


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--allow', required=True)
    ap.add_argument('--products-in')
    ap.add_argument('--products-out')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    sw = Swapper(json.load(open(a.allow, encoding='utf-8')))
    writes, errs = {}, []

    for p in root.rglob('*'):
        rel = p.relative_to(root).parts
        if not p.is_file() or p.suffix.lower() not in ('.html', '.js', '.css') or rel[0] in ('admin', 'assets'):
            continue
        t = rd(p)
        t2 = sw.text(t, '/'.join(rel))
        if t2 != t:
            writes[p] = t2

    for page in ('index.html', 'index-mobile.html'):
        p = root / page
        h = writes.get(p) or rd(p)
        m = re.findall(r'/assets/brand-20261017/(home-app-[a-z]+-[^"\s]+?\.js)', h)
        if len(m) != 1:
            errs.append(f'{page}: expected 1 home-app bundle, found {m}')
            continue
        name = m[0]
        if name.endswith(SUFFIX):
            continue
        b = rd(root / 'assets' / 'brand-20261017' / name)
        b2 = sw.text(b, name)
        if b2 != b:
            new = name[:-3] + SUFFIX
            writes[root / 'assets' / 'brand-20261017' / new] = b2
            writes[p] = h.replace(name, new)

    js = sorted(p.name for p in writes if p.suffix == '.js' and p.parent == root)
    n_pages = 0
    if js:
        rx = re.compile(r'((?:%s)\?v=)[^"\'&\s]+' % '|'.join(re.escape(n) for n in js))
        for p in root.rglob('*.html'):
            if p.relative_to(root).parts[0] in ('admin', 'assets'):
                continue
            h = writes.get(p) or rd(p)
            h2 = rx.sub(r'\g<1>' + VER, h)
            if h2 != h:
                writes[p] = h2
                n_pages += 1

    prod = None
    if a.products_in:
        prod = sw.obj(json.load(open(a.products_in, encoding='utf-8')), 'API')

    if sw.unknown:
        print('refs NOT in allowlist (left unchanged):', len(sw.unknown))
        for k, v in sorted(sw.unknown.items())[:40]:
            print('  ', k, sorted(v)[:3])
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    print('ok: refs swapped', sw.count, '| files to write', len(writes), '| edited js', js, '| pages ?v bumped', n_pages)
    if a.dry_run:
        return
    for p, t in writes.items():
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)
    if prod is not None:
        with open(a.products_out, 'w', encoding='utf-8') as f:
            json.dump(prod, f, ensure_ascii=False)


if __name__ == '__main__':
    main()
