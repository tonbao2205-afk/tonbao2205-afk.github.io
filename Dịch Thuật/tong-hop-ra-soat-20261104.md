# Tổng hợp rà soát ngôn ngữ bằng bộ skill Dịch Thuật — 04/11/2026

Dùng 3 bộ skill trong thư mục này để rà bản dịch website (bản thử GitHub). Mỗi ngôn ngữ được đối chiếu với câu gốc tiếng Việt và đọc thử trên trang đã dựng.

| Ngôn ngữ | Skill áp dụng | Mục đã rà | Mục đã sửa | Báo cáo chi tiết |
|---|---|---|---|---|
| English | translating-products, reviewing-translations, translating-core/web/marketing, practical-localizer | 2.019 | 227 | `i18n/en/review/report.md` |
| 中文 | như trên + translating-chinese | 2.019 | 139 | `i18n/zh/review/report.md` |
| 한국어 | như trên + translating-korean | 2.019 | 147 | `i18n/ko/review/report.md` |
| 日本語 | như trên + translating-japanese + yomiyasu | 2.019 | 106 | `i18n/ja/review/report.md` |
| हिन्दी | practical-localizer (có ví dụ Hindi) + translating-products, reviewing-translations, translating-core/web/marketing | 2.019 | 128 | `i18n/hi/review/report.md` |
| Tiếng Việt (bản gốc) | practical-localizer, translating-products, localizing-software… | 2.019 | chỉ báo cáo, chưa sửa | `Dịch Thuật/bao-cao-tieng-viet.md` (36 vấn đề) |

Các chỗ sửa nằm trong `i18n/<ngôn ngữ>/review/fixes.json` và đã áp vào `units.json` / `names.json`. Bản trước khi sửa giữ ở `review/before-*.json`.

## Lỗi chung đã sửa ở nhiều ngôn ngữ
- **Câu bị thẻ HTML cắt thành mảnh, ghép lại sai ngữ pháp.** Đây là lỗi nhiều nhất, gặp ở trang Giới thiệu, Vest nữ, Dịch vụ, May đo, Tư vấn, các trang phụ kiện và giỏ hàng.
- **"Gần 1 Nửa Thế Kỷ"** từng hiện thành "1 half a century" ở mọi ngôn ngữ. Giờ câu này được dịch nguyên câu: Nearly Half a Century / 近半个世纪 / 반세기 가까이 / 半世紀近く / लगभग आधी सदी.
- **"Cổ lá sen"** từng bị dịch từng chữ ("lá sen"). Đã sửa thành thuật ngữ đúng là cổ Peter Pan.
- **Thuật ngữ và tên màu chưa thống nhất.** Đã gom về một cách gọi. Tên sản phẩm đặt màu theo đúng trật tự của từng ngôn ngữ.
- **Mô tả meta bị cắt giữa câu.** Đã viết lại thành câu hoàn chỉnh.
- **Tiếng Nhật: 6 nút và tiêu đề "Tư Vấn…" bị lệch dòng** (nhận nhầm bản dịch của dòng bên cạnh). Đã sửa.
- **Sai nghĩa** như "đối tác" thành "khách hàng" và "tiếp nhận đồ" thành "giao hàng". Tiếng Hindi: đổi "da bò" sang "cowhide leather" để tránh nhạy cảm văn hóa.

## Chủ shop đã chốt (04/11/2026, bản p10)
- **"K" = khuy.** "BE 2K" là be 2 khuy. Cả 5 ngôn ngữ dịch thành số khuy: 2-BUTTON / 两粒扣 / 2버튼 / 2つボタン / 2 बटन.
- **"Tuyết mưa" được dịch tên vải.** Theo các nguồn tiếng Việt (may10.vn, mitritex.vn, fptshop.com.vn), đây là vải dệt kim đôi (đan đôi) pha polyester–rayon/viscose–spandex, tên quốc tế **Ponte di Roma** (ponte knit). Tên dùng: Ponte Knit / 罗马布 / 폰테 원단 / ポンチ素材 / पोंटे निट. Nếu vải thực tế của shop là vải dệt thoi khác thì phải đổi lại.
- **Sửa mâu thuẫn bản tiếng Việt: đồng ý.** Đang chờ chủ shop chốt số liệu thật (năm, bảo hành, số đo, đổi trả).

## Cần chủ shop quyết (danh sách ban đầu)
1. **"BE 2K/4K/6K"** trong tên vest nữ thiết kế: K có phải là số khuy không? Tiếng Anh, Trung và Nhật đã hiểu là số khuy; tiếng Hàn và Hindi giữ chữ "K".
2. **"Tuyết Mưa"** (dòng vải): giữ tên tiếng Việt hay đặt tên dịch?
3. **Nội dung gốc tiếng Việt mâu thuẫn**, xem `bao-cao-tieng-viet.md`:
   - số năm kinh nghiệm và năm thành lập;
   - bảo hành trọn đời hay 12 tháng;
   - 25 hay 30+ số đo;
   - đổi trả 30 ngày, freeship;
   - các khẳng định khó chứng minh.

   Các chỗ này sửa ở bản tiếng Việt, tức là trên web thật, nên cần chủ shop đồng ý.
4. **Phần không sửa được trong từ điển dịch:**
   - chữ "TP.";
   - "Qatar";
   - "Fanpage 1: LH Veston";
   - một chú thích HTML lộ trên trang Dịch vụ;
   - khóa "Bộ sưu tập" dùng chung với menu.

   Cần sửa ở HTML gốc hoặc công cụ dựng trang.

## Lưu ý
Rà soát do AI làm theo phương pháp của các skill, không thay thế người bản ngữ. Trước khi đăng web thật, nên nhờ người bản ngữ từng thứ tiếng đọc lại.
