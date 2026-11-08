"""may-do.html: the 16 fabric swatches in `ul.md2-swatches` (4 per row, shown ~80-140 CSS px, no click/lightbox)
load the full 900x1160 board photos from /images/bang-vai-mau-chuan/ (~250-350 KB each, ~4.5 MB).
Makes 360px-wide WebP copies (q80) in assets/swatch-thumbs-20261108/<same sub path> and points the <img> there,
width/height attributes set to the thumb size (same aspect). Full photos stay on the server untouched.
Usage: python -X utf8 -I tools/swatch_thumbs_20261108.py <web_root> [--dry-run]   (idempotent)
"""
import io
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

OUT = 'assets/swatch-thumbs-20261108'
W = 360
RX = re.compile(r'<img src="/images/bang-vai-mau-chuan/([a-z0-9/_.-]+\.webp)"([^>]*?)width="\d+" height="\d+"')


def main():
    web = Path(sys.argv[1])
    f = web / 'may-do.html'
    with open(f, encoding='utf-8', newline='') as fh:
        t = fh.read()
    hits = RX.findall(t)
    if not hits:
        print('nothing to do (already applied?)')
        return
    sizes = {}
    total = [0, 0]
    for sub, _ in hits:
        data = urllib.request.urlopen('https://maylehuong.com/images/bang-vai-mau-chuan/' + sub, timeout=90).read()
        im = Image.open(io.BytesIO(data)).convert('RGB')
        im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=80, method=6)
        sizes[sub] = (im.size, buf.getvalue())
        total[0] += len(data)
        total[1] += buf.tell()
    print('swatches', len(hits), 'bytes', total[0], '->', total[1])
    if '--dry-run' in sys.argv:
        return
    for sub, (_, b) in sizes.items():
        p = web / OUT / sub
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(b)

    def rep(m):
        (w, h), _ = sizes[m.group(1)]
        return '<img src="/%s/%s"%swidth="%d" height="%d"' % (OUT, m.group(1), m.group(2), w, h)
    t2, n = RX.subn(rep, t)
    with open(f, 'w', encoding='utf-8', newline='') as fh:
        fh.write(t2)
    print('replaced', n)


if __name__ == '__main__':
    main()
