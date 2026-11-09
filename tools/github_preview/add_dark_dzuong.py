"""Dua darkmode va 6 trang Dzuong vao ban thu GitHub. Chay SAU make_preview.py, chay lai duoc.

python -I tools/github_preview/add_dark_dzuong.py <site_dir> <web_da_chay_dark_mode_20261109>

Dzuong nam o /dzuong/ vi GitHub Pages chi co mot ten mien. Khong dung cho VPS.
"""
import glob
import os
import re
import shutil
import sys

MEDIA = 'https://maylehuong.com'
PAGES = {'dzuong-tailor.html': '', 'dzuong-san-pham.html': 'san-pham', 'dzuong-dong-phuc.html': 'dong-phuc',
         'dzuong-nang-luc-san-xuat.html': 'nang-luc-san-xuat', 'dzuong-gioi-thieu.html': 'gioi-thieu', 'dzuong-phap-ly.html': 'phap-ly'}
LANGS = {
    '': ('Cơ Sở Đối Tác Sản Xuất', 'Dzuong Tailor là cơ sở đối tác của mayLEHUONG về mảng sản xuất, đảm nhận lên mẫu, sản xuất, gia công và may đo vest.', 'Xem Dzuong Tailor'),
    'en': ('Production Partner', "Dzuong Tailor is mayLEHUONG's production partner, handling pattern development, production, contract sewing and made-to-measure suits.", 'Visit Dzuong Tailor'),
    'zh': ('生产合作工坊', 'Dzuong Tailor 是 mayLEHUONG 的生产合作工坊，负责打版、生产、代工及西装量身定制。', '查看 Dzuong Tailor'),
    'ko': ('생산 협력 공방', 'Dzuong Tailor는 mayLEHUONG의 생산 협력 공방으로, 패턴 개발, 생산, 임가공, 맞춤 정장 제작을 맡고 있습니다.', 'Dzuong Tailor 보기'),
    'ja': ('生産提携工房', 'Dzuong Tailorは、mayLEHUONGの生産提携工房として、パターン開発、生産、縫製加工、オーダースーツの仕立てを担当しています。', 'Dzuong Tailorを見る'),
    'hi': ('उत्पादन साझेदार', 'Dzuong Tailor, mayLEHUONG का उत्पादन साझेदार है, जो पैटर्न विकास, उत्पादन, सिलाई कार्य और माप के अनुसार सूट तैयार करता है।', 'Dzuong Tailor देखें'),
}
ABOUT = '''<section class="py-12 sm:py-24 px-4 sm:px-12 md:px-24 bg-[#f5f0eb] border-t border-black/5" id="doi-tac-san-xuat" data-no-tr>
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="font-noto-serif text-2xl sm:text-4xl font-bold text-[#000000]" style="color: #000000 !important;">%s</h2>
    <p class="mt-4 text-sm sm:text-base leading-relaxed" style="color:#333333">%s</p>
    <a class="inline-block mt-6 font-semibold underline" style="color:#9d0208" href="/dzuong/">%s</a>
  </div>
</section>

'''


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def write(p, t):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def boot_block(web):
    m = re.search(r'<script id="mlh-theme-boot">.*?</script>\r?\n<script src="/theme\.js[^>]*></script>\r?\n', read(os.path.join(web, 'index.html')), re.S)
    if not m:
        raise SystemExit('khong tim thay doan bootstrap')
    return m.group(0)


def inject(site, boot):
    done = 0
    for p in glob.glob(os.path.join(site, '**', '*.html'), recursive=True):
        rel = os.path.relpath(p, site).replace('\\', '/')
        if rel.startswith('dzuong/') or os.path.basename(p) == 'blazer.html':
            continue
        t = read(p)
        if 'id="mlh-theme-boot"' in t:
            continue
        n = t.lower().find('</head>')
        if n < 0:
            continue
        write(p, t[:n] + boot + t[n:])
        done += 1
    return done


def about(site):
    vi = read(os.path.join(site, 'gioi-thieu.html'))
    done = 0
    marker = 'id="doi-tac-san-xuat"'
    if marker in vi:
        return 0
    anchor = vi.index('Ghé Thăm Showroom')
    index = vi.count('<section', 0, vi.rfind('<section', 0, anchor))
    total = vi.count('<section')
    for lang, text in LANGS.items():
        p = os.path.join(site, lang, 'gioi-thieu.html')
        t = read(p)
        if t.count('<section') != total:
            raise SystemExit('so section khac: ' + p)
        n = -1
        for _ in range(index + 1):
            n = t.index('<section', n + 1)
        write(p, t[:n] + ABOUT % text + t[n:])
        done += 1
    return done


def dzuong(site, web):
    head = re.search(r'<script src="/preview-mode\.js[^>]*></script>', read(os.path.join(site, 'index.html'))).group(0)
    fonts = set()
    for name, slug in PAGES.items():
        t = read(os.path.join(web, name))
        t = t.replace('<meta name="robots" content="index,follow" />', '<meta name="robots" content="noindex,nofollow" />')
        t = t.replace('<head>', '<head>\n' + head, 1)
        for path in filter(None, PAGES.values()):
            t = t.replace('href="/%s"' % path, 'href="/dzuong/%s/"' % path)
        t = t.replace('href="/"', 'href="/dzuong/"').replace('href="/#lien-he"', 'href="/dzuong/#lien-he"')
        t = re.sub(r'''(?<=["'(=,\s])/?(images|videos|uploads)/''', lambda m: MEDIA + '/' + m.group(1) + '/', t)
        fonts.update(re.findall(r'url\(["\']?(/assets/[^"\')]+)', t))
        write(os.path.join(site, 'dzuong', slug, 'index.html'), t)
    missing = 0
    for u in fonts:
        dst = os.path.join(site, u.lstrip('/').split('?')[0])
        if not os.path.isfile(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(os.path.join(web, u.lstrip('/').split('?')[0]), dst)
            missing += 1
    return len(PAGES), missing


def main():
    site, web = sys.argv[1], sys.argv[2]
    for f in ('theme.js', 'dark-theme.css'):
        shutil.copyfile(os.path.join(web, f), os.path.join(site, f))
    shutil.copytree(os.path.join(web, 'assets', 'dzuong-20261109'), os.path.join(site, 'assets', 'dzuong-20261109'), dirs_exist_ok=True)
    print('bootstrap:', inject(site, boot_block(web)))
    print('gioi-thieu:', about(site))
    print('dzuong:', dzuong(site, web))


if __name__ == '__main__':
    main()
