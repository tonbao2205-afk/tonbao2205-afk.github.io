"""Page motion for the redesigned may-do.html (md2) and dich-vu.html (dv2) — 07/11/2026.

Owner: "các animation hiện đang không hoạt động ... trang may đo và trang dịch vụ, add thêm vào".
Why they stopped: the p16/p25 redesigns replaced the old markup (dv-anim / dv-stagger / card classes),
and the shared luxury-animations.js turns scroll reveal OFF at <=768px and does not recognise the
new md2-/dv2- card names. This adds a small, self-contained motion layer for both pages, phone + desktop:

- hero: text lines rise in one after another, hero photo settles from a slight zoom;
- scroll reveal: every block of each md2/dv2 section fades up when it enters the screen, items of a
  grid/list come in one after another, figures settle from a slight zoom, numbers pop, the gold line
  of each kicker draws itself;
- desktop hover (fine pointer only): cards lift, card photos zoom softly, main buttons lift + light sweep.

It uses the independent CSS properties `translate` / `scale` / `filter:opacity()` so it never fights
with luxury-animations.js (which drives `opacity` / `transform` with !important); inside md2/dv2 the
shared reveal is neutralised so nothing reveals twice. prefers-reduced-motion: nothing moves.
Nothing is hidden without JS (class `mlh-motion` is set by an inline head script), modal dialogs are
never wrapped in a moving ancestor.

Usage: python -X utf8 -I tools/page_motion_20261107.py <web_root> [--dry-run]
Idempotent: re-running replaces the three blocks in place. Writes nothing unless every check passes.
"""
import argparse
import sys
from pathlib import Path

PAGES = {'may-do.html': 'md2', 'dich-vu.html': 'dv2'}

CSS = r"""<style id="mlh-page-motion">
:root{--mlh-e:cubic-bezier(.22,1,.36,1)}
/* shared luxury reveal off inside md2/dv2: this page layer handles reveal on every width */
html body section.md2.lux-r,html body section.dv2.lux-r,html body .md2 .lux-r,html body .dv2 .lux-r{opacity:1!important;transform:none!important}
@keyframes mlh-rise{from{filter:opacity(0);translate:0 22px}to{filter:none;translate:none}}
@keyframes mlh-settle{from{scale:1.08}to{scale:1}}
@keyframes mlh-pop{0%{scale:.55;filter:opacity(0)}70%{scale:1.12}100%{scale:1;filter:none}}
/* hero */
html.mlh-motion .md2-hero-text>*,html.mlh-motion .dv2-hero-text>*{animation:mlh-rise .9s var(--mlh-e) both}
html.mlh-motion .md2-hero-text>:nth-child(2),html.mlh-motion .dv2-hero-text>:nth-child(2){animation-delay:.12s}
html.mlh-motion .md2-hero-text>:nth-child(3),html.mlh-motion .dv2-hero-text>:nth-child(3){animation-delay:.24s}
html.mlh-motion .md2-hero-text>:nth-child(4),html.mlh-motion .dv2-hero-text>:nth-child(4){animation-delay:.36s}
html.mlh-motion .md2-hero-text>:nth-child(n+5),html.mlh-motion .dv2-hero-text>:nth-child(n+5){animation-delay:.48s}
html.mlh-motion .md2-hero-img,html.mlh-motion .dv2-hero-img{overflow:hidden}
html.mlh-motion .md2-hero-img img,html.mlh-motion .dv2-hero-img img{animation:mlh-settle 1.6s var(--mlh-e) both}
/* scroll reveal */
html.mlh-motion body [data-rv]{transition:filter .85s var(--mlh-e),translate .85s var(--mlh-e),scale .85s var(--mlh-e);transition-delay:var(--rv-d,0s)}
html.mlh-motion body [data-rv]:not(.is-in){filter:opacity(0);translate:0 30px}
html.mlh-motion body [data-rv="zoom"]:not(.is-in){translate:0 18px;scale:.965}
html.mlh-motion body [data-rv].is-in{filter:none;translate:none;scale:none}
html.mlh-motion body [data-rv].rv-done{transition:translate .4s var(--mlh-e),box-shadow .4s var(--mlh-e)}
html.mlh-motion .md2-kicker:before,html.mlh-motion .dv2-kicker:before{transform-origin:left center;transition:transform .9s var(--mlh-e) .2s}
html.mlh-motion [data-rv]:not(.is-in) .md2-kicker:before,html.mlh-motion [data-rv]:not(.is-in) .dv2-kicker:before,
html.mlh-motion .md2-kicker[data-rv]:not(.is-in):before,html.mlh-motion .dv2-kicker[data-rv]:not(.is-in):before{transform:scaleX(0)}
html.mlh-motion [data-rv].is-in .md2-num,html.mlh-motion [data-rv].is-in .md2-cv-num,html.mlh-motion [data-rv].is-in .dv2-num{animation:mlh-pop .6s var(--mlh-e) .25s both}
/* desktop hover */
@media (hover:hover) and (pointer:fine){
html.mlh-motion .md2-cv-card,html.mlh-motion .md2-board,html.mlh-motion .md2-card,html.mlh-motion .md2-fx-card,html.mlh-motion .md2-steps>li,
html.mlh-motion .dv2-tier,html.mlh-motion .dv2-steps>li,html.mlh-motion .dv2-perk-list>li{transition:translate .4s var(--mlh-e),box-shadow .4s var(--mlh-e)}
html.mlh-motion body .md2-cv-card:hover,html.mlh-motion body .md2-board:hover,html.mlh-motion body .md2-card:hover,html.mlh-motion body .md2-fx-card:hover,html.mlh-motion body .md2-steps>li:hover,
html.mlh-motion body .dv2-tier:hover,html.mlh-motion body .dv2-steps>li:hover,html.mlh-motion body .dv2-perk-list>li:hover{translate:0 -6px;box-shadow:0 18px 40px rgba(45,26,15,.14),0 0 0 1px rgba(161,127,34,.28)}
html.mlh-motion .md2-board-media img,html.mlh-motion .md2-fx-media img,html.mlh-motion .md2-card img{transition:scale .9s var(--mlh-e)}
html.mlh-motion .md2-board:hover .md2-board-media img,html.mlh-motion .md2-fx-card:hover .md2-fx-media img,html.mlh-motion .md2-card:hover img{scale:1.05}
html.mlh-motion .md2-btn,html.mlh-motion .dv2-btn{position:relative;overflow:hidden;transition:translate .3s var(--mlh-e),box-shadow .3s var(--mlh-e)}
html.mlh-motion .md2-btn:after,html.mlh-motion .dv2-btn:after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-18deg);pointer-events:none;transition:left .7s var(--mlh-e)}
html.mlh-motion .md2-btn:hover,html.mlh-motion .dv2-btn:hover{translate:0 -2px;box-shadow:0 10px 24px rgba(157,2,8,.22)}
html.mlh-motion .md2-btn:hover:after,html.mlh-motion .dv2-btn:hover:after{left:120%}
html.mlh-motion .md2-fx-btn{transition:translate .3s var(--mlh-e),background-color .25s,color .25s}
html.mlh-motion .md2-fx-btn:hover{translate:0 -2px}
}
@media (prefers-reduced-motion:reduce){
html.mlh-motion *,html.mlh-motion *:before,html.mlh-motion *:after{animation:none!important;transition:none!important}
html.mlh-motion body [data-rv]{filter:none!important;translate:none!important;scale:none!important}
}
</style>
<script id="mlh-page-motion-head">try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('mlh-motion')}catch(e){}</script>
"""

JS = r"""<script id="mlh-page-motion-js">
(function(){
  var root=document.documentElement;
  if(!root.classList.contains('mlh-motion')) return;
  var P='__P__';
  var DIALOG='[role="dialog"],[id$="-modal"]';
  var targets=[];
  function hasDialog(el){ return el.matches(DIALOG)||!!el.querySelector(DIALOG); }
  function isGroup(el){
    if(el.children.length<2||el.children.length>40) return false;
    if(/^(P|H[1-6]|A|BUTTON|SUMMARY|FIGURE|PICTURE)$/.test(el.tagName)) return false;
    var d=getComputedStyle(el).display; return d==='grid'||d==='flex'||d==='inline-grid'||el.tagName==='UL'||el.tagName==='OL';
  }
  function mark(el,depth){
    if(el.hidden||el.offsetHeight<8) return;
    if(el.matches(DIALOG)) return;
    if(hasDialog(el)){ if(depth<3) Array.prototype.forEach.call(el.children,function(c){mark(c,depth+1);}); return; }
    if(depth<2&&isGroup(el)){ Array.prototype.forEach.call(el.children,function(c){mark(c,depth+1);}); return; }
    el.setAttribute('data-rv',/^(FIGURE|PICTURE)$/.test(el.tagName)?'zoom':'');
    targets.push(el);
  }
  var secs=document.querySelectorAll('section.'+P+':not(.'+P+'-hero)');
  Array.prototype.forEach.call(secs,function(sec){
    var wrap=sec.querySelector(':scope>.'+P+'-wrap')||sec;
    Array.prototype.forEach.call(wrap.children,function(c){mark(c,0);});
  });
  function show(list){
    list.sort(function(a,b){return a.compareDocumentPosition(b)&4?-1:1;});
    list.forEach(function(el,i){
      var d=Math.min(i,5)*0.09;
      if(d) el.style.setProperty('--rv-d',d+'s');
      el.classList.add('is-in');
      setTimeout(function(){ el.style.removeProperty('--rv-d'); el.classList.add('rv-done'); },(d+0.95)*1000);
    });
  }
  /* a block is shown once its top passes 92% of the screen height; blocks already scrolled past
     (fast flick, anchor jump) are shown too, so nothing can stay hidden */
  var pending=targets.slice(), ticking=false;
  function sweep(){
    ticking=false;
    if(!pending.length) return;
    var vh=window.innerHeight||root.clientHeight, batch=[];
    pending=pending.filter(function(el){ if(el.getBoundingClientRect().top<vh*0.92){ batch.push(el); return false; } return true; });
    if(batch.length) show(batch);
    if(!pending.length){ removeEventListener('scroll',onScroll); removeEventListener('resize',onScroll); }
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(sweep); } }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll,{passive:true});
  addEventListener('load',onScroll);
  sweep();
  addEventListener('pageshow',function(ev){ if(ev.persisted){ pending=[]; targets.forEach(function(el){ el.classList.add('is-in','rv-done'); }); } });
})();
</script>
"""


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def replace_block(t, start, end_tag):
    s = t.index(start)
    e = t.index(end_tag, s) + len(end_tag)
    if t[e:e + 1] == '\n':
        e += 1
    return t[:s] + t[e:]


def apply(t, prefix):
    for start, end in (('<style id="mlh-page-motion">', '</style>'),
                       ('<script id="mlh-page-motion-head">', '</script>'),
                       ('<script id="mlh-page-motion-js">', '</script>')):
        n = t.count(start)
        if n > 1:
            raise ValueError(f'{start} found {n} times')
        if n == 1:
            t = replace_block(t, start, end)
    for m in ('</head>', '</body>'):
        if t.count(m) != 1:
            raise ValueError(f'expected 1 x {m}, found {t.count(m)}')
    if f'section class="{prefix} {prefix}-hero"' not in t:
        raise ValueError(f'{prefix} hero section not found (page not redesigned?)')
    t = t.replace('</head>', CSS + '</head>', 1)
    t = t.replace('</body>', JS.replace('__P__', prefix) + '</body>', 1)
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    out = {}
    for name, prefix in PAGES.items():
        p = root / name
        t = rd(p)
        try:
            new = apply(t, prefix)
        except ValueError as ex:
            print('NOT WRITTEN:', name, ex)
            sys.exit(1)
        for chk in ('<h1', 'id="mlh-page-motion"', 'id="mlh-page-motion-js"', 'id="mlh-page-motion-head"'):
            if new.count(chk) != 1:
                print('NOT WRITTEN:', name, 'count', chk, new.count(chk))
                sys.exit(1)
        out[p] = new
        print('ok', name, 'changed' if new != t else 'unchanged', len(new) - len(t))
    if a.dry_run:
        return
    for p, t in out.items():
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
