"""Small menu/loader logo (08/11/2026, GitHub preview first).

nav-component.js, cta-widget.js and luxury-animations.js load `/images/Logo Lê Hương Web.webp` (1093x403, ~100 KB)
on every page but show it at most 46 px high. This makes assets/brand-20261108/logo-nav.webp (140 px high = 3x,
quality 90) from that file and points the three scripts to it, then bumps their ?v= on every page.
Home pages (own optimized logo) and admin are untouched. Optional --also <file> patches more files (lang-switch.js).

Usage: python -X utf8 -I tools/logo_small_20261108.py <web_root> [--also file ...] [--dry-run]   (idempotent)
"""
import argparse
import io
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

OLD = '/images/Logo Lê Hương Web.webp'
NEW = '/assets/brand-20261108/logo-nav.webp'
SRC_URL = 'https://maylehuong.com/images/Logo%20L%C3%AA%20H%C6%B0%C6%A1ng%20Web.webp'
JS = ['nav-component.js', 'cta-widget.js', 'luxury-animations.js']
VER = '20261108-logo'
H = 140


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def wr(p, s):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--also', nargs='*', default=[])
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    web = Path(a.web)
    writes, errs = {}, []
    for n in JS:
        t = rd(web / n)
        if NEW in t:
            continue
        if t.count(OLD) != 1:
            errs.append('%s: %d refs' % (n, t.count(OLD)))
        writes[web / n] = t.replace(OLD, NEW)
    for x in a.also:
        t = rd(Path(x))
        if OLD in t:
            writes[Path(x)] = t.replace(OLD, NEW)
    rx = re.compile(r'((?:%s)\?v=)[^"\'\s>]*' % '|'.join(re.escape(n) for n in JS))
    pages = 0
    for f in web.rglob('*.html'):
        if 'admin' in f.relative_to(web).parts:
            continue
        t = rd(f)
        t2 = rx.sub(lambda m: m.group(1) + VER, t)
        if t2 != t:
            writes[f] = t2
            pages += 1
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    out = web / NEW.lstrip('/')
    im = Image.open(io.BytesIO(urllib.request.urlopen(SRC_URL, timeout=60).read()))
    im = im.convert('RGBA' if 'A' in im.mode else 'RGB')
    im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=90, method=6)
    print('logo', im.size, buf.tell(), 'bytes | files', len(writes), '| pages version bump', pages)
    if a.dry_run:
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(buf.getvalue())
    for f, t in writes.items():
        wr(f, t)


if __name__ == '__main__':
    main()
