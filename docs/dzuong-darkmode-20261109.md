# Darkmode 2 web + trang riêng Dzuong Tailor — 09/11/2026

Trạng thái: BẢN XEM TRƯỚC TRÊN MÁY. Chưa đăng VPS; VPS không đổi (current `20261107-app-download-r1`).

## Đã chốt với chủ shop
- Dzuong Tailor là cơ sở đối tác của mayLEHUONG về mảng sản xuất (lên mẫu, sản xuất, gia công, may đo), chưa có pháp danh riêng.
- dzuongtailor.com: trang riêng trưng bày mẫu may đo, không giá/giỏ; trang bán hàng cũ 301 về maylehuong.com.
- Cả hai web mặc định sáng, có nút chuyển sáng/tối, máy nhớ lựa chọn.
- maylehuong.com: thêm mục `#doi-tac-san-xuat` ở trang Giới thiệu.

## Thay đổi (gốc lấy từ VPS current)
- Mới: 6 trang `dzuong-*.html`, `theme.js`, `dark-theme.css`, `dzuong-robots.txt`, `dzuong-sitemap.xml`, `assets/dzuong-20261109/*`.
- 215 trang chèn đoạn bootstrap trước `</head>`. Khi đăng hoặc thêm trang sản phẩm: chạy `tools/dark_mode_20261109.py <web> <src> [sites.conf]`, chạy lại không chèn hai lần.
- `sites.conf`: khối dzuongtailor đổi `/` sang trang riêng, robots/sitemap riêng, còn lại 301 về maylehuong.com; giữ `/api`, `/admin`, `/uploads`, ảnh, file tĩnh, file xác minh Zalo.

## Cách darkmode chạy
Khách ở chế độ sáng không tải `dark-theme.css` và không chạy bộ đổi màu. Khi chọn tối, `theme.js` đọc màu thật của từng phần tử, đổi nền sáng/chữ tối và theo dõi nội dung chèn sau. Nó phải chốt transition trước khi đọc màu vì menu có transition `!important`, và phải ghi cả `-webkit-text-fill-color`.

Trang mới dùng nền/chữ riêng cần tự đạt tương phản ở cả hai chế độ.

## Kiểm tra
Xem kết quả cuối ở `.codex-local/dzuong-darkmode-20261109/qa/` (`final.json`, `final-dark.json`, `final-sp.json`, ảnh `shots/`). 13 trang × 1366/390/320. Bấm thử nút chuyển, tải lại, nút trạng thái, menu điện thoại, tìm kiếm.

Lỗi tương phản ở bản sáng là lỗi có sẵn trước đợt này (chữ/nền vàng #a17f22 3,3–3,8:1, chủ shop chưa chốt); bản sáng ngoài đoạn bootstrap không đổi byte nào, trừ `gioi-thieu.html`.

## Làm lại trang Dzuong theo chuẩn Light Luxury
Chủ shop yêu cầu đọc quy tắc UX/UI và làm sang như Lê Hương. Chuẩn ghi trong `PROMPT-ANTI-DARKMODE-DZUONG.md`: nền kem, Noto Serif local, nhãn kiểu A, khung Atelier, thẻ số chìm, khối Conversion, ảnh WebP.

Ảnh `Ảnh Bìa.webp` của May Đo là bìa mẫu vải CERAZO, không phải ảnh bộ vest; thẻ mẫu mở mặc định ảnh áo, nút "Vải" mới hiện bìa. Ảnh mở đầu cắt từ `images/hero-may-do.webp` (bỏ chữ VEST LÊ HƯƠNG, làm mờ nhãn Loro Piana/Cashmere trên kệ), ghi "Ảnh minh họa"; thay bằng ảnh xưởng thật khi có.

## Menu và 6 trang Dzuong
Chủ shop yêu cầu thanh menu chuẩn như Lê Hương: 2 logo ở giữa (58px máy tính), các trang ở hàng dưới. Hàng menu dính đầu trang khi cuộn, hàng logo cuộn đi; điện thoại giữ nút ba gạch, 2 logo, nút sáng/tối.

Đường dẫn: `/`, `/san-pham`, `/dong-phuc`, `/nang-luc-san-xuat`, `/gioi-thieu`, `/phap-ly`. File `dzuong-*.html` trong webroot, nội dung từng trang ở `src/dz-pages/`, khung chung `src/dzuong-tailor.template.html`. Vào thẳng `dzuong-*.html` chuyển 301 về trang tương ứng; `/gioi-thieu.html`, `/dong-phuc.html` cũ của Dzuong về trang mới; `/san-pham/<mã>.html` và phần còn lại vẫn 301 về maylehuong.com.

Giới thiệu và Pháp lý lấy nguyên từ `gioi-thieu.html` đã công bố. Lịch sử, sứ mệnh, khách hàng của Lê Hương đứng dưới tiêu đề mayLEHUONG. Không chép chính sách mua hàng/bảo hành sang Dzuong vì website này không bán hàng. Trang Đồng phục dùng khung chờ, không dùng 6 ảnh đồng phục của Lê Hương vì có logo lớn của Vingroup, Vietcombank, DHL...; quy trình 5 bước rút gọn từ `dong-phuc.html`, bỏ các cam kết.

Kiểm tra: 6 trang × 1366/390/320 × sáng/tối (`qa/dz6.json`) 0 lỗi tương phản/JS/tràn; `nginx -t` trên `preview/sites.conf` trong container tạm từ web image đang chạy.

## Còn thiếu trước khi đăng
- Ảnh xưởng và ảnh đồng phục (khung đang để chờ).

Chủ shop đã cho số liên hệ Mr. Van 0786.291.468 và xác nhận câu chân trang, câu "hiện chưa có pháp danh riêng" ở Pháp Lý, quy trình trang Đồng Phục.

Chưa kiểm: Safari/iPhone thật, Admin và trang VIP (không thuộc phạm vi), trang 404 và các trang không có menu chung thì theo lựa chọn đã lưu nhưng không có nút chuyển.

## Năng lực sản xuất và logo khách hàng (GitHub p40)
Chủ shop cho danh sách đơn vị đã sản xuất. Logo lấy từ website chính thức (`src/clients/`): Sonacons, KCN Tín Nghĩa, Thép Tiến Lên, Saigon Centre (đổi chữ trắng sang tối), BNI. Xăng dầu Tín Nghĩa và Tín Nghĩa Á Châu dùng logo Tổng công ty Tín Nghĩa vì chưa tìm được logo riêng. Bệnh viện Tâm An và Familia chưa xác định đúng đơn vị nên để chữ. familia.vn là công ty nội thất, chưa xác nhận đúng nên không dùng.
Quy trình 8 công đoạn viết theo công đoạn may vest thông thường, không có số liệu; chủ shop cần đọc lại. Bỏ khung chờ ảnh xưởng ở Năng Lực và ảnh đồng phục, thêm lại khi có ảnh thật.
