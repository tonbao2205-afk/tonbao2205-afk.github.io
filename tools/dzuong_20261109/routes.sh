#!/bin/sh
# Chay TRONG container tam (network none) dung web image dang chay: kiem tra nginx -t va tuyen URL Dzuong.
set -u
cd /tmp/t
cp sites.conf /etc/nginx/sites.conf
cp web/* /var/www/maylehuong/
mkdir -p /var/www/maylehuong/assets/dzuong-20261109 && cp assets/* /var/www/maylehuong/assets/dzuong-20261109/
nginx -t 2>&1 || exit 1
nginx
sleep 1
P=0; F=0
chk() { # host path code [location|header-regex]
  out=$(curl -s -o /dev/null -D - -H "Host: $1" "http://127.0.0.1:8089$2" 2>/dev/null)
  [ "$1" = "maylehuong.com" ] && out=$(curl -s -o /dev/null -D - -H "Host: $1" "http://127.0.0.1:8088$2" 2>/dev/null)
  code=$(printf '%s' "$out" | head -1 | awk '{print $2}')
  ok=1; [ "$code" = "$3" ] || ok=0
  if [ $# -ge 4 ] && ! printf '%s' "$out" | tr -d '\r' | grep -qiE "$4"; then ok=0; fi
  if [ $ok = 1 ]; then P=$((P+1)); echo "ok   $1$2 -> $code ${4:-}"; else F=$((F+1)); echo "FAIL $1$2 -> $code (want $3 ${4:-})"; printf '%s\n' "$out" | tr -d '\r' | grep -iE '^(location|content-type|x-robots)' ; fi
}
D=dzuongtailor.com
for p in / /san-pham /dong-phuc /nang-luc-san-xuat /gioi-thieu /phap-ly; do chk $D $p 200 'strict-transport-security'; done
chk $D /index.html 301 '^location: /$'
chk $D /index-mobile.html 301 '^location: /$'
chk $D /dzuong-tailor.html 301 '^location: /$'
for p in san-pham dong-phuc nang-luc-san-xuat gioi-thieu phap-ly; do
  chk $D /$p/ 301 "^location: /$p\$"
  chk $D /$p.html 301 "^location: /$p\$"
  chk $D /dzuong-$p.html 301 "^location: /$p\$"
done
chk $D '/dong-phuc/?utm=1' 301 '^location: /dong-phuc\?utm=1$'
chk $D /sitemap.xml 200 'content-type: application/xml'
chk $D /sitemap.xml 200 '^x-robots-tag: noindex, follow'
chk $D /robots.txt 200 'content-type: text/plain'
chk $D /dzuong-sitemap.xml 301 '^location: /$'
chk $D /san-pham/vnam1.html 301 '^location: https://maylehuong.com/san-pham/vnam1.html'
chk $D /san-pham/p01.html 301 '^location: https://maylehuong.com/san-pham/p01.html'
chk $D /vest-nu.html 301 '^location: https://maylehuong.com/vest-nu.html'
chk $D /vest-nam-tre.html 301 '^location: https://maylehuong.com/vest-nam-tre.html'
chk $D /zalo_verifierU-FZBAliCoCgsxelx-zW6MtCzJc1kYPdC3Kp.html 200
chk $D /assets/dzuong-20261109/hero-atelier.webp 200 'content-type: image/webp'
chk $D /theme.js 200
chk $D /admin/ 200 'x-robots-tag: noindex'
chk www.$D / 301 '^location: https://dzuongtailor.com/$'
chk www.$D /phap-ly 301 '^location: https://dzuongtailor.com/phap-ly$'
chk maylehuong.com /dzuong-san-pham.html 301 '^location: https://dzuongtailor.com/san-pham$'
chk maylehuong.com /dzuong-tailor.html 301 '^location: https://dzuongtailor.com/$'
chk maylehuong.com /dzuong-sitemap.xml 404
chk maylehuong.com /gioi-thieu.html 200
chk maylehuong.com /dong-phuc 301 '^location: .*/dong-phuc.html'
echo "PASS=$P FAIL=$F"
