# Prompt cho Antigravity: ảnh minh họa trang May Đo (`may-do.html`), 05/11/2026

## Yêu cầu của chủ shop
- "Cần ví dụ hình ảnh trực quan hơn. Ví dụ như thế nào gọi là vai ngực lệch, có hình ảnh chứng minh."
- Mỗi luận điểm H3 trên trang cần một ảnh chứng minh.
- Phạm vi: **cả điện thoại và máy tính**. Mỗi ảnh có **một tỉ lệ dùng chung** cho cả hai bản.
- Lượt này chỉ tạo ảnh. Codex/Claude sẽ ghép vào trang và đưa lên bản thử GitHub. Không đăng lên VPS.

## Số lượng: 7 ảnh

| # | Phần trên trang | H3 | Loại ảnh | Kích thước |
|---|---|---|---|---|
| 1 | H2 Vấn đề | Vai và ngực lệch size | So sánh **sai / đúng** đặt cạnh nhau | 1600×1000 (16:10) |
| 2 | H2 Vấn đề | Tay áo và ống quần sai độ dài | So sánh sai / đúng | 1600×1000 |
| 3 | H2 Vấn đề | Dáng người riêng không có trong bảng size | So sánh sai / đúng | 1600×1000 |
| 4 | H2 Lập luận | Đo 25 số đo cơ thể | Ảnh cảnh may đo | 1200×900 (4:3) |
| 5 | H2 Lập luận | Chọn vải theo cách bạn mặc | Ảnh cảnh may đo | 1200×900 |
| 6 | H2 Lập luận | Thử đồ và chỉnh trước khi giao | Ảnh cảnh may đo | 1200×900 |
| 7 | H2 Lập luận | Bảo hành đường may trọn đời | Ảnh cận cảnh | 1200×900 |

- Phần "Quy trình 4 bước" **không cần ảnh mới**: các bước đã được minh họa bằng ảnh 4–6 ở trên. Chỉ thêm ảnh khi chủ shop yêu cầu.
- Ba ảnh so sánh 1–3 quan trọng nhất, vì chúng chứng minh vấn đề. Làm ba ảnh này trước.

## Quy tắc chung cho cả 7 ảnh
- **Không có chữ, số, logo, mũi tên hay dấu ✗/✓ trong ảnh.** Nhãn "May sẵn / May đo" và dấu đánh dấu do HTML phủ lên, để còn dịch được sang 5 ngôn ngữ.
- Ảnh chụp thật (photorealistic), ánh sáng studio dịu, tông kem, ngà và nâu gỗ, hợp với giao diện Light Luxury của web.
- Người mẫu nam người Việt khoảng 30–45 tuổi. **Ảnh 1, 2 và 3 dùng cùng một người mẫu, cùng màu vest (xanh navy trơn) và cùng phông nền.** Người xem chỉ được thấy khác biệt ở độ vừa của bộ vest.
- Trong ảnh so sánh: **bên trái là may sẵn bị lỗi, bên phải là may đo vừa vặn.** Hai nửa chia đều, có khe trống mảnh màu kem ở giữa để HTML đặt nhãn. Cùng tư thế, cùng góc máy, cùng ánh sáng.
- Lỗi phải **nhìn thấy rõ ngay ở cỡ điện thoại (khoảng 360px ngang)** nhưng vẫn giống thật, không cường điệu thành hoạt hình.
- Chừa lề an toàn: chi tiết quan trọng nằm trong 80% giữa khung, vì bản điện thoại có thể cắt nhẹ hai mép.
- Ảnh do AI tạo được ghi "ảnh minh họa" trên trang. Không được trông như ảnh khách hàng thật hay ảnh "trước/sau" của một khách cụ thể.

## Prompt từng ảnh (viết tiếng Anh cho mô hình tạo ảnh)

### Ảnh 1: `01-vai-nguc-sai-dung` (vai và ngực lệch size)
> Photorealistic studio photograph, split-screen side-by-side comparison of the same Vietnamese man (about 35 years old, medium build) wearing a plain navy two-button suit jacket, front view from mid-thigh up, neutral cream backdrop, soft even lighting. LEFT half: an off-the-rack jacket that does not fit — shoulder seams extend past his natural shoulders creating a visible dent/divot at the top of the sleeve, and the fastened button pulls the fabric into an obvious X-shaped strain across the chest and stomach, lapels lifting away from the chest. RIGHT half: a tailored jacket of the identical fabric — shoulder seam ends exactly at the shoulder bone, sleeve falls cleanly, chest lies flat with no pulling at the button, lapels rest on the chest. Same pose, same camera angle, same lighting on both halves. Thin cream vertical gap between halves. No text, no arrows, no logos, no watermarks.

### Ảnh 2: `02-tay-ong-quan-sai-dung` (tay áo và ống quần sai độ dài)
> Photorealistic studio photograph, split-screen side-by-side comparison of the same Vietnamese man in a plain navy suit, full-length front view, neutral cream backdrop, polished dark brown oxford shoes. LEFT half: off-the-rack suit with sleeves too long, covering the knuckles so no shirt cuff shows, and trousers too long, bunching and pooling in several folds over the shoes. RIGHT half: tailored suit of the identical fabric — about 1–1.5 cm of white shirt cuff visible below the jacket sleeve at the wrist bone, trousers with a clean single slight break resting on the shoe. Same pose (arms relaxed at sides), same camera angle and lighting. Thin cream vertical gap between halves. No text, no arrows, no logos, no watermarks.

### Ảnh 3: `03-dang-nguoi-rieng-sai-dung` (dáng người riêng)
> Photorealistic studio photograph, split-screen side-by-side comparison, three-quarter back view of the same Vietnamese man with naturally sloped shoulders and a slightly rounded upper back, wearing a plain navy suit jacket, neutral cream backdrop, soft light. LEFT half: off-the-rack jacket — the collar stands away from the neck leaving a visible gap, horizontal folds bunch below the collar across the upper back, and the back vent flares open. RIGHT half: tailored jacket of the identical fabric cut for his posture — collar hugs the shirt collar with no gap, the back is smooth without folds, the vent hangs closed and straight. Same pose, same camera angle and lighting. Thin cream vertical gap between halves. No text, no arrows, no logos, no watermarks.

### Ảnh 4: `04-do-25-so-do` (đo 25 số đo)
> Photorealistic photograph inside a warm bespoke tailoring atelier: an experienced Vietnamese tailor (about 55, waistcoat, measuring tape around his neck) measuring the shoulder width of a Vietnamese male client in a white shirt, tape held taut across the shoulders, client standing naturally; a small notebook and pencil on a wooden table nearby (notebook pages blank or blurred, no readable writing). Soft window light, cream and walnut tones, shallow depth of field. 4:3 landscape. No text, no logos, no watermarks.

### Ảnh 5: `05-chon-vai` (chọn vải theo cách mặc)
> Photorealistic photograph: a Vietnamese male client and a tailor at a wooden table looking through open premium suiting swatch books — fabric swatches in navy, charcoal grey, burgundy and beige fanned out, the client's hand touching a swatch to feel the texture. Warm atelier light, cream and walnut tones, close-to-medium framing focused on hands and fabric. Swatch labels blank or blurred, no readable brand names. 4:3 landscape. No text, no logos, no watermarks.

### Ảnh 6: `06-thu-do-chinh` (thử đồ và chỉnh trước khi giao)
> Photorealistic photograph of a fitting session: a Vietnamese male client in a basted navy jacket (visible white basting stitches along the seams), standing before a tall mirror; a tailor adjusts the sleeve length with a pin, a pin cushion on his wrist and tailor's chalk in hand. Warm atelier interior, soft light, cream and walnut tones. 4:3 landscape. No text, no logos, no watermarks.

### Ảnh 7: `07-duong-may` (bảo hành đường may trọn đời)
> Photorealistic macro close-up of fine tailoring workmanship on a navy wool suit jacket: neat, even, tight hand stitching along the lapel edge and a precisely set sleeve head seam, a hand-sewn buttonhole, and a needle with navy thread resting on the fabric. Soft raking light showing texture, cream background blur. 4:3 landscape. No text, no logos, no watermarks.

## Bàn giao
- Lưu PNG gốc vào `images/may-do-minh-hoa-20261105/` với đúng tên ở trên (ví dụ `01-vai-nguc-sai-dung.png`), kèm tệp `manifest.json` ghi lại prompt đã dùng cho từng ảnh.
- Không cần tự chuyển sang WebP và không sửa HTML. Codex/Claude sẽ:
  - tạo bản WebP 1600/800 cho ảnh so sánh và 1200/640 cho ảnh cảnh;
  - phủ nhãn "May sẵn / May đo" bằng HTML và dịch sang 5 ngôn ngữ;
  - đặt ảnh 1–3 dưới từng H3 của phần Vấn đề, ảnh 4–7 dưới từng H3 của phần Lập luận;
  - tải lười (lazy) mọi ảnh và quét tương phản chữ ở 390 và 1366.
- Tự kiểm tra trước khi bàn giao:
  - lỗi ở nửa trái nhìn rõ khi thu ảnh về 360px ngang;
  - hai nửa cùng người, cùng vải, cùng tư thế;
  - không có chữ hay chữ giả trong ảnh;
  - bàn tay, ngón tay và khuy áo không bị méo.

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*
