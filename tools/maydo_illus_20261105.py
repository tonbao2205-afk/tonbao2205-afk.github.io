"""May-do page: add the 7 illustration images (PROMPT-ANTI-ANH-MINH-HOA-MAY-DO-20261105.md).

Usage: python -I tools/maydo_illus_20261105.py <web_root> [--dry-run]
Needs tools/maydo_v2_20261105.py already applied. Converts the PNGs from
images/may-do-minh-hoa-20261105/ (repo checkout) to WebP under <web_root>/assets/may-do-minh-hoa-20261105/:
comparisons 1600/800 px, scenes 1200/640 px. Then:
  - problem section: the 3 cards become rows (image + text), labels "May sẵn" / "May đo" are HTML over the image;
  - solution section: each of the 4 cards gets its image on top;
  - adds <style id="mlh-maydo-illus">. Refuses to run twice; every rule must match or nothing is written.
"""
import argparse
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'images' / 'may-do-minh-hoa-20261105'
OUT_REL = 'assets/may-do-minh-hoa-20261105'
STYLE_ID = 'mlh-maydo-illus'

COMPARE = [
    ('01-vai-nguc-sai-dung', 'Vai và ngực lệch size',
     'Ảnh minh họa: bên trái vest may sẵn thừa vai và kéo nếp chữ X ở ngực, bên phải vest may đo vừa vai, ngực phẳng'),
    ('02-tay-ong-quan-sai-dung', 'Tay áo và ống quần sai độ dài',
     'Ảnh minh họa: bên trái tay áo che kín cổ tay và ống quần dồn nếp trên giày, bên phải tay áo lộ cổ tay sơ mi và ống quần gọn'),
    ('03-dang-nguoi-rieng-sai-dung', 'Dáng người riêng không có trong bảng size',
     'Ảnh minh họa nhìn từ sau: bên trái cổ áo hở, lưng nhăn và xẻ tà bung, bên phải cổ áo ôm sát và lưng phẳng'),
]
SCENES = [
    ('04-do-25-so-do', 'Đo 25 số đo cơ thể', 'Ảnh minh họa: thợ may đo vai cho khách'),
    ('05-chon-vai', 'Chọn vải theo cách bạn mặc', 'Ảnh minh họa: khách sờ thử vải trên quyển mẫu cùng nhân viên tư vấn'),
    ('06-thu-do-chinh', 'Thử đồ và chỉnh trước khi giao', 'Ảnh minh họa: khách thử áo lược chỉ trước gương, thợ ghim chỉnh tay áo'),
    ('07-duong-may', 'Bảo hành đường may trọn đời', 'Ảnh minh họa: cận cảnh đường may và khuyết áo trên ve vest'),
]
LBL_BAD = 'May sẵn'
LBL_GOOD = 'May đo'
CAPTION = 'Ảnh minh họa'

CSS = (
    '<style id="' + STYLE_ID + '">'
    '.md2-cases{display:grid;gap:18px}'
    '.md2-case{display:grid;gap:0;padding:0!important;overflow:hidden}'
    '.md2-case-fig{position:relative;margin:0;background:#f6efe2}'
    '.md2-case-fig img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}'
    '.md2-case-body{padding:18px 20px 20px}'
    '.md2-case-fig .md2-tag{position:absolute;top:8px;display:inline-block;padding:3px 8px;border-radius:999px;'
    'font-size:11px!important;font-weight:800;line-height:1.2;letter-spacing:.02em;text-transform:none!important;'
    'box-shadow:0 2px 8px rgba(0,0,0,.18)}'
    '.md2-tag-bad{left:8px;background:#9d0208;color:#fff!important;-webkit-text-fill-color:#fff}'
    '.md2-tag-good{left:calc(50% + 8px);background:#15110e;color:#fff!important;-webkit-text-fill-color:#fff}'
    '.md2-figcap{position:absolute;right:8px;bottom:8px;padding:3px 8px;border-radius:999px;'
    'background:rgba(255,255,255,.92);color:#3d3226!important;-webkit-text-fill-color:#3d3226;'
    'font-size:11px!important;font-weight:600;line-height:1.2}'
    '.md2-scene-fig{position:relative;margin:-20px -20px 16px;background:#f6efe2}'
    '.md2-scene-fig img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}'
    '.md2-solution .md2-card{overflow:hidden}'
    '@media (min-width:768px){'
    '.md2-case{grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);align-items:center}'
    '.md2-case-body{padding:24px 28px}'
    '.md2-case-fig .md2-tag{top:14px;padding:5px 11px;font-size:13px!important}.md2-tag-bad{left:14px}.md2-tag-good{left:calc(50% + 14px)}'
    '}'
    '</style>'
)


def pic(slug, alt, w_big, w_small, ratio, sizes):
    h_big = round(w_big / ratio)
    return (f'<img src="/{OUT_REL}/{slug}-{w_big}.webp" srcset="/{OUT_REL}/{slug}-{w_small}.webp {w_small}w, '
            f'/{OUT_REL}/{slug}-{w_big}.webp {w_big}w" sizes="{sizes}" width="{w_big}" height="{h_big}" '
            f'loading="lazy" decoding="async" alt="{alt}">')


def convert(web):
    out = Path(web) / OUT_REL
    out.mkdir(parents=True, exist_ok=True)
    for slug, *_ in COMPARE:
        im = Image.open(SRC / f'{slug}.png').convert('RGB')
        for w in (1600, 800):
            im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(out / f'{slug}-{w}.webp', 'WEBP', quality=82, method=6)
    for slug, *_ in SCENES:
        im = Image.open(SRC / f'{slug}.png').convert('RGB')
        for w in (1200, 640):
            im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(out / f'{slug}-{w}.webp', 'WEBP', quality=82, method=6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    p = Path(a.web) / 'may-do.html'
    with open(p, encoding='utf-8', newline='') as f:
        t = f.read()
    errs = []
    if STYLE_ID in t:
        errs.append('already applied')
    if 'md2-problem' not in t:
        errs.append('maydo_v2 not applied')
    for slug, *_ in COMPARE + SCENES:
        if not (SRC / f'{slug}.png').is_file():
            errs.append(f'missing {slug}.png')
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)

    # problem: 3 cards -> rows with comparison image
    n = 0
    for slug, h3, alt in COMPARE:
        pat = re.compile(r'<div class="md2-card">(<span class="md2-num">\d\d</span><h3 class="md2-h3">'
                         + re.escape(h3) + r'</h3><p>.*?</p>)</div>')
        fig = ('<figure class="md2-case-fig">'
               + pic(slug, alt, 1600, 800, 1.6, '(max-width:767px) 100vw, 680px')
               + f'<span class="md2-tag md2-tag-bad">{LBL_BAD}</span>'
               + f'<span class="md2-tag md2-tag-good">{LBL_GOOD}</span>'
               + f'<figcaption class="md2-figcap">{CAPTION}</figcaption></figure>')
        t, k = pat.subn(lambda m: '<div class="md2-card md2-case">' + fig
                        + '<div class="md2-case-body">' + m.group(1) + '</div></div>', t)
        n += k
    if n != 3:
        errs.append(f'problem cards matched {n}/3')
    t, k = re.subn(r'(<h2 id="md2-problem-title".*?)<div class="md2-grid3">', r'\1<div class="md2-cases">', t, count=1, flags=re.S)
    if k != 1:
        errs.append('problem grid not found')

    # solution: image on top of each card
    n = 0
    for slug, h3, alt in SCENES:
        old = f'<div class="md2-card"><h3 class="md2-h3">{h3}</h3>'
        if t.count(old) != 1:
            continue
        fig = ('<figure class="md2-scene-fig">'
               + pic(slug, alt, 1200, 640, 4 / 3, '(max-width:767px) 100vw, 540px')
               + f'<figcaption class="md2-figcap">{CAPTION}</figcaption></figure>')
        t = t.replace(old, f'<div class="md2-card">{fig}<h3 class="md2-h3">{h3}</h3>', 1)
        n += 1
    if n != 4:
        errs.append(f'solution cards matched {n}/4')
    if t.count('</head>') != 1:
        errs.append('</head> not found once')
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    t = t.replace('</head>', CSS + '\n</head>', 1)
    print('ok: 3 comparison rows + 4 scene images')
    if not a.dry_run:
        convert(a.web)
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
