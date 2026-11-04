"""Phone home page: turn #mlh-featured-catalog-links (12 stacked rows) into one horizontal swipe row.

Usage: python -I tools/mobile_featured_swipe_20261105.py <web_root> [--dry-run]
Only index-mobile.html is changed: one <style id="mlh-featured-mobile-swipe"> block is inserted
before </head>, scoped to @media (max-width: 767px). Markup, links, images and desktop index.html
stay untouched. Idempotent: refuses to run twice.
"""
import argparse
import sys
from pathlib import Path

STYLE_ID = 'mlh-featured-mobile-swipe'
S = '#mlh-featured-catalog-links'
GRID = S + '>div>div:nth-child(2)'
CSS = (
    '<style id="' + STYLE_ID + '">@media (max-width:767px){'
    + S + '{padding:28px 0 24px 16px!important}'
    + S + '>div>div:first-child{padding-right:16px;margin-bottom:14px!important}'
    + GRID + '{display:flex!important;grid-template-columns:none!important;gap:10px!important;'
    'overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;'
    'overscroll-behavior-x:contain;scrollbar-width:none;padding:2px 16px 6px 0}'
    + GRID + '::-webkit-scrollbar{display:none}'
    + GRID + '>a{flex:0 0 42%!important;max-width:200px;flex-direction:column!important;'
    'align-items:stretch!important;gap:8px!important;padding:8px!important;scroll-snap-align:start}'
    + GRID + '>a>img{width:100%!important;height:auto!important;aspect-ratio:4/5;object-fit:cover}'
    + GRID + '>a>span>span:first-child{display:-webkit-box!important;-webkit-line-clamp:2;'
    '-webkit-box-orient:vertical;overflow:hidden;font-size:12.5px!important;min-height:2.7em}'
    '}</style>'
)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    p = Path(a.web) / 'index-mobile.html'
    with open(p, encoding='utf-8', newline='') as f:
        t = f.read()
    errs = []
    if STYLE_ID in t:
        errs.append('already applied')
    if t.count('<section id="mlh-featured-catalog-links"') != 1:
        errs.append('featured section not found exactly once')
    if t.count('</head>') != 1:
        errs.append('</head> not found exactly once')
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    t = t.replace('</head>', CSS + '\n</head>', 1)
    print('ok: index-mobile.html +', len(CSS), 'bytes CSS')
    if not a.dry_run:
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
