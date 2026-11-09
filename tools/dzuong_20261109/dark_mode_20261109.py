#!/usr/bin/env python3
"""Darkmode 2 web + trang rieng Dzuong Tailor. Chay lai duoc, khong chen hai lan.

python tools/dark_mode_20261109.py <web_dir> <src_dir> [sites.conf]

Sau khi them trang san pham moi phai chay lai de trang moi co doan bootstrap.
"""
import glob
import html
import json
import os
import re
import shutil
import sys
import urllib.parse

V = '20261109-dark1'
BOOT = (
    '<script id="mlh-theme-boot">(function(){try{if(localStorage.getItem(\'mlh_theme\')===\'dark\'){'
    "document.documentElement.setAttribute('data-theme','dark');"
    "document.write('<link id=\"mlh-dark-css\" rel=\"stylesheet\" href=\"/dark-theme.css?v=" + V + "\">')"
    '}}catch(e){}})()</script>\n'
    '<script src="/theme.js?v=' + V + '" defer></script>\n'
)
SKIP = {'blazer.html'}
ABOUT_ID = 'doi-tac-san-xuat'
ABOUT = '''<section class="py-12 sm:py-24 px-4 sm:px-12 md:px-24 bg-[#f5f0eb] border-t border-black/5" id="doi-tac-san-xuat">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="font-noto-serif text-2xl sm:text-4xl font-bold text-[#000000]" style="color: #000000 !important;">Cơ Sở Đối Tác Sản Xuất</h2>
    <p class="mt-4 text-sm sm:text-base leading-relaxed" style="color:#333333">Dzuong Tailor là cơ sở đối tác của mayLEHUONG về mảng sản xuất, đảm nhận lên mẫu, sản xuất, gia công và may đo vest.</p>
    <a class="inline-block mt-6 font-semibold underline" style="color:#9d0208" href="https://dzuongtailor.com/" rel="noopener">Xem Dzuong Tailor</a>
  </div>
</section>

'''


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def write(p, t):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def inject(web):
    done = 0
    pages = glob.glob(os.path.join(web, '*.html')) + glob.glob(os.path.join(web, 'san-pham', '*.html'))
    for p in pages:
        name = os.path.basename(p)
        if name in SKIP or name.startswith(('zalo_verifier', 'dzuong-')):
            continue
        t = read(p)
        if 'id="mlh-theme-boot"' in t:
            continue
        n = t.lower().find('</head>')
        if n < 0:
            raise SystemExit('khong co </head>: ' + p)
        write(p, t[:n] + BOOT + t[n:])
        done += 1
    return done


def add_about(web):
    p = os.path.join(web, 'gioi-thieu.html')
    t = read(p)
    if 'id="%s"' % ABOUT_ID in t:
        return False
    anchor = t.index('Ghé Thăm Showroom')
    n = t.rfind('<section', 0, anchor)
    write(p, t[:n] + ABOUT + t[n:])
    return True


def webp(src):
    return urllib.parse.quote(src.rsplit('.', 1)[0] + '.webp')


def models_html(path, limit=None):
    with open(path, encoding='utf-8') as f:
        models = json.load(f)[:limit]
    order = [('Áo Vest', 'Vest'), ('Quần Tây', 'Quần'), ('Áo Gile', 'Gile'), ('Ảnh Bìa', 'Vải')]
    out = []
    for m in models:
        views = {v['label']: v['src'] for v in m['views']}
        first = html.escape(webp(views['Áo Vest']), quote=True)
        name = html.escape(m['name'])
        btns = ''.join(
            '<button type="button" data-src="%s"%s%s aria-pressed="%s">%s</button>' % (
                html.escape(webp(views[label]), quote=True), ' class="on"' if i == 0 else '',
                ' data-fabric' if short == 'Vải' else '', 'true' if i == 0 else 'false', short)
            for i, (label, short) in enumerate(order))
        out.append(
            '<article class="model r"><button class="ph" type="button" aria-label="Phóng to %s"><img src="%s" alt="%s" loading="lazy" decoding="async" width="768" height="1376" /></button>'
            '<h3>%s</h3><div class="views">%s</div></article>' % (name, first, name, name, btns))
    return ''.join(out)


def local_fonts(web):
    """Lay @font-face tieng Viet/Latin tu trang chu, khong dung Google Fonts."""
    t = read(os.path.join(web, 'index.html'))
    keep = []
    for rule in re.findall(r'@font-face\{[^}]*\}', t):
        if not ('U+0102' in rule or 'U+0000-00FF' in rule or 'U+0100-02BA' in rule) or 'font-style:normal' not in rule:
            continue
        family = re.search(r'font-family:"?([^;"]+)', rule).group(1)
        weight = re.search(r'font-weight:([\d ]+)', rule).group(1).strip()
        if family in ('Noto Serif', 'Montserrat') or (family == 'Be Vietnam Pro' and weight in ('400', '500', '600', '700')):
            if rule not in keep:
                keep.append(rule)
    if not keep:
        raise SystemExit('khong tim thay font local')
    return ''.join(keep)


SITE = 'https://dzuongtailor.com'
DZ_PAGES = [
    ('/', 'Trang Chủ', 'dzuong-tailor.html', 'home.html', 'Dzuong Tailor – Cơ Sở Sản Xuất Đối Tác Của mayLEHUONG',
     'Dzuong Tailor là cơ sở đối tác của mayLEHUONG về mảng sản xuất: lên mẫu, sản xuất, gia công và may đo vest theo số đo.'),
    ('/san-pham', 'Sản Phẩm', 'dzuong-san-pham.html', 'san-pham.html', 'Sản Phẩm May Đo Vest – Showroom Mẫu Của Dzuong Tailor',
     'Các mẫu vest may đo của Dzuong Tailor: xem áo, quần, gile và chất vải. Giá theo vải và số đo, vui lòng liên hệ để được báo.'),
    ('/dong-phuc', 'Đồng Phục', 'dzuong-dong-phuc.html', 'dong-phuc.html', 'May Đồng Phục Vest Doanh Nghiệp – Dzuong Tailor',
     'Dzuong Tailor nhận may đồng phục vest cho doanh nghiệp và tổ chức: tư vấn, thiết kế mẫu, chọn chất liệu, đo số và sản xuất.'),
    ('/nang-luc-san-xuat', 'Năng Lực Sản Xuất', 'dzuong-nang-luc-san-xuat.html', 'nang-luc.html', 'Năng Lực Sản Xuất Vest: Lên Mẫu, Gia Công – Dzuong Tailor',
     'Năng lực của Dzuong Tailor, đối tác sản xuất của mayLEHUONG: lên mẫu, sản xuất, gia công và may đo vest theo số đo riêng.'),
    ('/gioi-thieu', 'Giới Thiệu', 'dzuong-gioi-thieu.html', 'gioi-thieu.html', 'Giới Thiệu Dzuong Tailor – Cơ Sở Đối Tác Của mayLEHUONG',
     'Dzuong Tailor là cơ sở đối tác của mayLEHUONG về mảng sản xuất, đảm nhận lên mẫu, sản xuất, gia công và may đo vest.'),
    ('/phap-ly', 'Pháp Lý', 'dzuong-phap-ly.html', 'phap-ly.html', 'Thông Tin Pháp Lý – Dzuong Tailor Và Công Ty Lê Hương',
     'Thông tin pháp lý của Dzuong Tailor, cơ sở đối tác sản xuất của mayLEHUONG (Công ty TNHH Thời Trang Lê Hương).'),
]
HERO_PRELOAD = '<link rel="preload" as="image" href="/assets/dzuong-20261109/hero-atelier.webp" fetchpriority="high" />\n'


def dz_jsonld(path, label):
    if path == '/':
        return json.dumps({'@context': 'https://schema.org', '@type': 'Organization', 'name': 'Dzuong Tailor', 'url': SITE + '/',
                           'logo': SITE + '/images/dzuong/logo-dzuong-web.png', 'telephone': '+84786291468',
                           'description': 'Cơ sở đối tác của mayLEHUONG về mảng sản xuất: lên mẫu, sản xuất, gia công và may đo vest.'}, ensure_ascii=False)
    return json.dumps({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Trang Chủ', 'item': SITE + '/'},
        {'@type': 'ListItem', 'position': 2, 'name': label, 'item': SITE + path}]}, ensure_ascii=False)


def dzuong_page(web, src):
    shell = read(os.path.join(src, 'dzuong-tailor.template.html')).replace('%%FONTS%%', local_fonts(web))
    pages = os.path.join(src, 'dz-pages')
    cta = read(os.path.join(pages, 'cta.html'))
    models = os.path.join(src, 'models.json')
    for path, label, name, body_file, title, desc in DZ_PAGES:
        nav = ''.join('<a href="%s"%s>%s</a>' % (p, ' aria-current="page"' if p == path else '', l) for p, l, *_ in DZ_PAGES)
        body = read(os.path.join(pages, body_file)).replace('%%CTA%%', cta)
        if '%%MODELS%%' in body:
            body = body.replace('%%MODELS%%', models_html(models))
        if '%%MODELS4%%' in body:
            body = body.replace('%%MODELS4%%', models_html(models, 4))
        out = (shell.replace('%%TITLE%%', html.escape(title)).replace('%%DESC%%', html.escape(desc, quote=True))
               .replace('%%URL%%', SITE + path).replace('%%PRELOAD%%', HERO_PRELOAD if path == '/' else '')
               .replace('%%JSONLD%%', dz_jsonld(path, label)).replace('%%NAV%%', nav).replace('%%BODY%%', body))
        if '%%' in out:
            raise SystemExit('con placeholder: ' + name)
        write(os.path.join(web, name), out)
    for f in ('theme.js', 'dark-theme.css', 'dzuong-robots.txt', 'dzuong-sitemap.xml'):
        shutil.copyfile(os.path.join(src, f), os.path.join(web, f))
    dest = os.path.join(web, 'assets', 'dzuong-20261109')
    os.makedirs(dest, exist_ok=True)
    for f in ('mlh-logo.webp', 'mlh-logo-white.webp', 'hero-atelier.webp'):
        shutil.copyfile(os.path.join(src, f), os.path.join(dest, f))


def block(t, name):
    """Tra ve (dau, cuoi) khoi server co server_name name."""
    i = t.index('server_name %s' % name)
    s = t.rfind('server {', 0, i)
    depth, j = 0, s
    while True:
        c = t[j]
        depth += (c == '{') - (c == '}')
        j += 1
        if c == '}' and depth == 0:
            return s, j


def patch_sites(path):
    t = read(path)
    if 'dzuong-tailor.html' in t:
        return False
    s, e = block(t, 'dzuongtailor.com www.dzuongtailor.com')
    b = t[s:e]
    b, n = re.subn(r'add_header Vary "User-Agent" always;\n\s*', '', b, count=1)
    assert n == 1
    b, n = re.subn(r'try_files \$mlh_homepage_file =404;', 'try_files /dzuong-tailor.html =404;', b, count=1)
    assert n == 1
    extra = (
        '    location = /robots.txt { try_files /dzuong-robots.txt =404; }\n'
        '    location = /sitemap.xml { try_files /dzuong-sitemap.xml =404; }\n'
        + ''.join('    location = %s { try_files /%s =404; }\n' % (p, n) for p, _, n, *_ in DZ_PAGES if p != '/') +
        '    location = /san-pham/ { return 301 /san-pham; }\n'
        '    location = /gioi-thieu.html { return 301 /gioi-thieu; }\n'
        '    location = /dong-phuc.html { return 301 /dong-phuc; }\n'
        '    location ~ ^/dzuong-[a-z-]+\\.html$ { return 301 /; }\n'
        '    location ~ ^/zalo_verifier[A-Za-z0-9_-]+\\.html$ { try_files $uri =404; }\n'
    )
    a = b.index('    location = /blazer.html')
    z = b.index('    # Dzuong Tailor custom logo overrides')
    b = b[:a] + extra + '\n' + b[z:]
    b, n = re.subn(r'location ~ \^/san-pham/\[A-Za-z0-9_-\]\+\\\.html\$ \{\n\s*try_files \$uri /product-detail\.html;\n\s*\}',
                   'location ~ ^/san-pham/ {\n        return 301 https://maylehuong.com$request_uri;\n    }', b, count=1)
    assert n == 1
    b, n = re.subn(r'(    location / \{\n\s*)try_files \$uri \$uri/ \$uri\.html =404;',
                   r'\1return 301 https://maylehuong.com$request_uri;', b, count=1)
    assert n == 1
    t = t[:s] + b + t[e:]
    s2, e2 = block(t, 'maylehuong.com www.maylehuong.com')
    head = t.index('\n', t.index('server_name', s2)) + 1
    t = t[:head] + '    location ~ ^/dzuong-[a-z-]+\\.html$ { return 301 https://dzuongtailor.com/; }\n' + t[head:]
    write(path, t)
    return True


def main():
    web, src = sys.argv[1], sys.argv[2]
    print('bootstrap:', inject(web))
    print('gioi-thieu:', add_about(web))
    dzuong_page(web, src)
    if len(sys.argv) > 3:
        print('sites.conf:', patch_sites(sys.argv[3]))


if __name__ == '__main__':
    main()
