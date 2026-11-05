# Prompt cho Antigravity: làm lại trang Dịch Vụ (`dich-vu.html`) theo hướng cao cấp, 06/11/2026

## Phạm vi
- Làm cho **cả điện thoại và máy tính**. Giao diện Light Luxury giống trang May Đo bản mới:
  - nền trắng sứ / kem ngà;
  - chữ đen `#15110e` và đỏ `#9d0208`;
  - viền vàng `#a17f22`, chỉ dùng làm đường viền, không dùng cho chữ nhỏ.
- Chỉ làm trên bản thử. Không đăng VPS.
- Kế hoạch đầy đủ: `docs/dich-vu-cao-cap-plan-20261106.md`.

## Việc của Antigravity ở lượt này: chỉ tạo ảnh
Cần 7 ảnh, PNG, không có chữ, số, logo hay mũi tên trong ảnh. Nhãn do HTML đặt dưới ảnh.

| # | Tên file | Nội dung | Kích thước |
|---|---|---|---|
| S1 | `s1-sua-phom-so-sanh.png` | So sánh. Trái: vest sửa vụng, eo nhăn, vai lệch. Phải: vest sau chỉnh phom, phẳng, ôm dáng. Cùng người mẫu, cùng góc. | 1600×1000 |
| S2 | `s2-cham-soc-so-sanh.png` | So sánh. Trái: vest nhàu, ve gãy, vải bóng do ủi sai. Phải: vest sau hấp định hình, ve cuộn mềm. Treo trên ma-nơ-canh. | 1600×1000 |
| S3 | `s3-thue-vest-so-sanh.png` | So sánh. Trái: vest thuê đại trà, rộng thùng thình, vải cũ. Phải: vest thuê cao cấp, vừa người, vải mới. | 1600×1000 |
| S4 | `s4-goi-cuoi.png` | Chú rể và hai người thân mặc vest navy/ghi đồng bộ trong showroom ấm, sang. Không phải ảnh so sánh. | 1600×1000 |
| Q1 | `q1-tiep-nhan.png` | Thợ kiểm tra áo vest trên bàn gỗ, kính lúp, thước dây. | 1200×900 |
| Q2 | `q2-thuc-hien.png` | Bàn tay thợ khâu tay mép ve. | 1200×900 |
| Q3 | `q3-ban-giao.png` | Vest treo trong túi bảo quản cao cấp, móc gỗ. | 1200×900 |

## Quy tắc ảnh
- Ảnh so sánh: trái là lỗi, phải là chuẩn. Hai nửa chia đều, giữa có khe kem mảnh. Lỗi phải nhìn rõ khi thu ảnh về 360px ngang.
- Phong cách: ảnh chụp thật, ánh sáng studio dịu, tông kem, ngà và nâu gỗ. Người mẫu là người Việt.
- Ảnh không được trông như ảnh một khách hàng thật. Trang sẽ ghi "Ảnh minh họa".

## Bàn giao
- Lưu ảnh vào thư mục `images/dich-vu-cao-cap-20261106/`.
- Kèm `manifest.json` ghi prompt đã dùng và `no_text_verified` cho từng ảnh.
- Không sửa HTML. Claude/Codex sẽ:
  - dựng trang;
  - dịch sang 5 ngôn ngữ;
  - kiểm tra ở khổ 320, 390, 1366;
  - đưa lên bản thử GitHub.

*File này là tài liệu bàn giao. Tạo file không có nghĩa là đã gửi cho Antigravity.*
