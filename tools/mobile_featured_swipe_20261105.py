"""Phone home page: #mlh-featured-catalog-links as one auto-playing row of accessory-style cards.

Usage: python -I tools/mobile_featured_swipe_20261105.py <web_root> [--dry-run]
Only index-mobile.html changes:
  - <style id="mlh-featured-mobile-swipe"> (replaces the first version if present), scoped to <=767px;
  - a "Xem chi tiết" button label inside each existing product link (no new links);
  - <script id="mlh-featured-autoplay">: advances one card about every 3 s, pauses on touch
    (resumes 6 s later), when off-screen or the tab is hidden; off for prefers-reduced-motion and >767px.
Desktop index.html is untouched. Every rule must match, otherwise nothing is written.
"""
import argparse
import re
import sys
from pathlib import Path

STYLE_ID = 'mlh-featured-mobile-swipe'
SCRIPT_ID = 'mlh-featured-autoplay'
BTN = '<span class="mlh-fc-btn">Xem chi tiết</span>'
S = '#mlh-featured-catalog-links'
G = S + '>div>div:nth-child(2)'
CSS = (
    '<style id="' + STYLE_ID + '">'
    '.mlh-fc-btn{display:none}'
    '@media (max-width:767px){'
    + S + '{padding:28px 0 24px 16px!important}'
    + S + '>div>div:first-child{padding-right:16px;margin-bottom:14px!important}'
    + G + '{display:flex!important;grid-template-columns:none!important;gap:12px!important;'
    'overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;'
    'overscroll-behavior-x:contain;scrollbar-width:none;padding:4px 16px 10px 0}'
    + G + '::-webkit-scrollbar{display:none}'
    + G + '>a{flex:0 0 46%!important;max-width:210px;flex-direction:column!important;'
    'align-items:stretch!important;gap:0!important;padding:0!important;overflow:hidden;'
    'border-radius:16px!important;box-shadow:0 6px 18px rgba(45,26,15,.10);scroll-snap-align:start}'
    + G + '>a>img{width:100%!important;height:auto!important;aspect-ratio:1/1;object-fit:cover;'
    'border-radius:0!important}'
    + G + '>a>span:not(.mlh-fc-btn){padding:10px 10px 0;text-align:center}'
    + G + '>a>span>span:first-child{display:-webkit-box!important;-webkit-line-clamp:2;'
    '-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em;'
    'font-family:"Noto Serif","Times New Roman",serif;font-size:13.5px!important;color:#141210!important}'
    + G + '>a>span>span:last-child{margin-top:4px;color:#9d0208!important}'
    + G + '>a>.mlh-fc-btn{display:block;margin:10px;padding:9px 6px;border-radius:12px;'
    'background:#9d0208;color:#fff!important;font-size:11px;font-weight:800;letter-spacing:.06em;'
    'text-transform:uppercase;text-align:center}'
    '}</style>'
)
JS = (
    '<script id="' + SCRIPT_ID + '">(function(){'
    'var mq=window.matchMedia&&matchMedia("(max-width:767px)");'
    'var rm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");'
    'var s=document.getElementById("mlh-featured-catalog-links");'
    'if(!s||!mq||!mq.matches||(rm&&rm.matches))return;'
    'var g=s.querySelector(":scope>div>div:nth-child(2)");if(!g||g.children.length<2)return;'
    'var visible=false,holdUntil=0,timer=0;'
    'function step(){if(document.hidden||!visible||Date.now()<holdUntil)return;'
    'var c=g.children[0],w=c.getBoundingClientRect().width+12;'
    'if(g.scrollLeft+g.clientWidth>=g.scrollWidth-4){g.scrollTo({left:0,behavior:"smooth"});}'
    'else{g.scrollBy({left:w,behavior:"smooth"});}}'
    'function hold(){holdUntil=Date.now()+6000;}'
    '["pointerdown","touchstart","wheel"].forEach(function(e){g.addEventListener(e,hold,{passive:true});});'
    'if(window.IntersectionObserver){new IntersectionObserver(function(es){visible=es[0].isIntersecting;})'
    '.observe(g);}else{visible=true;}'
    'timer=setInterval(step,3000);'
    '})();</script>'
)
OLD_STYLE = re.compile(r'<style id="' + STYLE_ID + r'">.*?</style>\n?', re.S)
SECTION = re.compile(r'(<section id="mlh-featured-catalog-links".*?</section>)', re.S)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    p = Path(a.web) / 'index-mobile.html'
    with open(p, encoding='utf-8', newline='') as f:
        t = f.read()
    errs = []
    if SCRIPT_ID in t or 'mlh-fc-btn' in t:
        errs.append('already applied')
    secs = SECTION.findall(t)
    if len(secs) != 1:
        errs.append(f'featured section found {len(secs)} times')
    if t.count('</head>') != 1 or t.count('</body>') != 1:
        errs.append('</head> or </body> not found exactly once')
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    sec = secs[0]
    n_links = sec.count('</a>') - 1  # the header "Xem trọn bộ" link has no button
    new_sec, k = re.subn(r'(</span></span>)(</a>)', r'\1' + BTN + r'\2', sec)
    if k != 12 or k != n_links:
        print(f'NOT WRITTEN: expected 12 product cards, found {k} (links {n_links})')
        sys.exit(1)
    t = t.replace(sec, new_sec, 1)
    t = OLD_STYLE.sub('', t)
    t = t.replace('</head>', CSS + '\n</head>', 1)
    t = t.replace('</body>', JS + '\n</body>', 1)
    print('ok: 12 cards + button label, style + autoplay script')
    if not a.dry_run:
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
