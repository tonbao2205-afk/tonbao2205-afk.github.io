# Prompt: bảng giá vải thay phần "Tuyệt Tác May Đo Thủ Công" (`may-do.html`), 05/11/2026

## Yêu cầu của chủ shop
- "Phần Tuyệt Tác May Đo Thủ Công xóa đi, thay vào các bảng vải bên mình đang có, ghi các thông số vải vào."
- "Lấy 1 ảnh đại diện để họ bấm vào xem vải đó có những màu nào."
- "Ghi rõ ràng giá cả."
- Phạm vi: **cả điện thoại và máy tính**, theo lần thiết kế lại trang May Đo đã chốt.
- Lượt này đưa lên bản thử GitHub. VPS chỉ đổi khi chủ shop nói "đăng lên web/VPS".

## Nguồn dữ liệu (không tự bịa)
- **Ảnh mẫu:** `images/bang-vai-mau-chuan/catalog.json`, 13 quyển, 239 mẫu. Mỗi ảnh có nhãn in sẵn: mã vải và dòng thông số (thành phần, định lượng, xuất xứ).
  - Dòng thông số được chép nguyên văn theo nhãn, giữ tiếng Anh như trên nhãn.
- **Giá:** giá niêm yết sản phẩm KiotViet (đọc ngày 05/11/2026, chỉ đọc).
  - Roger La Viale 18.000.000
  - LOUIS-12L ENGLAND 12.000.000
  - DONATELLA 10500 10.500.000
  - NS10500 10.500.000
  - DONATELLA 9300 9.300.000
  - GAZZARINI UOMO 9000 9.000.000
  - LC9000 9.000.000
  - CEZARO7000 7.000.000
  - ICHN 02/04/07 5.500.000
  - TRS6500-01/02/03 5.500.000
- **Ảnh đại diện:**
  - Dùng ảnh bìa chủ shop chụp (`images/Bảng Vải Và Gía Tiền`) cho Roger, Louis, Donatella 10500, New Sample, Gazzarini và Cezaro.
  - Các quyển còn lại: ghép 4 dải màu cắt từ ảnh mẫu của chính quyển đó.
- **Roger La Viale:** chưa có ảnh từng màu. Thẻ ghi "xem quyển mẫu tại showroom".

## Giao diện
- Xóa trọn section `#tuyet-tac-may-do`, popup `#suitLightboxModal` và script của nó. CSS cũ không còn tác dụng thì để nguyên.
- Section mới `#bang-gia-vai` (H2 "Bảng giá vải may đo"), đặt đúng vị trí cũ.
- Mỗi quyển là một thẻ gồm:
  - ảnh đại diện;
  - giá đỏ đậm;
  - tên (H3);
  - dòng thông số theo nhãn;
  - số mẫu màu;
  - nút "Xem màu vải".
- **Bố cục thẻ:**
  - Máy tính: 3 cột.
  - Máy tính bảng: 2 cột.
  - Điện thoại: thẻ ngang, ảnh bên trái và chữ bên phải.
- **Popup** (bấm ảnh hoặc nút):
  - Lưới ảnh nhỏ của mọi màu, mỗi ảnh ghi mã và thông số nhãn.
  - Bấm một ảnh thì phóng to ảnh gốc có nhãn, kèm nút trước/sau.
  - Đóng bằng Esc, nút ×, hoặc bấm nền. Khóa cuộn nền khi popup mở.
- Ảnh WebP tự tạo, tải lười. Ảnh nhỏ 330px, ảnh phóng 600px, nằm ở `/assets/may-do-bang-vai-20261105/`.
- Light Luxury: nền kem, chữ `#15110e`, giá `#9d0208`. Chữ không chìm nền; quét tương phản ở 390 và 1366.
- Ghi chú dưới bảng: giá niêm yết, nhân viên xác nhận khi tư vấn; màu màn hình có thể khác vải thật.

## Kiểm tra
- Đúng 1 H1; biểu mẫu 6 trường giữ nguyên.
- Mở và đóng popup, phóng ảnh, trước/sau, Esc.
- 320/390/1366: không lỗi JS, không tràn ngang.
- Dựng chặt 6 ngôn ngữ, không thiếu câu.

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*
