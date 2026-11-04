# Prompt: khối "Sẵn mẫu tại showroom" trên điện thoại (05/11/2026)

## Yêu cầu của chủ shop
Khối `#mlh-featured-catalog-links` trên trang chủ ("SẴN MẪU TẠI SHOWROOM BIÊN HÒA – Mẫu Áo Vest Nữ & Bộ Vest Nam Thiết Kế Tiêu Biểu") **phải làm lại vì kéo quá nhiều**.
- **Phạm vi: chỉ điện thoại** (`index-mobile.html`, ≤ 767px). Máy tính (`index.html`) giữ nguyên.

## Hiện trạng
- 12 thẻ sản phẩm xếp dọc, mỗi thẻ một hàng (lưới `minmax(260px, 1fr)` nên điện thoại chỉ được 1 cột).
- Phải cuộn khoảng 12 hàng mới qua hết khối. Tên mẫu dài bị cắt.

## Cách làm
- Đổi thành **một hàng vuốt ngang** (scroll-snap):
  - mỗi thẻ rộng khoảng 42% màn hình, nên thấy khoảng 2,3 thẻ; thẻ thứ ba lộ một phần để khách biết còn vuốt được;
  - thẻ xếp dọc: ảnh 4:5 ở trên, tên mẫu tối đa 2 dòng, giá ở dưới.
- Khối chỉ cao bằng **1 hàng thẻ** thay cho 12 hàng.
- Giữ nguyên:
  - tiêu đề, dòng "Xem trọn bộ … sản phẩm →";
  - 12 liên kết, ảnh, chữ, giá;
  - thứ tự thẻ, thuộc tính `alt`, cách tải ảnh lười (lazy).
- Chỉ thêm một khối CSS riêng `<style id="mlh-featured-mobile-swipe">` trong `@media (max-width: 767px)`. Không sửa HTML thẻ, CSS hay JS dùng chung.
- Ẩn thanh cuộn ngang. Vuốt bằng ngón tay phải mượt. Không làm tràn ngang cả trang.
- Màu chữ giữ nguyên (đen `#141210`, giá đỏ `#9d0208` trên nền trắng). Chữ không được chìm vào nền.

## Tiêu chí kiểm tra
- Ở 320, 390 và 430px:
  - khối chỉ cao 1 hàng;
  - vuốt qua đủ 12 thẻ;
  - không tràn ngang trang, không lỗi JS;
  - tên mẫu không bị cắt giữa chữ (tối đa 2 dòng, có dấu "…").
- Ở 1366px: trang máy tính không đổi (so khớp từng byte `index.html`).
- Bản dịch EN/中文/한국어/日本語/हिन्दी chỉ đổi CSS, chữ giữ nguyên.

## Phát hành
Lượt này chỉ đưa lên bản thử GitHub. Chỉ đăng lên VPS khi chủ shop nói rõ "đăng lên web/VPS".

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*

## Bổ sung: thẻ kiểu phụ kiện, tự chạy (05/11/2026)
Chủ shop gửi ảnh thẻ phụ kiện trên trang chủ ("Cài Ve Áo", "Sơmi Nam": ảnh lớn, tên chữ serif căn giữa, nút đỏ "XEM BỘ SƯU TẬP"). Yêu cầu khối mẫu tiêu biểu làm thẻ như vậy, **tự chạy ngang**.

Phạm vi: vẫn chỉ điện thoại.
- **Thẻ:**
  - nền trắng, bo góc 16px, ảnh vuông phủ kín;
  - tên mẫu chữ serif đen căn giữa, tối đa 2 dòng, giá đỏ `#9d0208`;
  - nút đỏ `#9d0208` chữ trắng in hoa "Xem chi tiết". Nút này là phần của liên kết sẵn có, không thêm liên kết mới. Chữ có bản dịch 6 ngôn ngữ.
- **Tự chạy:**
  - cứ khoảng 3 giây hàng thẻ trượt sang thẻ kế tiếp; hết hàng thì quay về đầu;
  - khách chạm hoặc vuốt thì dừng, 6 giây sau chạy tiếp;
  - dừng khi khối ra khỏi màn hình hoặc tab bị ẩn;
  - không chạy khi máy bật giảm chuyển động (`prefers-reduced-motion`);
  - chỉ chạy ở ≤ 767px.
- Không thêm thư viện. JS nhỏ trong `<script id="mlh-featured-autoplay">`. Không sửa JS/CSS dùng chung và không sửa `index.html`.
