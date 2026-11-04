"""Assemble the GitHub Pages TEST copy of the website (Vietnamese + translated versions).

python -I tools/github_preview/make_preview.py --web <vi web root from VPS current> --build <build_en_site.py output>
       --products <api /api/products json> --out <site dir>

The copy is for review only: noindex everywhere, robots Disallow, product data from a static snapshot,
images loaded from https://maylehuong.com, every form/order POST blocked by preview-mode.js.
Never deploy this output to the VPS.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MEDIA = 'https://maylehuong.com'
SKIP_TOP = {'admin', 'robots.txt', 'sitemap.xml'}
TEXT_EXT = {'.html', '.css'}  # JS/JSON untouched: scripts build URLs themselves; preview-mode.js fixes them at runtime
SCRIPT_RE = re.compile(r'(<script[^>]*>.*?</script\s*>)', re.S | re.I)
# /images/... , images/... after a quote, "(", "=", "," or whitespace (HTML attrs, srcset, CSS url(), JS strings)
MEDIA_RE = re.compile(r'(?<=["\'`(=,\s])/?(images|videos|uploads)/')


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def wr(p, s):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(s.encode('utf-8'))


def patch_html(s, ver):
    s = re.sub(r'<meta\s+name=["\']robots["\'][^>]*>', '', s, flags=re.I)
    if '</head>' in s and 'mobile-fit.css' not in s:
        s = s.replace('</head>', '  <link rel="stylesheet" href="/mobile-fit.css?v=%s" />\n</head>' % ver, 1)
    head = re.search(r'<head[^>]*>', s, re.I)
    ins = '\n  <meta name="robots" content="noindex,nofollow" />\n  <script src="/preview-mode.js?v=%s"></script>' % ver
    return s[:head.end()] + ins + s[head.end():] if head else s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--web', required=True)
    ap.add_argument('--build', required=True)
    ap.add_argument('--products', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    web, build, out = Path(a.web), Path(a.build), Path(a.out)
    if out.exists():
        for c in out.iterdir():  # keep .git of the checkout
            if c.name == '.git':
                continue
            shutil.rmtree(c) if c.is_dir() else c.unlink()
    out.mkdir(parents=True, exist_ok=True)
    import hashlib
    ver = hashlib.sha1((HERE / 'preview-mode.js').read_bytes() + (HERE / 'mobile-fit.css').read_bytes()).hexdigest()[:10]
    n = {'copied': 0, 'html': 0, 'media_rewrites': 0}
    for layer in (web, build):
        for f in layer.rglob('*'):
            if not f.is_file():
                continue
            rel = f.relative_to(layer)
            top = rel.parts[0]
            if layer == web and (top in SKIP_TOP or top.startswith('zalo_verifier')):
                continue
            dst = out / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(f, dst)
            n['copied'] += 1
    for f in out.rglob('*'):
        if f.is_file() and f.suffix in TEXT_EXT and '.git' not in f.parts:
            s = rd(f)
            parts = SCRIPT_RE.split(s) if f.suffix == '.html' else [s]
            for i in range(0, len(parts), 2):  # odd indexes are <script> blocks
                parts[i], k = MEDIA_RE.subn(lambda m: MEDIA + '/' + m.group(1) + '/', parts[i])
                n['media_rewrites'] += k
            s2 = ''.join(parts)
            if f.suffix == '.html':
                s2 = patch_html(s2, ver)
                n['html'] += 1
            if s2 != s:
                wr(f, s2)
    prods = rd(Path(a.products))
    json.loads(prods)
    wr(out / 'api-snapshot' / 'products.json', prods)
    shutil.copyfile(HERE / 'preview-mode.js', out / 'preview-mode.js')
    shutil.copyfile(HERE / 'mobile-fit.css', out / 'mobile-fit.css')
    wr(out / 'robots.txt', 'User-agent: *\nDisallow: /\n')
    wr(out / '.nojekyll', '')
    shutil.copyfile(HERE / 'README-site.md', out / 'README.md')
    print(json.dumps(n))


if __name__ == '__main__':
    main()
