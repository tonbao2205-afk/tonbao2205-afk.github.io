# Prompt cho Antigravity: bộ ảnh so sánh MỚI HOÀN TOÀN cho trang May Đo (`may-do.html`), 05/11/2026

## Yêu cầu của chủ shop
- Trong 2 phương án, chủ shop chọn **tạo ảnh mới hoàn toàn**. Mỗi ảnh tập trung đúng vào điểm khuyết, nêu được vấn đề để nhân viên dựa vào đó chốt khách.
- Nội dung trang theo bản kế hoạch chủ shop đã gửi:
  - **Khối A:** So sánh phom dáng, 4 mục A1–A4.
  - **Khối B:** 5 đặc quyền thủ công và custom, B1–B5.
  - **Bảng tổng hợp:** 8 tiêu chí.
- Phạm vi: **cả điện thoại và máy tính**. Mỗi ảnh dùng một tỉ lệ chung cho cả hai bản.
- Lượt này chỉ tạo ảnh. Codex/Claude ghép vào trang và đưa lên bản thử GitHub. Không đăng lên VPS.
- **Không dùng lại 7 ảnh cũ** trong `images/may-do-minh-hoa-20261105/`. Giữ nguyên các ảnh đó, không xóa và không ghi đè.

## Số lượng: 9 ảnh, tất cả là ảnh so sánh "may sẵn | may đo"

| # | Mục | Lỗi cần thấy rõ ở nửa trái | Khung hình | Kích thước |
|---|---|---|---|---|
| A1 | Vai áo & eo | Vai trễ lõm đầu tay áo, thân suông hình hộp, khuy kéo chữ X | Nửa người, chính diện | 1600×1000 |
| A2 | Cổ tay áo | Tay áo trùm mu bàn tay, mất măng-sét sơ mi | **Cận** cổ tay | 1600×1000 |
| A3 | Ống quần | Ống dài, gãy nhiều nếp đùn trên giày | **Cận** từ gối xuống giày | 1600×1000 |
| A4 | Dáng người riêng | Hở cổ sau gáy, đùn nếp ngang lưng, xẻ tà bung | Sau lưng, 3/4 | 1600×1000 |
| B1 | Đột tay mép ve | Mép ve may máy phẳng lì, keo phồng rộp | **Macro** mép ve | 1600×1000 |
| B2 | Khuyết ve áo | Khuyết dập máy chỉ mảnh, xơ sợi | **Macro** khuyết ve | 1600×1000 |
| B3 | Thêu tên riêng | Mặt trong ngực chỉ có lót trơn đại trà | Cận mặt trong ngực áo | 1600×1000 |
| B4 | Custom chi tiết | Một kiểu ve, cúc nhựa, lót trơn | Cận ve, cúc tay áo, lót | 1600×1000 |
| B5 | Fitting thử đồ | Áo may xong lệch, phải sửa chắp vá | Cảnh người trước gương | 1600×1000 |

- Làm **A1–A4 trước**. Đây là bốn ảnh nêu vấn đề mạnh nhất, dùng để chốt khách.
- Cả 9 ảnh đều là ảnh so sánh, kể cả khối B, để khách thấy ngay cái thiếu của hàng may sẵn.

## Quy tắc chung
- **Không có chữ, số, logo, mũi tên hay dấu ✗/✓ trong ảnh.**
  - Nhãn "Hàng may sẵn" (đỏ `#9d0208`) và "May đo mayLEHUONG" (đen `#15110e`) do HTML phủ lên, để dịch được sang 5 ngôn ngữ.
  - Ảnh B3 không có chữ thêu đọc được. Vùng thêu là nét thêu trừu tượng; tên mẫu do HTML phủ lên.
- **Bên trái: may sẵn bị lỗi. Bên phải: may đo đạt chuẩn.**
  - Hai nửa chia đều, giữa có khe trống mảnh màu kem.
  - Hai nửa cùng tư thế, cùng góc máy, cùng ánh sáng.
- **Lỗi là nhân vật chính của ảnh.**
  - Đặt điểm khuyết ở giữa nửa trái, vùng sáng nhất, nét nhất.
  - Phải nhìn thấy ngay ở cỡ điện thoại, khoảng 360px ngang cho cả ảnh, tức mỗi nửa khoảng 180px.
  - Ảnh vẫn phải giống thật, không cường điệu thành hoạt hình.
- **Người mẫu và vải:**
  - A1–A4 và B5 dùng cùng một người mẫu: nam người Việt khoảng 35 tuổi.
  - Cùng vest xanh navy trơn, cùng phông kem.
  - Hai nửa của mỗi ảnh phải cùng màu vải. Khác biệt duy nhất là độ vừa hoặc tay nghề.
- **Phong cách:**
  - Ảnh chụp thật (photorealistic), ánh sáng studio dịu.
  - Tông kem, ngà và nâu gỗ, hợp giao diện Light Luxury.
  - Đặt chi tiết quan trọng trong 80% giữa khung.
- **Tính trung thực:**
  - Trang ghi "Ảnh minh họa".
  - Ảnh không được trông như ảnh một khách hàng thật, cũng không phải ảnh trước/sau của một người cụ thể.

## Prompt từng ảnh (tiếng Anh cho mô hình tạo ảnh)
Thêm vào cuối **mọi** prompt câu sau: `Split-screen, two equal halves with a thin cream vertical gap; LEFT = flawed off-the-rack, RIGHT = correct bespoke; identical fabric, pose, camera angle and lighting on both halves. Photorealistic, soft studio light, cream backdrop. No text, no letters, no numbers, no arrows, no logos, no watermarks.`

### A1 `a1-vai-eo-sai-dung` (vai áo và eo đồng hồ cát nhẹ)
> Front view from mid-thigh up of a Vietnamese man (about 35, medium build) in a plain navy two-button suit jacket, buttoned, arms relaxed. LEFT: off-the-rack jacket — shoulder seam hangs about 3 cm past the shoulder bone so the top of the sleeve caves in with a visible dent, the body is boxy and straight with no waist shape, and the button pulls sharp X-shaped strain folds across the stomach. RIGHT: bespoke jacket — shoulder seam stops exactly at the shoulder bone with a smooth rounded sleeve head, a gentle hourglass waist suppression creating a clean V from shoulders to waist, chest lies flat, no pulling at the button.

### A2 `a2-co-tay-ao-sai-dung` (cổ tay áo vừa tầm)
> Close-up at the wrist and hand of a man in a navy suit with a white dress shirt, arm relaxed at his side, shot at the height of the hand. LEFT: off-the-rack sleeve far too long, covering the wrist and half of the back of the hand, no white shirt cuff visible at all, fabric creasing over the hand. RIGHT: bespoke sleeve ending exactly at the wrist bone, showing a crisp 1–1.5 cm band of white shirt cuff, four neat sleeve buttons visible.

### A3 `a3-ong-quan-sai-dung` (ống quần không gãy)
> Close-up from the knees down of a man standing straight in navy suit trousers and polished dark brown oxford shoes, on a light wooden floor. LEFT: off-the-rack trousers far too long, the fabric pooling and breaking into several deep folds piled on top of the shoe, hem dragging toward the heel. RIGHT: bespoke trousers falling in a straight clean line, hem just touching the top of the shoe with a single slight break, no folds.

### A4 `a4-dang-nguoi-rieng-sai-dung` (dáng người riêng)
> Three-quarter back view of a man with naturally sloped shoulders and a slightly rounded upper back, in a navy suit jacket, standing. LEFT: off-the-rack jacket — a clear gap where the jacket collar stands away from the shirt collar at the back of the neck, a stack of horizontal folds across the upper back below the collar, and the centre back vent flaring open. RIGHT: bespoke jacket cut for his posture — collar hugging the shirt collar with no gap, back smooth with no folds, vent hanging closed and straight.

### B1 `b1-dot-tay-ve-sai-dung` (đột tay thủ công mép ve)
> Macro close-up of the lapel edge of a navy wool suit jacket, raking light across the fabric. LEFT: machine-made lapel — flat, stiff, perfectly uniform machine edge, fused interlining showing small bubbles and a puckered ripple along the lapel. RIGHT: bespoke lapel with fine hand pick-stitching — tiny evenly spaced hand stitches about 5 mm from the edge, a soft natural roll of the lapel, smooth surface with no bubbles.

### B2 `b2-khuyet-ve-sai-dung` (khuyết ve áo thùa tay)
> Macro close-up of the lapel buttonhole on a navy wool suit jacket. LEFT: machine buttonhole — thin flat thread, uneven tension, loose fibres fraying out of the slit, or a fake buttonhole that is only stitched without an opening. RIGHT: hand-sewn Milanese lapel buttonhole — dense raised silk stitches wrapped around a corded gimp, forming a crisp, sculpted 3D outline in tonal navy silk thread.

### B3 `b3-theu-ten-sai-dung` (thêu tên riêng)
> Close-up of the inside chest of a navy suit jacket held slightly open to show the lining and the inside breast pocket. LEFT: off-the-rack jacket — plain mass-produced polyester lining, a generic woven care tag, nothing personal. RIGHT: bespoke jacket — lustrous silk lining in deep burgundy, and above the inside pocket a small elegant hand-embroidered area in gold thread made of abstract decorative flourishes (no readable letters).

### B4 `b4-custom-chi-tiet-sai-dung` (custom theo ý khách)
> Detail shot of the front lapel, sleeve cuff and opened lining of a navy suit jacket laid on a walnut tailoring table. LEFT: off-the-rack — standard narrow notch lapel, shiny plastic buttons sewn flat and fixed, plain grey lining. RIGHT: bespoke — a peak lapel, natural horn buttons, working cuff buttonholes with the last button left undone, and a contrasting silk lining; a small tray of horn buttons and folded silk lining swatches (burgundy, gold, navy) at the edge of the frame.

### B5 `b5-fitting-sai-dung` (fitting thử đồ trước khi hoàn thiện)
> Medium shot of a man standing in front of a tall mirror in a tailoring atelier. LEFT: he wears a finished off-the-rack navy jacket that clearly does not fit (sleeves too long, loose boxy waist), holding a shopping bag, looking at the mirror unhappy. RIGHT: he wears a basted navy jacket with visible white basting stitches during a fitting, while a tailor pins the waist and marks the sleeve length with chalk, pin cushion on the tailor's wrist.

## Bàn giao
- Lưu PNG gốc vào thư mục mới `images/may-do-so-sanh-v2-20261105/` với đúng tên ở trên, ví dụ `a1-vai-eo-sai-dung.png`.
- Kèm `manifest.json` ghi prompt đã dùng, kích thước và `no_text_verified` cho từng ảnh.
- Tự kiểm tra từng ảnh trước khi bàn giao:
  - không có chữ hay số;
  - lỗi ở nửa trái thấy rõ khi thu ảnh về 360px ngang;
  - hai nửa cùng màu vải và cùng góc máy.
  - Ảnh nào không đạt thì tạo lại.
- Không cần chuyển WebP, không sửa HTML. Codex/Claude sẽ:
  - tạo WebP 1600/800;
  - phủ nhãn HTML, viết H2/H3 và bảng 8 tiêu chí;
  - dịch sang 5 ngôn ngữ, kiểm tra 320/390/1366;
  - đưa lên bản thử GitHub.

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*

## Cập nhật 06/11/2026 (chủ shop)
- Không phủ chữ lên ảnh nữa. Nhãn "Hàng may sẵn" / "May đo mayLEHUONG" và dòng "Ảnh minh họa" nằm **dưới ảnh**, mỗi nhãn canh giữa nửa ảnh tương ứng, áp dụng cho cả điện thoại và máy tính.
- Ảnh vẫn không được có chữ (quy tắc trên giữ nguyên).
