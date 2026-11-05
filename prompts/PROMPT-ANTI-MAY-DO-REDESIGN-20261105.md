# Prompt: thiết kế lại trang May Đo (`may-do.html`), 05/11/2026

## Yêu cầu của chủ shop
- "Thiết kế lại trang may đo". Phạm vi: **cả điện thoại và máy tính**.
- Làm lại **cả nội dung lẫn thiết kế**.
- **Có ảnh các bảng vải may đo, lấy các bộ đắt tiền.**
- Nội dung phải có **luận cứ H1 → H2 → H3**: nêu vấn đề trước, phân tích rồi mới suy ra kết luận.
- Lượt này đưa lên bản thử GitHub. Chỉ đăng lên VPS khi chủ shop nói rõ "đăng lên web/VPS".

## Mạch nội dung (một H1, các H2 nối nhau thành lập luận)
1. **H1 – May vest theo số đo tại Biên Hòa và Hà Nội.**
   - Mở đầu nêu mục đích trang, kèm 2 nút "Đặt lịch tư vấn" và "Xem bảng vải".
   - Dải 4 dữ kiện đã được chủ shop chốt: 25 số đo, hơn nửa thế kỷ nghề may, bảo hành đường may trọn đời, 2 showroom.
2. **H2 Vấn đề – Vì sao vest may sẵn thường không vừa?**
   - 3 H3: vai/ngực lệch size; tay áo và ống quần sai độ dài; dáng người riêng không có trong bảng size.
   - Kết đoạn: sửa đồ may sẵn chỉ khắc phục được một phần.
3. **H2 Lập luận – May đo giải quyết như thế nào?**
   - 4 H3: đo 25 số đo; chọn vải theo cách mặc; thử đồ và chỉnh trước khi giao; bảo hành đường may trọn đời.
4. **H2 Bằng chứng – Bảng vải cao cấp** (giữ `id="bo-suu-tap-vai"`).
   - 5 thẻ H3: Roger La Viale 18.000.000đ, Louis 12.000.000đ, Donatella 10.500.000đ, New Sample 10.500.000đ, Gazzarini Uomo 9.000.000đ.
   - Mỗi thẻ có ảnh bìa quyển mẫu thật, 4 ô mẫu vải thật (từ `/images/bang-vai-mau-chuan/`), đặc điểm và dòng "Phù hợp".
   - Ghi chú: CERAZO 7.000.000đ cho nhu cầu cơ bản.
5. **H2 Quy trình 4 bước** (H3 từng bước).
6. Giữ nguyên phần **Tuyệt Tác May Đo Thủ Công** (thư viện 10 mẫu, popup và JS) và phần **Các Gói May Đo**.
7. **H2 Kết luận – Khi nào nên chọn may đo?**: danh sách 4 trường hợp, câu suy ra và nút tới biểu mẫu.
8. Giữ nguyên **biểu mẫu tư vấn 6 trường** (ID, payload, handler, thông báo đã chốt 14/10).

## Nguyên tắc về sự thật
- Chất liệu chỉ ghi theo **nhãn quyển mẫu của nhà cung cấp**, có chữ "theo nhãn mẫu":
  - Roger La Viale Aventus: 70/30 Wool/Poly, khổ 58/60";
  - Louis: Made in England;
  - Donatella: Micro Fiber, Made in Italy;
  - New Sample: Italy · England · Germany;
  - Gazzarini Uomo: Made in Italy.
- Bỏ các câu không kiểm chứng được ("Wool 100%, Cashmere, nhập từ Pháp", "tuyệt đối", "vĩnh cửu"). Sửa mâu thuẫn "20+ chỉ số" thành 25 số đo.
- Ghi chú: màu trên màn hình có thể khác vải thật; nên xem quyển mẫu tại showroom.

## Thiết kế
- Light Luxury của web:
  - nền trắng sứ / kem `#fdfaf4` / `#f6efe2`;
  - chữ đen `#15110e`, nhấn đỏ `#9d0208`, viền vàng `#a17f22`;
  - tiêu đề chữ serif (Noto Serif). Chữ không bao giờ chìm vào nền.
- **Máy tính:**
  - mở đầu 2 cột (chữ bên trái, ảnh may đo nam không chữ bên phải);
  - phần vấn đề 3 cột, phần lập luận lưới 2×2;
  - thẻ bảng vải ảnh bên trái, nội dung bên phải.
- **Điện thoại:** mọi phần xếp 1 cột, ảnh mở đầu dạng dọc, ô mẫu vải 4 ô một hàng, không tràn ngang.
- CSS riêng `<style id="mlh-maydo-v2">`, tiền tố lớp `.md2-`. Không sửa CSS hay JS dùng chung.
- Ảnh WebP, tải lười (lazy) trừ ảnh mở đầu. Ảnh bìa quyển mẫu là ảnh thật, đặt ở `/assets/may-do-20261105/`.

## Kiểm tra
- Đúng 1 H1. Thứ tự H2/H3 đúng mạch. Biểu mẫu 6 trường còn nguyên và gửi bị chặn trên bản thử.
- Ở 320/390/430/1366/1920px: không tràn ngang, không lỗi JS. Quét tương phản chữ.
- Bản dịch EN/中文/한국어/日本語/हिन्दी đủ câu mới (dựng chặt, không thiếu câu).

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*
