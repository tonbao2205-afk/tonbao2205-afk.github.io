# Rà soát bản dịch tiếng Anh — mayLEHUONG (04/11/2026)

## Phạm vi và phương pháp
- Đã đọc toàn bộ **2.019 mục**: `units.json` (1.832 chuỗi) và `names.json` (187 tên sản phẩm).
- Đối chiếu với:
  - `GLOSSARY.md`;
  - tiếng Việt gốc trong `.codex-local/en-site-20261104/vps/web/`;
  - trang tiếng Anh đã dựng trong `.codex-local/i18n-preview-20261104/site/en/`, để xem các mảnh câu ghép lại thành câu gì.
- Áp dụng phương pháp của các skill:
  - `reviewing-translations`: rà 6 lượt (nghĩa, thuật ngữ, ngữ pháp và giọng văn, quy ước en-US, cấu trúc và placeholder, độ dài giao diện).
  - `practical-localizer`: review-methodology, terminology, ui-fit, locale-formatting.
  - `translating-web`, `translating-marketing` (giữ đúng thông điệp, không phóng đại cam kết) và `translating-core`.
- Coi bản dịch và glossary hiện có là chuẩn đã duyệt; chỉ sửa khi có lý do rõ.
- **Kết quả: sửa 227 mục** (209 chuỗi, 18 tên sản phẩm), ghi ở `review/fixes.json`. Không sửa trực tiếp `units.json` hay `names.json`.
- Kiểm tra tự động bằng Python: mọi khóa đều tồn tại, placeholder `{N1} {C1} {D1}…` đủ số lượng, không có giá trị rỗng, ký hiệu đ/₫/VNĐ giữ nguyên, tệp lưu UTF-8.
- Chưa xem trên trình duyệt sau khi áp bản sửa.

## Nhóm lỗi chính và ví dụ

### 1. Mảnh câu ghép lại bị sai ngữ pháp (khách đọc thấy ngay)
- "In the market of Biên Hòa, Đồng Nai, mayLEHUONG **we offer**…" → "**In** Biên Hòa, Đồng Nai, mayLEHUONG **offers**…"
- "Let the experts at mayLEHUONG **advice on choosing**…" → "…**advise you on**…", đồng thời trả lại ý "che bụng" bị mất.
- "Haven't found the right style yet**??**" → bỏ dấu hỏi thừa.
- "Our consultant mayLEHUONG will call you…" → "A consultant from mayLEHUONG will call you…"

### 2. Sai nghĩa hoặc dễ hiểu nhầm với khách Mỹ
- "Men's **Vests** & Suits" → "Men's Suits", vì ở Mỹ "vest" nghĩa là áo gile.
- "lotus-leaf collar" → "**Peter Pan collar**" (cổ lá sen).
- "with {D1} buttons" → "with {D1} **rows of** buttons"; "cúc song song" → "double-breasted".
- "Lịch nhận sản phẩm" bị dịch thành "Drop-off schedule" (sai chiều) → "Collection timing".

### 3. Thuật ngữ không thống nhất
- "Design TK…" và "Designer TK…" dùng lẫn → thống nhất "Design TK…".
- "BE 2K/4K" (K = khuy, khách không hiểu) → "BEIGE 2-BUTTON".
- "STRIPED", "STRIPE", "PINSTRIPE" dùng lẫn → "PINSTRIPE", theo tên sản phẩm.
- "BANANA GREEN" → "LIME GREEN".
- "photo" và "image" trong mô tả ảnh → thống nhất một cách gọi.
- "Trousers size" → "Trouser size".
- "ivory cream" → "ivory", theo glossary.

### 4. Còn sót chữ "veston" và tên hệ thống nội bộ
- "News & Veston Guide" → "News & Suit Guide".
- "according to KiotViet stock" → "based on current Showroom stock", vì khách quốc tế không biết KiotViet.

### 5. 21 mô tả mẫu vest nữ viết máy móc
Dạng "Color X – Style: …" → thống nhất thành "Pastel pink – Fitted sleeveless women's suit…".

### 6. 44 mô tả meta bị cắt giữa câu
Các câu kết thúc lơ lửng như "…with a refined pattern that adds" hay "…design at." → viết thành câu hoàn chỉnh, ngắn.

### 7. Câu vụng, dịch sát chữ
- "Renting a suit suits weddings…" → "Renting is the right choice when…"
- "Completely free {D1}%." → "{D1}% free of charge."
- "Satisfied With Men's Suit Style" → "Perfect Your Men's Suit Style"
- "NATIONWIDE SHOWROOMS" (shop chỉ có 2 showroom) → "OUR SHOWROOMS"
- "CONFIRM BUY NOW" → "CONFIRM PURCHASE"

### 8. Tiêu đề SEO
"{N1} | Men's Suits Biên Hòa" → "… in Biên Hòa", đồng bộ cho mọi trang sản phẩm.

## Rủi ro còn lại (không sửa được trong file dịch)
- **"Gần {D1} Nửa Thế Kỷ"** (D1 = 1) sẽ hiện "Nearly 1 Half a Century". Quy tắc không cho bỏ placeholder, nên cần công cụ cho phép dịch nguyên chuỗi; câu đúng nên là "Nearly Half a Century".
- **Khóa "Bộ sưu tập" dùng chung với menu** ("Collections"), nên câu trên trang Cài Ve đọc thành "Collections Lapel Pin 2026 – our latest designs…". Nên tách thành khóa riêng.
- **Cần chủ shop xác nhận tên tiếng Anh**:
  - "Tuyết Mưa": tên dòng vải, vẫn để tiếng Việt.
  - "CÀI QUÀI → STRAP FASTENING": chưa rõ kiểu dáng thật.
- **Chưa xem hết khi hiển thị**: một số chuỗi phụ thuộc giá trị số thật, như "Please select {D1} product size!" và "{D1}-Button".
- **Chưa đo trên máy tính 1366px**: nút và menu đã giữ ngắn ("Contact Us", "Lapel Pins") nhưng chưa kiểm tra sau khi áp bản sửa.
