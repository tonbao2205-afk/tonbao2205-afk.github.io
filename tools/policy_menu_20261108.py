"""Put the Chính sách page in the main menu (08/11/2026, owner: "đưa lên menu luôn công khai các thông tin").

Run AFTER tools/policy_page_20261108.py.
- nav-component.js: menu item after Giới Thiệu (desktop bar + mobile drawer share this list).
- site-data.js: same item in its fallback page list.
- The homepage does not load nav-component/footer-component: index.html and index-mobile.html use their own bundles,
  which hold private copies of the menu and footer. Those get the menu item plus the footer link/email/tax code that
  policy_page_20261108.py only added to footer-component.js. Bundles are immutable, so a new file name is written.
- Bumps nav-component.js / site-data.js ?v on every page.
Every rule must match exactly once per file, otherwise nothing is written.
Usage: python -X utf8 -I tools/policy_menu_20261108.py <web_root> [--dry-run]   (idempotent)
"""
import re
import sys
from pathlib import Path

VER = '20261108-policy'
SUFFIX = '-20261108-policy.js'
LABEL_ESC = 'Ch\\xEDnh S\\xE1ch'

NAV_OLD = "    { label: 'Giới Thiệu', href: '/gioi-thieu.html' }\n"
NAV_ITEM = "    { label: 'Chính Sách', href: '/chinh-sach.html' }\n"
SD_OLD = "      {href:'/gioi-thieu.html', label:'Giới Thiệu'},\n"
SD_ITEM = "      {href:'/chinh-sach.html', label:'Chính Sách'},\n"

GT = 'Gi\\u1EDBi Thi\\u1EC7u'
LINK_STYLE = ' style="color: #ffffff !important;">'
BUNDLE_RULES = [
    ('{label:"%s",href:"gioi-thieu.html"}]' % GT,
     '{label:"%s",href:"gioi-thieu.html"},{label:"%s",href:"chinh-sach.html"}]' % (GT, LABEL_ESC)),
    ('{href:"gioi-thieu.html",label:"%s"}]' % GT,
     '{href:"gioi-thieu.html",label:"%s"},{href:"chinh-sach.html",label:"%s"}]' % (GT, LABEL_ESC)),
    ("'      <a href=\"gioi-thieu.html\"%s%s Th\\u01B0\\u01A1ng Hi\\u1EC7u</a>'" % (LINK_STYLE, GT),
     "'      <a href=\"gioi-thieu.html\"%s%s Th\\u01B0\\u01A1ng Hi\\u1EC7u</a>',"
     "'      <a href=\"chinh-sach.html\"%s%s & \\u0110i\\u1EC1u Kho\\u1EA3n</a>'" % (LINK_STYLE, GT, LINK_STYLE, LABEL_ESC)),
    ("Hotline H\\xE0 N\\u1ED9i: 0786.291.468</p>'",
     "Hotline H\\xE0 N\\u1ED9i: 0786.291.468</p>',"
     "'      <p%s\\u2709\\uFE0F Email: xuongvestcuoibh9999@gmail.com</p>'" % LINK_STYLE),
    ('L\\xEA H\\u01B0\\u01A1ng. <span class=lhv-rr>',
     'L\\xEA H\\u01B0\\u01A1ng \\xB7 MST 3603652314. <span class=lhv-rr>'),
]
BUMP = re.compile(r'((?<![\w-])(?:nav-component\.js|site-data\.js))(\?v=[^"\'\s>]*)?(?=["\'\s>])')


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def eol(text, snippet):
    return snippet.replace('\n', '\r\n') if '\r\n' in text else snippet


def add_after(text, old, item, name, errs):
    old, item = eol(text, old), eol(text, item)
    if item in text:
        return text
    if text.count(old) != 1:
        errs.append(f'{name}: menu anchor found {text.count(old)} times')
        return text
    if name == 'nav-component.js':
        # last array item has no trailing comma
        bare = old.rstrip('\r\n')
        tail = old[len(bare):]
        return text.replace(old, bare + ',' + tail + item, 1)
    return text.replace(old, old + item, 1)


def main():
    web = Path(sys.argv[1])
    errs, writes = [], {}

    for name, old, item in (('nav-component.js', NAV_OLD, NAV_ITEM), ('site-data.js', SD_OLD, SD_ITEM)):
        t = rd(web / name)
        t2 = add_after(t, old, item, name, errs)
        if t2 != t:
            writes[web / name] = t2

    brand = web / 'assets' / 'brand-20261017'
    for page in ('index.html', 'index-mobile.html'):
        h = rd(web / page)
        m = re.findall(r'/assets/brand-20261017/(home-app-[a-z]+-[^"\s]+?\.js)', h)
        if len(m) != 1:
            errs.append(f'{page}: expected 1 home bundle, found {m}')
            continue
        old_name = m[0]
        if old_name.endswith(SUFFIX):
            continue
        b = rd(brand / old_name)
        for old, new in BUNDLE_RULES:
            if b.count(old) != 1:
                errs.append(f'{page}: rule matched {b.count(old)} times: {old[:50]}')
                continue
            b = b.replace(old, new, 1)
        new_name = old_name[:-3] + SUFFIX
        writes[brand / new_name] = b
        writes[web / page] = h.replace(old_name, new_name)

    if errs:
        print('NOT WRITTEN:', *errs, sep='\n  ')
        sys.exit(1)

    pages = 0
    for f in sorted(web.rglob('*.html')):
        if 'admin' in f.relative_to(web).parts:
            continue
        t = writes.get(f) or rd(f)
        t2 = BUMP.sub(lambda m: m.group(1) + '?v=' + VER, t)
        if t2 != t:
            writes[f] = t2
            pages += 1
    print('files', len(writes), '| html ?v bumped', pages)
    if '--dry-run' in sys.argv:
        return
    for f, t in writes.items():
        with open(f, 'w', encoding='utf-8', newline='') as fh:
            fh.write(t)


if __name__ == '__main__':
    main()
