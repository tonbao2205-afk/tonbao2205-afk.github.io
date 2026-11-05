# Prompt cho Antigravity: sửa lỗi bấm một nút làm cả hàng nút nổi lên (05/11/2026)

## Lỗi chủ shop báo
Trang May Đo, khối đầu trang: rê chuột hoặc bấm nút "Đặt lịch tư vấn" / "Xem bảng vải" thì cả khung chứa 2 nút hiện nền kem và bóng đỏ, như thể cả hàng là một nút.

## Nguyên nhân
- `luxury-animations.js` gắn class `lux-h-cta` cho phần tử cha của nút đầu tiên trong khối đầu trang.
- `initButtons()` sau đó chọn `[class*="cta"]`, nên khớp luôn khung cha `lux-h-cta`, rồi gắn `lux-btn`. Hiệu ứng `.lux-btn:hover` làm cả khung nổi lên và có bóng.
- Cùng lỗi ở trang chủ (cả khung banner `lh-hero-carousel`), Dịch Vụ (`seo-dv-unified-cta`), Giới Thiệu và Tư Vấn.

## Phạm vi
- Cả điện thoại và máy tính: đây là lỗi hiệu ứng dùng chung, không đổi thiết kế.
- Chỉ sửa `initButtons()`: bỏ qua phần tử nào chứa `a` hoặc `button` bên trong (vì đó là khung chứa, không phải nút).
- Áp dụng cho:
  - `luxury-animations.js`;
  - 2 gói JS trang chủ: tạo file mới hậu tố `-20261105-luxbtn.js`, không ghi đè file cũ; chỉ đổi đường dẫn trong `index.html` và `index-mobile.html`.
- Không đổi màu, kích thước hay hiệu ứng của từng nút riêng lẻ.

## Tiêu chí kiểm tra
- Rê chuột hoặc nhấn từng nút: chỉ nút đó nổi lên, khung xung quanh không hiện nền hay bóng.
- Trên các trang chủ, May Đo, Dịch Vụ, Giới Thiệu, Tư Vấn: không còn phần tử `.lux-btn` nào chứa `a` hoặc `button` bên trong.
- Kiểm tra ở khổ 390 và 1366: không lỗi JS, không tràn ngang.

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*
