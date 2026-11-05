"""May-do page: comparison blocks A (fit) + B (handwork/custom) + 8-row table.

Spec: PROMPT-ANTI-ANH-SO-SANH-MAY-DO-V2-20261105.md (owner chose all-new images).
Usage: python -I tools/maydo_compare_v2_20261105.py <web_root> [--dry-run]

- First run replaces <section class="md2 md2-problem"> with blocks A and B (between markers).
- Later runs replace the content between the markers, so the tool can be re-run once the
  9 PNGs arrive in images/may-do-so-sanh-v2-20261105/ (repo checkout).
- Each image: PNG present -> WebP 1600/800 in <web_root>/assets/may-do-so-sanh-v2-20261105/ and <img>;
  missing -> neutral placeholder "Ảnh minh họa đang được cập nhật" (no reuse of old images).
- Labels "Hàng may sẵn" / "May đo mayLEHUONG" are HTML BELOW the image, one per half (translatable); no text over the photo.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'images' / 'may-do-so-sanh-v2-20261105'
OUT_REL = 'assets/may-do-so-sanh-v2-20261105'
STYLE_ID = 'mlh-maydo-compare-v2'
M_START = '<!-- MLH-COMPARE-V2 START -->'
M_END = '<!-- MLH-COMPARE-V2 END -->'
BAD = 'Hàng may sẵn'
GOOD = 'May đo mayLEHUONG'
CAPTION = 'Ảnh minh họa'
PLACEHOLDER = 'Ảnh minh họa đang được cập nhật'

A = [
    ('a1-vai-eo-sai-dung', 'Vai áo và eo đồng hồ cát nhẹ',
     ['Cầu vai thừa, trễ khỏi xương vai làm lõm đầu tay áo, hoặc quá chật gây kích nách.',
      'Thân áo suông thẳng như hình hộp, hoặc cài khuy bị kéo nhăn hình chữ X.'],
     ['Đường ráp vai dừng đúng mỏm xương vai, đầu tay áo tròn êm.',
      'Thân áo chiết eo đồng hồ cát nhẹ, tôn dáng chữ V mà ngồi vẫn thoải mái.'],
     'Ảnh minh họa: bên trái vest may sẵn trễ vai, thân suông và kéo nhăn chữ X, bên phải vest may đo vừa vai, chiết eo nhẹ'),
    ('a2-co-tay-ao-sai-dung', 'Cổ tay áo vừa tầm',
     ['Tay áo quá dài trùm qua mu bàn tay, che mất cổ tay sơ mi, hoặc quá ngắn, co tay là lộ cả cổ tay.'],
     ['Tay áo dừng đúng xương cổ tay, lộ 1–1,5 cm măng-sét sơ mi bên trong.'],
     'Ảnh minh họa cận cổ tay: bên trái tay áo trùm mu bàn tay, bên phải tay áo lộ măng-sét sơ mi'),
    ('a3-ong-quan-sai-dung', 'Ống quần đứng phom, không gãy ống',
     ['Quần may sẵn chung một chiều dài nên thường thừa, vải đùn thành nhiều nếp gãy trên mu giày.'],
     ['Ống quần cắt theo chiều dài chân và độ mở cổ giày, rơi thẳng và chỉ chạm nhẹ mặt giày.'],
     'Ảnh minh họa cận ống quần: bên trái ống quần dài gãy nhiều nếp trên giày, bên phải ống quần thẳng chạm nhẹ giày'),
    ('a4-dang-nguoi-rieng-sai-dung', 'Dáng người riêng: vai xuôi, lưng, hông',
     ['Hở cổ áo sau gáy, đùn nếp ngang dưới cổ và bung xẻ tà sau.'],
     ['Cắt rập riêng theo 25 số đo cơ thể: cổ áo ôm sát sơ mi, lưng phẳng, xẻ tà khép thẳng.'],
     'Ảnh minh họa nhìn từ sau: bên trái hở cổ áo, lưng đùn nếp và xẻ tà bung, bên phải cổ áo ôm sát và lưng phẳng'),
]
B = [
    ('b1-dot-tay-ve-sai-dung', 'Đột tay thủ công mép ve',
     ['Mép ve áo và nắp túi may máy phẳng lì, cứng; lớp keo ép dễ phồng rộp.'],
     ['Thợ đột chỉ tay từng mũi nhỏ dọc mép ve, cổ áo, nắp túi và tay áo, giúp mép áo mềm và giữ phom lâu.'],
     'Ảnh minh họa cận mép ve: bên trái may máy phồng keo, bên phải đường đột tay đều mũi'),
    ('b2-khuyet-ve-sai-dung', 'Khuyết Milan thùa tay trên ve áo',
     ['Khuyết ve dập máy hàng loạt bằng chỉ mảnh, dễ xơ sợi, hoặc chỉ là khuyết giả.'],
     ['Khuyết Milan được thợ thùa tay từng mũi chỉ lụa quanh sợi gân, nổi khối sắc nét trên ve áo.'],
     'Ảnh minh họa cận khuyết ve: bên trái khuyết dập máy xơ chỉ, bên phải khuyết Milan thùa tay'),
    ('b3-theu-ten-sai-dung', 'Thêu tên riêng trong ngực áo',
     ['Chỉ có nhãn mác sản xuất hàng loạt, ai mặc cũng giống nhau.'],
     ['Thêu tên hoặc chữ ký riêng bên trong ngực áo, khách chọn phông chữ và màu chỉ.'],
     'Ảnh minh họa mặt trong ngực áo: bên trái lót trơn đại trà, bên phải lót lụa có vùng thêu'),
    ('b4-custom-chi-tiet-sai-dung', 'Tự chọn chi tiết theo ý thích',
     ['Kiểu ve, số khuy, màu lót và túi áo cố định; khách phải chấp nhận mẫu có sẵn.'],
     ['Tự chọn kiểu ve (ve nhọn, ve xuôi, ve sam), màu lót lụa, cúc sừng, kiểu túi, xẻ tà và khuy tay áo mở thật.'],
     'Ảnh minh họa chi tiết áo: bên trái ve thường và cúc nhựa, bên phải ve nhọn, cúc sừng và lót lụa'),
    ('b5-fitting-sai-dung', 'Thử đồ trước khi hoàn thiện',
     ['Mua áo đã may xong; nếu lệch thì chỉ sửa chắp vá phần ngọn.'],
     ['Thử áo trên người khi còn lược chỉ trắng để chỉnh độ ôm eo, độ dài tay áo và ống quần trước khi may hoàn thiện.'],
     'Ảnh minh họa: bên trái khách mặc áo may sẵn bị lệch, bên phải thợ chỉnh áo còn lược chỉ trên người khách'),
]
TABLE = [
    ('Vai áo', 'Theo bảng size chung, dễ thừa hoặc chật', 'Dừng đúng mỏm xương vai'),
    ('Eo áo', 'Suông thẳng hoặc kéo nhăn khi cài khuy', 'Chiết eo đồng hồ cát nhẹ, vẫn thoải mái'),
    ('Cổ tay áo', 'Thường quá dài hoặc quá ngắn', 'Lộ 1–1,5 cm măng-sét sơ mi'),
    ('Độ dài ống quần', 'Chung một chiều dài, dễ gãy ống', 'Cắt theo chân, chạm nhẹ mặt giày'),
    ('Đột tay và khuyết Milan', 'May máy, khuyết dập máy', 'Đột tay và thùa tay từng mũi'),
    ('Thêu tên riêng', 'Không có', 'Thêu tên hoặc chữ ký theo ý khách'),
    ('Chọn chi tiết', 'Mẫu cố định', 'Tự chọn ve, lót, cúc, túi, xẻ tà'),
    ('Thử đồ và bảo hành', 'Sửa sau khi mua, nếu sửa được', 'Thử khi còn lược chỉ, bảo hành đường may trọn đời'),
]

CSS = (
    '<style id="' + STYLE_ID + '">'
    '.md2-cv-grid{display:grid;gap:20px}'
    '.md2-cv-card{background:#fff;border:1px solid rgba(20,18,16,.08);border-radius:16px;overflow:hidden;'
    'box-shadow:0 6px 18px rgba(45,26,15,.06);display:flex;flex-direction:column}'
    '.md2-cv-fig{position:relative;margin:0;background:#f6efe2}'
    '.md2-cv-fig img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}'
    '.md2-cv-ph{aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;padding:40px 16px 16px;'
    'background:linear-gradient(90deg,#efe5d6 0,#efe5d6 calc(50% - 2px),#fdfaf4 calc(50% - 2px),#fdfaf4 calc(50% + 2px),#e7dcc9 calc(50% + 2px))}'
    '.md2-cv-ph span{background:#fff;color:#3d3226!important;-webkit-text-fill-color:#3d3226;font-size:13px;font-weight:600;'
    'padding:6px 12px;border-radius:999px;border:1px dashed rgba(161,127,34,.6);text-align:center}'
    '.md2-cv-under{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(20,18,16,.08);background:#fffdf8}'
    '.md2-cv-under>span{display:block;padding:8px 10px;text-align:center;font-size:12.5px!important;font-weight:800;line-height:1.3;'
    'letter-spacing:.02em;text-transform:none!important}'
    '.md2-cv-under>.is-bad{color:#9d0208!important;-webkit-text-fill-color:#9d0208;border-right:1px solid rgba(20,18,16,.08)}'
    '.md2-cv-under>.is-good{color:#15110e!important;-webkit-text-fill-color:#15110e}'
    '.md2-cv-card .md2-figcap{position:static;display:block;margin:0;padding:6px 12px 0;background:none;border-radius:0;text-align:right;'
    'color:#4a3d2f!important;-webkit-text-fill-color:#4a3d2f;font-size:11.5px!important;font-weight:600}'
    '.md2-cv-body{padding:16px 16px 18px}'
    '.md2-cv-num{display:inline-block;font-family:\'Noto Serif\',Georgia,serif;font-size:14px;font-weight:700;'
    'color:#6e5410!important;margin-bottom:4px}'
    '.md2-cv-cols{display:grid;gap:10px;margin-top:10px}'
    '.md2-cv-col{border-radius:10px;padding:10px 12px}'
    '.md2-cv-col.is-bad{background:#fff6f4;border-left:3px solid #9d0208}'
    '.md2-cv-col.is-good{background:#fffdf8;border-left:3px solid #15110e;box-shadow:inset 0 0 0 1px rgba(161,127,34,.22)}'
    '.md2-cv-col .md2-cv-lbl{margin:0 0 4px!important;font-size:13px!important;font-weight:800;letter-spacing:.02em;text-transform:none!important}'
    '.md2-cv-col.is-bad .md2-cv-lbl{color:#9d0208!important}'
    '.md2-cv-col.is-good .md2-cv-lbl{color:#15110e!important}'
    '.md2-cv-col ul{margin:0;padding-left:18px;list-style:disc!important}'
    '.md2-cv-col li{color:#15110e!important;font-size:14px;line-height:1.55;margin:0 0 4px}'
    '.md2-cv-col li:last-child{margin-bottom:0}'
    '.md2-cv-tbl-wrap{margin-top:34px}'
    '.md2-cv-tbl{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid rgba(161,127,34,.3);'
    'border-radius:14px;overflow:hidden;font-size:14px}'
    '.md2-cv-tbl th,.md2-cv-tbl td{padding:10px 12px;text-align:left;vertical-align:top;color:#15110e!important;'
    'border-bottom:1px solid rgba(20,18,16,.08);line-height:1.5}'
    '.md2-cv-tbl tbody tr:last-child th,.md2-cv-tbl tbody tr:last-child td{border-bottom:0}'
    '.md2-cv-tbl thead th{background:#f6efe2;font-weight:800;font-size:13px}'
    '.md2-cv-tbl thead th.is-bad{color:#9d0208!important}'
    '.md2-cv-tbl tbody th{font-weight:700;background:#fffdf8}'
    '.md2-cv-tbl td.is-good{font-weight:600}'
    '@media (max-width:639px){'
    '.md2-cv-tbl,.md2-cv-tbl thead,.md2-cv-tbl tbody{display:block}'
    '.md2-cv-tbl tr{display:grid;grid-template-columns:1fr 1fr}'
    '.md2-cv-tbl thead th:first-child{display:none}'
    '.md2-cv-tbl tbody th{grid-column:1/-1;border-bottom:0;padding-bottom:2px;background:#fff}'
    '.md2-cv-tbl tbody td{font-size:13px}'
    '.md2-cv-tbl tbody td.is-bad{border-right:1px solid rgba(20,18,16,.08)}'
    '}'
    '@media (min-width:420px){.md2-cv-cols{grid-template-columns:1fr 1fr}}'
    '@media (min-width:900px){.md2-cv-grid{grid-template-columns:1fr 1fr;gap:24px}'
    '.md2-cv-under>span{font-size:13.5px!important;padding:9px 12px}'
    '.md2-cv-body{padding:20px 22px 22px}}'
    '</style>'
)


def figure(slug, alt, have):
    if have:
        media = (f'<img src="/{OUT_REL}/{slug}-1600.webp" srcset="/{OUT_REL}/{slug}-800.webp 800w, '
                 f'/{OUT_REL}/{slug}-1600.webp 1600w" sizes="(max-width:899px) 100vw, 580px" width="1600" '
                 f'height="1000" loading="lazy" decoding="async" alt="{alt}">')
        cap = f'<figcaption class="md2-figcap">{CAPTION}</figcaption>'
    else:
        media = f'<div class="md2-cv-ph"><span>{PLACEHOLDER}</span></div>'
        cap = ''
    # Labels sit BELOW the image (owner 06/11: no text over the photo), one per half.
    return (f'<figure class="md2-cv-fig">{media}<div class="md2-cv-under">'
            f'<span class="is-bad">{BAD}</span><span class="is-good">{GOOD}</span></div>{cap}</figure>')


def card(i, item, have):
    slug, h3, bad, good, alt = item
    lis = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
    return (f'<article class="md2-cv-card">{figure(slug, alt, have)}<div class="md2-cv-body">'
            f'<span class="md2-cv-num">{i:02d}</span><h3 class="md2-h3">{h3}</h3><div class="md2-cv-cols">'
            f'<div class="md2-cv-col is-bad"><p class="md2-cv-lbl">{BAD}</p><ul>{lis(bad)}</ul></div>'
            f'<div class="md2-cv-col is-good"><p class="md2-cv-lbl">{GOOD}</p><ul>{lis(good)}</ul></div>'
            f'</div></div></article>')


def build(have):
    rows = ''.join(f'<tr><th scope="row">{c}</th><td class="is-bad">{b}</td><td class="is-good">{g}</td></tr>'
                   for c, b, g in TABLE)
    a = ''.join(card(i, it, it[0] in have) for i, it in enumerate(A, 1))
    b = ''.join(card(i, it, it[0] in have) for i, it in enumerate(B, 1))
    return (
        M_START + '\n'
        '<section class="md2 md2-cmp" id="so-sanh-phom-dang" aria-labelledby="md2-cmp-a-title">\n<div class="md2-wrap">\n'
        '<p class="md2-kicker">Vấn đề</p>\n'
        '<h2 id="md2-cmp-a-title" class="md2-h2">So sánh phom dáng: vest may sẵn và vest may đo</h2>\n'
        '<p class="md2-intro">Vest may sẵn được cắt theo bảng size chung. Đây là bốn lỗi hay gặp nhất khi mặc thử, '
        'và cách may đo xử lý từng lỗi.</p>\n'
        f'<div class="md2-cv-grid">{a}</div>\n</div>\n</section>\n'
        '<section class="md2 md2-cmp md2-cmp-b" id="dac-quyen-may-do" aria-labelledby="md2-cmp-b-title">\n<div class="md2-wrap">\n'
        '<p class="md2-kicker">Đặc quyền</p>\n'
        '<h2 id="md2-cmp-b-title" class="md2-h2">5 đặc quyền thủ công và custom chỉ có ở vest may đo mayLEHUONG</h2>\n'
        '<p class="md2-intro">Những chi tiết hàng may sẵn đại trà không làm được, và là lý do một bộ vest may đo đáng giá hơn.</p>\n'
        f'<div class="md2-cv-grid">{b}</div>\n'
        '<div class="md2-cv-tbl-wrap"><h3 class="md2-h3">So sánh nhanh 8 tiêu chí</h3>'
        '<table class="md2-cv-tbl"><thead><tr><th scope="col">Tiêu chí</th>'
        f'<th scope="col" class="is-bad">Vest may sẵn</th><th scope="col">Vest may đo mayLEHUONG</th></tr></thead>'
        f'<tbody>{rows}</tbody></table></div>\n</div>\n</section>\n' + M_END
    )


def convert(web, slugs):
    from PIL import Image
    out = Path(web) / OUT_REL
    out.mkdir(parents=True, exist_ok=True)
    for slug in slugs:
        im = Image.open(SRC / f'{slug}.png').convert('RGB')
        for w in (1600, 800):
            im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(
                out / f'{slug}-{w}.webp', 'WEBP', quality=82, method=6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    p = Path(a.web) / 'may-do.html'
    with open(p, encoding='utf-8', newline='') as f:
        t = f.read()
    have = {it[0] for it in A + B if (SRC / f'{it[0]}.png').is_file()}
    block = build(have)
    if M_START in t:
        i, j = t.index(M_START), t.index(M_END) + len(M_END)
        t = t[:i] + block + t[j:]
        mode = 'refresh'
    else:
        m = re.search(r'<section class="md2 md2-problem".*?</section>', t, re.S)
        if not m or t.count('<section class="md2 md2-problem"') != 1:
            print('NOT WRITTEN: problem section not found once')
            sys.exit(1)
        t = t[:m.start()] + block + t[m.end():]
        mode = 'first run'
    t = re.sub(r'<style id="' + STYLE_ID + r'">.*?</style>\n?', '', t, flags=re.S)
    if t.count('</head>') != 1:
        print('NOT WRITTEN: </head> not found once')
        sys.exit(1)
    t = t.replace('</head>', CSS + '\n</head>', 1)
    print(f'ok ({mode}): 9 cards, {len(have)} real images, {9 - len(have)} placeholders, table {len(TABLE)} rows')
    if not a.dry_run:
        if have:
            convert(a.web, sorted(have))
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
