"""Swap the home hero banners (text baked into images) for the 6 text-free banners of 04/11/2026.

Usage: python -I tools/hero_nochu_20261104.py <web_root> [--dry-run]
- Copies the 24 WebP files from images/home/hero/banner-nochu-20261104 to <web_root>/assets/hero-nochu-20261104/.
- index.html and index-mobile.html: slides 1-5 point to the new scenes (same markup, lazy-load and
  preload untouched), slide 6 is a copy of slide 5 with the 6th scene, and a 6th dot is added.
- Every rule must match its expected count, otherwise nothing is written.
Images are AI illustrations (manifest.json: ai_illustration true).
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / 'images' / 'home' / 'hero' / 'banner-nochu-20261104'
DEST = 'assets/hero-nochu-20261104'
SCENES = [
    ('hang-san-vest-nam', 'Vest nam may sẵn trưng bày trên ma-nơ-canh'),
    ('hang-san-vest-nu', 'Vest nữ công sở may sẵn trưng bày trên ma-nơ-canh'),
    ('hang-san-phu-kien', 'Phụ kiện: cà vạt, sơ mi, nơ, kẹp cà vạt và giày tây'),
    ('may-do-nam', 'May đo vest nam: thợ may lấy số đo cho khách'),
    ('may-do-nu', 'May đo vest nữ: thợ may ướm áo cho khách'),
    ('dong-phuc-cong-ty', 'Đồng phục công ty cho nhân viên nam và nữ'),
]
SUFFIXES = ('desktop-1600.webp', 'desktop-960.webp', 'mobile-563.webp', 'mobile-480.webp')
OLD = '/assets/performance/20261014-v1/banner-logo-{}-'
PIC = re.compile(r'<picture class="lh-hero-slide">.*?</picture>', re.S)
ALT = re.compile(r'(<img alt=")[^"]*(")')
DOT5 = '<button class="lh-hero-dot" type="button" role="tab" aria-label="Banner 5" aria-selected="false"></button>'
DOT6 = '<button class="lh-hero-dot" type="button" role="tab" aria-label="Banner 6" aria-selected="false"></button>'


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def patch(t, name, errors):
    pics = PIC.findall(t)
    if len(pics) != 5:
        errors.append(f'{name}: expected 5 hero slides, found {len(pics)}')
        return t
    new = []
    for i, pic in enumerate(pics, 1):
        scene, alt = SCENES[i - 1]
        if pic.count(OLD.format(i)) < 3:
            errors.append(f'{name}: slide {i} does not use {OLD.format(i)}')
        p = pic.replace(OLD.format(i), f'/{DEST}/{scene}-')
        new.append(ALT.sub(lambda m: m.group(1) + alt + m.group(2), p, count=1))
    scene6, alt6 = SCENES[5]
    six = pics[4].replace(OLD.format(5), f'/{DEST}/{scene6}-')
    six = ALT.sub(lambda m: m.group(1) + alt6 + m.group(2), six, count=1)
    psep = t[t.index(pics[3]) + len(pics[3]):t.index(pics[4])]
    dot4 = DOT5.replace('Banner 5', 'Banner 4')
    dsep = t[t.index(dot4) + len(dot4):t.index(DOT5)] if dot4 in t and DOT5 in t else '\n'
    for old, nw in zip(pics, new):
        t = t.replace(old, nw, 1)
    # slide 6 and dot 6 reuse the exact separator (indent, line breaks) of the previous item
    t = t.replace(new[4], new[4] + psep + six, 1)
    if t.count(DOT5) != 1:
        errors.append(f'{name}: dot 5 not found exactly once')
    t = t.replace(DOT5, DOT5 + dsep + DOT6, 1)
    # preload links for slide 1 live outside the <picture>
    t = t.replace(OLD.format(1), f'/{DEST}/{SCENES[0][0]}-')
    if 'banner-logo-' in t:
        errors.append(f'{name}: old banner URL still present')
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    errors = []
    missing = [f'{s}-{x}' for s, _ in SCENES for x in SUFFIXES if not (SRC / f'{s}-{x}').is_file()]
    if missing:
        errors.append('missing images: ' + ', '.join(missing))
    out = {}
    for name in ('index.html', 'index-mobile.html'):
        out[name] = patch(rd(root / name), name, errors)
    if errors:
        print('NOT WRITTEN:', *errors, sep='\n  ')
        sys.exit(1)
    print(f'ok: 6 slides, 6 dots, {len(SCENES) * len(SUFFIXES)} images')
    if a.dry_run:
        return
    d = root / DEST
    d.mkdir(parents=True, exist_ok=True)
    for s, _ in SCENES:
        for x in SUFFIXES:
            shutil.copyfile(SRC / f'{s}-{x}', d / f'{s}-{x}')
    for name, t in out.items():
        with open(root / name, 'w', encoding='utf-8', newline='') as f:
            f.write(t)


if __name__ == '__main__':
    main()
