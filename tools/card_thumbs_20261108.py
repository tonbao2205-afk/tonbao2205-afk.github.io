"""Card thumbnails for product listing grids (08/11/2026, GitHub preview first; owner: "trien khai cac ke hoach").

Listing cards (vest-nu, vest-nam-*, products, phu-kien*) show product photos at ~170-320 CSS px but download the full
1200-1800px WebP (tie page ~4 MB). This tool:
  1. collects every image a card can show: all `images` + `img` of each product in the API snapshot (cards with
     arrows/dots cycle through all of them) and the pre-rendered <img> inside `.vn-thumb` blocks of listing pages;
  2. downloads each original from https://maylehuong.com (cache dir), makes a <=600px-wide WebP (q80) and keeps it
     only if it is <80% of the original, saved as assets/card-thumbs-20261108/<fnv1a32 hex>.webp
     (key = resolved path, percent-decoded, NFC; same hash in JS -> no Vietnamese literals for the i18n build);
  3. product-api.js: adds MLH_API.cardImageUrl(url) = thumb if the hash is in CARD_THUMBS else getProductImageUrl(url),
     used by createProductCardHTML; listing pages' card code switches MLH_API.getProductImageUrl( -> cardImageUrl(;
     pre-rendered card <img src> -> thumb; product-api.js?v= -> 20261108-thumbs on every page.
Detail pages, galleries, cart and SEO/og images keep the full image. Images with no thumb fall back to the original.

Usage: python -X utf8 -I tools/card_thumbs_20261108.py <web_root> --products <api products json> --cache <dir> [--dry-run]
Idempotent (marker CARD_THUMBS in product-api.js); writes nothing if any expected replacement is missing.
"""
import argparse
import concurrent.futures as cf
import io
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path
from urllib.parse import quote, unquote

from PIL import Image, ImageOps

ORIGIN = 'https://maylehuong.com'
OUT_DIR = 'assets/card-thumbs-20261108'
VER_OLD = re.compile(r'product-api\.js\?v=[^"\'\s>]*')
VER_NEW = 'product-api.js?v=20261108-thumbs'
PAGES = ['phu-kien-ca-vat.html', 'phu-kien-cai-ca-vat.html', 'phu-kien-giay-tay.html', 'phu-kien-khan-lua.html',
         'phu-kien-no.html', 'phu-kien-so-mi.html', 'phu-kien.html', 'products.html', 'vest-nam-tre.html',
         'vest-nam-trung-nien.html', 'vest-nu.html']
CALLS = {  # expected number of card-image calls per page
    'phu-kien-ca-vat.html': 1, 'phu-kien-cai-ca-vat.html': 1, 'phu-kien-giay-tay.html': 1, 'phu-kien-khan-lua.html': 1,
    'phu-kien-no.html': 1, 'phu-kien-so-mi.html': 1, 'phu-kien.html': 1, 'products.html': 1,
    'vest-nam-tre.html': 2, 'vest-nam-trung-nien.html': 2, 'vest-nu.html': 3}
MAX_W, QUALITY, KEEP_RATIO = 600, 80, 0.8

JS_HELPERS = r'''
  // Card thumbnails (<=600px WebP) for listing grids; key = FNV-1a 32 of the decoded NFC path. Full image if absent.
  const CARD_THUMBS = new Set(%s);
  function cardThumbKey(path) {
    let s = path;
    try { s = decodeURIComponent(s); } catch (e) { /* keep raw */ }
    if (s.normalize) s = s.normalize('NFC');
    const b = new TextEncoder().encode(s);
    let h = 0x811c9dc5;
    for (let i = 0; i < b.length; i++) { h ^= b[i]; h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function cardImageUrl(url) {
    const full = getProductImageUrl(url);
    if (!/^\/images\//.test(full) || typeof TextEncoder === 'undefined') return full;
    const k = cardThumbKey(full);
    return CARD_THUMBS.has(k) ? '/%s/' + k + '.webp' : full;
  }
'''


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def wr(p, s):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def resolve(u):
    """Python mirror of product-api.js getProductImageUrl for local image paths (None if not /images/)."""
    if isinstance(u, dict):
        u = u.get('url')
    if not isinstance(u, str) or not u.strip():
        return None
    t = u.strip()
    if t.startswith(('http://', 'https://', 'data:', '/uploads/', 'uploads/')):
        return None
    if t.startswith('../images/'):
        r = '/' + t[3:]
    elif t.startswith('/images/'):
        r = t
    elif t.startswith('images/'):
        r = '/' + t
    else:
        r = t if t.startswith('/') else '/' + t
    if re.fullmatch(r'/images/products/vest-nu/p\d+/cover\.png', r, re.I):
        r = r[:-4] + '.webp'
    return r if r.startswith('/images/') else None


def key(path):
    s = unicodedata.normalize('NFC', unquote(path))
    h = 0x811c9dc5
    for b in s.encode('utf-8'):
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return '%08x' % h


def thumb_block_imgs(t):
    """(start, end, src) of the first <img src> inside each .vn-thumb block."""
    out = []
    for m in re.finditer(r'class="vn-thumb[^"]*"', t):
        im = re.compile(r'<img\b[^>]*?\bsrc="([^"]+)"').search(t, m.end(), m.end() + 1500)
        if im:
            out.append((im.start(1), im.end(1), im.group(1)))
    return out


def as_list(v):
    if isinstance(v, list):
        return v
    return [v] if v else []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--products', required=True)
    ap.add_argument('--cache', required=True)
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    web, cache = Path(a.web), Path(a.cache)
    api_p = web / 'product-api.js'
    api = rd(api_p)
    if 'CARD_THUMBS' in api:
        print('already applied')
        return

    # 1. collect
    paths = set()
    for p in json.loads(rd(Path(a.products))):
        for u in as_list(p.get('images')) + [p.get('img')]:
            r = resolve(u)
            if r:
                paths.add(r)
    texts = {n: rd(web / n) for n in PAGES}
    for n, t in texts.items():
        for _, _, src in thumb_block_imgs(t):
            r = resolve(src)
            if r:
                paths.add(r)
    print('candidate images', len(paths))

    # 2. download + thumb
    cache.mkdir(parents=True, exist_ok=True)
    out = web / OUT_DIR

    def job(path):
        k = key(path)
        src = cache / ('%s%s' % (k, Path(unquote(path)).suffix.lower() or '.bin'))
        if not src.exists():
            try:
                data = urllib.request.urlopen(ORIGIN + quote(unicodedata.normalize('NFC', unquote(path))), timeout=90).read()
            except Exception as e:  # missing image: card keeps the original (logo fallback as today)
                return path, k, None, 'download %s' % str(e)[:60]
            src.write_bytes(data)
        data = src.read_bytes()
        try:
            im = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
        except Exception as e:
            return path, k, None, 'decode %s' % str(e)[:60]
        if im.width <= MAX_W + 40:
            return path, k, None, 'small'
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        im.thumbnail((MAX_W, MAX_W * 20), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=QUALITY, method=6)
        if buf.tell() >= KEEP_RATIO * len(data):
            return path, k, None, 'no gain'
        return path, k, buf.getvalue(), '%d->%d' % (len(data), buf.tell())

    with cf.ThreadPoolExecutor(8) as ex:
        res = list(ex.map(job, sorted(paths)))
    made = {k: b for _, k, b, _ in res if b}
    keys_by_path = {p: k for p, k, b, _ in res if b}
    skipped = {}
    for p, k, b, why in res:
        if not b:
            skipped.setdefault(why.split(' ')[0], []).append(p)
    if len({k for _, k, _, _ in res}) != len(res):
        sys.exit('hash collision')
    before = sum((cache / ('%s%s' % (k, Path(unquote(p)).suffix.lower()))).stat().st_size for p, k, b, _ in res if b)
    print('thumbs', len(made), 'bytes', before, '->', sum(len(b) for b in made.values()),
          '| skipped', {w: len(v) for w, v in skipped.items()})
    for p in skipped.get('download', []) + skipped.get('decode', []):
        print('  !', p)

    # 3. patch product-api.js
    errs, writes = [], {}
    nl = '\r\n' if '\r\n' in api else '\n'
    anchor = nl + '  const FRIENDLY_UNMAPPED_NOTE'
    if api.count(anchor) != 1:
        errs.append('product-api anchor')
    helpers = (JS_HELPERS % (json.dumps(sorted(made)), OUT_DIR)).replace('\n', nl)
    api2 = api.replace(anchor, helpers + anchor, 1)
    old = 'const imgSrc = getProductImageUrl(primaryImg);'
    if api2.count(old) != 1:
        errs.append('product-api card call')
    api2 = api2.replace(old, 'const imgSrc = cardImageUrl(primaryImg);', 1)
    exp = '    getProductImageUrl,' + nl + '    dedupeProductImages,'
    if api2.count(exp) != 1:
        errs.append('product-api export')
    api2 = api2.replace(exp, '    getProductImageUrl,' + nl + '    cardImageUrl,' + nl + '    dedupeProductImages,', 1)
    writes[api_p] = api2

    # 4. listing pages: card calls + pre-rendered card images
    pre = 0
    for n, t in texts.items():
        c = t.count('MLH_API.getProductImageUrl(')
        if c != CALLS[n]:
            errs.append('%s: %d calls (expected %d)' % (n, c, CALLS[n]))
        t = t.replace('MLH_API.getProductImageUrl(', 'MLH_API.cardImageUrl(')
        for s, e, src in reversed(thumb_block_imgs(t)):
            r = resolve(src)
            if r and r in keys_by_path:
                t = t[:s] + '/%s/%s.webp' % (OUT_DIR, keys_by_path[r]) + t[e:]
                pre += 1
        writes[web / n] = t
    # 5. cache-bust product-api.js on every page that loads it
    nver = 0
    for f in web.rglob('*.html'):
        if 'admin' in f.relative_to(web).parts:
            continue
        t = writes.get(f) or rd(f)
        t2, k = VER_OLD.subn(VER_NEW, t)
        if k:
            writes[f] = t2
            nver += 1
    print('prerendered card imgs ->thumb', pre, '| pages with product-api version bump', nver)
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    if a.dry_run:
        return
    out.mkdir(parents=True, exist_ok=True)
    for k, b in made.items():
        (out / (k + '.webp')).write_bytes(b)
    for f, t in writes.items():
        wr(f, t)
    print('written', len(writes), 'files +', len(made), 'thumbs')


if __name__ == '__main__':
    main()
