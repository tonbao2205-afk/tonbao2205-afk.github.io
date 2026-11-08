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
#chinh-sach{background:#f5f0eb!important;padding:36px 20px 88px}
#chinh-sach .cs-wrap{max-width:920px;margin:0 auto}
#chinh-sach .cs-head{margin:0 0 36px}
#chinh-sach .cs-kicker{display:block;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;color:#9d0208!important;-webkit-text-fill-color:#9d0208!important}
#chinh-sach .cs-kicker::after{content:"";display:block;width:32px;height:2px;background:#a17f22;margin:9px 0 18px}
#chinh-sach h1{font-family:'Noto Serif',serif;font-weight:700;font-size:clamp(31px,5.2vw,50px);line-height:1.18;color:#15110e!important;-webkit-text-fill-color:#15110e!important;margin:0 0 16px}
#chinh-sach .cs-lead{max-width:720px;font-size:16.5px;line-height:1.75;color:#2b231d!important;-webkit-text-fill-color:#2b231d!important;margin:0 0 10px}
#chinh-sach .cs-updated{font-size:14px;color:#5c4a3d!important;-webkit-text-fill-color:#5c4a3d!important;margin:0}
#chinh-sach .cs-acc{border-bottom:1px solid #c9b88f}
#chinh-sach details.cs-item{border-top:1px solid #c9b88f;scroll-margin-top:96px}
#chinh-sach summary{display:grid;grid-template-columns:38px minmax(0,1fr) 22px;align-items:center;column-gap:6px;padding:21px 0;cursor:pointer;list-style:none}
#chinh-sach summary::-webkit-details-marker{display:none}
#chinh-sach summary:focus-visible{outline:2px solid #9d0208;outline-offset:3px}
#chinh-sach .cs-no{font-family:'Noto Serif',serif;font-weight:700;font-size:16px;color:#7d5f14!important;-webkit-text-fill-color:#7d5f14!important}
#chinh-sach h2{font-family:'Noto Serif',serif;font-weight:700;font-size:clamp(19px,2.6vw,25px);line-height:1.32;margin:0;color:#15110e!important;-webkit-text-fill-color:#15110e!important;transition:color .18s}
#chinh-sach summary:hover h2,#chinh-sach details[open] h2{color:#9d0208!important;-webkit-text-fill-color:#9d0208!important}
#chinh-sach .cs-plus{position:relative;width:18px;height:18px;justify-self:end}
#chinh-sach .cs-plus::before,#chinh-sach .cs-plus::after{content:"";position:absolute;background:#7d5f14;left:0;right:0;top:8px;height:2px;transition:transform .22s ease}
#chinh-sach .cs-plus::after{transform:rotate(90deg)}
#chinh-sach details[open] .cs-plus::after{transform:rotate(0)}
#chinh-sach .cs-body{padding:0 0 28px}
#chinh-sach .cs-body p,#chinh-sach .cs-body li{font-size:16px;line-height:1.78;color:#2b231d!important;-webkit-text-fill-color:#2b231d!important}
#chinh-sach .cs-body p{margin:0 0 12px}
#chinh-sach ul.cs-list{margin:0;padding:0 0 0 19px;list-style:disc}
#chinh-sach ul.cs-list li{margin:0 0 9px;padding-left:2px}
#chinh-sach ul.cs-list li:last-child{margin-bottom:0}
#chinh-sach ul.cs-list li::marker{color:#7d5f14}
#chinh-sach .cs-contact{margin:34px 0 0}
#chinh-sach .cs-contact a{display:inline-block;padding:14px 26px;border-radius:3px;background:#9d0208;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;text-decoration:none;color:#ffffff!important;-webkit-text-fill-color:#ffffff!important}
#chinh-sach .cs-contact a:hover{background:#7f0206}
@media (min-width:640px){#chinh-sach{padding:56px 28px 112px}
#chinh-sach .cs-head{margin-bottom:48px}
#chinh-sach summary{grid-template-columns:58px minmax(0,1fr) 22px;padding:26px 0}
#chinh-sach .cs-no{font-size:18px}
#chinh-sach .cs-body{padding:0 28px 34px 64px}}
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
    items = [(a, h, render_blocks(blocks)) for a, _, h, blocks in SECTIONS]
    parts = [
        '<section id="chinh-sach"><div class="cs-wrap">',
        '<div class="cs-head"><span class="cs-kicker">Chính sách</span>',
        '<h1>Chính sách &amp; điều khoản mua hàng</h1>',
        '<p class="cs-lead">Thông tin về giao hàng, đổi trả, bảo hành, thanh toán, bảo mật và '
        'giải quyết khiếu nại khi bạn mua sắm và sử dụng dịch vụ tại mayLEHUONG.</p>',
        f'<p class="cs-updated">Cập nhật: {UPDATED}</p></div>',
        '<div class="cs-acc">',
    ]
    for i, (a, h, body) in enumerate(items, 1):
        parts.append(f'<details class="cs-item" id="{a}"{" open" if i == 1 else ""}><summary>'
                     f'<span class="cs-no" aria-hidden="true">{i:02d}</span><h2>{E(h)}</h2>'
                     f'<span class="cs-plus" aria-hidden="true"></span></summary>'
                     f'<div class="cs-body">{body}</div></details>')
    parts.append('</div>')
    parts.append('<p class="cs-contact"><a href="tel:0948954848">Hỏi thêm qua hotline 0948.954.848</a></p>')
    parts.append('</div></section>')
    parts.append('<script>(function(){function o(){var d=location.hash&&document.getElementById(location.hash.slice(1));'
                 'if(d&&d.tagName==="DETAILS"){d.open=true;d.scrollIntoView();}}'
                 'window.addEventListener("hashchange",o);o();})();</script>')
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
