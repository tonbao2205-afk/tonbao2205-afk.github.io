"""dong-phuc.html: 9 uniform photos named '... (1).jpeg' were skipped by webp_refs_20261108.py (its regex stops at
'(' ). The server has a same-name .webp for all 9 (checked 08/11/2026: same size/aspect, pixel diff below 2/255).
Swaps those refs to .webp. Usage: python -X utf8 -I tools/webp_paren_20261108.py <web_root> [--check]  (idempotent)
"""
import io
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

RX = re.compile(r'(/?images/[^"\'<>]*\(1\))\.jpeg')


def main():
    web = Path(sys.argv[1])
    f = web / 'dong-phuc.html'
    t = f.read_text(encoding='utf-8')
    refs = sorted(set(RX.findall(t)))
    if '--check' in sys.argv:
        from PIL import Image, ImageChops, ImageStat
        for r in refs:
            u = 'https://maylehuong.com' + urllib.parse.quote(unicodedata.normalize('NFC', '/' + r.lstrip('/')))
            a, b = (Image.open(io.BytesIO(urllib.request.urlopen(u + e, timeout=60).read())) for e in ('.jpeg', '.webp'))
            d = ImageStat.Stat(ImageChops.difference(a.convert('RGB').resize((64, 64)), b.convert('RGB').resize((64, 64)))).mean
            print(round(sum(d) / 3, 2), a.size, b.size, r.rsplit('/', 1)[1])
        return
    t2, n = RX.subn(r'\1.webp', t)
    if n:
        with open(f, 'w', encoding='utf-8', newline='') as fh:
            fh.write(t2)
    print('swapped', n, 'refs (', len(refs), 'images )')


if __name__ == '__main__':
    main()
