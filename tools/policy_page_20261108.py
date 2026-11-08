"""Chính sách & điều khoản page (08/11/2026, owner: "thêm 1 trang chính sách chuẩn quy luật của Bộ Công Thương").

Content follows the information a selling website must publish under Nghị định 52/2013/NĐ-CP (sửa đổi bởi
Nghị định 85/2021/NĐ-CP), Điều 29: owner information, general trading terms, delivery, returns/refunds,
warranty, payment, personal data (Nghị định 13/2023/NĐ-CP) and complaint handling.
Facts used are only those already confirmed by the owner / published on the site (legal name, MST, founding date,
head office, hotlines, đổi trả 30 ngày, miễn phí giao hàng từ 500k, bảo hành đường may trọn đời, sửa vest miễn phí,
hấp ủi miễn phí khi mua vest). Anything not confirmed is written as "thông báo khi xác nhận đơn / liên hệ hotline".

- Creates <web>/chinh-sach.html from gioi-thieu.html's head/scripts (title/meta/canonical/og replaced, page JSON-LD
  and the stats-counter script dropped).
- footer-component.js: adds "Chính Sách & Điều Khoản" link + MST line; bumps footer-component.js ?v on every page.
- sitemap.xml: adds the URL.
Usage: python -X utf8 -I tools/policy_page_20261108.py <web_root> [--dry-run]   (idempotent)
"""
import html
import json
import re
import sys
from pathlib import Path

E = html.escape
PAGE = 'chinh-sach.html'
URL = 'https://maylehuong.com/' + PAGE
TITLE = 'Chính Sách & Điều Khoản Mua Hàng – mayLEHUONG'
DESC = ('Chính sách giao hàng, đổi trả 30 ngày, bảo hành đường may trọn đời, thanh toán, bảo mật thông tin '
        'và giải quyết khiếu nại của Công ty TNHH Thời Trang Lê Hương (mayLEHUONG).')
FOOTER_VER = '20261108-policy2'
UPDATED = '08/11/2026'

COMPANY = [
    ('Tên doanh nghiệp', 'Công ty TNHH Thời Trang Lê Hương'),
    ('Tên quốc tế', 'mayLEHUONG Fashion Company Limited'),
    ('Mã số thuế / mã số doanh nghiệp', '3603652314'),
    ('Ngày thành lập', '26/06/2019'),
    ('Người đại diện', 'Bà Lê Thị Hương'),
    ('Trụ sở chính', '1797 Nguyễn Ái Quốc, Khu Phố 10, Phường Tam Hiệp, Thành Phố Đồng Nai'),
    ('Showroom Hà Nội', 'Số 7 Chính Vân, Chuyên Mỹ, Thành Phố Hà Nội'),
    ('Hotline Đồng Nai', '0948.954.848 (8:00 – 22:00)'),
    ('Hotline Hà Nội', '0786.291.468'),
    ('Email', 'xuongvestcuoibh9999@gmail.com'),
]

# (anchor, icon, heading, [blocks]); block = ('p', text) | ('ul', [items])
SECTIONS = [
    ('dieu-kien-giao-dich', 'description', 'Điều kiện giao dịch chung', [
        ('p', 'Các chính sách trên trang này áp dụng cho mọi giao dịch mua hàng, may đo, thuê và sử dụng dịch vụ '
              'tại website maylehuong.com và tại các showroom của mayLEHUONG.'),
        ('ul', [
            'Giá sản phẩm hiển thị trên website tính bằng đồng Việt Nam. Giá chính thức của đơn hàng là giá được '
            'nhân viên xác nhận với bạn trước khi giao dịch.',
            'Với sản phẩm may đo, giá phụ thuộc bảng vải và kiểu dáng bạn chọn; giá được báo rõ trước khi đo và cắt may.',
            'Đơn hàng được xác lập khi mayLEHUONG liên hệ xác nhận với bạn qua điện thoại hoặc Zalo.',
            'Hình ảnh có ghi "ảnh minh họa" chỉ mang tính tham khảo; màu vải trên màn hình có thể khác màu vải thật.',
        ]),
    ]),
    ('giao-hang', 'local_shipping', 'Chính sách giao hàng', [
        ('ul', [
            'Miễn phí giao hàng cho đơn từ 500.000đ.',
            'Đơn dưới 500.000đ: phí giao hàng tính theo biểu phí của đơn vị vận chuyển và được báo trước khi gửi hàng.',
            'Giao hàng toàn quốc, thời gian dự kiến 3–5 ngày tùy địa chỉ nhận hàng.',
            'Với sản phẩm may đo, ngày nhận đồ được hẹn sau khi đo và chọn vải; bạn có thể nhận tại showroom hoặc nhận qua giao hàng.',
            'Bạn được kiểm tra sản phẩm khi nhận hàng. Nếu sản phẩm sai mẫu, sai size hoặc hư hỏng, vui lòng báo ngay cho hotline.',
        ]),
    ]),
    ('doi-tra', 'published_with_changes', 'Chính sách đổi trả & hoàn tiền', [
        ('ul', [
            'Sản phẩm may sẵn được đổi trả trong vòng 30 ngày kể từ ngày nhận hàng.',
            'Sản phẩm đổi trả cần còn nguyên tem nhãn, chưa qua sử dụng, giặt hoặc sửa, kèm hóa đơn mua hàng.',
            'Sản phẩm sai mẫu, sai size so với đơn đã xác nhận hoặc lỗi do nhà sản xuất được đổi miễn phí.',
            'Sản phẩm may đo được may theo số đo riêng của bạn: mayLEHUONG chỉnh sửa miễn phí cho đến khi vừa '
            'vặn theo số đo đã thống nhất, thay cho việc đổi trả.',
            'Khi đổi trả được chấp nhận và cần hoàn tiền, mayLEHUONG hoàn theo hình thức bạn đã thanh toán; '
            'thời gian hoàn tiền được thông báo khi xác nhận yêu cầu.',
        ]),
    ]),
    ('bao-hanh', 'workspace_premium', 'Chính sách bảo hành & chăm sóc', [
        ('ul', [
            'Bảo hành đường may trọn đời cho vest may đo tại mayLEHUONG.',
            'Sửa vest miễn phí cho khách đã may đo hoặc mua vest tại mayLEHUONG; phạm vi sửa được xác nhận khi nhận đồ.',
            'Hấp ủi miễn phí cho khách mua vest tại mayLEHUONG.',
            'Bảo hành không áp dụng cho hư hỏng do sử dụng sai cách, cháy, rách, hóa chất hoặc do sửa chữa ở nơi khác.',
        ]),
    ]),
    ('thanh-toan', 'payments', 'Phương thức thanh toán', [
        ('ul', [
            'Thanh toán khi nhận hàng (COD) với đơn đặt trên website.',
            'Thanh toán trực tiếp tại showroom.',
            'Chuyển khoản ngân hàng cho sản phẩm có sẵn (hàng mua sẵn). Vui lòng chỉ chuyển khoản theo thông tin tài khoản '
            'do nhân viên mayLEHUONG gửi khi xác nhận đơn qua hotline hoặc Zalo chính thức.',
            'Với sản phẩm may đo, mức đặt cọc (nếu có) được thông báo khi chốt đơn và được trừ vào tổng tiền khi nhận đồ.',
            'mayLEHUONG gửi xác nhận số tiền đã thanh toán và số tiền còn lại qua Zalo hoặc hóa đơn.',
        ]),
    ]),
    ('bao-mat', 'verified', 'Chính sách bảo mật thông tin cá nhân', [
        ('p', 'mayLEHUONG thu thập và xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.'),
        ('ul', [
            'Thông tin thu thập: họ tên, số điện thoại, email (nếu có), địa chỉ nhận hàng, số đo cơ thể (với sản phẩm '
            'may đo) và nội dung bạn gửi qua biểu mẫu tư vấn.',
            'Mục đích: xác nhận và thực hiện đơn hàng, may đo theo số đo, giao hàng, bảo hành, chăm sóc khách hàng '
            'và gửi thông báo về đơn hàng qua Zalo.',
            'Thông tin chỉ được chia sẻ với đơn vị vận chuyển hoặc đối tác may khi cần để thực hiện đơn hàng của bạn, '
            'hoặc khi cơ quan nhà nước có thẩm quyền yêu cầu theo quy định pháp luật.',
            'Thông tin được lưu trữ trên hệ thống có kiểm soát truy cập và được lưu trong thời gian cần thiết để phục '
            'vụ đơn hàng, bảo hành và theo quy định pháp luật.',
            'Mã QR hoặc đường dẫn hồ sơ khách hàng giúp bạn xem đơn và số đo của mình; vui lòng không chia sẻ mã này cho người khác.',
            'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình bằng cách liên hệ hotline.',
        ]),
    ]),
    ('khieu-nai', 'support_agent', 'Tiếp nhận & giải quyết khiếu nại', [
        ('ul', [
            'Bạn gửi phản ánh, khiếu nại qua hotline 0948.954.848, Zalo, email xuongvestcuoibh9999@gmail.com hoặc trực tiếp tại showroom.',
            'mayLEHUONG tiếp nhận, kiểm tra và liên hệ lại với bạn để thống nhất hướng xử lý.',
            'Các bên ưu tiên giải quyết bằng thương lượng, hòa giải. Trường hợp không thống nhất được, bạn có thể '
            'liên hệ cơ quan quản lý nhà nước về bảo vệ quyền lợi người tiêu dùng hoặc giải quyết tại Tòa án theo '
            'quy định pháp luật Việt Nam.',
        ]),
    ]),
]

STYLE = '''<style id="mlh-policy">
#chinh-sach{background:#f5f0eb!important;padding:24px 16px 72px}
#chinh-sach .cs-wrap{max-width:880px;margin:0 auto}
#chinh-sach .cs-kicker{display:inline-block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#9d0208!important;-webkit-text-fill-color:#9d0208!important;margin-bottom:10px}
#chinh-sach .cs-kicker::after{content:"";display:block;width:32px;height:2px;background:#a17f22;margin-top:8px}
#chinh-sach h1{font-family:'Noto Serif',serif;font-weight:700;font-size:clamp(28px,4.5vw,42px);line-height:1.2;color:#15110e!important;-webkit-text-fill-color:#15110e!important;margin:0 0 12px}
#chinh-sach .cs-lead{font-size:16px;line-height:1.7;color:#3b3029!important;-webkit-text-fill-color:#3b3029!important;margin:0 0 6px}
#chinh-sach .cs-updated{font-size:14px;color:#5c4a3d!important;-webkit-text-fill-color:#5c4a3d!important;margin:0 0 24px}
#chinh-sach .cs-toc{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px;padding:0;list-style:none}
#chinh-sach .cs-toc a{display:inline-block;padding:7px 14px;border:1px solid #d8c9a6;border-radius:999px;background:#fffdf8;font-size:14px;font-weight:600;color:#2b231d!important;-webkit-text-fill-color:#2b231d!important;text-decoration:none}
#chinh-sach .cs-toc a:hover{border-color:#a17f22;color:#9d0208!important;-webkit-text-fill-color:#9d0208!important}
#chinh-sach .cs-card{background:#fffdf8;border:1px solid #e6dcc6;border-radius:14px;padding:22px 20px;margin:0 0 18px;scroll-margin-top:110px}
#chinh-sach h2{display:flex;align-items:center;gap:10px;font-family:'Noto Serif',serif;font-weight:700;font-size:clamp(20px,2.6vw,24px);line-height:1.3;color:#15110e!important;-webkit-text-fill-color:#15110e!important;margin:0 0 12px}
#chinh-sach h2 .material-symbols-outlined{color:#a17f22!important;-webkit-text-fill-color:#a17f22!important;font-size:26px}
#chinh-sach p,#chinh-sach li{font-size:15.5px;line-height:1.75;color:#2b231d!important;-webkit-text-fill-color:#2b231d!important}
#chinh-sach p{margin:0 0 10px}
#chinh-sach ul.cs-list{margin:0;padding-left:20px;list-style:disc}
#chinh-sach ul.cs-list li{margin:0 0 6px}
#chinh-sach ul.cs-list li::marker{color:#a17f22}
#chinh-sach dl.cs-info{margin:0;display:grid;grid-template-columns:1fr;gap:0}
#chinh-sach dl.cs-info div{display:grid;grid-template-columns:1fr;gap:2px;padding:9px 0;border-bottom:1px solid #eee4d0}
#chinh-sach dl.cs-info div:last-child{border-bottom:0}
#chinh-sach dt{font-size:14px;color:#5c4a3d!important;-webkit-text-fill-color:#5c4a3d!important}
#chinh-sach dd{margin:0;font-size:15.5px;font-weight:600;color:#15110e!important;-webkit-text-fill-color:#15110e!important}
#chinh-sach .cs-contact{text-align:center;margin-top:26px}
#chinh-sach .cs-contact a{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;background:#9d0208;font-weight:700;color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;text-decoration:none}
@media (min-width:640px){#chinh-sach{padding:40px 24px 96px}#chinh-sach .cs-card{padding:28px 30px}
#chinh-sach dl.cs-info div{grid-template-columns:220px 1fr;gap:16px}}
</style>'''


def render_blocks(blocks):
    out = []
    for kind, val in blocks:
        if kind == 'p':
            out.append(f'<p>{E(val)}</p>')
        else:
            out.append('<ul class="cs-list">' + ''.join(f'<li>{E(x)}</li>' for x in val) + '</ul>')
    return ''.join(out)


def main_html():
    toc = [('thong-tin-doanh-nghiep', 'Thông tin doanh nghiệp')] + [(a, h) for a, _, h, _ in SECTIONS]
    parts = [
        '<section id="chinh-sach"><div class="cs-wrap">',
        '<span class="cs-kicker">Chính sách</span>',
        '<h1>Chính sách &amp; điều khoản mua hàng</h1>',
        '<p class="cs-lead">Thông tin về doanh nghiệp, giao hàng, đổi trả, bảo hành, thanh toán, bảo mật và '
        'giải quyết khiếu nại khi bạn mua sắm và sử dụng dịch vụ tại mayLEHUONG.</p>',
        f'<p class="cs-updated">Cập nhật: {UPDATED}</p>',
        '<ul class="cs-toc">' + ''.join(f'<li><a href="#{a}">{E(h)}</a></li>' for a, h in toc) + '</ul>',
        '<div class="cs-card" id="thong-tin-doanh-nghiep"><h2><span class="material-symbols-outlined" aria-hidden="true">'
        'business</span>Thông tin doanh nghiệp</h2><dl class="cs-info">'
        + ''.join(f'<div><dt>{E(k)}</dt><dd>{E(v)}</dd></div>' for k, v in COMPANY) + '</dl></div>',
    ]
    for a, icon, h, blocks in SECTIONS:
        parts.append(f'<div class="cs-card" id="{a}"><h2><span class="material-symbols-outlined" aria-hidden="true">'
                     f'{icon}</span>{E(h)}</h2>{render_blocks(blocks)}</div>')
    parts.append('<div class="cs-contact"><a href="tel:0948954848"><span class="material-symbols-outlined" '
                 'aria-hidden="true">call</span>Hỏi thêm qua hotline 0948.954.848</a></div>')
    parts.append('</div></section>')
    return '\n'.join(parts)


def ld_json():
    data = {
        '@context': 'https://schema.org',
        '@graph': [
            {'@type': 'WebPage', '@id': URL + '#webpage', 'url': URL, 'name': TITLE, 'description': DESC,
             'inLanguage': 'vi-VN', 'isPartOf': {'@id': 'https://maylehuong.com/#website'}},
            {'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': 'https://maylehuong.com/'},
                {'@type': 'ListItem', 'position': 2, 'name': 'Chính sách & điều khoản', 'item': URL}]},
        ],
    }
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=1) + '\n</script>'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def wr(p, t):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def one(pattern, repl, text, flags=0):
    t, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit('rule did not match: ' + pattern[:60])
    return t


def build_page(base):
    t = base
    t = one(r'<title>.*?</title>', lambda m: f'<title>{E(TITLE)}</title>', t, re.S)
    t = one(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + E(DESC), t)
    t = one(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + URL, t)
    t = one(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + E(TITLE), t)
    t = one(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + E(DESC), t)
    t = one(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + URL, t)
    # drop the page's own JSON-LD blocks, add ours + style
    t = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', '', t, flags=re.S)
    t = re.sub(r'\s*<style data-contrast-fix="20261015">.*?</style>', '', t, flags=re.S)
    t = one(r'</head>', lambda m: ld_json() + '\n' + STYLE + '\n</head>', t)
    t = one(r'(<main class="pt-\[90px\] min-h-screen">).*?(</main>)', lambda m: m.group(1) + '\n' + main_html() + '\n' + m.group(2), t, re.S)
    # drop the stats-counter inline script (page has no counters)
    t = one(r'\s*<script>\s*// Stats Counter animation.*?</script>', '', t, re.S)
    return t


FOOTER_LINK_AFTER = "      '      <a href=\"/gioi-thieu.html\" style=\"color: #ffffff !important;\">Giới Thiệu Thương Hiệu</a>',"
FOOTER_LINK = "      '      <a href=\"/chinh-sach.html\" style=\"color: #ffffff !important;\">Chính Sách & Điều Khoản</a>',"
FOOTER_MAIL_AFTER = "      '      <p style=\"color: #ffffff !important;\">📞 Hotline Hà Nội: 0786.291.468</p>',"
FOOTER_MAIL = "      '      <p style=\"color: #ffffff !important;\">✉️ Email: xuongvestcuoibh9999@gmail.com</p>',"
FOOTER_MST_OLD = "'  © Công Ty TNHH Thời Trang Lê Hương. <span class=lhv-rr>"
FOOTER_MST_NEW = "'  © Công Ty TNHH Thời Trang Lê Hương · MST 3603652314. <span class=lhv-rr>"
BUMP = re.compile(r'((?<![\w-])footer-component\.js)(\?v=[^"\'\s>]*)?(?=["\'\s>])')


def main():
    web = Path(sys.argv[1])
    dry = '--dry-run' in sys.argv
    writes = {}
    writes[web / PAGE] = build_page(rd(web / 'gioi-thieu.html'))

    fc = rd(web / 'footer-component.js')
    nl = '\r\n' if '\r\n' in fc else '\n'
    if FOOTER_LINK not in fc:
        if FOOTER_LINK_AFTER not in fc:
            raise SystemExit('footer anchor not found')
        fc = fc.replace(FOOTER_LINK_AFTER, FOOTER_LINK_AFTER + nl + FOOTER_LINK, 1)
    if FOOTER_MAIL not in fc:
        if FOOTER_MAIL_AFTER not in fc:
            raise SystemExit('footer mail anchor not found')
        fc = fc.replace(FOOTER_MAIL_AFTER, FOOTER_MAIL_AFTER + nl + FOOTER_MAIL, 1)
    if FOOTER_MST_NEW not in fc:
        if FOOTER_MST_OLD not in fc:
            raise SystemExit('footer bottom not found')
        fc = fc.replace(FOOTER_MST_OLD, FOOTER_MST_NEW, 1)
    writes[web / 'footer-component.js'] = fc

    sm = rd(web / 'sitemap.xml')
    if URL not in sm:
        snl = '\r\n' if '\r\n' in sm else '\n'
        entry = f'  <url>{snl}    <loc>{URL}</loc>{snl}    <changefreq>yearly</changefreq>{snl}    <priority>0.3</priority>{snl}  </url>{snl}'
        sm = sm.replace('</urlset>', entry + '</urlset>', 1)
        writes[web / 'sitemap.xml'] = sm

    pages = 0
    for f in sorted(web.rglob('*.html')):
        if 'admin' in f.relative_to(web).parts:
            continue
        t = writes.get(f) or rd(f)
        t2 = BUMP.sub(lambda m: m.group(1) + '?v=' + FOOTER_VER, t)
        if t2 != t or f in writes:
            writes[f] = t2
            pages += t2 != t
    print('files', len(writes), '| footer ?v bumped on', pages, 'pages')
    if dry:
        return
    for f, t in writes.items():
        wr(f, t)


if __name__ == '__main__':
    main()
