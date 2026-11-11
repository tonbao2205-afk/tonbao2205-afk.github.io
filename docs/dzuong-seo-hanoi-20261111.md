# Dzuong Tailor: Local SEO Hà Nội + chuẩn Search Console (11/11/2026)

Trạng thái: BẢN XEM TRƯỚC (máy + GitHub `/dzuong/`). VPS CHƯA đổi (current `20261111-vip-auto-qr-r1`). Chỉ đăng khi chủ shop nói rõ "đăng lên VPS".

## NAP dùng thống nhất
Dzuong Tailor, Số 7 Chính Vân, Chuyên Mỹ, Thành Phố Hà Nội, Mr. Van 0786.291.468 (điện thoại/Zalo). Xuất hiện ở hero/khối liên hệ, chân trang, hỏi đáp, Pháp Lý (khối "Dzuong Tailor Tại Hà Nội") và JSON-LD `LocalBusiness`. Địa chỉ và số này trùng Showroom Hà Nội của maylehuong.com, theo yêu cầu.

## Thay đổi
- Nguồn: `.codex-local/dzuong-darkmode-20261109/src/` (`dz-pages/*.html`, `dz-pages/faq.json`, `clients.html`, template), công cụ `tools/dark_mode_20261109.py`.
- Title/description/H1 6 trang theo yêu cầu. Title Năng Lực rút còn "Xưởng Sản Xuất & Gia Công Vest Tại Hà Nội | Dzuong Tailor" (57 ký tự) vì bản đề xuất 66 ký tự vượt mức 62. Title 52–60, description 141–156 ký tự.
- Nội dung thêm: Sản Phẩm (đoạn giới thiệu + 4 hỏi đáp), Đồng Phục (đoạn Hà Nội & miền Bắc + 4 hỏi đáp), Năng Lực (khối làm việc với thương hiệu/nhà may/doanh nghiệp + 4 hỏi đáp), Trang Chủ (4 hỏi đáp). Câu trả lời chỉ dùng thông tin đã chốt, không số liệu/cam kết/giá.
- `faq.json` là nguồn duy nhất cho hỏi đáp: HTML `<details>` và JSON-LD `FAQPage` sinh từ cùng dữ liệu nên khớp từng chữ. Lưu ý: Google hiện chỉ hiện kết quả hỏi đáp mở rộng cho một số trang chính phủ/y tế; FAQPage vẫn hợp lệ nhưng thường không hiện thêm trên kết quả tìm kiếm.
- JSON-LD mỗi trang một `@graph`: `LocalBusiness #workshop` (logo `.webp`, telephone, address Hà Nội, areaServed), `WebSite`, `WebPage`/`CollectionPage`+`ItemList` (10 mẫu)/`AboutPage`, `BreadcrumbList`, và `FAQPage` ở 4 trang. Không `parentOrganization`, không `Product`, không đánh giá.
- og:locale, og:site_name, og:image:width/height. Ảnh mẫu alt "Mẫu bộ suit may đo GC-003 – Dzuong Tailor Hà Nội". 9 logo khách có width/height thật và alt "Logo …".
- Hiệu ứng `.r`: khối đầu sau hero/page-head hiện ngay; bot (UA chứa bot/crawl/spider/lighthouse/inspectiontool) hiện tất cả; rootMargin 120px; sau 1,2 giây khối trong khung nhìn tự hiện. Người dùng thường vẫn có hiệu ứng khi cuộn.
- Vùng bấm ≥44px: nút sáng/tối, ba gạch, logo, liên kết chân trang; nút Vest/Quần/Gile/Vải xếp 2×2 trên màn ≤640px.
- Sitemap sinh từ `DZ_PAGES` kèm `<lastmod>` ngày dựng; robots thêm `Disallow: /api/`.

## Nginx
- `sites.conf` (container web): `www` → `https://dzuongtailor.com$request_uri` một bước; 6 URL chuẩn trả 200; `/index.html`, `/index-mobile.html`, `/dzuong-tailor.html` → `/`; `/x/`, `/x.html`, `/dzuong-x.html` → `/x` (giữ query); `/sitemap.xml` `application/xml` + `X-Robots-Tag: noindex, follow` (nhắc lại HSTS/nosniff vì add_header ở location thay header cấp server); `/robots.txt` text/plain. Trang bán hàng cũ vẫn 301 sang maylehuong.com. Trên maylehuong.com: `dzuong-x.html` → `https://dzuongtailor.com/x`, `dzuong-robots.txt`/`dzuong-sitemap.xml` 404.
- `dzuongtailor.edge.conf` (Nginx biên trên máy chủ, ngoài image): `http://www` hiện đi 2 bước (→ https://www → apex). `patch_edge()` đổi thành 1 bước; phải áp vào cấu hình biên khi đăng.
- Bản vá đã chạy trên `sites.conf` của current 20261111; kết quả `.codex-local/dzuong-seo-hanoi-20261111/sites.conf`.

## Kiểm tra
- `nginx -t` đạt trong container tạm (web image đang chạy, không mạng, tự xóa); 44/44 tuyến URL/header đạt (`routes.sh`, `routes-result.txt`).
- `src/qa_seo.py`: 6 trang × 320/390/768/1366 × sáng/tối = 48 lượt: 1 H1, canonical đúng, JSON-LD parse đạt, FAQ khớp, 0 lỗi JS/console, không tràn ngang, 0 vùng bấm <44px, 0 khối `.r` bị ẩn, 0 lỗi tương phản (`qa/seo-hanoi.json`). Bot UA không cuộn: 0 khối ẩn; người dùng không cuộn: 0 khối ẩn trong khung nhìn.
- Ảnh trong schema: 11/12 trả 200 trên web thật; `hero-atelier.webp` 404 vì chưa đăng (200 trong container thử).
- Chưa kiểm: Safari/iPhone thật, Search Console thật (chỉ có sau khi đăng).

## Khi đăng VPS
Chạy `tools/dark_mode_20261109.py <web current> <src> <sites.conf current> <dzuongtailor.edge.conf>`, build web image, áp edge conf lên Nginx biên + reload, rồi gửi sitemap trong Search Console.
