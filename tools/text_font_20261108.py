"""Text webfont request: Montserrat only in the weights the site renders (08/11/2026, GitHub preview first).

Every page (HTML <link>, global.css @import, nav-component.js fallback) asks Google for
Noto Serif 400..900 + italic, Be Vietnam Pro 300..900 + italic, Montserrat 300..900 + italic.
Measured on 22 pages x 390/1366 (computed style of every text element incl. hidden drawers/modals):
Montserrat is only used at 600/700/800 normal -> `Montserrat:wght@600;700;800` (latin+vietnamese ~101 -> ~49 KB).
Noto Serif / Be Vietnam Pro unchanged (Google serves the same files for static weights). Home pages use their own
local fonts and are untouched. Bumps global.css / nav-component.js ?v on every page.
Usage: python -X utf8 -I tools/text_font_20261108.py <web_root> [--dry-run]   (idempotent)
"""
import re
import sys
from pathlib import Path

OLD = 'Montserrat:ital,wght@0,300..900;1,300..900'
NEW = 'Montserrat:wght@600;700;800'
VER = '20261108-font'
BUMP = re.compile(r'((?<![\w-])(?:global\.css|nav-component\.js))(\?v=[^"\'\s>]*)?(?=["\'\s>])')


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def main():
    web = Path(sys.argv[1])
    writes = {}
    for n in ('global.css', 'nav-component.js'):
        t = rd(web / n)
        if OLD in t:
            writes[web / n] = t.replace(OLD, NEW)
    links = pages = 0
    for f in web.rglob('*.html'):
        if 'admin' in f.relative_to(web).parts:
            continue
        t = rd(f)
        k = t.count(OLD)
        t2 = t.replace(OLD, NEW)
        t2, b = BUMP.subn(lambda m: m.group(1) + '?v=' + VER, t2)
        if t2 != t:
            writes[f] = t2
            links += k
            pages += 1
    print('files', len(writes), '| html pages', pages, '| font links', links)
    if '--dry-run' in sys.argv:
        return
    for f, t in writes.items():
        with open(f, 'w', encoding='utf-8', newline='') as fh:
            fh.write(t)


if __name__ == '__main__':
    main()
