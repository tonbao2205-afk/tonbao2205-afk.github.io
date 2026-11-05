"""Homepage: hide the closed cart drawer completely (iPhone bottom white strip).

Usage: python -I tools/cart_sheet_fix_20261105.py <web_root> [--dry-run]

Bug: the homepage bundles (home-app-*-20261104-vi-facts.js) only move the closed cart
drawer off-screen (mobile: bottom sheet translateY(100%)). On iPhone Safari, when the
toolbar collapses, the sheet just below the viewport shows as a white strip at the bottom.
nav-component.js (other pages) already hides it with visibility/opacity/pointer-events;
this copies that fix into the two homepage bundles. New file names (suffix -20261105-cart)
so cached old bundles are not reused; index.html / index-mobile.html point to them.
Every rule must match exactly once or nothing is written. Refuses to run twice.
"""
import argparse
import sys
from pathlib import Path

OLD = {
    'index.html': 'home-app-desktop-291f86e271c9.min-207533e2592b-20261104-vi-facts.js',
    'index-mobile.html': 'home-app-mobile-e05fb5c34d24.min-89e932ab3b15-20261104-vi-facts.js',
}
SUFFIX_OLD = '-20261104-vi-facts.js'
SUFFIX_NEW = '-20261104-vi-facts-20261105-cart.js'
HIDE = 'visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; '
SHOW = 'visibility: visible !important; pointer-events: auto !important; opacity: 1 !important; '
REPL = [
    ('transform: translateX(100%) !important; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;',
     HIDE + 'transform: translateX(100%) !important; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), '
     'opacity 0.25s ease, visibility 0.35s !important;'),
    ('#lhv-cart-drawer.is-open { transform: translateX(0) !important; }',
     '#lhv-cart-drawer.is-open { transform: translateX(0) !important; ' + SHOW + '}'),
    ('    transform: translateY(100%) !important;\n    box-shadow: 0 -10px 30px rgba(0,0,0,0.25) !important;',
     '    visibility: hidden !important;\n    pointer-events: none !important;\n    opacity: 0 !important;\n'
     '    transform: translateY(100%) !important;\n    box-shadow: 0 -10px 30px rgba(0,0,0,0.25) !important;'),
    ('#lhv-cart-drawer.is-open {\n    transform: translateY(0) !important;\n  }',
     '#lhv-cart-drawer.is-open {\n    transform: translateY(0) !important;\n    visibility: visible !important;\n'
     '    pointer-events: auto !important;\n    opacity: 1 !important;\n  }'),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    web = Path(a.web)
    bdir = web / 'assets/brand-20261017'
    errs, writes = [], []
    for html, old in OLD.items():
        new = old.replace(SUFFIX_OLD, SUFFIX_NEW)
        if (bdir / new).exists():
            errs.append(f'already applied: {new}')
            continue
        src = (bdir / old).read_text(encoding='utf-8')
        for o, n in REPL:
            if src.count(o) != 1:
                errs.append(f'{old}: rule matched {src.count(o)}x: {o[:50]!r}')
            src = src.replace(o, n, 1)
        h = (web / html).read_text(encoding='utf-8')
        ref = f'/assets/brand-20261017/{old}'
        if h.count(ref) != 1:
            errs.append(f'{html}: bundle ref found {h.count(ref)}x')
        writes.append((bdir / new, src))
        writes.append((web / html, h.replace(ref, f'/assets/brand-20261017/{new}')))
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    print('ok: 2 bundles patched (4 rules each), 2 html refs updated')
    if not a.dry_run:
        for p, t in writes:
            with open(p, 'w', encoding='utf-8', newline='') as f:
                f.write(t)


if __name__ == '__main__':
    main()
