"""Homepage content refresh (08/11/2026, owner: "check lai trang chu ... trien khai sua").

Featured block "San Pham Noi Bat & Ban Chay" still carried launch-era placeholder prices and discounts that no
longer match the catalog (API snapshot 04/11, KiotViet-synced):
  Suit Den Slim Fit Nam   1.850.000d (gach 2.200.000d, HOT SALE -15%) -> 2.800.000d  (Suit Nam Den - 1/2 Khuy)
  Vest Nu Mau Be Blazer   1.650.000d (gach 1.950.000d)                -> 2.500.000d  (Vest Nu Be - Blazer Fitted)
  Vest Sui Gia Navy       2.100.000d (gach 2.500.000d, LUXURY -16%)   -> 3.800.000d  (Vest Sui Gia Navy Phong Cach)
No sale exists in the catalog (oldPrice empty), so the struck-through old prices are removed and the discount
badges lose their percentage ("HOT SALE -15%" -> "HOT", "LUXURY -16%" -> "LUXURY").
Subtitle "The Old Sailor Style Signature Collection" (template leftover, not this brand) -> "mayLEHUONG Signature Collection".
"Xem tron bo 157+ san pham" -> "170+" (173 public on VPS 03/11, 187 in the 04/11 snapshot).
Applies to index.html and index-mobile.html only. Service-card claims, stats and the booking notice are untouched
(need the owner's confirmation).

Usage: python -X utf8 -I tools/home_refresh_20261108.py <web_root> [--dry-run]
Idempotent; writes nothing unless every replacement matches exactly once per file.
"""
import argparse
import re
import sys
from pathlib import Path

OLD_SPAN = r'\s*<span class="text-stone-400 text-\[10px\] sm:text-xs line-through">{p}</span>'
REPL = [
    ('>1.850.000đ</span>', '>2.800.000đ</span>'),
    ('>1.650.000đ</span>', '>2.500.000đ</span>'),
    ('>2.100.000đ</span>', '>3.800.000đ</span>'),
    ('>HOT SALE -15%</span>', '>HOT</span>'),
    ('>LUXURY -16%</span>', '>LUXURY</span>'),
    ('The Old Sailor Style Signature Collection', 'mayLEHUONG Signature Collection'),
    ('Xem trọn bộ 157+ sản phẩm', 'Xem trọn bộ 170+ sản phẩm'),
]
STRUCK = ('2.200.000đ', '1.950.000đ', '2.500.000đ')
MARK = 'mayLEHUONG Signature Collection'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    writes, errs = {}, []
    for name in ('index.html', 'index-mobile.html'):
        p = root / name
        t = rd(p)
        if MARK in t:
            continue
        # struck-through old prices first (2.500.000d is also a new price, so remove spans before swapping)
        for old in STRUCK:
            rx = re.compile(OLD_SPAN.format(p=re.escape(old)))
            n = len(rx.findall(t))
            if n != 1:
                errs.append(f'{name}: struck {old} x{n}')
            t = rx.sub('', t, count=1)
        for old, new in REPL:
            n = t.count(old)
            if n != 1:
                errs.append(f'{name}: {old!r} x{n}')
            t = t.replace(old, new, 1)
        if 'line-through' in re.sub(r'<style.*?</style>', '', t, flags=re.S):
            errs.append(f'{name}: line-through still present')
        writes[p] = t
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    print('ok: files', [p.name for p in writes])
    if a.dry_run:
        return
    for p, t in writes.items():
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
