# Bản thử đa ngôn ngữ trên GitHub (VI · EN · 中文) — 04/11/2026

Chủ shop yêu cầu: làm thêm tiếng Trung cùng tiếng Anh, đưa bản thử lên GitHub chạy công khai, các bản cập nhật ngôn ngữ để trên GitHub, test trước và **không đưa lên VPS**.

## Kết quả
- Bản thử: https://tonbao2205-afk.github.io/ (VI), `/en/` (tiếng Anh), `/zh/` (tiếng Trung giản thể).
- Repo công khai `tonbao2205-afk/tonbao2205-afk.github.io`:
  - Nhánh `main`: website đã dựng, GitHub Pages phục vụ.
  - Nhánh `source`: công cụ và từ điển (`tools/`, `i18n/en`, `i18n/zh`), README hướng dẫn cập nhật.
- VPS KHÔNG bị đụng tới: không SSH, không đổi release. `/en/` và `/zh/` trên maylehuong.com vẫn 404.

## Bản thử khác web thật ở đâu (`tools/github_preview/`)
- Mọi trang có `noindex,nofollow`, `robots.txt` chặn toàn bộ, nên không cạnh tranh SEO với maylehuong.com.
- Sản phẩm, giá, tồn lấy từ ảnh chụp `/api/products` ngày 04/11 (`api-snapshot/products.json`). `preview-mode.js` trả lời `/api/products` từ ảnh chụp này.
- Ảnh và video tải từ `https://maylehuong.com/images/...`. Repo không chứa ảnh.
- `preview-mode.js` chặn mọi POST/PUT/DELETE (fetch, XHR, sendBeacon, form POST) và hiện thông báo "Bản thử nghiệm". Đã thử gửi form trên tu-van, may-do, dong-phuc (VI và ZH): 0 request tới n8n, webhook hoặc `/api/public`.
- Trang chủ trên điện thoại tự chuyển sang `index-mobile.html`, thay việc nginx chọn theo User-Agent.
- Có nhãn nhỏ "BẢN THỬ / PREVIEW / 预览版" ở góc dưới bên trái.

## Thay đổi công cụ trên máy
- `tools/build_en_site.py` dựng được nhiều ngôn ngữ (`--langs en,zh`). Mỗi ngôn ngữ có `/<lang>/<lang>-dict.js` và `<lang>-runtime.js`; hreflang và sitemap gồm vi, en, zh-Hans và x-default. Bản EN dựng lại chỉ khác bản cũ ở thẻ hreflang zh, `og:locale:alternate` và tag version.
- `tools/en_i18n.py`: thêm `joiner` (tiếng Trung nối câu không có dấu cách).
- `tools/en_assets/en-runtime.js` dùng chung cho mọi ngôn ngữ (đọc `window.MLH_I18N`). `lang-switch.js` có 3 ngôn ngữ:
  - Máy tính: VI | EN | 中文.
  - Điện thoại: nút nhỏ mở menu.
  - Gợi ý ngôn ngữ theo trình duyệt (zh → 中文, ngôn ngữ khác → English).
  - `window.MLH_LANGS` để giới hạn số ngôn ngữ hiện.
- Từ điển tiếng Trung `i18n/zh/`:
  - `units.json` 1.831 câu, `names.json` 187 tên, `GLOSSARY.md`.
  - AI dịch từ tiếng Việt, đối chiếu bản EN.
  - Đã kiểm placeholder khớp 100%.
  - Tên đường, tên công ty và một số địa danh nhỏ giữ tiếng Việt theo glossary.
- Công cụ kiểm tra: `.codex-local/i18n-preview-20261104/tools/` (`cdp.py` sửa cho zh, `evalpage.py`).

## Kiểm tra
- Dựng `--strict`: 0 câu thiếu, 0 tên thiếu cho cả EN và ZH.
- Trên máy, 20 trang × 390/1366 qua giả lập DevTools: 0 lỗi JS, 0 tràn ngang, 0 link sai ngôn ngữ. Danh mục hiện đủ sản phẩm (vest nữ 63, sản phẩm 174, phụ kiện 86…), 0 ảnh lỗi. Chữ tiếng Việt còn lại chỉ là tên công ty, tên đường và địa danh.
- Trên GitHub Pages thật, 8 trang × 390/1366: kết quả như trên.

## Tối ưu cỡ điện thoại (bản p4, cùng ngày)
Chủ shop yêu cầu bản GitHub tối ưu cho cả cỡ điện thoại. Prompt: phần bổ sung trong `PROMPT-ANTI-WEB-TIENG-ANH.md`.

Đo ở 320px thấy các lỗi sau. Thẻ sản phẩm bị cắt chữ ở cả 3 ngôn ngữ, kể cả bản tiếng Việt đang chạy thật:
- Thẻ sản phẩm `.vn-card` cắt mã SKU, giá ("2.500.000₫ / bộ") và nút.
- Menu chọn ngôn ngữ trên điện thoại bị header che.
- Nút "English" trong gợi ý ngôn ngữ gãy chữ.
- "Mua Ngay" không dấu chưa được dịch.

Đã sửa:
- `tools/github_preview/mobile-fit.css`: chỉ áp ở ≤ 400px, chỉ class thẻ. SKU được xuống dòng, giá và nút co chữ theo màn hình.
- `lang-switch.js`: menu nổi trên `body`, mục bấm cao 44px; nút gợi ý không gãy chữ.
- `en-runtime.js`: dịch cả chuỗi không dấu có trong từ điển.
- `preview-mode.js`: trang chủ chọn bản điện thoại theo loại máy HOẶC màn hình ≤ 767px, và về bản máy tính khi màn hình rộng.
- Thêm "Mua Ngay" vào từ điển EN/ZH và `runtime-seen.json`.

Kiểm tra:
- 15 trang × 320/360/390/430/1366: 0 tràn ngang, 0 lỗi JS, 0 link sai.
- 0 phần tử trong thẻ bị cắt ở 320/360.
- Trên GitHub thật: kết quả như trên.

`mobile-fit.css` mới chỉ có trên bản GitHub. Web thật vẫn bị cắt giá ở 320px cho tới khi chủ shop cho đăng.

## Còn lại / chủ shop cần biết
- Bản dịch tiếng Trung do AI làm. Nên nhờ người biết tiếng Trung đọc lại trước khi đăng thật.
- Banner trang chủ là ảnh có chữ tiếng Việt, cả EN và ZH đều đang dùng ảnh này.
- Một số thông báo lỗi form trong JS (ví dụ "Gửi thông tin không thành công…") vẫn là tiếng Việt.
- Trang 404 trên điện thoại hiển thị theo bố cục máy tính (do trang 404 hiện có, không phải lỗi bản dịch).
- Giá và tồn trên bản thử không tự cập nhật. Muốn mới thì dựng lại và push.
- Khi chủ shop nói rõ "đăng lên web/VPS", phải dựng lại từ web current trên VPS bằng `build_en_site.py --langs en,zh`, KHÔNG dùng `make_preview.py`. Cần thêm khối `/zh/` vào nginx `sites.conf` như `/en/` (`.codex-local/en-site-20261104/tools/nginx_patch.py` mới chỉ có `/en/`), rồi phát hành theo quy trình Docker.

## Cỡ chữ menu theo ngôn ngữ (bản p5, cùng ngày)
- Chủ shop: menu tiếng Trung hơi bé, menu tiếng Anh hơi to.
- `nav-component.js` ghi cỡ chữ trực tiếp vào từng mục menu (inline `!important`) và ghi lại mỗi khi đổi cỡ cửa sổ, nên CSS không đè được.
- Cách sửa: `lang-switch.js` nhân cỡ chữ đó theo hệ số từng ngôn ngữ, chỉ ở màn hình ≥ 1024px.
  - 中文: menu ×1,16 (13,5→15,5px ở 1920), nút Tư vấn ×1,12, menu xổ ×1,07.
  - EN: menu ×0,92 (13,5→12,5px), nút ×0,95.
  - VI giữ nguyên.
- Kiểm tra ở 1024/1280/1366/1920 (trên máy và GitHub thật): menu một hàng, không xuống dòng, không đè logo hoặc nút, không tràn ngang.

## Bảng chọn ngôn ngữ khi vào web lần đầu (bản p6, cùng ngày)
- Anti làm theo `PROMPT-ANTI-CHON-NGON-NGU.md`. Chi tiết và ảnh của Anti ở `docs/lang-popup-20261104/`. Popup này thay thanh gợi ý nhỏ cũ.
- Claude rà code: gọn, không còn code thừa, không ghi gì ngoài cookie `mlh_lang`. Phần chỉnh cỡ chữ menu của bản p5 vẫn giữ.
- Lỗi phát hiện khi kiểm tra (có từ trước, do công cụ dựng): trang chủ VI có script `querySelectorAll('a[href="/"]')…setAttribute("href","/")`. Công cụ dựng chỉ dịch phần selector thành `/en/` hoặc `/zh/`, nên trên trang chủ EN/ZH mọi link trỏ về trang chủ của chính ngôn ngữ đó (nút ngôn ngữ, logo) bị đổi về `/` tiếng Việt.
  - Đã sửa `js_literal_url` trong `tools/build_en_site.py`: không dịch selector CSS `[href…]`.
  - Đã đối chiếu: bản dựng lại chỉ khác bản cũ ở dòng script này và tag version.
- Kiểm tra (trên máy và GitHub thật):
  - `/`, `/en/`, `/zh/`, `/products.html`, `/zh/may-do.html` ở 320/390/1366/1920: popup hiện giữa màn hình, link đúng trang, focus vào nút gợi ý, khóa cuộn trang phía sau.
  - Esc: đóng popup, lưu cookie theo ngôn ngữ đang xem, mở lại cuộn.
  - Đã có cookie hoặc là Googlebot: popup không hiện.
  - Bấm chọn ngôn ngữ khác: chuyển trang.
  - 0 lỗi JS, 0 tràn ngang.

## Thêm tiếng Hàn, tiếng Nhật, tiếng Hindi (bản p7, cùng ngày)
- Chủ shop yêu cầu thêm tiếng Hàn, tiếng Nhật và "tiếng Ấn Độ". Tiếng Ấn Độ chọn Hindi (phổ biến nhất); muốn ngôn ngữ Ấn Độ khác thì làm thêm.
- Đường dẫn: `/ko/`, `/ja/`, `/hi/`.
- Từ điển: `i18n/{ko,ja,hi}/` gồm `units.json` (1.832 câu), `names.json` (187 tên) và `GLOSSARY.md`.
  - AI dịch từ tiếng Việt, đối chiếu bản EN/ZH.
  - Đã kiểm placeholder khớp 100%.
  - Tên đường, tên phường, tên pháp nhân và tên đối tác giữ tiếng Việt.
- Công cụ:
  - `build_en_site.py`: thêm `ko`/`ja`/`hi` vào `LANGS`. Tiếng Nhật nối câu không có dấu cách.
  - `lang-switch.js`:
    - Có 6 ngôn ngữ; nút trên máy tính chuyển sang dạng thả xuống khi có hơn 3 ngôn ngữ.
    - Popup có 6 lựa chọn và cuộn được bên trong.
    - Gợi ý theo trình duyệt cho vi/zh/ko/ja/hi.
    - Cỡ chữ menu: ja ×1,14, ko ×1,10, hi ×1,08.
  - `preview-mode.js`: nhận diện thêm 3 tiền tố, có thông báo và nhãn bản thử bằng 3 ngôn ngữ mới.
- Kiểm tra:
  - Dựng `--strict` 5 ngôn ngữ: 0 câu thiếu, 0 tên thiếu.
  - 7 trang × 3 ngôn ngữ × 390/1366: 0 lỗi JS, 0 tràn ngang, 0 link sai, đủ sản phẩm. Chữ tiếng Việt còn lại chỉ là tên pháp nhân và địa chỉ.
  - Menu ở 1024/1366/1920 nằm một hàng, không đè logo hoặc nút.
  - Trên GitHub thật: `/ko/`, `/ja/`, `/hi/` trả 200, popup có 6 lựa chọn.
- Lưu ý: bản dịch do AI làm, nên nhờ người bản ngữ đọc lại trước khi đăng web thật. Một câu khẩu hiệu "Gần 1 Nửa Thế Kỷ" đọc hơi gượng ở mọi ngôn ngữ do câu gốc tiếng Việt.

## Rà soát bằng bộ skill "Dịch Thuật" (bản p9, cùng ngày)
- Chủ shop yêu cầu cài 3 bộ Agent Skills: practical-localizer, translating-products-skill và yomiyasu.
  - Bản tải về để trong thư mục `Dịch Thuật/`.
  - Các skill cũng được chép vào `.claude/skills/` để Claude Code dùng được.
  - Đã đọc qua trước khi cài: chỉ là tài liệu và vài script xử lý văn bản trên máy, không gọi mạng.
- Mỗi ngôn ngữ có một agent rà toàn bộ 2.019 mục, đối chiếu với tiếng Việt gốc và đọc trên trang đã dựng. Số mục đã sửa:
  - EN 227, ZH 139, KO 147, JA 106, HI 128.
  - Các chỗ sửa nằm ở `i18n/*/review/fixes.json`, đã áp vào `units.json` / `names.json`. Bản trước khi sửa giữ ở `review/before-*.json`.
  - Báo cáo tiếng Việt: `review/report.md`.
- Bản gốc tiếng Việt chỉ được lập báo cáo, chưa sửa: `Dịch Thuật/bao-cao-tieng-viet.md`, 36 vấn đề.
- Tổng hợp: `Dịch Thuật/tong-hop-ra-soat-20261104.md`.
- Thêm câu nguyên văn "Gần 1 Nửa Thế Kỷ Định Hình Quý Ông Việt" vào từ điển 5 ngôn ngữ. Khớp nguyên câu được ưu tiên hơn mẫu `{D1}`, nên câu này không còn bị dịch thành "1 half a century".
- Kiểm tra sau khi sửa:
  - Dựng `--strict`: 0 câu thiếu.
  - 5 ngôn ngữ × 7 trang × 390/1366: 0 lỗi JS, 0 tràn ngang, 0 link sai.
  - Menu ở 1024 và 1366 nằm trên một hàng.
  - Chữ tiếng Việt còn lại chỉ là tên riêng.
- Đã lên GitHub (main p9, nhánh source). VPS không đổi.

## Quyết định của chủ shop (p10, p11; 04/11/2026)
- p10:
  - "K" trong "BE 2K/4K/6K" là số khuy; cả 5 ngôn ngữ dịch theo nghĩa này.
  - "Tuyết mưa" là vải dệt kim đôi kiểu Ponte di Roma, dịch thành Ponte Knit / 罗马布 / 폰테 원단 / ポンチ素材 / पोंटे निट.
- p11:
  - Thống nhất số liệu trong bản tiếng Việt: hơn nửa thế kỷ (50+), bảo hành đường may trọn đời, 25 số đo, chân trang viết lại.
  - Thêm 13 câu dịch mới. Chi tiết trong `docs/vi-facts-20261104.md`.
  - Trang tiếng Việt ở gốc bản thử GitHub đã có các sửa này.
- VPS không đổi.

## Banner trang chủ không chữ (p12; 05/11/2026)
- Antigravity tạo 6 cảnh theo `PROMPT-ANTI-ANH-HERO-KHONG-CHU-20261104.md`, mỗi cảnh 2 bản ngang và dọc:
  - hàng sẵn: vest nam, vest nữ, phụ kiện;
  - may đo: nam, nữ;
  - đồng phục công ty.
- Ảnh gốc và manifest ở `images/home/hero/banner-nochu-20261104/`. Đây là ảnh minh họa AI.
- Đã soát cả 12 ảnh: không chữ, số hay logo. Kích thước đúng 1600/960 (ngang) và 563/480 (dọc).
- `tools/hero_nochu_20261104.py <web_root>`:
  - chép 24 WebP vào `assets/hero-nochu-20261104/`;
  - trên `index.html` và `index-mobile.html`: slide 1–5 đổi ảnh, giữ nguyên cách tải ảnh và preload; thêm slide 6 và chấm thứ 6.
  - Thêm 6 câu chú thích ảnh (alt), dịch sang 5 ngôn ngữ.
- Banner chưa có chữ HTML đè lên. Phần chữ chờ chủ shop duyệt nội dung.
- Chỉ đưa lên bản thử GitHub; VPS không đổi.

## Khối "Sẵn mẫu tại showroom" trên điện thoại (p13; 05/11/2026)
- Chủ shop báo khối `#mlh-featured-catalog-links` trên điện thoại phải cuộn quá dài (12 thẻ xếp dọc).
- Prompt bàn giao: `PROMPT-ANTI-MOBILE-MAU-TIEU-BIEU-20261105.md`.
- Công cụ `tools/mobile_featured_swipe_20261105.py`: chỉ thêm một khối CSS `@media (max-width:767px)` vào `index-mobile.html`. Khối thành một hàng vuốt ngang: thẻ rộng 42%, ảnh 4:5, tên tối đa 2 dòng.
- Kết quả đo ở 390px: khối cao khoảng 470px, đủ 12 thẻ. Không tràn ngang ở 320, 390 và 430px; không lỗi JS ở VI, EN và JA.
- `index.html` (máy tính) khớp từng byte với bản trước.
- Chỉ đưa lên bản thử GitHub; VPS không đổi.
- p14 (05/11/2026): theo ảnh thẻ phụ kiện chủ shop gửi, thẻ đổi sang kiểu phụ kiện:
  - ảnh vuông, tên chữ serif căn giữa, giá đỏ, nút đỏ "Xem chi tiết" (nằm trong liên kết sẵn có, dịch đủ 6 ngôn ngữ).
  - Hàng tự trượt sang thẻ kế tiếp khoảng mỗi 3 giây, hết hàng thì quay về đầu.
  - Chạm hoặc vuốt thì dừng, 6 giây sau chạy tiếp. Dừng khi khối ra khỏi màn hình hoặc tab bị ẩn; tắt khi máy bật giảm chuyển động.
  - Đo ở 390px: khối cao khoảng 523px, thẻ rộng 165px, trượt từng thẻ 177px, chạm vào thì đứng yên.
  - Không tràn ngang hay lỗi JS ở 320 và 430px (VI, EN, HI). `index.html` khớp từng byte.
- p15 (05/11/2026): chủ shop muốn "tự động chạy mượt mà". Đổi từ nhảy từng thẻ mỗi 3 giây sang trôi liên tục:
  - tốc độ khoảng 30px/giây, dùng `requestAnimationFrame`;
  - JS nhân đôi 12 thẻ (bản sao `aria-hidden` để trình đọc màn hình bỏ qua) nên nối vòng liền mạch;
  - tắt hút thẻ (scroll-snap) khi đang chạy; chạm hoặc vuốt thì dừng, 2,5 giây sau chạy tiếp.
  - Đo ở 390px: trôi 0→54px trong 1,8 giây đều đặn; nối vòng 2120→7 không giật; chạm thì đứng yên rồi chạy lại.
  - Không tràn ngang hay lỗi ở 320 và 430px. `index.html` khớp từng byte.

## p16 (05/11/2026) — Thiết kế lại trang May Đo (cả điện thoại và máy tính)
- Công cụ `tools/maydo_v2_20261105.py`, prompt `PROMPT-ANTI-MAY-DO-REDESIGN-20261105.md`. Mạch H1 → H2 Vấn đề (3 H3) → H2 Lập luận (4 H3) → H2 Bảng vải cao cấp (5 thẻ: Roger La Viale 18tr, Louis 12tr, Donatella 10,5tr, New Sample 10,5tr, Gazzarini Uomo 9tr; ảnh bìa thật + 4 ô mẫu từ `/images/bang-vai-mau-chuan`) → Quy trình 4 bước → (giữ Tuyệt Tác May Đo + Các Gói) → H2 Kết luận → biểu mẫu 6 trường giữ nguyên. h1=1/h2=8/h3=28.
- Chất liệu chỉ ghi theo nhãn quyển mẫu. Gói may đo cũ (half/full canvas...) giữ nguyên chữ cũ, chưa kiểm chứng.
- 96 câu mới dịch 5 ngôn ngữ, dựng chặt 0 thiếu. 390/1366 VI/EN/ZH/JA/KO/HI: 0 lỗi JS, không tràn; quét tương phản: phần mới 0 lỗi (số 01–04 đổi `#6e5410`); chữ vàng nhỏ ở phần cũ vẫn chờ chủ shop.
- Commit `main` 0355c26, `source` dccb2fa. VPS KHÔNG đổi.

## p17 (05/11/2026) — Ảnh minh họa trang May Đo
- 7 ảnh Antigravity (`images/may-do-minh-hoa-20261105/`, prompt `PROMPT-ANTI-ANH-MINH-HOA-MAY-DO-20261105.md`) → WebP `assets/may-do-minh-hoa-20261105/` bằng `tools/maydo_illus_20261105.py`. Phần Vấn đề: 3 hàng ảnh so sánh May sẵn/May đo (nhãn HTML, dịch được); phần Lập luận: 4 ảnh cảnh. Mỗi ảnh có nhãn "Ảnh minh họa".
- Quy tắc cũ `@media(max-width:768px) span:not(...){font-size:14px!important}` ép chữ nhãn; dùng selector `.md2-case-fig .md2-tag`.
- 9 câu mới dịch 5 ngôn ngữ, dựng chặt 0 thiếu; 320/390/1366 × 6 ngôn ngữ 0 lỗi/không tràn; tương phản phần mới 0 lỗi; biểu mẫu 6 trường giữ. `main` ced5cc5, `source` 8191b04. VPS KHÔNG đổi.

## p18 (05/11/2026): dải trắng ở đáy trang chủ trên iPhone
- Chủ shop gửi ảnh iPhone: có dải trắng che nội dung ở đáy màn hình trang chủ.
- Nguyên nhân: giỏ hàng dạng ngăn kéo (`#lhv-cart-drawer`) trong gói JS trang chủ (`home-app-*-20261104-vi-facts.js`) lúc đóng chỉ bị đẩy xuống dưới mép màn hình (`translateY(100%)`), không ẩn hẳn. Khi Safari thu thanh công cụ, phần trắng đó lộ ra. `nav-component.js` của các trang khác đã có `visibility/opacity/pointer-events`, nhưng gói trang chủ thì chưa.
- Sửa: `tools/cart_sheet_fix_20261105.py` chép cách ẩn đó vào 2 gói trang chủ, lưu thành file mới hậu tố `-20261105-cart.js`, rồi đổi đường dẫn trong `index.html` và `index-mobile.html`.
- Kiểm tra:
  - lúc đóng: hidden / 0 / none; bấm giỏ hàng: mở bình thường;
  - 390/1366 × 6 ngôn ngữ: 0 lỗi, không tràn ngang;
  - bản dựng chặt: 0 thiếu câu.
- Commit: main 914ccd0, source 1809132.
- VPS KHÔNG đổi. Gói trang chủ trên VPS cũng thiếu cách ẩn này, nên web thật nhiều khả năng bị cùng lỗi. Chỉ sửa trên VPS khi chủ shop nói "đăng lên web/VPS".

## p19 (05/11/2026): bảng giá vải thay "Tuyệt Tác May Đo Thủ Công"
- Chủ shop yêu cầu: xóa phần Tuyệt Tác; thay bằng các bảng vải đang có, kèm thông số vải; mỗi quyển một ảnh đại diện, bấm vào xem các màu; ghi rõ giá. Phạm vi điện thoại và máy tính. Prompt: `PROMPT-ANTI-BANG-GIA-VAI-MAY-DO-20261105.md`.
- Công cụ `tools/maydo_fabric_catalog_20261105.py` (không chạy lại lần hai; muốn chạy lại thì khôi phục `may-do.html` trước khi chạy):
  - Gỡ section `#tuyet-tac-may-do`, popup `#suitLightboxModal` và script của chúng. CSS cũ vô hại nên để nguyên.
  - Thêm `#bang-gia-vai`: 14 quyển, 239 mẫu có ảnh. Ảnh tạo trong `assets/may-do-bang-vai-20261105/{cover,thumb,full}` (khoảng 20MB).
- **Giá:** lấy giá niêm yết KiotViet, đọc ngày 05/11 (chỉ đọc).
  - Roger 18tr, Louis 12tr, Donatella 10500 và NS10500 10,5tr, Donatella 9300 9,3tr, Gazzarini và LC9000 9tr, Cezaro 7tr, ICHN 02/04/07 và TRS6500-01/02/03 5,5tr.
  - Nhãn giá ghi "Giá may đo bộ vest".
- **Thông số:** chép nguyên văn dòng nhãn in trên từng ảnh mẫu.
  - Cezaro chép từng mẫu.
  - Các quyển khác dùng chung một dòng; riêng TRS-01 và TRS-03 chia theo nhóm mẫu.
- **Ảnh đại diện:** dùng ảnh bìa chủ shop chụp cho Roger, Louis, Donatella 10500, New Sample, Gazzarini và Cezaro (bìa xanh). Các quyển còn lại ghép 4 dải màu cắt từ chính quyển đó.
- **Mã vải:** mã in trên nhãn được giữ nguyên ở mọi ngôn ngữ (vd "135 Lô 15 - 15", "NTR 110 Co Giãn") qua bản dịch giữ nguyên chữ.
- **Kiểm tra:**
  - dựng chặt 6 ngôn ngữ, 0 câu thiếu dịch;
  - 320/390/1366 × 6 ngôn ngữ: 0 lỗi JS, không tràn ngang;
  - popup: 14 quyển, 240 ảnh không hỏng; phóng ảnh, nút trước/sau, phím mũi tên, Esc, bấm nền đóng, khóa và mở lại cuộn trang đều đúng;
  - 1 H1; biểu mẫu 6 ô giữ nguyên;
  - phần mới không có lỗi tương phản.
- **Cần chủ shop xác nhận:**
  - TRS6500 trên KiotViet giá 5,5tr trong khi tên ghi 6500;
  - nhãn mẫu Donatella 10500 ghi "180's Wool & Lycra", còn mô tả của chủ shop ghi Micro Fiber;
  - giá có phải trọn bộ vest không;
  - phần "Các Gói May Đo" (4,8–18tr) có lệch với bảng giá vải không.
- VPS không đổi.

## p20 (05/11/2026): so sánh may sẵn và may đo, ảnh mới hoàn toàn
- Chủ shop chọn tạo ảnh mới hoàn toàn và trả lời "Làm toàn bộ nhé". Bản kế hoạch gồm Khối A (4 lỗi phom dáng), Khối B (5 đặc quyền: đột tay, khuyết Milan, thêu tên, chọn chi tiết, thử đồ) và bảng 8 tiêu chí.
- `tools/maydo_compare_v2_20261105.py` thay section `md2-problem` bằng hai section `#so-sanh-phom-dang` và `#dac-quyen-may-do`, đặt giữa các marker `MLH-COMPARE-V2`. Chạy lại được.
- Ảnh: đơn đặt cho Antigravity là `PROMPT-ANTI-ANH-SO-SANH-MAY-DO-V2-20261105.md` (9 ảnh). Chưa có ảnh nên trang hiện khung chờ "Ảnh minh họa đang được cập nhật". Khi PNG có trong `images/may-do-so-sanh-v2-20261105/`, chạy lại công cụ để chuyển sang WebP 1600/800 rồi dựng lại.
- 75 câu dịch × 5 ngôn ngữ, gồm cả alt của ảnh tương lai. Dựng chặt: 0 câu thiếu.
- Kiểm tra: ở 320/390/1366, bản VI/EN/HI có đủ 9 thẻ, bảng 8 dòng, 1 H1 và biểu mẫu 6 ô; không tràn ngang. Phần mới không có lỗi tương phản.
- VPS không đổi.

## p21 (05/11/2026)
- Antigravity giao 9 PNG `images/may-do-so-sanh-v2-20261105/` (1600×1000, manifest no_text_verified). Đã xem từng ảnh: trái lỗi/phải chuẩn, không chữ.
- Chạy lại `tools/maydo_compare_v2_20261105.py`: 9 ảnh thật, 0 khung chờ; WebP 1600/800 ở `assets/may-do-so-sanh-v2-20261105/`.
- Build strict 6 ngôn ngữ (version 20261105-i18n-p21) 0 thiếu; QA 320/390/1366 VI/EN/HI 9/9 ảnh tải, 0 tràn, 1 H1. VPS không đổi.

## p22 (05/11/2026)
- Lỗi: bấm/rê 1 nút thì cả khung chứa nút hiện nền và bóng. Nguyên nhân: `initButtons()` chọn `[class*="cta"]` khớp luôn khung cha được gắn `lux-h-cta`, rồi gắn `lux-btn` cho khung đó. Cùng lỗi ở trang chủ (khung banner), Dịch Vụ, Giới Thiệu, Tư Vấn.
- Sửa: bỏ qua phần tử chứa `a`/`button`. Áp dụng `luxury-animations.js` (bản `$V` và bản ở thư mục gốc) và 2 gói JS trang chủ mới hậu tố `-20261105-luxbtn.js` (file cũ giữ nguyên). Prompt `PROMPT-ANTI-NUT-NOI-CA-HANG-20261105.md`.
- QA 390/1366, 7 trang: 0 khung bị gắn `lux-btn`, 0 tràn ngang; bấm chuột thật trên trang May Đo không còn nền/bóng ở khung. VPS không đổi.

## p23 (06/11/2026): nhãn so sánh xuống dưới ảnh
- Chủ shop yêu cầu bỏ chữ đè lên ảnh. Nhãn "Hàng may sẵn" / "May đo mayLEHUONG" của 9 thẻ so sánh trang May Đo chuyển xuống một dải ngay dưới ảnh, mỗi nhãn canh giữa nửa ảnh tương ứng; "Ảnh minh họa" cũng nằm dưới ảnh. Áp dụng cho cả điện thoại và máy tính, cả 6 ngôn ngữ.
- Công cụ `tools/maydo_compare_v2_20261105.py` (CSS dùng `.md2-cv-under>span` để không tách tên thương hiệu thành nhiều dòng).
- QA 320/1366 × 6 ngôn ngữ: 9/9 thẻ có dải nhãn ngay dưới ảnh, 0 nhãn đè, không tràn ngang; build strict 0 chuỗi thiếu. VPS không đổi.

## p24 (06/11/2026): nhãn dưới ảnh cùng cỡ chữ
- Lỗi: tên thương hiệu "mayLEHUONG" bị quy tắc chung ép cỡ 14px, nên nhãn "May đo mayLEHUONG" to hơn "Hàng may sẵn" (12,5px); dòng "Ảnh minh họa" nằm trên dải màu kem khác dải nhãn.
- Sửa: `.brand-maylehuong` nằm trong nhãn thì kế thừa cỡ/độ đậm/phông của nhãn; "Ảnh minh họa" cùng nền với dải nhãn. QA 390/1366 VI/EN cỡ chữ khớp, không tràn ngang; build strict 0 chuỗi thiếu. VPS không đổi.

## p25 (06/11/2026): làm lại trang Dịch Vụ theo hướng cao cấp
- Chủ shop chốt:
  - 4 nhóm: Sửa & tinh chỉnh phom, Chăm sóc & giặt hấp, Thuê vest cao cấp, Gói trọn gói;
  - giá ghi "từ …" theo từng bậc, chủ shop gửi giá;
  - "miễn phí" chuyển thành đặc quyền cho khách đã may/mua vest;
  - làm cho cả điện thoại và máy tính.
- Công cụ `tools/dichvu_v2_20261106.py` thay toàn bộ nội dung trong `<main>` (giữ breadcrumb). Trang mới gồm:
  - phần đầu trang và thanh chuyển nhanh 4 nhóm;
  - 4 nhóm, mỗi nhóm có ảnh (3 ảnh so sánh, nhãn đặt dưới ảnh) và 11 thẻ bậc dịch vụ;
  - đặc quyền, quy trình 3 bước, câu hỏi thường gặp (5 câu, FAQPage JSON-LD), showroom Biên Hòa/Hà Nội (giữ id `seo-dich-vu-bien-hoa`).
- Đã cập nhật title, description, og, WebPage, Breadcrumb, Service.
- Ảnh: 7 PNG của Antigravity trong `images/dich-vu-cao-cap-20261106/`, chuyển thành WebP ở `assets/dich-vu-cao-cap-20261106/` (888KB).
- **Giá:** biến `PRICE` trong công cụ đang để trống, nên trang hiện "Báo giá khi tư vấn". Khi chủ shop gửi giá thì điền vào rồi chạy lại công cụ (chế độ refresh).
- Dịch 132 chuỗi × 5 ngôn ngữ; build strict 0 chuỗi thiếu.
- QA ở khổ 320 và 1366 × 6 ngôn ngữ:
  - H1 = 1, 11 bậc, 4 ảnh, không tràn ngang;
  - quét tương phản 0 lỗi;
  - nút bấm không nổi cả hàng.
- Thanh chuyển nhanh: trên điện thoại xếp lưới 2×2, đứng yên; trên máy tính bám đầu trang.
- VPS không đổi.

## p26 (07/11/2026): hiệu ứng chuyển động cho trang May Đo và Dịch Vụ
- Chủ shop báo: "các animation hiện đang không hoạt động bản github là trang may đo và trang dịch vụ".
- Nguyên nhân:
  - Khi làm lại 2 trang (p16, p25), các lớp hiệu ứng cũ (`dv-anim`, `dv-stagger`, thẻ có hiệu ứng nổi) bị bỏ.
  - Tệp chung `luxury-animations.js` tắt hẳn hiệu ứng hiện dần ở khổ ≤768px và không nhận tên thẻ mới `md2-*`/`dv2-*`.
- Sửa: công cụ `tools/page_motion_20261107.py` thêm 3 khối có id riêng vào 2 trang: `mlh-page-motion` (CSS), `mlh-page-motion-head`, `mlh-page-motion-js`. Hiệu ứng chạy trên cả điện thoại và máy tính:
  - phần đầu trang: các dòng chữ trồi lên lần lượt, ảnh thu nhẹ về đúng cỡ;
  - lướt tới đâu hiện tới đó: từng khối mờ dần rồi trồi lên, thẻ trong lưới hiện lần lượt, ảnh/hình hiện từ hơi phóng to, số thứ tự nảy nhẹ, gạch vàng trước nhãn tự kéo dài;
  - máy tính rê chuột: thẻ nổi lên, ảnh trong thẻ phóng nhẹ, nút chính nổi và có vệt sáng lướt qua.
- Cách làm không đè tệp chung: dùng các thuộc tính `translate`, `scale`, `filter:opacity()`. Trong khối `md2`/`dv2`, hiệu ứng hiện dần chung được tắt để không hiện 2 lần.
- An toàn:
  - không có JS thì không ẩn gì;
  - máy bật "giảm chuyển động" thì không có hiệu ứng;
  - khối đã lướt qua (lướt nhanh, bấm link nhảy trang) vẫn được hiện, không bị kẹt ẩn;
  - không bọc popup bảng màu vải.
- QA 390/1366: may-do 91 khối, dich-vu 104 khối; lướt nhanh hoặc nhảy giữa trang thì 0 khối kẹt ẩn; không tràn ngang; popup bảng vải phủ đúng toàn màn hình.
- VPS không đổi.

## p27 (07/11/2026): thêm người thực hiện ở chân trang
- Chủ shop yêu cầu thêm 2 người vào dòng chân trang. Dòng mới: "© Công Ty TNHH Thời Trang Lê Hương. All Rights Reserved. - Design by HarryDuong · Planning by Haris Nguyen · Coding by Sophie Tran". Chủ shop viết "Planining", đã sửa thành "Planning".
- Công cụ `tools/footer_credit_20261107.py`:
  - sửa `footer-component.js`;
  - sửa 2 gói JS trang chủ: vì gói là bất biến nên tạo file tên mới có hậu tố `-20261107-credit.js`, rồi trỏ `index.html`/`index-mobile.html` sang file mới;
  - đổi `?v=20261107-credit` cho footer trên 207 trang.
- Build strict 0 chuỗi thiếu. Kiểm tra trang chủ, May Đo, EN/JA/ZH ở khổ 390/1366: dòng mới hiện đủ, không tràn ngang.
- VPS không đổi.

## p28 — 07/11/2026: làm gọn chân trang (chủ shop: "nhìn rối quá, làm lại")
- `tools/footer_credit_v2_20261107.py` (chạy sau footer_credit_20261107.py): dòng 1 bản quyền ("All Rights Reserved." không ngắt giữa cụm), dòng 2 ba tên chữ nhỏ xám, chấm vàng ngăn cách; điện thoại (<768px) ba tên xếp 3 dòng, lề hai bên 72px + đáy 78px để nút logo tròn và nút lên đầu trang không đè chữ. Gói home mới hậu tố `-20261107-credit2.js`, `footer-component.js?v=20261107-credit2` 207 trang.
- JA: thêm "。" cuối tên công ty (i18n/ja/units.json) vì trước đó dính liền "...Lê Hương)All Rights Reserved.".
- Kiểm tra VI/EN/JA/KO 390, ZH 1366: 0 thiếu bản dịch, không chữ bị che. Chỉ GitHub, VPS không đổi.

## p29 — 08/11/2026: trang gọi ảnh WebP thay PNG/JPG (chủ shop: "làm trên bản github trước")
- Máy chủ đã có sẵn bản `.webp` cùng tên cho 630/630 ảnh PNG/JPG mà trang gọi (HEAD + đọc đầu file WebP; so 110 mẫu trên 12 nhóm thư mục, sai khác ≤0,7/255, cùng tỉ lệ). Không tạo ảnh mới, chỉ đổi đuôi đường dẫn có trong `tools/webp_allowlist_20261108.json`.
- `tools/webp_refs_20261108.py` trên web VI (`.codex-local/vi-facts-20261104/web`): 3.273 chỗ trong HTML/JS/CSS (trừ admin, sitemap, og:image/JSON-LD tuyệt đối), 2 gói home mới hậu tố `-20261108-webp.js`, `?v=20261108-webp` cho nav-component/luxury-animations/cta-widget/product-api trên 207 trang; dữ liệu sản phẩm → `.codex-local/en-site-20261104/api-products-webp.json`.
- units.json 5 ngôn ngữ: thêm 85 câu đường dẫn `.webp` (bản dịch giữ nguyên đường dẫn); lang-switch.js logo `.webp`.
- Đo điện thoại (mạng chậm, máy chủ local, ảnh từ maylehuong.com), ảnh tải: trang chủ 7,0→0,8 MB; Vest Nữ 15,5→0,5 MB (load 87→17 s); Sản phẩm 12,6→3,4 MB; Cà vạt 4,0→4,1 MB (vốn đã WebP ~250KB/ảnh, cần ảnh thu nhỏ). 0 ảnh lỗi.
- Còn PNG/JPG: 1 ảnh DHL tên có "(1)" (156KB). Chưa làm: font icon 1,1 MB, ảnh thu nhỏ cà vạt. Chỉ GitHub, VPS không đổi; khi đăng VPS phải chạy cùng công cụ trên web current + đổi runtime products.json.

## p30 — 08/11/2026: rà trang chủ, sửa nội dung cũ (chủ shop: "check lại trang chủ ... triển khai sửa")
- Rà 1366/390 với DNS trỏ đúng VPS: 41/41 ảnh tải được ở cả index.html và index-mobile.html. Ô trống quan sát được trước đó là do maylehuong.com bị đổi DNS (xem dưới), không phải trang thiếu ảnh.
- `tools/home_refresh_20261108.py` (index.html + index-mobile.html): 4 thẻ "Sản Phẩm Nổi Bật" bỏ giá cũ gạch và % giảm không có trong catalog; giá theo catalog 04/11: Suit Đen 2.800.000đ, Vest Nữ Be 2.500.000đ, Vest Sui Gia Navy 3.800.000đ; nhãn "HOT SALE -15%"→"HOT", "LUXURY -16%"→"LUXURY"; phụ đề "The Old Sailor Style Signature Collection"→"mayLEHUONG Signature Collection"; "157+"→"170+ sản phẩm". Build strict 0 thiếu bản dịch.
- Chưa đổi (chờ chủ shop): 3 thẻ dịch vụ ghi "Thuê từ 500.000đ / Hấp ủi miễn phí khi mua vest / Sửa vest miễn phí" trong khi trang Dịch vụ mới ghi "Báo giá khi tư vấn"; số 50.000+ khách hàng và 40+ loại vải chưa được chủ shop xác nhận.
- SỰ CỐ 08/11 ~12:30 VN: maylehuong.com bị đổi nameserver sang mặc định Name.com (ns1kpv/ns2kry/ns3jmt/ns4dmx), A trỏ 91.195.240.94 (trang đỗ), RDAP last changed 2026-11-08T05:30:09Z, hạn tên miền 2027-07-31. VPS 103.159.53.73 vẫn chạy (health 200), dzuongtailor.com bình thường. Cần chủ shop vào tài khoản Name.com khôi phục DNS.

## p31 — 08/11/2026: ảnh thu nhỏ thẻ sản phẩm, font biểu tượng gọn, logo nhỏ (chủ shop: "triển khai các kế hoạch ... chỉ ở bản github")
- DNS maylehuong.com đã được chủ shop khôi phục (A 103.159.53.73, kiểm 16:5x VN), ảnh bản thử tải lại bình thường.
- `tools/card_thumbs_20261108.py`: 603 ảnh thẻ (mọi ảnh trong `images`/`img` của 187 sản phẩm + ảnh dựng sẵn trong `.vn-thumb`) → WebP rộng ≤600px q80, `assets/card-thumbs-20261108/<fnv1a32>.webp` (58,4→12,1 MB; 1 ảnh vốn nhỏ giữ gốc). `product-api.js` thêm `MLH_API.cardImageUrl()` (băm FNV-1a đường dẫn đã giải mã/NFC, không có thì dùng ảnh gốc); 11 trang danh mục đổi lời gọi ảnh thẻ + 383 ảnh dựng sẵn; `product-api.js?v=20261108-thumbs` 199 trang. Trang chi tiết/gallery/giỏ/SEO giữ ảnh gốc.
- `tools/icon_font_20261108.py`: 207 trang dùng một URL Material Symbols `icon_names=` 95 biểu tượng, trục wght 300..500/FILL 0..1, display=block: ~28KB thay 1,1MB (19 trang) hoặc 324KB (188 trang). Trang chủ giữ font cục bộ riêng. Thêm biểu tượng mới phải thêm tên vào ICONS.
- `tools/logo_small_20261108.py`: logo menu/màn che/nút liên hệ `assets/brand-20261108/logo-nav.webp` 380×140 8KB thay 100KB; ?v=20261108-logo cho nav-component/cta-widget/luxury-animations 207 trang; lang-switch.js cùng logo.
- `tools/webp_paren_20261108.py`: 9 ảnh đồng phục tên "(1).jpeg" (công cụ p29 bỏ sót vì dấu ngoặc) → .webp cùng tên (so điểm ảnh sai khác ≤0,5/255).
- preview-mode.js: snapshot sản phẩm `cache:'no-cache'` (hỏi lại máy chủ, 304 nếu không đổi) thay `no-store` (tải lại 485KB mỗi trang).
- Đo điện thoại 390 cùng cách (ép tải hết ảnh, không giới hạn mạng), trước p30 → sau p31: Sản phẩm 17,4→4,6 MB; Phụ kiện 13,4→3,6; Cà vạt 4,5→2,3; Vest Nữ 4,5→2,3; font mỗi trang ~1,7→~0,6 MB. 16 trang × 390/1366 (gồm /en /ko /ja): 0 biểu tượng lộ chữ, 0 ảnh lỗi, 0 lỗi JS. Build strict 0 thiếu bản dịch.
- Chưa làm: ảnh bảng vải trang May đo (294 ảnh ~10 MB khi tải hết), font chữ Google (~0,6 MB). VPS không đổi; khi đăng VPS chạy 4 công cụ theo thứ tự webp_refs → webp_paren → card_thumbs → icon_font → logo_small trên web current và thêm thư mục assets mới vào web image.
