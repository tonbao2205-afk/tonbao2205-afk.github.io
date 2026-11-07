"""Footer credit line v2: tidy layout (07/11/2026, owner: "nhin roi qua, lam lai").

p27 put copyright + 3 credits on one run-on line; on phones it wrapped mid-name and the floating
back-to-top button covered the end. v2:
  line 1  "(c) Cong Ty TNHH Thoi Trang Le Huong. All Rights Reserved."   (unchanged text, still translated)
  line 2  "Design by HarryDuong · Planning by Haris Nguyen · Coding by Sophie Tran"  smaller, muted,
          each credit kept whole (nowrap); dots in footer gold.
  phone (<768px): line 2 becomes 3 stacked lines, dots hidden, extra bottom padding so the
          back-to-top button (bottom 20px, 42px) never sits on the text.
Markup uses unquoted class attributes so it can be inserted unchanged into both the single-quoted
footer-component.js and the double-quoted home bundles.

Applies on top of tools/footer_credit_20261107.py output. Home bundles are immutable: edited copies
get suffix -20261107-credit2.js. Bumps footer-component.js?v=20261107-credit2 on every page.
Usage: python -X utf8 -I tools/footer_credit_v2_20261107.py <web_root> [--dry-run]
Idempotent; writes nothing unless every check passes.
"""
import argparse
import re
import sys
from pathlib import Path

OLD_TAIL = '. All Rights Reserved. - Design by HarryDuong {D} Planning by Haris Nguyen {D} Coding by Sophie Tran'
NEW_TAIL = ('. <span class=lhv-rr>All Rights Reserved.</span><span class=lhv-cr><span>Design by HarryDuong</span><i>{D}</i>'
            '<span>Planning by Haris Nguyen</span><i>{D}</i><span>Coding by Sophie Tran</span></span>')
CSS_ANCHOR = 'font-size: 12.5px !important; color: #d1d5db !important; }'
CSS_ADD = (' .lhv-rr { white-space: nowrap !important; } .lhv-cr { display: block !important; margin-top: 8px !important; font-size: 11px !important;'
           ' letter-spacing: 0.04em !important; color: #9ca3af !important; line-height: 1.7 !important; }'
           ' .lhv-cr span { display: inline-block !important; white-space: nowrap !important; color: #9ca3af !important; }'
           ' .lhv-cr i { font-style: normal !important; margin: 0 10px !important; color: #e6c364 !important; }'
           ' @media (max-width: 767px) { .lhv-footer-bottom { padding: 18px 72px 78px !important; line-height: 1.6 !important; }'
           ' .lhv-cr { margin-top: 10px !important; } .lhv-cr span { display: block !important; } .lhv-cr i { display: none !important; } }')
MARK = 'lhv-cr'
OLD_SUFFIX = '-20261107-credit.js'
NEW_SUFFIX = '-20261107-credit2.js'
VER = '20261107-credit2'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def patch(t, dot, name, errs):
    if MARK in t:
        return t
    old = OLD_TAIL.format(D=dot)
    if t.count(old) != 1 or t.count(CSS_ANCHOR) != 1:
        errs.append(f'{name}: tail x{t.count(old)}, css anchor x{t.count(CSS_ANCHOR)} (expected 1/1)')
        return None
    return t.replace(old, NEW_TAIL.format(D=dot)).replace(CSS_ANCHOR, CSS_ANCHOR + CSS_ADD)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    writes, errs = {}, []

    fc = root / 'footer-component.js'
    t = rd(fc)
    t2 = patch(t, '·', 'footer-component.js', errs)
    if t2 is not None and t2 != t:
        writes[fc] = t2

    for page in ('index.html', 'index-mobile.html'):
        p = root / page
        h = rd(p)
        m = re.findall(r'/assets/brand-20261017/(home-app-[a-z]+-[^"\s]+?\.js)', h)
        if len(m) != 1:
            errs.append(f'{page}: expected 1 home-app bundle, found {m}')
            continue
        old_name = m[0]
        if old_name.endswith(NEW_SUFFIX):
            continue
        if not old_name.endswith(OLD_SUFFIX):
            errs.append(f'{page}: bundle {old_name} is not the p27 credit bundle')
            continue
        b = rd(root / 'assets' / 'brand-20261017' / old_name)
        b2 = patch(b, '\\xB7', old_name, errs)
        if b2 is None:
            continue
        new_name = old_name[:-len(OLD_SUFFIX)] + NEW_SUFFIX
        writes[root / 'assets' / 'brand-20261017' / new_name] = b2
        writes[p] = h.replace(old_name, new_name)

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
    if a.dry_run:
        return
    for p, t in writes.items():
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
