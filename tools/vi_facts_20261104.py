"""Unify contradictory Vietnamese facts on the public website (owner decisions 04/11/2026).

Decisions:
  - Years: "Hơn nửa thế kỷ" (family tradition, home stat 50+), company since 06/2019.
  - Warranty: lifetime seam warranty everywhere (drop "Bảo Hành Vàng 12 Tháng").
  - Measurements: 25 body measurements (matches Admin).
  - Footer: 30-day returns and free nationwide delivery from 500.000đ are true; reword for clarity.
  - Also: "hơn 500+" -> "hơn 500"; uniform form reply line drops the 2-working-hour promise
    (removed from tu-van.html on 15/10).

Usage: python -I tools/vi_facts_20261104.py <web_root> [--dry-run]
Edits in place. Every rule must match the expected count, otherwise nothing is written.
Minified home bundles are immutable (cache 365 days), so they are copied to a new file
name and index.html / index-mobile.html are pointed at the copy.
"""
import argparse
import re
import sys
from pathlib import Path

VERSION = '20261104-vi-facts'


def js_escape(s):
    out = []
    for ch in s:
        o = ord(ch)
        if o < 128:
            out.append(ch)
        elif o < 256:
            out.append('\\x%02X' % o)
        else:
            out.append('\\u%04X' % o)
    return ''.join(out)


FOOTER = [
    ('>Freeship Toàn Quốc<', '>Miễn Phí Giao Hàng<'),
    ('>Cho đơn hàng từ 500.000đ<', '>Toàn quốc, đơn từ 500.000đ<'),
    ('>Trong vòng 30 ngày tận nhà<', '>Đổi trả trong vòng 30 ngày<'),
]

# (file, old, new, expected count)
RULES = [
    ('index.html', 'Gần 1 Nửa Thế Kỷ Định Hình Quý Ông Việt', 'Hơn Nửa Thế Kỷ Định Hình Quý Ông Việt', 1),
    ('index-mobile.html', 'Gần 1 Nửa Thế Kỷ Định Hình Quý Ông Việt', 'Hơn Nửa Thế Kỷ Định Hình Quý Ông Việt', 1),
    ('index.html', "{ id: 'stat-years', target: 48, suffix: '' }", "{ id: 'stat-years', target: 50, suffix: '+' }", 1),
    ('index.html', '>48</span>', '>50+</span>', 1),
    ('index-mobile.html', "animateCounter(elYears, 48, '', 1800);", "animateCounter(elYears, 50, '+', 1800);", 1),
    ('index.html', '(Lấy 30+ số đo)', '(Lấy 25 số đo)', 1),
    ('index-mobile.html', '(Lấy 30+ số đo)', '(Lấy 25 số đo)', 1),
    ('index.html', 'Tuyệt Đối (30+ số đo)', 'Tuyệt Đối (25 số đo)', 1),
    ('index-mobile.html', 'Tuyệt Đối (30+ số đo)', 'Tuyệt Đối (25 số đo)', 1),
    ('may-do.html', 'theo hơn 30 thông số hình thể', 'theo 25 số đo cơ thể', 1),
    ('may-do.html', 'Chuẩn 30+ Thông Số Cá Nhân', 'Chuẩn 25 Số Đo Cá Nhân', 1),
    ('may-do.html', 'Lấy hơn 30 thông số đo đạc chi tiết', 'Lấy 25 số đo cơ thể chi tiết', 1),
    ('gioi-thieu.html', 'Hành trình phát triển từ năm 2010 của mayLEHUONG', 'Hành trình hơn nửa thế kỷ của mayLEHUONG', 3),
    ('dong-phuc.html', 'Bảo Hành Vàng 12 Tháng', 'Bảo Hành Trọn Đời Đường May', 2),
    ('dong-phuc.html', 'kho vải hơn 500+ chất liệu', 'kho vải hơn 500 chất liệu', 1),
    ('dong-phuc.html', 'CHÚNG TÔI SẼ PHẢN HỒI TRONG VÒNG 2 GIỜ LÀM VIỆC', 'NHÀ MAY SẼ LIÊN HỆ LẠI ĐỂ TƯ VẤN VÀ XÁC NHẬN', 1),
] + [('footer-component.js', a, b, 1) for a, b in FOOTER]

BUNDLE_RE = re.compile(r'/assets/brand-20261017/(home-app-(?:desktop|mobile)-[0-9a-f]+\.min-[0-9a-f]+)\.js')


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    files = {}
    errors = []

    def text(name):
        if name not in files:
            files[name] = rd(root / name)
        return files[name]

    for name, old, new, n in RULES:
        t = text(name)
        c = t.count(old)
        if c != n:
            errors.append(f'{name}: expected {n} x {old!r}, found {c}')
            continue
        files[name] = t.replace(old, new)

    # immutable home bundles -> new copies with the footer reworded
    new_files = {}
    for page in ('index.html', 'index-mobile.html'):
        t = files[page]
        m = BUNDLE_RE.search(t)
        if not m:
            errors.append(f'{page}: home bundle not found')
            continue
        src = root / 'assets' / 'brand-20261017' / (m.group(1) + '.js')
        b = rd(src)
        for old, new in FOOTER:
            eo, en = js_escape(old), js_escape(new)
            if b.count(eo) != 1:
                errors.append(f'{src.name}: expected 1 x {eo!r}, found {b.count(eo)}')
            b = b.replace(eo, en)
        dst = src.with_name(m.group(1) + '-' + VERSION + '.js')
        new_files[dst] = b
        files[page] = t.replace(m.group(0), m.group(0)[:-3] + '-' + VERSION + '.js')

    # bump footer cache version on every page that loads it
    bumped = 0
    pat = re.compile(r'footer-component\.js\?v=[\w.-]+')
    for p in sorted(root.rglob('*.html')):
        rel = p.relative_to(root).as_posix()
        if rel.startswith(('admin/', 'api/')):
            continue
        t = files.get(rel) or rd(p)
        nt, k = pat.subn('footer-component.js?v=' + VERSION, t)
        if k:
            files[rel] = nt
            bumped += 1

    if errors:
        print('NOT WRITTEN:', *errors, sep='\n  ')
        sys.exit(1)
    changed = [n for n, t in files.items() if t != rd(root / n)]
    print(f'rules {len(RULES)} ok; files changed {len(changed)}; footer version bumped on {bumped} pages; new bundles {len(new_files)}')
    if a.dry_run:
        return
    for n in changed:
        (root / n).write_text(files[n], encoding='utf-8', newline='')
    for p, b in new_files.items():
        p.write_text(b, encoding='utf-8', newline='')
        print('new', p.relative_to(root).as_posix())


if __name__ == '__main__':
    main()
