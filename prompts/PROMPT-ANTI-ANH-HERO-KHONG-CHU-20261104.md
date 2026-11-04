# Prompt cho Antigravity: bộ ảnh banner không có chữ (04/11/2026)

## Yêu cầu của chủ shop
Thay bộ banner trang chủ đang có chữ in trong ảnh. Ảnh có chữ không dịch được sang EN/中文/한국어/日本語/हिन्दी và không sửa được nội dung. Bộ mới **không có bất kỳ chữ nào trong ảnh**.

Bộ mới gồm 3 nhóm:
1. **Hàng may sẵn**: 3 ảnh đại diện (vest nam, vest nữ công sở, phụ kiện).
2. **May đo nam và nữ**: 2 ảnh (nam, nữ).
3. **Đồng phục công ty**: 1 ảnh.

Mỗi ảnh làm **2 bản**: ngang cho máy tính và dọc cho điện thoại. Tổng cộng **6 cảnh × 2 = 12 ảnh**.

Phạm vi lượt này: **chỉ tạo ảnh và xem trước trên máy (localhost)**.
- Không sửa `index.html`, `index-mobile.html` hay CSS/JS.
- Không đăng lên VPS.
- Codex/Claude kiểm tra rồi mới ghép. Việc đăng lên web chỉ làm khi chủ shop nói rõ "đăng lên web/VPS".

## Kích thước chuẩn (khớp khung banner đang chạy)

| Bản | Khung trên web | File gốc cần xuất (PNG) | Bản web (WebP) |
|---|---|---|---|
| Ngang, máy tính | 16:9 (đang dùng 1600×900) | **2400×1350** | 1600×900 và 960×540 |
| Dọc, điện thoại | 563:1000 (≈ 9:16; đang dùng 563×1000) | **1126×2000** | 563×1000 và 480×853 |

- Trang chủ máy tính hiện ảnh trọn khung 16:9 (contain), cao tối đa 640px. Trang chủ điện thoại hiện trọn khung dọc 563/1000. Ảnh **không bị cắt**, nên mọi chi tiết quan trọng phải nằm trong khung.
- Bản dọc phải **dựng lại bố cục cho khung dọc**, không cắt từ bản ngang. Người hoặc sản phẩm chính đặt ở 2/3 dưới khung, phía trên để trống.
- Hai bản của cùng một cảnh phải đồng bộ: cùng sản phẩm, cùng màu, cùng ánh sáng, cùng phong cách.

### Vùng trống để đặt chữ HTML sau này
Chữ (tiêu đề, nút) sẽ được viết bằng HTML đè lên ảnh và dịch được sang 6 ngôn ngữ. Vì vậy ảnh phải chừa vùng nền sạch: không chi tiết rối, độ sáng đều.
- **Bản ngang:** chừa **40% bên trái** khung (hoặc bên phải, nhưng thống nhất trong cả bộ). Chủ thể đặt ở 60% còn lại.
- **Bản dọc:** chừa **35% phía trên** khung. Chủ thể ở phía dưới. Đáy khung chừa khoảng 60px cho các chấm chuyển ảnh.
- Nền vùng trống nên là kem ngà sáng (ví dụ `#f6efe2`) hoặc tối đều. Chữ đặt lên phải đọc rõ (quy tắc chủ shop: chữ không bao giờ chìm vào nền).

## Phong cách chung (Light Luxury Bespoke của mayLEHUONG)
- Tông màu chủ đạo trắng sứ – kem ngà (`#ffffff → #fdfaf4 → #f6efe2`). Điểm nhấn vàng đồng `#a17f22` và đỏ đô `#9d0208` chỉ dùng ít, ví dụ cà vạt, chỉ may, khăn cài túi.
- Ánh sáng studio mềm, ấm, kiểu ảnh chụp thương mại cao cấp. Độ nét cao, chất vải thấy rõ sợi.
- Người trong ảnh là người Việt hoặc châu Á, tự nhiên, lịch sự. Không giống người nổi tiếng. Tay và ngón tay phải đúng giải phẫu.
- Sản phẩm bám sát hàng thật của shop. Dùng ảnh tham chiếu trong:
  - `images/vest-nam-tre/`, `images/nam-thiet-ke-20261026/` (vest nam);
  - `images/catalog-generated-20261017/webp/`, `images/nu-den-chan-vay-dai-20261101/` (vest nữ);
  - `images/cavat-studio-20261103/`, `images/so-mi-nam-20261103/`, `images/Phụ Kiện/` (phụ kiện);
  - `images/Ảnh May Đo/` (may đo);
  - `images/Đồng Phục/`, `images/ẢNH ĐỒNG PHỤC CÁC KHỐI/` (đồng phục).

### Cấm tuyệt đối trong ảnh
- **Chữ, số, ký tự, logo, watermark, biển hiệu, nhãn mác, tem giá**, kể cả chữ mờ, chữ giả hay chữ trên túi, hộp hoặc biển cửa hàng.
- Logo thương hiệu khác (Hermès, Zara…), họa tiết chữ H, mã QR.
- Khung viền, nút bấm, hiệu ứng banner vẽ sẵn.
- Ảnh là minh họa AI. Không được mô tả là "ảnh thật xưởng" hay "khách thật" ở bất kỳ đâu.

## 6 cảnh và prompt tạo ảnh

Prompt viết bằng tiếng Anh để công cụ tạo ảnh hiểu chính xác. Mỗi prompt dùng cho cả hai bản; chỉ thay dòng **Layout** theo bản ngang hoặc dọc.

Câu chung, thêm vào cuối mọi prompt:
> Photorealistic luxury commercial photography, soft warm studio light, ivory and cream palette with subtle antique-gold accents, high detail fabric texture, shallow depth of field. Absolutely no text, no letters, no numbers, no logos, no watermarks, no signage, no labels, no price tags anywhere in the image.

**Layout ngang:**
> Wide 16:9 composition, subject placed in the right 60% of the frame, the left 40% is clean softly lit ivory negative space for headline overlay.

**Layout dọc:**
> Tall 9:16 portrait composition designed for mobile, subject in the lower two-thirds, the top 35% is clean softly lit ivory negative space for headline overlay, keep the bottom 60px uncluttered.

### Nhóm 1: Hàng may sẵn (3 ảnh)

**1A. Vest nam may sẵn** (`hang-san-vest-nam`)
> An elegant menswear showroom corner: three headless tailor mannequins wearing ready-to-wear two-button men's suits in navy, charcoal grey and sand beige, crisp white shirts and silk ties in burgundy and navy, a wooden valet rack with neatly hung jackets behind, polished light oak floor.

**1B. Vest nữ công sở may sẵn** (`hang-san-vest-nu`)
> Refined womenswear boutique display: two or three headless female mannequins wearing modern fitted office blazers with pencil skirts and tailored trousers in black, pastel pink and light beige, a minimalist cream wall, a small marble side table with folded silk scarves.

**1C. Phụ kiện** (`hang-san-phu-kien`)
> Luxury still-life flat lay on cream linen: rolled silk neckties in navy, burgundy and gold tones, a folded white dress shirt, gold-tone tie clips and lapel pins, a pair of polished black leather oxford shoes, a bow tie, arranged with generous spacing.
> (Bản dọc: xếp dọc theo đường chéo, giữ đủ 5 món.)

### Nhóm 2: May đo nam và nữ (2 ảnh)

**2A. May đo nam** (`may-do-nam`)
> A master tailor measuring a Vietnamese gentleman's shoulders with a cloth tape measure in a bright bespoke atelier, the client wearing a half-finished basted navy suit jacket with visible white tacking stitches, fabric swatch books and tailor's chalk on a cutting table, warm and trustworthy mood.

**2B. May đo nữ** (`may-do-nu`)
> A female tailor fitting a Vietnamese businesswoman in a tailored cream blazer, adjusting the waist with pins, a full-length mirror and bolts of fine suiting fabric in the background, elegant and calm atmosphere.

### Nhóm 3: Đồng phục công ty (1 ảnh)

**3A. Đồng phục doanh nghiệp** (`dong-phuc-cong-ty`)
> A confident group of five Vietnamese office staff, men and women, wearing matching corporate uniforms: navy suits for men, navy blazers with skirts or trousers for women, white shirts, coordinated burgundy ties and scarves, standing in a bright modern office lobby with soft daylight, professional and friendly.
> Không hiện logo công ty nào trên áo, tường hay quầy lễ tân.
> (Bản dọc: xếp 3–4 người thành hàng so le, giữ đủ nam và nữ.)

## Tên file và nơi lưu
Thư mục mới: `images/home/hero/banner-nochu-20261104/`. **Không ghi đè** bất kỳ ảnh cũ nào.
- File gốc PNG: `<cảnh>-desktop-2400x1350.png` và `<cảnh>-mobile-1126x2000.png`.
- File WebP cho web:
  - `<cảnh>-desktop-1600.webp`, `<cảnh>-desktop-960.webp`;
  - `<cảnh>-mobile-563.webp`, `<cảnh>-mobile-480.webp`.
  - Chất lượng khoảng 80; mỗi file ngang 1600 nên dưới 250KB, mỗi file dọc 563 dưới 120KB.
- Ghi `manifest.json` gồm tên cảnh, prompt đã dùng, kích thước, SHA-256, công cụ tạo ảnh, và đánh dấu `"ai_illustration": true`.
- Tạo `preview.html` xem 12 ảnh trong khung đúng tỉ lệ: 16:9 ở 1366px và 563/1000 ở 390px, có vẽ vùng trống để đặt chữ.

## Tiêu chí kiểm tra trước khi bàn giao
1. Đủ 12 ảnh, đúng kích thước, hai bản của cùng một cảnh đồng bộ.
2. **Phóng to 100% soát từng ảnh: không có chữ, số, logo hay ký tự giả nào.** Ảnh nào có thì làm lại.
3. Vùng trống đúng vị trí, nền sạch. Thử đặt chữ đen `#15110e` và chữ đỏ `#9d0208` lên vùng này: tương phản ≥ 4,5:1.
4. Người: tay, mặt và tỉ lệ cơ thể tự nhiên. Đường may, khuy và ve áo hợp lý. Không méo vải.
5. Sản phẩm giống hàng thật của shop về kiểu và màu, so với ảnh tham chiếu.
6. Báo lại: danh sách file, ảnh làm lại bao nhiêu lần, và điểm nào chưa chắc chắn.

## Bước sau (không thuộc lượt này)
- Codex/Claude ghép ảnh vào khung banner của `index.html` và `index-mobile.html`. Thêm tiêu đề, mô tả ngắn và nút bằng HTML, có bản dịch 6 ngôn ngữ.
- Nội dung chữ của từng banner do chủ shop duyệt; không tự thêm ưu đãi, giá hay cam kết.
- Thứ tự slide và việc giữ hay bỏ banner khuyến mãi tháng 10 cũng do chủ shop quyết.
- Chỉ đăng lên VPS khi chủ shop nói rõ "đăng lên web/VPS".

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*
