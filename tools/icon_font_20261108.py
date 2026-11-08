"""Material Symbols icon font -> subset with only the icons the site uses (08/11/2026, GitHub preview first).

19 pages loaded the full variable font `wght,FILL@100..700,0..1` (1,1 MB) and 188 the static `@24,400,0,0` (324 KB).
Google Fonts serves a per-icon subset with `&icon_names=` (sorted, comma separated): all 95 icons used anywhere on the
site (HTML spans, JS literals incl. nav-component/home bundles/preview scripts, translated builds), axes
opsz 24, wght 300..500 (pages use 300/400, cart icon 500), FILL 0..1 (cart icon filled), GRAD 0 = ~28 KB, one URL for
every page (cached once). display=block so ligature names never flash as text.
The home pages keep their own local subset font (data-mlh-fonts) and are not touched. Admin is not touched.
If a NEW icon name is added to the site, add it to ICONS (otherwise it renders as its text name).

Usage: python -X utf8 -I tools/icon_font_20261108.py <web_root> [--dry-run]   (idempotent)
"""
import argparse
import re
import sys
from pathlib import Path

ICONS = sorted(set('''
account_balance account_balance_wallet add architecture arrow_forward arrow_forward_ios article auto_fix badge block bolt
brush business calendar_month call cards category check checkroom chevron_left chevron_right close cloud_off code colors
delete description design_services diamond directions domain download draft edit_note expand_more function grid_view
height history_edu home http image input inventory_2 label link list local_shipping location_on map margin meeting_room
menu mobile navigation newspaper open_in_new padding palette pattern payments person person_pin_circle post preview
public published_with_changes refresh resize rocket_launch schedule script search search_off select shopping_bag
shopping_cart spellcheck start step straighten style support_agent sync tab task_alt timeline title transform uppercase
verified visibility ward workspace_premium zoom_in
'''.split()))
URL = ('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300..500,0..1,0'
       '&icon_names=' + ','.join(ICONS) + '&display=block')
RX = re.compile(r'https://fonts\.googleapis\.com/css2\?family=Material\+Symbols\+Outlined:[^"\'\s>]*')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('web')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    root = Path(a.web)
    n = 0
    for f in sorted(root.rglob('*.html')):
        if 'admin' in f.relative_to(root).parts:
            continue
        with open(f, encoding='utf-8', newline='') as fh:
            t = fh.read()
        t2 = RX.sub(lambda m: URL, t)
        if t2 != t:
            n += 1
            if not a.dry_run:
                with open(f, 'w', encoding='utf-8', newline='') as fh:
                    fh.write(t2)
    print('icons', len(ICONS), '| pages changed', n, '| url chars', len(URL))


if __name__ == '__main__':
    main()
