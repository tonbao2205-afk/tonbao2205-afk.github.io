# PROMPT: Darkmode 2 web + trang riêng Dzuong Tailor (09/11/2026)

Thiết bị: CẢ điện thoại và máy tính. Chỉ làm bản xem trước trên máy; đăng VPS khi chủ shop nói rõ "đăng lên VPS".

## Đã chốt với chủ shop
- Dzuong Tailor là cơ sở đối tác của mayLEHUONG về mảng sản xuất, chưa có pháp danh riêng; pháp nhân là Công ty TNHH Thời Trang Lê Hương.
- Dzuong làm lên mẫu, sản xuất, gia công, may đo; nhận khách trực tiếp qua số riêng: Mr. Van 0786.291.468.
- dzuongtailor.com: trang riêng trưng bày mẫu may đo, không giá, không giỏ; các trang bán hàng cũ chuyển 301 về maylehuong.com.
- Cả hai web: mặc định sáng, có nút chuyển sáng/tối, máy nhớ lựa chọn.
- maylehuong.com: thêm một mục ở trang Giới thiệu nói về đối tác sản xuất, có liên kết sang Dzuong.
- Ảnh xưởng chủ shop gửi sau; để khung chờ.

## File
- Mới: `dzuong-tailor.html`, `theme.js`, `dark-theme.css`, `dzuong-robots.txt`, `dzuong-sitemap.xml`, `assets/dzuong-20261109/*`.
- Sửa: chèn đoạn bootstrap vào `<head>` các trang công khai (`tools/dark_mode_20261109.py`, chạy lại được, không chèn hai lần); `gioi-thieu.html` thêm `#doi-tac-san-xuat`; `sites.conf` khối dzuongtailor.
- Lấy gốc từ VPS current, không dùng HTML trên máy.

## Chuẩn thiết kế trang Dzuong (chủ shop yêu cầu sang như Lê Hương, 09/11/2026)
- Light Luxury: nền trắng sứ/kem `#ffffff → #fdfaf4 → #f6efe2`, chữ `#15110e`, nhấn đỏ `#9d0208`. Vàng `#a17f22` chỉ làm đường viền, không làm chữ nhỏ. Tiêu đề Noto Serif, font lấy từ bộ local của site, không Google Fonts.
- Mở đầu 2 cột chữ trái, ảnh phải, khung Atelier 2 lớp viền vàng. Điện thoại 1 cột, không tràn ngang.
- Nhãn kiểu A: không viên thuốc, không icon; chữ hoa đỏ giãn 0,22em, 15px máy tính/13,5px điện thoại, gạch vàng 32×1 phía trước.
- Tiêu đề căn giữa có vạch vàng; thẻ nổi có số chìm 01–04; hover chỉ nhô đúng thẻ đang trỏ −5px 180ms, chỉ khi có chuột và không bật giảm chuyển động.
- Khối liên hệ cuối là một khối Luxury Conversion nền kem, viền vàng, thanh đỏ–vàng. Không có khối nền đen giữa trang.
- Ảnh WebP có sẵn trên máy chủ, không chép thêm bản trùng; lazy trừ ảnh mở đầu. Xem phóng to như trang May Đo.
- Không gán việc mọi bộ vest Lê Hương đều do Dzuong may (Hon, Hoa Thông, Văn cũng là bên may). Không số liệu, không cam kết chưa có.

## Menu và 6 trang Dzuong (chủ shop chốt 09/11/2026)
- Máy tính: hàng trên chỉ logo Dzuong ở giữa cỡ như logo Lê Hương (58px; logo mayLEHUONG đặt ở trang Pháp Lý), hàng dưới các trang, chữ Montserrat như menu Lê Hương, trang đang mở màu đỏ có gạch dưới. Điện thoại: nút ba gạch trái, logo Dzuong giữa, nút sáng/tối phải.
- 6 trang: Trang Chủ `/`, Sản Phẩm `/san-pham`, Đồng Phục `/dong-phuc`, Năng Lực Sản Xuất `/nang-luc-san-xuat`, Giới Thiệu `/gioi-thieu`, Pháp Lý `/phap-ly`.
- Giới thiệu và Pháp lý ghi đúng thông tin đã công bố ở `gioi-thieu.html`; lịch sử và số liệu của Lê Hương phải đứng dưới tiêu đề mayLEHUONG, không gán cho Dzuong. Không chép chính sách mua hàng/bảo hành của Lê Hương vào Dzuong.
- Không dùng ảnh đồng phục có logo doanh nghiệp lớn (Vingroup, Vietcombank, DHL...), để khung chờ.

## Giới hạn
- Bản sáng phải giữ nguyên: người dùng sáng không tải `dark-theme.css`.
- Không đổi Admin, API, dữ liệu, trang VIP `/q`.
- Giữ một H1, meta, canonical, JSON-LD, form, webhook. Trang Dzuong có canonical riêng; không dùng `parentOrganization`.
- Không gán số liệu của Lê Hương (hơn nửa thế kỷ, bảo hành trọn đời, xuất khẩu) cho Dzuong.
- Giữ `/api`, `/admin`, `/uploads`, ảnh, file tĩnh và file xác minh Zalo trên dzuongtailor.com.

## Tiêu chí kiểm tra
- Quét tương phản ở 1366 và 390 cho cả sáng và tối: chữ thường ≥ 4,5:1, chữ lớn ≥ 3:1.
- 320/390/1366 không tràn ngang, không lỗi JS; nút chuyển sáng/tối hoạt động, tải lại vẫn nhớ, chuyển về sáng trả đúng giao diện cũ.
- Logo đổi bản trắng khi tối; nút trạng thái (tab, nút đang chọn) vẫn đổi được khi tối.
