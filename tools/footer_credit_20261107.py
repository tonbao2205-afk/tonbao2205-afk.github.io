"""Footer credit line: add planning + coding credits (07/11/2026, owner request).

Before: "... All Rights Reserved. - Design by HarryDuong"
After : "... All Rights Reserved. - Design by HarryDuong · Planning by Haris Nguyen · Coding by Sophie Tran"

Changes footer-component.js and the two home-app bundles that embed the same footer. Home bundles are
immutable, so the edited copy gets a new name (suffix -20261107-credit.js) and index.html /
index-mobile.html point to it. Bump of ?v= on footer-component.js is done on every page that loads it.

Usage: python -X utf8 -I tools/footer_credit_20261107.py <web_root> [--dry-run]
Idempotent; writes nothing unless every check passes.
"""
import argparse
import re
import sys
from pathlib import Path

OLD = 'Design by HarryDuong'
NEW = 'Design by HarryDuong · Planning by Haris Nguyen · Coding by Sophie Tran'
NEW_JS = 'Design by HarryDuong \\xB7 Planning by Haris Nguyen \\xB7 Coding by Sophie Tran'  # inside escaped bundles
SUFFIX = '-20261107-credit.js'
VER = '20261107-credit'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    writes = {}
    errs = []

    fc = root / 'footer-component.js'
    t = rd(fc)
    if 'Planning by Haris Nguyen' not in t:
        if t.count(OLD) != 1:
            errs.append(f'footer-component.js: expected 1 x {OLD!r}, found {t.count(OLD)}')
        else:
            writes[fc] = t.replace(OLD, NEW)

    for page in ('index.html', 'index-mobile.html'):
        p = root / page
        h = rd(p)
        m = re.findall(r'/assets/brand-20261017/(home-app-[a-z]+-[^"\s]+?\.js)', h)
        if len(m) != 1:
            errs.append(f'{page}: expected 1 home-app bundle, found {m}')
            continue
        old_name = m[0]
        if old_name.endswith(SUFFIX):
            continue
        b = rd(root / 'assets' / 'brand-20261017' / old_name)
        if b.count(OLD) != 1:
            errs.append(f'{old_name}: expected 1 x {OLD!r}, found {b.count(OLD)}')
            continue
        new_name = old_name[:-3] + SUFFIX
        writes[root / 'assets' / 'brand-20261017' / new_name] = b.replace(OLD, NEW_JS)
        writes[p] = h.replace(old_name, new_name)

    # bump ?v= of footer-component.js everywhere it is loaded
    n_pages = 0
    for p in root.rglob('*.html'):
        if 'assets' in p.parts:
            continue
        h = writes.get(p) or rd(p)
        h2 = re.sub(r'(footer-component\.js\?v=)[^"\'&\s]+', r'\g<1>' + VER, h)
        if h2 != h:
            writes[p] = h2
            n_pages += 1

    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    print('ok: files to write', len(writes), '| pages with footer ?v bumped', n_pages)
    for p in writes:
        print('  ', p.relative_to(root))
        if len(writes) > 12:
            break
    if a.dry_run:
        return
    for p, t in writes.items():
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
