"""Premium redesign of dich-vu.html (06/11/2026, owner request "đập nát trang dịch vụ, làm lại bài bản,
dịch vụ phải là những hạng dịch vụ đắt tiền").

Usage: python -I tools/dichvu_v2_20261106.py <web_root> [--dry-run]
- Replaces everything inside <main> after the breadcrumb bar (hero, 3 old service blocks, benefits,
  process, #seo-dich-vu-bien-hoa) with: hero / quick nav / 4 service groups with comparison image and
  2-3 tiers each / owner perks / 3-step process / FAQ / Biên Hòa & Hà Nội showroom block.
- Prices: PRICE[tier] = None renders "Báo giá khi tư vấn". Fill real "từ ..." prices only from the owner.
- No text over photos: comparison labels sit BELOW the image (owner rule 06/11).
- Updates title / description / og / WebPage / Breadcrumb / Service JSON-LD, adds FAQPage JSON-LD.
- Adds <style id="mlh-dichvu-v2"> before </head>; converts the 7 Antigravity PNGs to WebP.
Every rule must match exactly once, otherwise nothing is written. Re-running on an already converted
page refreshes the new block in place.
"""
import argparse
import html
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'images' / 'dich-vu-cao-cap-20261106'
OUT_REL = 'assets/dich-vu-cao-cap-20261106'
E = html.escape

# Owner-confirmed "từ ..." prices go here (string like '1.500.000đ'); None = not yet confirmed.
PRICE = {
    'sua-tinh-chinh': None, 'sua-chinh-phom': None, 'sua-tai-cau-truc': None,
    'cs-hap': None, 'cs-giat-kho': None, 'cs-tron-goi': None,
    'thue-tieu-chuan': None, 'thue-cao-cap': None, 'thue-thiet-ke': None,
    'goi-cuoi': None, 'goi-doanh-nhan': None,
}
NO_PRICE = 'Báo giá khi tư vấn'

BAD_DEFAULT = 'Dịch vụ thông thường'
GOOD = 'mayLEHUONG'
CAPTION = 'Ảnh minh họa'

# (anchor, kicker, h2, intro, image slug or None, bad label, alt, tiers[(key, name, desc, [items])], note)
GROUPS = [
    ('sua-chinh-phom', 'Sửa & tinh chỉnh phom', 'Sửa vest đúng kỹ thuật, giữ nguyên phom áo',
     'Một bộ vest đắt tiền có thể hỏng chỉ sau một lần sửa vụng: eo nhăn, vai lệch, ve áo gãy. '
     'Ở mayLEHUONG, việc sửa được làm như may mới: thợ tháo đúng đường may, chỉnh trên số đo của bạn rồi dựng lại phom.',
     's1-sua-phom-so-sanh', 'Sửa vụng', 'Vest sửa vụng bị nhăn eo, lệch vai so với vest được chỉnh phom đúng kỹ thuật',
     [('sua-tinh-chinh', 'Tinh chỉnh', 'Những chỉnh sửa nhỏ để bộ vest vừa vặn hơn.',
       ['Lên hoặc xuống gấu quần', 'Chỉnh độ dài tay áo', 'Đơm lại cúc, xử lý đường chỉ']),
      ('sua-chinh-phom', 'Chỉnh phom', 'Chỉnh lại dáng áo theo cơ thể hiện tại của bạn.',
       ['Bóp hoặc nới eo', 'Hạ size áo và quần', 'Chỉnh vai, chỉnh lưng áo']),
      ('sua-tai-cau-truc', 'Tái cấu trúc & phục hồi', 'Dành cho vest cũ, vest hãng hoặc vest quý cần làm lại gần như mới.',
       ['Dựng lại phom ngực và vai', 'Thay lót áo', 'Thùa lại khuyết, thay cúc cao cấp'])],
     'Khả năng sửa phụ thuộc lượng vải dư và kết cấu từng bộ vest; thợ kiểm tra trực tiếp trước khi nhận.'),
    ('cham-soc-giat-hap', 'Chăm sóc & giặt hấp', 'Chăm sóc vest như chăm sóc một món đồ quý',
     'Giặt nước hay ủi bàn là trực tiếp làm vải len bóng mặt, ve áo gãy nếp và phom ngực xẹp xuống. '
     'Vest cao cấp cần được làm sạch và hấp định hình đúng cách để giữ dáng qua nhiều năm.',
     's2-cham-soc-so-sanh', 'Ủi sai cách', 'Vest bị nhàu và bóng mặt vải do ủi sai so với vest được hấp định hình',
     [('cs-hap', 'Hấp định hình', 'Làm phẳng và hồi phục dáng áo trước dịp quan trọng.',
       ['Hấp hơi, không ép bóng mặt vải', 'Định hình lại ve áo và ngực', 'Là ly quần']),
      ('cs-giat-kho', 'Giặt khô cao cấp', 'Làm sạch vest mà không làm co rút hay hỏng sợi len.',
       ['Giặt khô thay cho giặt nước', 'Xử lý vết bẩn theo chất liệu', 'Hấp định hình sau giặt']),
      ('cs-tron-goi', 'Chăm sóc trọn gói', 'Đưa bộ vest về trạng thái đẹp nhất và bảo quản đúng cách.',
       ['Giặt khô và hấp định hình', 'Phục hồi phom, thay cúc nếu cần', 'Giao kèm túi bảo quản'])],
     'Hấp ủi không đồng nghĩa với tẩy được mọi vết bẩn; nhân viên kiểm tra chất liệu và tình trạng khi nhận.'),
    ('thue-vest', 'Thuê vest cao cấp', 'Thuê vest vừa người như đồ của chính bạn',
     'Vest thuê đại trà thường rộng, vải cũ và chỉ có vài size. Vest thuê ở mayLEHUONG được thử trực tiếp, '
     'tinh chỉnh độ dài tay áo và ống quần cho vừa trước ngày bạn mặc.',
     's3-thue-vest-so-sanh', 'Thuê đại trà', 'Vest thuê đại trà rộng và cũ so với vest thuê cao cấp vừa người',
     [('thue-tieu-chuan', 'Tiêu chuẩn', 'Vest công sở, phỏng vấn, lễ tốt nghiệp.',
       ['Thử trực tiếp tại showroom', 'Chỉnh độ dài tay và ống quần', 'Hấp phẳng trước khi giao']),
      ('thue-cao-cap', 'Cao cấp', 'Vest sự kiện, gala, hội nghị, chụp ảnh.',
       ['Mẫu vải cao cấp, màu đa dạng', 'Tư vấn phối sơ mi và cà vạt', 'Tinh chỉnh theo dáng người']),
      ('thue-thiet-ke', 'Thiết kế & lễ cưới', 'Suit chú rể, vest ông sui, trang phục ngày cưới.',
       ['Mẫu thiết kế riêng của nhà may', 'Phụ kiện đồng bộ', 'Ưu tiên lịch thử đồ'])],
     'Mẫu, kích cỡ và điều kiện thuê được xác nhận khi bạn thử đồ tại showroom.'),
    ('goi-tron-goi', 'Gói trọn gói', 'Gói dịch vụ cho những ngày quan trọng nhất',
     'Một lần làm việc với mayLEHUONG cho cả nhóm: cùng tông màu, cùng chất lượng, cùng lịch thử đồ, '
     'không phải chạy nhiều nơi.',
     's4-goi-cuoi', None, 'Chú rể và người thân mặc vest đồng bộ trong showroom mayLEHUONG',
     [('goi-cuoi', 'Gói Cưới', 'Chú rể, bố mẹ hai bên và phù rể mặc đồng bộ trong ngày cưới.',
       ['Tư vấn tông màu cho cả nhóm', 'May đo hoặc thuê theo từng người', 'Lịch thử đồ chung, hấp phẳng trước ngày cưới']),
      ('goi-doanh-nhan', 'Gói Doanh nhân', 'Xây dựng tủ vest cho người mặc vest mỗi ngày.',
       ['Tư vấn tủ đồ theo lịch làm việc', 'Phối vest, sơ mi, cà vạt, giày', 'Chăm sóc và chỉnh sửa định kỳ'])],
     'Nội dung từng gói được điều chỉnh theo số người và nhu cầu thực tế khi tư vấn.'),
]

PERKS = [
    ('Sửa vest miễn phí', 'Dành cho khách đã may đo hoặc mua vest tại mayLEHUONG. Phạm vi sửa được xác nhận khi nhận đồ.'),
    ('Hấp ủi miễn phí', 'Dành cho khách mua vest tại mayLEHUONG, giúp bộ vest luôn phẳng trước các dịp quan trọng.'),
    ('Bảo hành đường may trọn đời', 'Áp dụng cho vest may đo tại mayLEHUONG.'),
]

STEPS = [
    ('q1-tiep-nhan', 'Tiếp nhận và kiểm tra', 'Thợ kiểm tra chất liệu, đường may và tình trạng bộ vest, rồi tư vấn hạng dịch vụ phù hợp.',
     'Thợ may kiểm tra áo vest bằng kính lúp trên bàn gỗ'),
    ('q2-thuc-hien', 'Thực hiện thủ công', 'Các công đoạn cần sự tỉ mỉ được làm bằng tay, giữ nguyên cấu trúc và phom áo.',
     'Bàn tay thợ may khâu tay mép ve áo vest'),
    ('q3-ban-giao', 'Bàn giao và hướng dẫn bảo quản', 'Bộ vest được treo móc gỗ trong túi bảo quản, kèm hướng dẫn giữ dáng tại nhà.',
     'Áo vest treo móc gỗ trong túi bảo quản'),
]

FAQ = [
    ('Tôi có thể mang vest mua ở nơi khác đến sửa không?',
     'Có. Thợ sẽ kiểm tra kết cấu và lượng vải dư trước, rồi báo những hạng mục có thể chỉnh được trước khi nhận đồ.'),
    ('Giá dịch vụ được tính thế nào?',
     'Giá phụ thuộc vào hạng dịch vụ, chất liệu và tình trạng bộ vest. Nhân viên báo giá cụ thể sau khi kiểm tra trực tiếp.'),
    ('Khách đã may đo tại mayLEHUONG được ưu đãi gì?',
     'Khách đã may đo hoặc mua vest tại mayLEHUONG được sửa vest miễn phí và hấp ủi miễn phí; vest may đo được bảo hành đường may trọn đời.'),
    ('Có thuê vest cho cả nhóm trong ngày cưới được không?',
     'Được. Gói Cưới giúp chú rể, bố mẹ và phù rể mặc đồng bộ, có lịch thử đồ chung tại showroom.'),
    ('Tôi cần đặt lịch trước không?',
     'Nên đặt lịch trước để thợ chuẩn bị và bạn không phải chờ, đặc biệt khi cần đồ cho một ngày cố định.'),
]


def price(key):
    p = PRICE[key]
    return f'<p class="dv2-price">Từ {E(p)}</p>' if p else f'<p class="dv2-price is-quote">{NO_PRICE}</p>'


def figure(slug, bad, alt, compare):
    img = (f'<img src="/{OUT_REL}/{slug}-1600.webp" srcset="/{OUT_REL}/{slug}-800.webp 800w, '
           f'/{OUT_REL}/{slug}-1600.webp 1600w" sizes="(max-width:899px) 100vw, 1100px" width="1600" height="1000" '
           f'loading="lazy" decoding="async" alt="{E(alt)}">')
    under = (f'<div class="dv2-under"><span class="is-bad">{E(bad)}</span><span class="is-good">{GOOD}</span></div>'
             if compare else '')
    return f'<figure class="dv2-fig">{img}{under}<figcaption class="dv2-cap">{CAPTION}</figcaption></figure>'


def group_html(g, i):
    anchor, kicker, h2, intro, slug, bad, alt, tiers, note = g
    cards = ''.join(
        f'<article class="dv2-tier"><span class="dv2-num">{k:02d}</span><h3 class="dv2-h3">{E(name)}</h3>'
        f'<p class="dv2-tier-desc">{E(desc)}</p><ul class="dv2-list">{"".join(f"<li>{E(x)}</li>" for x in items)}</ul>'
        f'{price(key)}</article>'
        for k, (key, name, desc, items) in enumerate(tiers, 1))
    cols = 'dv2-tiers-2' if len(tiers) == 2 else 'dv2-tiers-3'
    return (f'<section class="dv2 dv2-group" id="{anchor}" aria-labelledby="dv2-{anchor}-title">\n<div class="dv2-wrap">\n'
            f'<p class="dv2-kicker">{E(kicker)}</p>\n<h2 id="dv2-{anchor}-title" class="dv2-h2">{E(h2)}</h2>\n'
            f'<p class="dv2-intro">{E(intro)}</p>\n{figure(slug, bad or BAD_DEFAULT, alt, bad is not None)}\n'
            f'<div class="dv2-tiers {cols}">{cards}</div>\n<p class="dv2-note">{E(note)}</p>\n'
            f'<div class="dv2-actions"><a class="dv2-btn" href="/tu-van.html">Đặt lịch tư vấn</a></div>\n</div>\n</section>\n')


def build():
    nav = ''.join(f'<li><a href="#{g[0]}">{E(g[1])}</a></li>' for g in GROUPS)
    groups = ''.join(group_html(g, i) for i, g in enumerate(GROUPS, 1))
    perks = ''.join(f'<li><h3 class="dv2-h3">{E(t)}</h3><p>{E(d)}</p></li>' for t, d in PERKS)
    steps = ''.join(
        f'<li><img src="/{OUT_REL}/{s}-900.webp" srcset="/{OUT_REL}/{s}-600.webp 600w, /{OUT_REL}/{s}-900.webp 900w" '
        f'sizes="(max-width:767px) 100vw, 360px" width="1200" height="900" loading="lazy" decoding="async" alt="{E(alt)}">'
        f'<div class="dv2-step-body"><span class="dv2-num">{k:02d}</span><h3 class="dv2-h3">{E(t)}</h3><p>{E(d)}</p></div></li>'
        for k, (s, t, d, alt) in enumerate(STEPS, 1))
    faq = ''.join(f'<details class="dv2-faq-item"><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in FAQ)
    return f'''<!-- DV2 START -->
<section class="dv2 dv2-hero" aria-labelledby="dv2-h1">
<div class="dv2-wrap dv2-hero-grid">
<div class="dv2-hero-text">
<p class="dv2-kicker">Dịch vụ âu phục cao cấp · Biên Hòa &amp; Hà Nội</p>
<h1 id="dv2-h1" class="dv2-h1">Dịch vụ âu phục cao cấp tại Biên Hòa và Hà Nội</h1>
<p class="dv2-lead">Sửa và tinh chỉnh phom, chăm sóc giặt hấp, thuê vest và các gói trọn gói, đều do đội thợ may đo của mayLEHUONG trực tiếp thực hiện. Mỗi dịch vụ chia thành nhiều hạng để bạn chọn đúng mức chăm sóc mà bộ vest của mình cần.</p>
<div class="dv2-actions"><a class="dv2-btn" href="/tu-van.html">Đặt lịch tư vấn</a><a class="dv2-btn dv2-btn-ghost" href="#hang-dich-vu">Xem các hạng dịch vụ</a></div>
<ul class="dv2-facts">
<li><strong>50+</strong><span>năm nghề may của gia đình</span></li>
<li><strong>Trọn đời</strong><span>bảo hành đường may</span></li>
<li><strong>25</strong><span>số đo cơ thể</span></li>
<li><strong>2</strong><span>showroom Biên Hòa &amp; Hà Nội</span></li>
</ul>
</div>
<figure class="dv2-hero-img"><img src="/{OUT_REL}/q2-thuc-hien-900.webp" srcset="/{OUT_REL}/q2-thuc-hien-600.webp 600w, /{OUT_REL}/q2-thuc-hien-900.webp 900w, /{OUT_REL}/q2-thuc-hien-1200.webp 1200w" sizes="(max-width:767px) 100vw, 50vw" width="1200" height="900" alt="Bàn tay thợ may khâu tay mép ve áo vest" fetchpriority="high" decoding="async"><figcaption class="dv2-cap">{CAPTION}</figcaption></figure>
</div>
</section>

<nav class="dv2 dv2-quick" id="hang-dich-vu" aria-label="Các nhóm dịch vụ">
<div class="dv2-wrap"><ul>{nav}</ul></div>
</nav>

{groups}
<section class="dv2 dv2-perks" aria-labelledby="dv2-perks-title">
<div class="dv2-wrap">
<p class="dv2-kicker">Đặc quyền</p>
<h2 id="dv2-perks-title" class="dv2-h2">Đặc quyền dành cho khách hàng mayLEHUONG</h2>
<p class="dv2-intro">Khi đã may đo hoặc mua vest tại mayLEHUONG, bạn được chăm sóc bộ vest đó lâu dài.</p>
<ul class="dv2-perk-list">{perks}</ul>
</div>
</section>

<section class="dv2 dv2-process" aria-labelledby="dv2-process-title">
<div class="dv2-wrap">
<p class="dv2-kicker">Quy trình</p>
<h2 id="dv2-process-title" class="dv2-h2">Quy trình làm việc 3 bước</h2>
<ol class="dv2-steps">{steps}</ol>
</div>
</section>

<section class="dv2 dv2-faq" aria-labelledby="dv2-faq-title">
<div class="dv2-wrap dv2-narrow">
<p class="dv2-kicker">Câu hỏi thường gặp</p>
<h2 id="dv2-faq-title" class="dv2-h2">Câu hỏi thường gặp</h2>
{faq}
</div>
</section>

<section class="dv2 dv2-showroom" id="seo-dich-vu-bien-hoa" aria-labelledby="dv2-showroom-title">
<div class="dv2-wrap dv2-narrow">
<p class="dv2-kicker">Showroom</p>
<h2 id="dv2-showroom-title" class="dv2-h2">Dịch vụ vest cao cấp tại Biên Hòa, Đồng Nai và Hà Nội</h2>
<p class="dv2-intro">Showroom mayLEHUONG Biên Hòa nhận sửa vest, chăm sóc giặt hấp và cho thuê vest cho cả sản phẩm của nhà may lẫn vest quý khách mang tới. Bên cạnh đó là dịch vụ <a href="/may-do.html">may đo vest theo số đo</a>, <a href="/vest-nam-tre.html">vest nam</a> và <a href="/vest-nu.html">vest nữ</a>.</p>
<ul class="dv2-nap">
<li><strong>Biên Hòa:</strong> 1797 Nguyễn Ái Quốc, Khu Phố 10, Phường Tam Hiệp, Thành Phố Đồng Nai · <a href="tel:0948954848">0948.954.848</a></li>
<li><strong>Hà Nội:</strong> Số 7 Chính Vân, Chuyên Mỹ · <a href="tel:0786291468">0786.291.468</a></li>
</ul>
<div class="dv2-actions dv2-center"><a class="dv2-btn" href="/tu-van.html">Đặt lịch tư vấn</a><a class="dv2-btn dv2-btn-ghost" href="https://maps.app.goo.gl/22238239258238379" target="_blank" rel="noopener">Chỉ đường Google Maps</a></div>
</div>
</section>
<!-- DV2 END -->
'''


CSS = '''<style id="mlh-dichvu-v2">
.dv2{--ink:#15110e;--red:#9d0208;--gold:#a17f22;background:#fdfaf4;padding:56px 16px;color:var(--ink)}
.dv2-group:nth-of-type(even),.dv2-perks,.dv2-faq{background:#f6efe2}
.dv2-wrap{max-width:1180px;margin:0 auto}
.dv2-narrow{max-width:820px}
.dv2 h1.dv2-h1,.dv2 h2.dv2-h2,.dv2 h3.dv2-h3{color:var(--ink)!important;-webkit-text-fill-color:var(--ink)!important;font-family:'Noto Serif',Georgia,serif;margin:0;text-transform:none!important;letter-spacing:0!important}
.dv2-h1{font-size:30px;line-height:1.25;font-weight:700}
.dv2-h2{font-size:26px;line-height:1.3;font-weight:700;margin-bottom:14px!important}
.dv2-h3{font-size:19px;line-height:1.35;font-weight:700;margin-bottom:6px!important}
.dv2-kicker{display:flex;align-items:center;gap:10px;color:var(--red)!important;-webkit-text-fill-color:var(--red);font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin:0 0 10px}
.dv2-kicker:before{content:"";width:32px;height:2px;background:var(--gold)}
.dv2 p,.dv2 li{color:#3a322b}
.dv2-lead,.dv2-intro{font-size:16px;line-height:1.7;color:#3a322b!important;margin:14px 0 0}
.dv2-intro{max-width:780px;margin:0 0 24px}
.dv2-intro a,.dv2-nap a{color:var(--red)!important;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.dv2-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.dv2-center{justify-content:center}
.dv2-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 22px;border-radius:12px;background:var(--red);color:#fff!important;-webkit-text-fill-color:#fff;font-weight:800;font-size:14px;letter-spacing:.04em;text-decoration:none;text-transform:uppercase}
.dv2-btn-ghost{background:#fff;color:var(--red)!important;-webkit-text-fill-color:var(--red);border:1.5px solid var(--red)}
.dv2-facts{list-style:none;padding:0;margin:26px 0 0;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.dv2-facts li{background:#fff;border:1px solid rgba(161,127,34,.28);border-radius:14px;padding:12px 14px}
.dv2-facts strong{display:block;font-family:'Noto Serif',Georgia,serif;font-size:22px;color:var(--red)}
.dv2-facts span{font-size:13px;color:#3a322b}
.dv2-hero{padding-top:28px}
.dv2-hero-grid{display:grid;gap:26px}
.dv2-hero-img{margin:0}
.dv2-hero-img img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:20px;box-shadow:0 14px 34px rgba(45,26,15,.14)}
.dv2-cap{display:block;margin:6px 4px 0;text-align:right;font-size:11.5px!important;font-weight:600;color:#4a3d2f!important;-webkit-text-fill-color:#4a3d2f}
.dv2-quick{padding:14px 16px;background:#fff;border-top:1px solid rgba(20,18,16,.06);border-bottom:1px solid rgba(20,18,16,.06)}
.dv2-quick ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dv2-quick li{margin:0}
.dv2-quick a{display:block;text-align:center;white-space:normal;line-height:1.3;padding:8px 14px;border-radius:999px;border:1px solid rgba(157,2,8,.35);color:var(--red)!important;-webkit-text-fill-color:var(--red);font-size:13.5px;font-weight:700;text-decoration:none;background:#fff}
.dv2-group{scroll-margin-top:130px}
.dv2-fig{margin:0 0 22px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(20,18,16,.08);box-shadow:0 8px 22px rgba(45,26,15,.07)}
.dv2-fig img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}
.dv2-under{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(20,18,16,.08);background:#fffdf8}
.dv2-under>span{display:block;padding:9px 10px;text-align:center;font-size:13px!important;font-weight:800;line-height:1.3;letter-spacing:.02em;text-transform:none!important}
.dv2-under>.is-bad{color:var(--red)!important;-webkit-text-fill-color:var(--red);border-right:1px solid rgba(20,18,16,.08)}
.dv2-under>.is-good{color:var(--ink)!important;-webkit-text-fill-color:var(--ink)}
.dv2-fig .dv2-cap{margin:0;padding:0 12px 7px;background:#fffdf8}
.dv2-under .brand-maylehuong,.dv2-under .brand-maylehuong *{font-size:inherit!important;font-weight:inherit!important;font-family:inherit!important;line-height:inherit!important}
.dv2-tiers{display:grid;gap:14px}
.dv2-tier{background:#fff;border:1px solid rgba(161,127,34,.3);border-radius:16px;padding:20px;display:flex;flex-direction:column;box-shadow:0 6px 18px rgba(45,26,15,.06)}
.dv2-num{display:inline-block;font-family:'Noto Serif',Georgia,serif;font-size:14px;font-weight:700;color:#6e5410!important;-webkit-text-fill-color:#6e5410;margin-bottom:4px}
.dv2-tier-desc{margin:0 0 10px;font-size:15px;line-height:1.6}
.dv2-list{margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.6;list-style:disc!important}
.dv2-list li{margin-bottom:4px}
.dv2-price{margin:auto 0 0!important;padding-top:12px;border-top:1px solid rgba(20,18,16,.08);font-family:'Noto Serif',Georgia,serif;font-size:18px!important;font-weight:700;color:var(--red)!important;-webkit-text-fill-color:var(--red)}
.dv2-price.is-quote{font-family:inherit;font-size:14.5px!important;color:#5a2a14!important;-webkit-text-fill-color:#5a2a14}
.dv2-note{margin:16px 0 0;font-size:14px;color:#5b4a2c!important;font-style:italic}
.dv2-perk-list{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.dv2-perk-list li{background:#fff;border-left:3px solid var(--red);border-radius:0 14px 14px 0;padding:18px 20px}
.dv2-perk-list p{margin:0;font-size:15px;line-height:1.6}
.dv2-steps{list-style:none;margin:0;padding:0;display:grid;gap:16px}
.dv2-steps li{background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(20,18,16,.08)}
.dv2-steps img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}
.dv2-step-body{padding:16px 18px 20px}
.dv2-step-body p{margin:0;font-size:15px;line-height:1.6}
.dv2-faq-item{background:#fff;border:1px solid rgba(20,18,16,.08);border-radius:12px;margin:0 0 10px;padding:0 18px}
.dv2-faq-item summary{cursor:pointer;padding:16px 0;font-weight:700;font-size:16px;color:var(--ink)!important;-webkit-text-fill-color:var(--ink);list-style:none}
.dv2-faq-item summary::-webkit-details-marker{display:none}
.dv2-faq-item summary:after{content:"+";float:right;color:var(--red);font-size:20px;line-height:1}
.dv2-faq-item[open] summary:after{content:"−"}
.dv2-faq-item p{margin:0 0 16px;font-size:15px;line-height:1.65}
.dv2-nap{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.dv2-nap li{background:#fff;border:1px solid rgba(161,127,34,.28);border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.6}
.dv2-nap strong{color:var(--ink)}
@media (min-width:640px){.dv2-tiers-2,.dv2-tiers-3{grid-template-columns:repeat(2,1fr)}.dv2-perk-list{grid-template-columns:repeat(3,1fr)}}
@media (min-width:768px){
.dv2{padding:84px 32px}
.dv2-quick{padding:14px 32px;position:sticky;top:72px;z-index:20}
.dv2-quick ul{display:flex;flex-wrap:wrap}
.dv2-h1{font-size:44px}
.dv2-h2{font-size:34px}
.dv2-hero-grid{grid-template-columns:1.05fr 1fr;align-items:center;gap:48px}
.dv2-facts{grid-template-columns:repeat(4,1fr)}
.dv2-steps{grid-template-columns:repeat(3,1fr)}
.dv2-under>span{font-size:14px!important}
}
@media (min-width:1024px){.dv2-tiers-3{grid-template-columns:repeat(3,1fr)}}
</style>
'''

TITLE_OLD = 'Thuê Vest, Sửa Chữa và Giặt Hấp Vest Tại Biên Hòa | mayLEHUONG'
TITLE_NEW = 'Dịch Vụ Vest Cao Cấp Biên Hòa: Sửa Phom, Giặt Hấp, Thuê | mayLEHUONG'
DESC_OLD = ('Dịch vụ cho thuê vest nam nữ cưới hỏi, sửa chữa hạ size bóp dáng Âu phục và giặt hấp ủi hơi '
            'chuyên sâu tại Showroom mayLEHUONG Biên Hòa, Đồng Nai.')
DESC_NEW = ('Dịch vụ âu phục cao cấp tại Biên Hòa và Hà Nội: sửa và tinh chỉnh phom, giặt khô hấp định hình, '
            'thuê vest cao cấp và gói cưới trọn gói từ mayLEHUONG.')
CRUMB_OLD = '"name": "Dịch vụ thuê, sửa & giặt hấp vest Biên Hòa"'
CRUMB_NEW = '"name": "Dịch vụ vest cao cấp Biên Hòa"'
SVC_OLD = '"name": "Cho Thuê Vest, Chỉnh Sửa Hạ Size & Giặt Hấp Âu Phục Tại Biên Hòa"'
SVC_NEW = '"name": "Dịch Vụ Âu Phục Cao Cấp: Sửa Phom, Giặt Hấp, Thuê Vest Tại Biên Hòa"'
START = '<!-- HERO SECTION WITH SINGLE H1 -->'


def faq_ld():
    d = {'@context': 'https://schema.org', '@type': 'FAQPage', '@id': 'https://maylehuong.com/dich-vu.html#faq',
         'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQ]}
    return '<script type="application/ld+json" id="dv2-faq-ld">' + json.dumps(d, ensure_ascii=False) + '</script>\n'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    page = root / 'dich-vu.html'
    t = rd(page)
    refresh = 'id="mlh-dichvu-v2"' in t
    errs = []
    if refresh:
        for m in ('<!-- DV2 START -->', '<!-- DV2 END -->', '<style id="mlh-dichvu-v2">', 'id="dv2-faq-ld"'):
            if t.count(m) != 1:
                errs.append(f'refresh: expected 1 x {m!r}, found {t.count(m)}')
    else:
        for m, n in ((START, 1), ('</main>', 1), ('</head>', 1), (f'<title>{TITLE_OLD}</title>', 1),
                     (DESC_OLD, 3), (TITLE_OLD, 3), (CRUMB_OLD, 1), (SVC_OLD, 1)):
            if t.count(m) != n:
                errs.append(f'expected {n} x {m[:60]!r}, found {t.count(m)}')
    for s in [g[4] for g in GROUPS] + [x[0] for x in STEPS]:
        if not (SRC / f'{s}.png').is_file():
            errs.append('missing image ' + s)
    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)
    if refresh:
        s = t.index('<!-- DV2 START -->')
        e = t.index('<!-- DV2 END -->') + len('<!-- DV2 END -->\n')
        t = t[:s] + build() + t[e:]
        cs = t.index('<style id="mlh-dichvu-v2">')
        ce = t.index('</style>', cs) + len('</style>\n')
        t = t[:cs] + CSS + t[ce:]
        fs = t.index('<script type="application/ld+json" id="dv2-faq-ld">')
        fe = t.index('</script>', fs) + len('</script>\n')
        t = t[:fs] + faq_ld() + t[fe:]
    else:
        s = t.index(START)
        e = t.index('</main>')
        t = t[:s] + build() + '\n' + t[e:]
        t = t.replace(TITLE_OLD, TITLE_NEW).replace(DESC_OLD, DESC_NEW)
        t = t.replace(CRUMB_OLD, CRUMB_NEW, 1).replace(SVC_OLD, SVC_NEW, 1)
        t = t.replace('</head>', CSS + faq_ld() + '</head>', 1)
    for chk, n in (('<h1', 1), ('id="seo-dich-vu-bien-hoa"', 1)):
        if t.count(chk) != n:
            print('NOT WRITTEN: count', chk, t.count(chk))
            sys.exit(1)
    print('ok (%s): h1=1 h2=%d h3=%d tiers=%d priced=%d' % (
        'refresh' if refresh else 'new', t.count('<h2'), t.count('<h3'), t.count('class="dv2-tier"'),
        sum(1 for v in PRICE.values() if v)))
    if a.dry_run:
        return
    out = root / OUT_REL
    out.mkdir(parents=True, exist_ok=True)
    for g in GROUPS:
        im = Image.open(SRC / f'{g[4]}.png').convert('RGB')
        for w in (1600, 800):
            (im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)).save(
                out / f'{g[4]}-{w}.webp', 'WEBP', quality=82, method=6)
    for st in STEPS:
        im = Image.open(SRC / f'{st[0]}.png').convert('RGB')
        for w in (1200, 900, 600):
            (im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)).save(
                out / f'{st[0]}-{w}.webp', 'WEBP', quality=82, method=6)
    with open(page, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


if __name__ == '__main__':
    main()
