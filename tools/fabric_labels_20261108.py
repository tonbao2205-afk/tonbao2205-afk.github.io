"""Fabric names and labels on may-do.html, corrected from the supplier photos (08/11/2026).

Owner: "Thông số vải ... cái nào có thì ghi không có thì thôi"; Donatella 10500 left to our choice; name "có ảnh chụp lấy
cái chuẩn nhất".
- CERAZO -> Cezaro: the book cover and every swatch label print CEZARO.
- Donatella 10500 summary: Micro Fiber -> 180's Wool & Lycra, the line printed on each of its 16 swatches and the one the
  catalogue already shows, so the page no longer states two different materials.
- TRS6500-02: adds 77% Poly, printed on all 14 swatch labels and missing from the page.
Usage: python -X utf8 -I tools/fabric_labels_20261108.py <web_root> [--dry-run]   (idempotent)
"""
import sys
from pathlib import Path

RULES = [
    ('Ngoài ra có bảng vải CERAZO', 'Ngoài ra có bảng vải Cezaro'),
    ('Theo nhãn mẫu: Micro Fiber, Made in Italy.', 'Theo nhãn mẫu: 180&#x27;s Wool &amp; Lycra, Made in Italy.'),
    ('10% Wool, 10% Tencel, 3% Spandex', '10% Wool, 10% Tencel, 77% Poly, 3% Spandex'),
]


def main():
    p = Path(sys.argv[1]) / 'may-do.html'
    with open(p, encoding='utf-8', newline='') as f:
        t = f.read()
    for old, new in RULES:
        n = t.count(old)
        if not n and new not in t:
            raise SystemExit('rule did not match: ' + old)
        print(n, 'x', old)
        t = t.replace(old, new)
    if '--dry-run' not in sys.argv:
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
