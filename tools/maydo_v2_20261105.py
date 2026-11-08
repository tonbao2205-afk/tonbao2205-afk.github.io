"""Redesign of may-do.html (05/11/2026): argument structure H1 -> H2 (problem, reasoning, evidence,
process, conclusion) -> H3, premium fabric boards with real sample-book photos and swatches.

Usage: python -I tools/maydo_v2_20261105.py <web_root> [--dry-run]
- Replaces the four opening sections (intro, process, why bespoke, fabric collection) with the new
  hero / problem / solution / fabric boards / process sections. The fabric section keeps id="bo-suu-tap-vai".
- Keeps the gallery (#tuyet-tac-may-do), the packages section and the 6-field consultation form
  (#dat-lich-may-do-section) untouched; inserts a conclusion section right before the form.
- Adds <style id="mlh-maydo-v2"> before </head>.
- Converts the 5 sample-book cover photos to WebP under <web_root>/assets/may-do-20261105/.
Every rule must match exactly once, otherwise nothing is written.
"""
import argparse
import html
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
COVERS = ROOT / 'images' / 'Bảng Vải Và Gía Tiền'
SWATCH_CAT = ROOT / 'images' / 'bang-vai-mau-chuan' / 'catalog.json'
ASSET_DIR = 'assets/may-do-20261105'
HERO = '/assets/hero-nochu-20261104/may-do-nam'

# (slug, cover file, swatch family, swatch indexes, name, price, label facts, traits, fit)
BOARDS = [
    ('roger-la-viale', 'Bảng Vải 18.000.000/ROGER LA VIALE.jpeg', None, [],
     'Roger La Viale · Aventus', '18.000.000đ',
     'Theo nhãn mẫu: 70% wool, 30% polyester, khổ vải 58/60 inch.',
     ['Len cho vải thoáng và rủ tự nhiên; phần polyester giúp ít nhăn hơn len nguyên chất.',
      'Bề mặt sợi pha màu (melange), đẹp nhất ở màu xám và đỏ rượu.'],
     'Doanh nhân hay đi công tác, cần bộ vest giữ dáng sau chuyến bay dài.'),
    ('louis', 'Bảng Vải 12.000.000/LOUIS.jpeg', 'louis-12l-england', [1, 3, 5, 6],
     'Louis', '12.000.000đ',
     'Theo nhãn mẫu: Made in England.',
     ['Sợi xoắn chặt, dệt dày, cầm đầm tay nên ngực, vai và ly quần giữ phom tốt.',
      'Bề mặt lì, không bóng, sang một cách kín đáo.'],
     'Vest mặc thường xuyên, cần bền và đứng dáng trong nhiều năm.'),
    ('donatella', 'Bảng Vải 10.500.000/DONATELLA/DONATELLA.jpeg', 'donatella-10500', [1, 4, 12, 13],
     'Donatella', '10.500.000đ',
     "Theo nhãn mẫu: 180's Wool & Lycra, Made in Italy.",
     ['Sợi rất mảnh dệt dày, bề mặt bóng nhẹ, mềm khi chạm da.',
      'Ít nhăn, có nhiều màu nổi như vàng, xanh cổ vịt, đỏ rượu.'],
     'Vest cưới, lễ phục và sự kiện cần nổi bật dưới ánh đèn.'),
    ('new-sample', 'Bảng Vải 10.500.000/NEW SAMPLE/NEW SAMPLE.jpeg', 'ns10500', [1, 2, 4, 8],
     'New Sample', '10.500.000đ',
     'Theo bìa mẫu: Italy · England · Germany.',
     ['Bề mặt lì, mịn, thoáng; áo giữ nét ở vai và ve nhưng thân vẫn rủ tự nhiên.',
      'Tông màu trung tính: xám, nâu xám, xanh navy.'],
     'Vest gặp đối tác, họp quan trọng, mặc nhiều lần trong tuần.'),
    ('gazzarini-uomo', 'Bảng Vải 9.000.000/GAZZARINI UOMO.jpeg', 'gazzarini-uomo-9000', [0, 3, 6, 8],
     'Gazzarini Uomo', '9.000.000đ',
     'Theo nhãn mẫu: Made in Italy.',
     ['Mềm, xốp nhẹ, bóng tự nhiên dưới ánh sáng.',
      'Bảng màu cơ bản: navy, xám than, xám tro, đen, dễ phối sơ mi và cà vạt.'],
     'Bộ vest may đo đầu tiên, mặc được nhiều dịp.'),
]

E = html.escape


def swatches(cat, family, idxs):
    items = [i for i in cat['items'] if i['family_id'] == family]
    return [items[k] for k in idxs]


def board_html(b, cat):
    slug, _, fam, idxs, name, price, label, traits, fit = b
    sw = ''
    if fam:
        cells = ''.join(
            f'<li><img src="{E(i["image"])}" alt="{E(i["alt"])}" width="900" height="1160" loading="lazy" decoding="async"></li>'
            for i in swatches(cat, fam, idxs))
        sw = f'<ul class="md2-swatches" aria-label="Mẫu vải {E(name)}">{cells}</ul>'
    tr = ''.join(f'<li>{E(t)}</li>' for t in traits)
    return (
        '<article class="md2-board">'
        f'<div class="md2-board-media"><img src="/{ASSET_DIR}/{slug}-1200.webp" '
        f'srcset="/{ASSET_DIR}/{slug}-640.webp 640w, /{ASSET_DIR}/{slug}-1200.webp 1200w" '
        'sizes="(max-width:767px) 100vw, 46vw" width="1200" height="670" loading="lazy" decoding="async" '
        f'alt="Quyển mẫu vải {E(name)}">{sw}</div>'
        '<div class="md2-board-body">'
        f'<p class="md2-price">{E(price)}</p>'
        f'<h3 class="md2-h3">{E(name)}</h3>'
        f'<p class="md2-spec">{E(label)}</p>'
        f'<ul class="md2-list">{tr}</ul>'
        f'<p class="md2-fit"><strong>Phù hợp:</strong> {E(fit)}</p>'
        '</div></article>'
    )


def build_sections(cat):
    boards = ''.join(board_html(b, cat) for b in BOARDS)
    return f'''<section class="md2 md2-hero" aria-labelledby="seo-page-heading">
<div class="md2-wrap md2-hero-grid">
<div class="md2-hero-text">
<p class="md2-kicker">May đo Bespoke · Biên Hòa &amp; Hà Nội</p>
<h1 id="seo-page-heading" class="md2-h1">May vest theo số đo tại Biên Hòa và Hà Nội</h1>
<p class="md2-lead">Một bộ vest đẹp trước hết phải vừa người. Trang này giải thích vì sao vest may sẵn thường không vừa, may đo khắc phục điều đó thế nào, và giúp bạn chọn bảng vải hợp với ngân sách.</p>
<div class="md2-actions"><a class="md2-btn" href="#dat-lich-may-do-section">Đặt lịch tư vấn</a><a class="md2-btn md2-btn-ghost" href="#bo-suu-tap-vai">Xem bảng vải</a></div>
<ul class="md2-facts">
<li><strong>25</strong><span>số đo cơ thể</span></li>
<li><strong>50+</strong><span>năm nghề may của gia đình</span></li>
<li><strong>Trọn đời</strong><span>bảo hành đường may</span></li>
<li><strong>2</strong><span>showroom Biên Hòa &amp; Hà Nội</span></li>
</ul>
</div>
<picture class="md2-hero-img"><source media="(max-width: 767px)" srcset="{HERO}-mobile-480.webp 480w, {HERO}-mobile-563.webp 563w" sizes="100vw" width="563" height="1000"><img src="{HERO}-desktop-960.webp" srcset="{HERO}-desktop-960.webp 960w, {HERO}-desktop-1600.webp 1600w" sizes="(max-width:767px) 100vw, 50vw" width="1600" height="900" alt="Thợ may lấy số đo vai cho khách nam" fetchpriority="high" decoding="async"></picture>
</div>
</section>

<section class="md2 md2-problem" aria-labelledby="md2-problem-title">
<div class="md2-wrap">
<p class="md2-kicker">Vấn đề</p>
<h2 id="md2-problem-title" class="md2-h2">Vì sao vest may sẵn thường không vừa?</h2>
<p class="md2-intro">Vest may sẵn được cắt theo bảng size chung, nhưng cơ thể mỗi người lại khác nhau ở những điểm mà bảng size không tính tới.</p>
<div class="md2-grid3">
<div class="md2-card"><span class="md2-num">01</span><h3 class="md2-h3">Vai và ngực lệch size</h3><p>Người vai rộng nhưng bụng gọn phải chọn size theo vai, thân áo lại rộng thùng thình. Chọn theo thân thì vai bị bó.</p></div>
<div class="md2-card"><span class="md2-num">02</span><h3 class="md2-h3">Tay áo và ống quần sai độ dài</h3><p>Cùng một size, chiều dài tay và chân mỗi người một khác. Dài thì cắt ngắn được, thiếu thì không nối thêm được.</p></div>
<div class="md2-card"><span class="md2-num">03</span><h3 class="md2-h3">Dáng người riêng không có trong bảng size</h3><p>Vai xuôi, lưng hơi gù, bụng to hay một bên vai thấp hơn đều làm áo nhăn ở lưng và cổ, dù đúng size.</p></div>
</div>
<p class="md2-therefore">Vì vậy, sửa lại vest may sẵn chỉ khắc phục được một phần. Muốn vừa thật sự, áo phải được cắt từ số đo của chính bạn.</p>
</div>
</section>

<section class="md2 md2-solution" aria-labelledby="md2-solution-title">
<div class="md2-wrap">
<p class="md2-kicker">Cách giải quyết</p>
<h2 id="md2-solution-title" class="md2-h2">May đo giải quyết vấn đề này như thế nào?</h2>
<div class="md2-grid2">
<div class="md2-card"><h3 class="md2-h3">Đo 25 số đo cơ thể</h3><p>Thợ đo vai, ngực, eo, bụng, tay, chân và độ xuôi vai. Số đo được lưu theo hồ sơ từng người, lần may sau không phải đo lại từ đầu.</p></div>
<div class="md2-card"><h3 class="md2-h3">Chọn vải theo cách bạn mặc</h3><p>Vest đi làm hằng ngày cần vải bền, ít nhăn. Vest cưới cần màu và độ bóng nổi bật. Vest công tác cần giữ dáng khi đi xa. Nhân viên tư vấn chọn bảng vải theo đúng nhu cầu đó.</p></div>
<div class="md2-card"><h3 class="md2-h3">Thử đồ và chỉnh trước khi giao</h3><p>Bạn mặc thử trước khi hoàn thiện để thợ chỉnh lại những điểm còn chưa vừa, thay vì nhận một bộ đồ đã may xong rồi mới sửa.</p></div>
<div class="md2-card"><h3 class="md2-h3">Bảo hành đường may trọn đời</h3><p>mayLEHUONG bảo hành đường may trọn đời cho bộ vest may đo, nên bộ đồ dùng được lâu năm.</p></div>
</div>
</div>
</section>

<section class="md2 md2-fabrics" id="bo-suu-tap-vai" aria-labelledby="md2-fabrics-title">
<div class="md2-wrap">
<p class="md2-kicker">Bảng vải cao cấp</p>
<h2 id="md2-fabrics-title" class="md2-h2">Chọn bảng vải theo ngân sách và cách mặc</h2>
<p class="md2-intro">Giá bộ vest may đo phụ thuộc chủ yếu vào bảng vải. Dưới đây là các bảng vải phân khúc cao; tại showroom bạn được xem và sờ quyển mẫu thật.</p>
<div class="md2-boards">{boards}</div>
<p class="md2-note">Ngoài ra có bảng vải Cezaro (7.000.000đ) cho nhu cầu cơ bản. Thông tin chất liệu ghi theo nhãn quyển mẫu của nhà cung cấp; màu trên màn hình có thể khác màu vải thật.</p>
</div>
</section>

<section class="md2 md2-process" aria-labelledby="md2-process-title">
<div class="md2-wrap">
<p class="md2-kicker">Quy trình</p>
<h2 id="md2-process-title" class="md2-h2">Quy trình may đo 4 bước</h2>
<ol class="md2-steps">
<li><span class="md2-num">01</span><h3 class="md2-h3">Tư vấn và chọn vải</h3><p>Trao đổi mục đích mặc, phong cách và ngân sách, rồi chọn bảng vải phù hợp.</p></li>
<li><span class="md2-num">02</span><h3 class="md2-h3">Đo 25 số đo</h3><p>Thợ lấy số đo chi tiết và ghi lại dáng người: vai, lưng, bụng.</p></li>
<li><span class="md2-num">03</span><h3 class="md2-h3">Cắt may</h3><p>Rập được cắt theo số đo riêng, áo được dựng phom và may hoàn thiện.</p></li>
<li><span class="md2-num">04</span><h3 class="md2-h3">Thử đồ, chỉnh và giao</h3><p>Bạn mặc thử, thợ chỉnh những điểm cuối cùng rồi giao bộ vest.</p></li>
</ol>
</div>
</section>
'''


CONCLUSION = '''<section class="md2 md2-conclusion" aria-labelledby="md2-conclusion-title">
<div class="md2-wrap md2-narrow">
<p class="md2-kicker">Kết luận</p>
<h2 id="md2-conclusion-title" class="md2-h2">Khi nào nên chọn may đo?</h2>
<ul class="md2-checks">
<li>Bạn mặc vest thường xuyên và cần vừa vặn lâu dài.</li>
<li>Dáng người khó mua đồ may sẵn: vai rộng, bụng to, tay dài hoặc người nhỏ.</li>
<li>Bạn cần bộ vest cho dịp quan trọng: cưới, ra mắt, gặp đối tác.</li>
<li>Bạn muốn chọn đúng chất vải theo cách mình sẽ mặc.</li>
</ul>
<p class="md2-therefore">Nếu bạn ở một trong các trường hợp trên, may đo đáng giá hơn mua sẵn rồi sửa. Hãy để lại thông tin, nhà may sẽ liên hệ tư vấn.</p>
<div class="md2-actions md2-center"><a class="md2-btn" href="#dat-lich-may-do-section">Đặt lịch tư vấn</a></div>
</div>
</section>

'''

CSS = '''<style id="mlh-maydo-v2">
.md2{--md2-ink:#15110e;--md2-red:#9d0208;--md2-gold:#a17f22;background:#fdfaf4;padding:56px 16px;color:var(--md2-ink)}
.md2:nth-of-type(even){background:#f6efe2}
.md2-wrap{max-width:1180px;margin:0 auto}
.md2-narrow{max-width:760px}
.md2 h1.md2-h1,.md2 h2.md2-h2,.md2 h3.md2-h3{color:var(--md2-ink)!important;-webkit-text-fill-color:var(--md2-ink)!important;font-family:'Noto Serif',Georgia,serif;margin:0}
.md2-h1{font-size:30px;line-height:1.25;font-weight:700}
.md2-h2{font-size:26px;line-height:1.3;font-weight:700;margin-bottom:14px!important}
.md2-h3{font-size:18px;line-height:1.35;font-weight:700;margin-bottom:8px!important}
.md2-kicker{display:flex;align-items:center;gap:10px;color:var(--md2-red)!important;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin:0 0 10px}
.md2-kicker:before{content:"";width:32px;height:2px;background:var(--md2-gold)}
.md2-lead,.md2-intro{font-size:16px;line-height:1.7;color:#3a322b!important;margin:14px 0 0}
.md2-intro{max-width:760px;margin:0 0 26px}
.md2 p{color:#3a322b}
.md2-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.md2-center{justify-content:center}
.md2-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 22px;border-radius:12px;background:var(--md2-red);color:#fff!important;font-weight:800;font-size:14px;letter-spacing:.04em;text-decoration:none;text-transform:uppercase}
.md2-btn-ghost{background:#fff;color:var(--md2-red)!important;border:1.5px solid var(--md2-red)}
.md2-facts{list-style:none;padding:0;margin:26px 0 0;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.md2-facts li{background:#fff;border:1px solid rgba(161,127,34,.28);border-radius:14px;padding:12px 14px}
.md2-facts strong{display:block;font-family:'Noto Serif',Georgia,serif;font-size:22px;color:var(--md2-red)}
.md2-facts span{font-size:13px;color:#3a322b}
.md2-hero{padding-top:28px}
.md2-hero-img img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:center 85%;border-radius:20px;box-shadow:0 14px 34px rgba(45,26,15,.14)}
.md2-hero-grid{display:grid;gap:26px}
.md2-card{background:#fff;border:1px solid rgba(20,18,16,.08);border-radius:16px;padding:20px;box-shadow:0 6px 18px rgba(45,26,15,.06)}
.md2-card p,.md2-steps p{margin:0;font-size:15px;line-height:1.65}
.md2-num{display:inline-block;font-family:'Noto Serif',Georgia,serif;font-size:14px;font-weight:700;color:#6e5410!important;margin-bottom:6px}
.md2-grid3,.md2-grid2{display:grid;gap:14px}
.md2-therefore{margin:24px 0 0;padding:16px 18px;border-left:3px solid var(--md2-red);background:#fff;border-radius:0 12px 12px 0;font-size:16px;line-height:1.65;color:var(--md2-ink)!important;font-weight:600}
.md2-boards{display:grid;gap:18px}
.md2-board{display:grid;background:#fff;border-radius:18px;overflow:hidden;border:1px solid rgba(161,127,34,.25);box-shadow:0 8px 24px rgba(45,26,15,.08)}
.md2-board-media img{display:block;width:100%;height:auto}
.md2-swatches{list-style:none;margin:0;padding:10px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#f6efe2}
.md2-swatches img{aspect-ratio:1/1;object-fit:cover;object-position:center 40%;border-radius:8px}
.md2-board-body{padding:18px 18px 20px}
.md2-price{display:inline-block;margin:0 0 8px;padding:4px 12px;border-radius:999px;background:#fbefe9;color:var(--md2-red)!important;font-weight:800;font-size:14px}
.md2 .md2-spec{font-size:13.5px!important;font-style:italic!important;font-weight:500!important;color:#5b4a2c!important;-webkit-text-fill-color:#5b4a2c!important;text-transform:none!important;letter-spacing:0!important;margin:0 0 10px!important}
.md2-list,.md2-checks{margin:0;padding-left:20px;font-size:15px;line-height:1.65;color:#3a322b}
.md2-list li,.md2-checks li{margin-bottom:6px}
.md2-fit{margin:12px 0 0;font-size:15px;color:var(--md2-ink)!important}
.md2-fit strong{color:var(--md2-red)}
.md2-note{margin:20px 0 0;font-size:13.5px;color:#6b5b3e!important;font-style:italic}
.md2-steps{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.md2-steps li{background:#fff;border-radius:16px;padding:20px;border:1px solid rgba(20,18,16,.08)}
.md2-checks{padding-left:0;list-style:none}
.md2-checks li{position:relative;padding-left:30px;font-size:16px}
.md2-checks li:before{content:"✓";position:absolute;left:0;top:0;width:22px;height:22px;border-radius:50%;background:var(--md2-red);color:#fff;font-size:13px;line-height:22px;text-align:center}
@media (min-width:768px){
.md2{padding:84px 32px}
.md2-h1{font-size:44px}
.md2-h2{font-size:34px}
.md2-hero-grid{grid-template-columns:1.05fr 1fr;align-items:center;gap:48px}
.md2-hero-img img{aspect-ratio:4/3;object-position:78% center}
.md2-facts{grid-template-columns:repeat(4,1fr)}
.md2-grid3{grid-template-columns:repeat(3,1fr)}
.md2-grid2{grid-template-columns:repeat(2,1fr)}
.md2-board{grid-template-columns:46% 1fr}
.md2-board-body{padding:28px 30px;align-self:center}
.md2-steps{grid-template-columns:repeat(4,1fr)}
}
</style>
'''

START = '<section class="seo-intro" aria-labelledby="seo-page-heading">'
FABRIC_END_MARK = 'id="bo-suu-tap-vai">'
FORM = '<section class="py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-24 bg-[#f5f0eb] border-t border-black/5" id="dat-lich-may-do-section">'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    page = root / 'may-do.html'
    t = rd(page)
    errs = []
    for mark, n in ((START, 1), (FABRIC_END_MARK, 1), (FORM, 1), ('</head>', 1), ('id="mlh-maydo-v2"', 0)):
        if t.count(mark) != n:
            errs.append(f'expected {n} x {mark[:60]!r}, found {t.count(mark)}')
    for b in BOARDS:
        if not (COVERS / b[1]).is_file():
            errs.append('missing cover ' + b[1])
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    cat = json.load(open(SWATCH_CAT, encoding='utf-8'))
    s = t.index(START)
    fab = t.index(FABRIC_END_MARK)
    e = t.index('</section>', fab) + len('</section>')
    t = t[:s] + build_sections(cat) + t[e:]
    t = t.replace(FORM, CONCLUSION + FORM, 1)
    t = t.replace('</head>', CSS + '</head>', 1)
    if t.count('<h1') != 1:
        print('NOT WRITTEN: h1 count', t.count('<h1'))
        sys.exit(1)
    print('ok: new sections + conclusion + css; h1=1, h2=%d, h3=%d' % (t.count('<h2'), t.count('<h3')))
    if a.dry_run:
        return
    out = root / ASSET_DIR
    out.mkdir(parents=True, exist_ok=True)
    for b in BOARDS:
        im = Image.open(COVERS / b[1]).convert('RGB')
        for w in (1200, 640):
            im2 = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w != im.width else im
            im2.save(out / f'{b[0]}-{w}.webp', 'WEBP', quality=82, method=6)
    with open(page, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


if __name__ == '__main__':
    main()
