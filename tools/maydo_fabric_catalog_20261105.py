"""May-do page: replace "Tuyệt Tác May Đo Thủ Công" with the fabric price catalogue.

Usage: python -I tools/maydo_fabric_catalog_20261105.py <web_root> [--dry-run]
Prompt: PROMPT-ANTI-BANG-GIA-VAI-MAY-DO-20261105.md

- Removes the gallery section #tuyet-tac-may-do, its lightbox #suitLightboxModal and the gallery script.
- Adds section #bang-gia-vai: 14 books (13 with swatches from images/bang-vai-mau-chuan/catalog.json,
  239 swatches; Roger La Viale has only the cover photo), price = KiotViet list price read 05/11/2026,
  spec lines copied verbatim from the printed label on each swatch image.
- Popup: grid of every swatch (code + label line), tap = enlarged original card with its label, prev/next.
- WebP assets under <web_root>/assets/may-do-bang-vai-20261105/{cover,thumb,full}/.
Every rule must match or nothing is written. Refuses to run twice.
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CAT = ROOT / 'images' / 'bang-vai-mau-chuan' / 'catalog.json'
SWATCH_ROOT = ROOT / 'images' / 'bang-vai-mau-chuan'
COVERS = ROOT / 'images' / 'Bảng Vải Và Gía Tiền'
OUT = 'assets/may-do-bang-vai-20261105'
STYLE_ID = 'mlh-maydo-fabric-catalog'
E = html.escape

# Spec line printed on each swatch card, by index in catalog['items'] (read from the images 05/11/2026).
CEZARO = (['P62% P33% LY5% - 400 gr/m', 'P62% P33% LY5% - 300 gr/m', 'P62% P33% LY5% - 400 gr/m',
           'P62% P33% LY5% - 400 gr/m', 'P62% P33% LY5% - 300 gr/m', 'P62% P33% LY5% - 300 gr/m',
           'C85% P12% LY3% - 250 gr/m', 'C62% P33% LY5% - 270 gr/m', 'C85% P12% LY3% - 280 gr/m',
           'C85% P12% LY3% - 280 gr/m', 'C65% P35% - 400 gr/m', 'C62% P33% LY5% - 400 gr/m',
           'P62% P33% LY5% - 300 gr/m', 'P62% P33% LY5% - 300 gr/m', 'P62% P33% LY5% - 270 gr/m']
          + ['P62% P33% LY5% - 300 gr/m'] * 3
          + ['P62% P33% LY5% - 385 gr/m'] + ['P62% P33% LY5% - 300 gr/m'] * 3
          + ['P62% V33% LY5% - 300 gr/m'] * 2
          + ['P62% P33% LY5% - 270 gr/m', 'P62% P33% LY5% - 300 gr/m', 'P62% P33% LY5% - 300 gr/m',
             'P62% V33% LY5% - 350 gr/m', 'P62% P33% LY5% - 320 gr/m', 'P62% V33% LY5% - 310 gr/m',
             'P65% V35% - 270 gr/m', 'P65% V35% - 300 gr/m', 'P62% P33% LY5% - 270 gr/m',
             'P65% V35% - 350 gr/m', 'P65% V35% - 270 gr/m', 'P65% V35% - 290 gr/m',
             'P65% V35% - 290 gr/m', 'P65% V35% - 270 gr/m', 'P65% V35% - 270 gr/m'])
FAMILY_LABEL = {
    'donatella-10500': "180's Wool & Lycra - Made in Italy",
    'donatella-9300': 'Donatella 9300 - Premium Suiting',
    'gazzarini-uomo-9000': 'Gazzarini Uomo - Made in Italy',
    'ichn-02': 'Superfine Wool & Cashmere Blend',
    'ichn-04': "Wool Finish 210's Ferrari",
    'ichn-07': 'Superfine Australian Wool Blend',
    'lc9000': 'Lanificio Di Calvino - Made in Italy',
    'louis-12l-england': 'LOUIS - Made in England',
    'ns10500': 'NS10500 - Luxury Suiting Fabric',
    'trs6500-02': '10% Wool, 10% Tencel, 77% Poly, 3% Spandex',
}
RANGE_LABEL = {  # family: [(count, label), ...] in catalog order
    'trs6500-01': [(7, '18% Rayon, 80% Poly, 2% Spandex'), (20, '20% Rayon, 80% Polyester - 320 g/m'),
                   (4, '10% Rayon, 87% Poly, 3% Spandex')],
    'trs6500-03': [(9, '20% Rayon, 80% Polyester - 410 g/m'), (13, '27% Rayon, 70% Poly, 3% Spandex')],
}

# (book id, display name, price VND, Vietnamese spec summary, cover file or None, swatch family or None)
BOOKS = [
    ('roger-la-viale', 'Roger La Viale', 18000000, 'Theo nhãn: 70% Wool, 30% Poly, khổ vải 58/60"',
     'Bảng Vải 18.000.000/ROGER LA VIALE.jpeg', None),
    ('louis', 'LOUIS-12L England', 12000000, 'Theo nhãn: Made in England',
     'Bảng Vải 12.000.000/LOUIS.jpeg', 'louis-12l-england'),
    ('donatella-10500', 'Donatella 10500', 10500000, "Theo nhãn: 180's Wool & Lycra, Made in Italy",
     'Bảng Vải 10.500.000/DONATELLA/DONATELLA.jpeg', 'donatella-10500'),
    ('ns10500', 'NS10500 · New Sample', 10500000, 'Theo nhãn: Luxury Suiting Fabric',
     'Bảng Vải 10.500.000/NEW SAMPLE/NEW SAMPLE.jpeg', 'ns10500'),
    ('donatella-9300', 'Donatella 9300', 9300000, 'Theo nhãn: Premium Suiting', None, 'donatella-9300'),
    ('gazzarini', 'Gazzarini Uomo', 9000000, 'Theo nhãn: Made in Italy',
     'Bảng Vải 9.000.000/GAZZARINI UOMO.jpeg', 'gazzarini-uomo-9000'),
    ('lc9000', 'LC9000', 9000000, 'Theo nhãn: Lanificio Di Calvino, Made in Italy', None, 'lc9000'),
    ('cezaro', 'Cezaro', 7000000, 'Theo nhãn: vải pha, 250–400 g/m, thành phần ghi trên từng mẫu',
     'Bảng Vải 7.000.000/CERAZO/CERAZO BÌA XANH.jpeg', 'cezaro7000'),
    ('ichn-02', 'ICHN 02', 5500000, 'Theo nhãn: Superfine Wool & Cashmere Blend', None, 'ichn-02'),
    ('ichn-04', 'ICHN 04', 5500000, "Theo nhãn: Wool Finish 210's Ferrari", None, 'ichn-04'),
    ('ichn-07', 'ICHN 07', 5500000, 'Theo nhãn: Superfine Australian Wool Blend', None, 'ichn-07'),
    ('trs6500-01', 'TRS6500-01', 5500000, 'Theo nhãn: pha Rayon và Polyester, một số mẫu có Spandex',
     None, 'trs6500-01'),
    ('trs6500-02', 'TRS6500-02', 5500000, 'Theo nhãn: 10% Wool, 10% Tencel, 77% Poly, 3% Spandex', None, 'trs6500-02'),
    ('trs6500-03', 'TRS6500-03', 5500000, 'Theo nhãn: pha Rayon và Polyester, một số mẫu có Spandex',
     None, 'trs6500-03'),
]

THUMB_BOX = (120, 170, 780, 590)  # fabric area of a 900x1160 swatch card, above the sticker


def vnd(n):
    return f'{n:,}'.replace(',', '.') + 'đ'


def labels_for(cat):
    by_fam = {}
    for i in cat['items']:
        by_fam.setdefault(i['family_id'], []).append(i)
    out = {}
    for fam, items in by_fam.items():
        if fam == 'cezaro7000':
            labs = CEZARO
        elif fam in FAMILY_LABEL:
            labs = [FAMILY_LABEL[fam]] * len(items)
        else:
            labs = [lab for n, lab in RANGE_LABEL[fam] for _ in range(n)]
        assert len(labs) == len(items), (fam, len(labs), len(items))
        for it, lab in zip(items, labs):
            out[it['id']] = lab
    return by_fam, out


def slug(it):
    return Path(it['image']).stem


def pick4(paths):
    """4 visually different swatches (greedy farthest mean colour)."""
    cols = []
    for p in paths:
        im = Image.open(p).convert('RGB').crop(THUMB_BOX).resize((8, 8))
        px = list(im.getdata())
        cols.append(tuple(sum(c[k] for c in px) / len(px) for k in range(3)))
    chosen = [min(range(len(cols)), key=lambda k: sum(cols[k]))]
    while len(chosen) < min(4, len(cols)):
        chosen.append(max((k for k in range(len(cols)) if k not in chosen),
                          key=lambda k: min(sum((a - b) ** 2 for a, b in zip(cols[k], cols[c])) for c in chosen)))
    return chosen


def make_assets(web, cat, by_fam):
    out = Path(web) / OUT
    for sub in ('cover', 'thumb', 'full'):
        (out / sub).mkdir(parents=True, exist_ok=True)
    for book, _, _, _, cover, fam in BOOKS:
        if cover:
            im = ImageOps.exif_transpose(Image.open(COVERS / cover)).convert('RGB')
            im = ImageOps.fit(im, (800, 500), Image.LANCZOS)
        else:
            paths = [SWATCH_ROOT / Path(i['image']).relative_to('/images/bang-vai-mau-chuan') for i in by_fam[fam]]
            im = Image.new('RGB', (800, 500), '#f6efe2')
            for k, idx in enumerate(pick4(paths)):
                sw = Image.open(paths[idx]).convert('RGB').crop((370, 170, 530, 570)).resize((200, 500), Image.LANCZOS)
                im.paste(sw, (k * 200, 0))
        im.save(out / 'cover' / f'{book}.webp', 'WEBP', quality=80, method=6)
        if not fam:
            continue
        (out / 'thumb' / fam).mkdir(exist_ok=True)
        (out / 'full' / fam).mkdir(exist_ok=True)
        for it in by_fam[fam]:
            src = Image.open(SWATCH_ROOT / Path(it['image']).relative_to('/images/bang-vai-mau-chuan')).convert('RGB')
            src.crop(THUMB_BOX).resize((330, 210), Image.LANCZOS).save(
                out / 'thumb' / fam / f'{slug(it)}.webp', 'WEBP', quality=78, method=6)
            src.resize((600, round(600 * src.height / src.width)), Image.LANCZOS).save(
                out / 'full' / fam / f'{slug(it)}.webp', 'WEBP', quality=80, method=6)


def section_html(by_fam, labs):
    total = sum(len(by_fam[b[5]]) for b in BOOKS if b[5])
    cards, panels = [], []
    for book, name, price, spec, _, fam in BOOKS:
        n = len(by_fam[fam]) if fam else 0
        count = (f'<span class="md2-fx-count"><b>{n}</b> <span>mẫu màu</span></span>' if n
                 else '<span class="md2-fx-count"><span>Xem quyển mẫu tại showroom</span></span>')
        cards.append(
            f'<article class="md2-fx-card"><button type="button" class="md2-fx-media" data-fx-open="{book}" '
            f'aria-label="{E(name)}"><img src="/{OUT}/cover/{book}.webp" width="800" height="500" loading="lazy" '
            f'decoding="async" alt="{E(name)}"></button>'
            f'<div class="md2-fx-body"><p class="md2-fx-pricewrap"><span class="md2-fx-pricelabel">Giá may đo bộ vest</span>'
            f'<strong class="md2-fx-price">{vnd(price)}</strong></p>'
            f'<h3 class="md2-h3">{E(name)}</h3><p class="md2-fx-spec">{E(spec)}</p>{count}'
            f'<button type="button" class="md2-fx-btn" data-fx-open="{book}">Xem màu vải</button></div></article>')
        if fam:
            cells = ''.join(
                f'<li><button type="button" class="md2-fx-sw" data-fx-full="/{OUT}/full/{fam}/{slug(it)}.webp" '
                f'data-fx-code="{E(it["code"])}" data-fx-lab="{E(labs[it["id"]])}">'
                f'<img src="/{OUT}/thumb/{fam}/{slug(it)}.webp" width="330" height="210" loading="lazy" decoding="async" '
                f'alt="{E(name)} {E(it["code"])}"><span class="md2-fx-code">{E(it["code"])}</span>'
                f'<span class="md2-fx-lab">{E(labs[it["id"]])}</span></button></li>' for it in by_fam[fam])
            body = f'<ul class="md2-fx-grid">{cells}</ul>'
        else:
            body = (f'<img class="md2-fx-cover" src="/{OUT}/cover/{book}.webp" width="800" height="500" loading="lazy" '
                    f'decoding="async" alt="{E(name)}"><p class="md2-fx-empty">Chưa có ảnh từng màu trên web. '
                    'Mời bạn xem quyển mẫu thật tại showroom.</p>')
        panels.append(
            f'<div class="md2-fx-panel" data-fx-book="{book}" hidden><div class="md2-fx-head">'
            f'<h3 class="md2-h3">{E(name)}</h3><p class="md2-fx-headprice"><span class="md2-fx-pricelabel">Giá may đo bộ vest</span>'
            f'<strong class="md2-fx-price">{vnd(price)}</strong></p><p class="md2-fx-spec">{E(spec)}</p></div>{body}</div>')
    return f'''<section class="md2 md2-fx" id="bang-gia-vai" aria-labelledby="md2-fx-title">
<div class="md2-wrap">
<p class="md2-kicker">Bảng giá vải</p>
<h2 id="md2-fx-title" class="md2-h2">Bảng giá vải may đo</h2>
<p class="md2-intro">{len(BOOKS)} quyển vải đang có tại mayLEHUONG, {total} mẫu màu có ảnh. Bấm vào ảnh để xem các màu và thông số in trên nhãn từng mẫu.</p>
<div class="md2-fx-cards">{''.join(cards)}</div>
<p class="md2-note">Giá niêm yết tại cửa hàng, nhân viên xác nhận lại khi tư vấn. Màu trên màn hình có thể khác vải thật; nên xem quyển mẫu tại showroom.</p>
</div>
</section>
<div class="md2-fx-modal" id="md2-fx-modal" role="dialog" aria-modal="true" aria-labelledby="md2-fx-title" hidden>
<div class="md2-fx-box">
<button type="button" class="md2-fx-close" data-fx-close aria-label="Đóng">×</button>
{''.join(panels)}
<div class="md2-fx-zoom" hidden>
<button type="button" class="md2-fx-back" data-fx-back>Quay lại</button>
<div class="md2-fx-zoomimg"><button type="button" class="md2-fx-nav md2-fx-prev" data-fx-step="-1" aria-label="Mẫu trước">‹</button>
<img alt="" width="600" height="773"><button type="button" class="md2-fx-nav md2-fx-next" data-fx-step="1" aria-label="Mẫu sau">›</button></div>
<p class="md2-fx-zoomcap"><b></b> <span></span></p>
</div>
</div>
</div>
'''


CSS = '''<style id="''' + STYLE_ID + '''">
.md2-fx-cards{display:grid;gap:12px}
.md2-fx-card{display:grid;grid-template-columns:40% 1fr;background:#fff;border:1px solid rgba(161,127,34,.25);border-radius:16px;overflow:hidden;box-shadow:0 6px 18px rgba(45,26,15,.06)}
.md2-fx-media{position:relative;display:block;padding:0;border:0;background:#f6efe2;cursor:pointer;min-height:150px}
.md2-fx-card .md2-fx-media img{position:absolute!important;top:0;left:0;display:block;width:100%!important;height:100%!important;max-height:none!important;object-fit:cover!important}
.md2-fx-body{padding:12px 14px;display:flex;flex-direction:column;gap:4px;min-width:0}
.md2-fx .md2-fx-body .md2-h3{font-size:16px;margin:0!important;overflow-wrap:anywhere}
.md2-fx-pricewrap,.md2-fx-headprice{margin:0;display:flex;flex-direction:column}
.md2-fx .md2-fx-pricelabel{font-size:11px!important;color:#5c5147!important;font-weight:600;letter-spacing:.02em}
.md2-fx .md2-fx-price{font-family:'Noto Serif',Georgia,serif;font-size:19px!important;color:#9d0208!important;-webkit-text-fill-color:#9d0208;line-height:1.25}
.md2-fx .md2-fx-spec{margin:0;font-size:12.5px!important;line-height:1.45;color:#3a322b!important}
.md2-fx .md2-fx-count{font-size:12.5px!important;color:#3a322b!important}
.md2-fx .md2-fx-count b{color:#15110e}
.md2-fx-btn{align-self:flex-start;margin-top:4px;min-height:36px;padding:0 14px;border-radius:10px;border:1.5px solid #9d0208;background:#fff;color:#9d0208;font-weight:800;font-size:13px;cursor:pointer}
.md2-fx-btn:hover,.md2-fx-btn:focus-visible{background:#9d0208;color:#fff}
.md2-fx-modal{position:fixed;inset:0;z-index:100000;background:rgba(21,17,14,.62);display:flex;align-items:flex-end;justify-content:center}
.md2-fx-modal[hidden]{display:none}
.md2-fx-box{position:relative;background:#fdfaf4;width:100%;max-width:1080px;max-height:92vh;max-height:92dvh;overflow:auto;border-radius:20px 20px 0 0;padding:18px 14px 22px;color:#15110e;overscroll-behavior:contain}
.md2-fx-modal .md2-fx-close{position:sticky;top:0;float:right;z-index:2;width:40px!important;height:40px!important;min-width:0!important;min-height:0!important;padding:0!important;border-radius:50%!important;border:0;background:#15110e;color:#fff;font-size:26px!important;line-height:1!important;cursor:pointer}
.md2-fx-head{padding-right:48px;margin-bottom:12px}
.md2-fx-modal .md2-h3{color:#15110e!important;-webkit-text-fill-color:#15110e!important;font-family:'Noto Serif',Georgia,serif;font-size:20px;margin:0 0 4px}
.md2-fx-modal .md2-fx-pricelabel{font-size:11px!important;color:#5c5147!important;font-weight:600}
.md2-fx-modal .md2-fx-price{font-family:'Noto Serif',Georgia,serif;font-size:20px!important;color:#9d0208!important;-webkit-text-fill-color:#9d0208}
.md2-fx-modal .md2-fx-spec{margin:4px 0 0;font-size:13px!important;color:#3a322b!important}
.md2-fx-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.md2-fx-sw{display:flex;flex-direction:column;width:100%;padding:0;border:1px solid rgba(20,18,16,.1);border-radius:12px;overflow:hidden;background:#fff;cursor:pointer;text-align:left}
.md2-fx-sw img{display:block;width:100%;height:auto;aspect-ratio:330/210;object-fit:cover}
.md2-fx-modal .md2-fx-code{display:block;padding:6px 8px 0;font-size:12.5px!important;font-weight:800;color:#15110e!important}
.md2-fx-modal .md2-fx-lab{display:block;padding:2px 8px 8px;font-size:11px!important;line-height:1.35;color:#4a4038!important}
.md2-fx-cover{display:block;width:100%;height:auto;border-radius:14px}
.md2-fx-modal .md2-fx-empty{margin:12px 0 0;font-size:14px!important;color:#3a322b!important}
.md2-fx-back{min-height:38px;padding:0 14px;border-radius:10px;border:1.5px solid #15110e;background:#fff;color:#15110e;font-weight:700;font-size:13px;cursor:pointer;margin-bottom:10px}
.md2-fx-zoomimg{position:relative;display:flex;justify-content:center}
.md2-fx-zoomimg img{display:block;max-width:100%;width:auto;height:auto;max-height:68vh;max-height:68dvh;border-radius:12px;background:#fff}
.md2-fx-modal .md2-fx-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px!important;height:42px!important;min-width:0!important;min-height:0!important;padding:0!important;border-radius:50%!important;border:0;background:rgba(21,17,14,.82);color:#fff;font-size:28px!important;line-height:1!important;cursor:pointer}
.md2-fx-prev{left:4px}.md2-fx-next{right:4px}
.md2-fx-modal .md2-fx-zoomcap{text-align:center;margin:10px 0 0;font-size:14px!important;color:#15110e!important}
@media (min-width:640px){
.md2-fx-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.md2-fx-card{grid-template-columns:1fr}
.md2-fx-media{min-height:0}.md2-fx-card .md2-fx-media img{position:static!important;height:auto!important;aspect-ratio:16/10}
.md2-fx-body{padding:16px 18px 18px}
.md2-fx .md2-fx-body .md2-h3{font-size:19px}
.md2-fx .md2-fx-price{font-size:22px!important}
.md2-fx-modal{align-items:center;padding:24px}
.md2-fx-box{border-radius:20px;padding:24px}
.md2-fx-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
}
@media (min-width:1024px){.md2-fx-cards{grid-template-columns:repeat(3,minmax(0,1fr))}.md2-fx-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
</style>'''

JS = '''<script id="mlh-maydo-fabric-js">
(function(){
  var modal=document.getElementById('md2-fx-modal'); if(!modal) return;
  var zoom=modal.querySelector('.md2-fx-zoom'), zimg=zoom.querySelector('img');
  var cur=null, list=[], idx=0, lastFocus=null;
  function show(i){ idx=(i+list.length)%list.length; var b=list[idx];
    zimg.src=b.getAttribute('data-fx-full'); zimg.alt=b.querySelector('img').alt;
    zoom.querySelector('.md2-fx-zoomcap b').textContent=b.getAttribute('data-fx-code');
    zoom.querySelector('.md2-fx-zoomcap span').textContent=b.getAttribute('data-fx-lab'); }
  function open(book,from){ lastFocus=from||null;
    Array.prototype.forEach.call(modal.querySelectorAll('.md2-fx-panel'),function(p){ p.hidden=p.getAttribute('data-fx-book')!==book; });
    cur=modal.querySelector('.md2-fx-panel[data-fx-book="'+book+'"]'); if(!cur) return;
    list=Array.prototype.slice.call(cur.querySelectorAll('.md2-fx-sw')); zoom.hidden=true;
    modal.hidden=false; document.documentElement.style.overflow='hidden'; document.body.style.overflow='hidden';
    modal.querySelector('.md2-fx-box').scrollTop=0; modal.querySelector('.md2-fx-close').focus(); }
  function close(){ modal.hidden=true; zoom.hidden=true; if(cur) cur.hidden=true;
    document.documentElement.style.overflow=''; document.body.style.overflow='';
    if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  function unzoom(){ zoom.hidden=true; if(cur) cur.hidden=false; }
  document.addEventListener('click',function(e){
    var t=e.target.closest?e.target.closest('[data-fx-open]'):null;
    if(t){ e.preventDefault(); open(t.getAttribute('data-fx-open'),t); }});
  modal.addEventListener('click',function(e){
    if(e.target===modal||e.target.closest('[data-fx-close]')){ close(); return; }
    if(e.target.closest('[data-fx-back]')){ unzoom(); return; }
    var s=e.target.closest('[data-fx-step]'); if(s){ show(idx+parseInt(s.getAttribute('data-fx-step'),10)); return; }
    var w=e.target.closest('.md2-fx-sw'); if(w){ show(list.indexOf(w)); cur.hidden=true; zoom.hidden=false; modal.querySelector('.md2-fx-box').scrollTop=0; }});
  document.addEventListener('keydown',function(e){ if(modal.hidden) return;
    if(e.key==='Escape'){ if(!zoom.hidden) unzoom(); else close(); }
    else if(!zoom.hidden&&e.key==='ArrowLeft') show(idx-1);
    else if(!zoom.hidden&&e.key==='ArrowRight') show(idx+1); });
})();
</script>'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    p = Path(a.web) / 'may-do.html'
    t = p.read_text(encoding='utf-8')
    errs = []
    if STYLE_ID in t:
        errs.append('already applied')
    cat = json.loads(CAT.read_text(encoding='utf-8'))
    by_fam, labs = labels_for(cat)
    for b in BOOKS:
        if b[4] and not (COVERS / b[4]).is_file():
            errs.append('missing cover ' + b[4])
        if b[5] and b[5] not in by_fam:
            errs.append('missing family ' + b[5])
    used = {b[5] for b in BOOKS if b[5]}
    if used != set(by_fam):
        errs.append(f'families not covered: {set(by_fam) ^ used}')
    start = '<!-- GALLERY SECTION: TUYỆT TÁC MAY ĐO THỦ CÔNG'
    if t.count(start) != 1 or t.count('id="tuyet-tac-may-do"') != 1 or t.count('id="suitLightboxModal"') != 1:
        errs.append('gallery markers not found exactly once')
    else:
        i = t.index(start)
        j = t.index('function closeSuitModal()', i)
        k = t.index('</script>', j) + len('</script>')
        block = t[i:k]
        if block.count('<section') != 1 or 'openSuitCardModal' not in block or 'md2-' in block:
            errs.append('gallery block boundaries look wrong')
    if t.count('</head>') != 1 or t.count('</body>') != 1:
        errs.append('head/body not found once')
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    t = t[:i] + section_html(by_fam, labs) + t[k:]
    t = t.replace('</head>', CSS + '\n</head>', 1).replace('</body>', JS + '\n</body>', 1)
    assert 'openSuitCardModal' not in t and 'tuyet-tac-may-do"' not in t.split('<body', 1)[1]
    print(f'ok: removed gallery ({k - i} chars), added {len(BOOKS)} books / {len(labs)} swatches')
    if not a.dry_run:
        make_assets(a.web, cat, by_fam)
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
