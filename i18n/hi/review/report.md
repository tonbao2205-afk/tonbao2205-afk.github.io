# Báo cáo rà soát bản dịch tiếng Hindi — mayLEHUONG (04/11/2026)

## Phạm vi và phương pháp
- Đã đọc và áp dụng: `practical-localizer` (SKILL + toàn bộ references + `examples/hindi.md`), `translating-products`, `reviewing-translations` (6 lượt: nghĩa, thuật ngữ, ngôn ngữ, locale, cấu trúc, bề mặt), `translating-core`, `translating-web`, `translating-marketing`. Glossary `i18n/hi/GLOSSARY.md` được coi là quyết định đã duyệt; không tạo thư mục `.translation/`.
- Chế độ: REVIEW — chỉ tạo `review/fixes.json`, **không sửa** `units.json` / `names.json`.
- Đã rà **2.019 mục** (1.832 câu/đoạn trong `units.json` + 187 tên sản phẩm trong `names.json`), đối chiếu tiếng Việt gốc, tham khảo tiếng Anh, và đọc lại các đoạn ghép trên trang Hindi đã dựng (`index`, `gioi-thieu`, `vest-nu`, `dich-vu`, `dong-phuc`, `tu-van`, `products`, các trang phụ kiện, `nav-component.js`) so với trang Việt gốc.
- Kiểm tra máy: placeholder `{N1} {C1} {D1}…` khớp đủ số lượng; giữ nguyên `đ/₫/VNĐ`, tên thương hiệu, đường dẫn ảnh/mã; không có giá trị rỗng; JSON UTF-8 (`ensure_ascii=False`); mọi khóa đều tồn tại trong file gốc.

## Kết quả
- **128 mục được đề xuất sửa** (112 trong units, 16 trong names): 80 mục sửa tay theo ngữ cảnh + 48 mục chuẩn hóa thuật ngữ đồng loạt.
- Phần lớn bản dịch tốt: tự nhiên, giọng lịch sự आप nhất quán, dùng dấu `।` đúng, từ mượn thời trang hợp lý (सूट, ब्लेज़र, फ़िट, शोरूम). Không thấy lỗi placeholder hay dấu chấm câu.

## Nhóm lỗi chính và ví dụ (trước → sau)
1. **Câu bị cắt bởi thẻ HTML ghép lại sai trật tự (Hindi là SOV)** — lỗi nặng nhất, khoảng 45 mục.
   - Trang dòng vest: «इससे संतुष्ट पुरुषों के सूट की शैली» (“hài lòng với cái này phong cách…”) → «**मनपसंद** पुरुषों के सूट की शैली».
   - Khối CTA phụ kiện/dòng vest: «mayLEHUONG की विशेषज्ञ टीम – may LEHUONG आपके लिए… परामर्श।» (lặp thương hiệu, không có động từ) → «**विशेषज्ञ सलाह:** may LEHUONG **की टीम** … चुनने में आपकी मदद करेगी।»
   - FAQ: «परामर्श बुक करें यहाँ: may LEHUONG क्या इसका शुल्क लगता है?» → «**क्या** may LEHUONG **पर परामर्श बुक करने का कोई शुल्क लगता है?**»
   - Giỏ hàng: «आपको और खरीदने होंगे 500.000₫ और पाने के लिए निःशुल्क शिपिंग» → «**और खरीदें** 500.000₫ **का सामान, और पाएँ** निःशुल्क शिपिंग»; «आप इसके पात्र हैं निःशुल्क शिपिंग !» → «**बधाई! आपको मिल रही है** निःशुल्क शिपिंग !».
   - Giới thiệu: «may LEHUONG आज **हम** इनके लिए … साझेदार हैं» (sai chủ ngữ) → «may LEHUONG आज इनके लिए … **का साझेदार है**:»; «मूल मिशन may LEHUONG उद्यमियों…» → «मूल मिशन: may LEHUONG **का लक्ष्य है** …».
   - Cũng sửa: khối giới thiệu vest nữ, khối dịch vụ thuê/sửa (dich-vu), ghi chú bảng size, dòng kết quả tìm kiếm, mốc lịch sử 1985/2013/2018.
2. **Sai nghĩa / dịch máy móc**
   - «Gần 1 Nửa Thế Kỷ» → «लगभग 1 आधी सदी» (vô nghĩa) → «लगभग **1/2 सदी** से वियतनामी सज्जनों को सँवारते हुए».
   - «giấu khuyết điểm vòng 2» → «2 के आसपास की कमियों» (không hiểu “vòng 2” = vòng eo) → «**कमर (माप नंबर 2)** की कमियों».
   - «Vòng Bụng» → «कमर» (eo) → «**पेट का घेरा**».
   - «Giá Trị Cốt Lõi» → «मूल मूल्य» (dễ hiểu thành “giá gốc”) → «**हमारे मूल सिद्धांत**».
   - Bảng so sánh may sẵn/may đo: «Cố Định» → «स्थिर» (“ổn định”) → «**पहले से तय**»; «Tương Đối» → «अनुमानित» (“ước tính”) → «**लगभग सही**».
   - Màu «Nâu Ấm Áp» → «गर्म भूरा» (nghe như “nâu nóng”) → «**वॉर्म ब्राउन**»; «Xanh chuối» → «केला हरा» → «**लाइम ग्रीन**».
3. **Thuật ngữ không nhất quán** (chuẩn hóa đồng loạt): किराये/किराए → **किराए**; अल्टरेशन → **ऑल्टरेशन**; «cổ lá sen» có 3 cách dịch (कमल-पत्ती / लोटस-लीफ़ / लोटस) → **पीटर पैन कॉलर** (tên quen thuộc với khách Ấn Độ); संग्रह/कलेक्शन → **कलेक्शन**; «THƯỜNG» lúc सामान्य lúc स्टैंडर्ड → **स्टैंडर्ड**; तारीख/तारीख़ và क़ीमती/कीमती → thống nhất một cách viết.
4. **Rủi ro văn hóa**: «da bò» dịch «गाय का चमड़ा» (“da bò cái”) ở 13 tên/mô tả giày — với khách Ấn Độ đây là chi tiết nhạy cảm; đổi về **काउहाइड लेदर** đúng như glossary và các trang khác đã dùng (không đổi sự thật về chất liệu).
5. **Văn phong nhỏ**: câu FAQ dùng «सकता/सकती हूँ» (gạch chéo giới tính) → câu bị động trung tính; tiêu đề «पुरुषों के सूट बिएन होआ» → «बिएन होआ में पुरुषों के सूट»; «Chính sách của mỗi đơn vị» → «हर ब्रांड की नीति» (thay vì संस्थान = “viện/tổ chức”).

## Rủi ro còn lại — cần người bản ngữ Hindi xem
- Các đoạn ghép đã sửa (nhóm 1) mới kiểm bằng cách ghép chữ, **chưa xem trên trình duyệt**; cần dựng lại bản preview Hindi để xác nhận câu đọc liền mạch, nhất là vest-nu, dich-vu, gioi-thieu, giỏ hàng.
- Mẫu «Hiện tại chưa có sản phẩm nào trong {tên danh mục}» và tiêu đề SEO dạng «{N1} | … बिएन होआ – mayLEHUONG» vẫn theo thứ tự tiếng Việt; đọc được nhưng chưa tự nhiên — nên sửa ở mã nguồn (ghép thành một câu hoàn chỉnh) thay vì sửa từng mảnh.
- «BE 2K/4K/6K»: chưa rõ “K” nghĩa là gì (khuy?). Đã giữ nguyên «2K/4K/6K» cho thống nhất; cần chủ shop xác nhận.
- «Vest Sui Gia» → «शादी में परिवार के बड़ों के सूट» (theo glossary) đúng nghĩa nhưng dài; người bản ngữ nên quyết có rút gọn không.
- «Tuyết mưa» chỗ phiên âm «तुयेत मुआ», chỗ giữ chữ Việt; nên chọn một cách.
- «vải» dùng lẫn «कपड़ा» và «फ़ैब्रिक» — đều tự nhiên, chưa đổi; cần chốt nếu muốn đồng nhất.
- Các mô tả SEO bị cắt cụt (meta description cắt giữa câu) vẫn là mảnh câu cụt ở cả tiếng Việt lẫn Hindi.
- Đây là rà soát bằng máy theo phương pháp kỹ năng, **không phải** xác nhận của người bản ngữ.
