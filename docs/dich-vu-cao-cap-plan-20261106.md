# Kế hoạch làm lại trang Dịch Vụ theo hướng cao cấp (06/11/2026)

## Chủ shop đã chốt
- Bỏ toàn bộ trang cũ, làm lại từ đầu. Mọi dịch vụ được định vị là dịch vụ cao cấp, giá cao.
- Trang gồm 4 nhóm:
  1. Sửa & tinh chỉnh phom.
  2. Chăm sóc & giặt hấp.
  3. Thuê vest cao cấp.
  4. Gói trọn gói mới.
- Giá: mỗi bậc ghi "từ …". **Chủ shop cung cấp giá.** Không tự đặt giá.
- "Sửa miễn phí" và "Hấp ủi miễn phí khi mua vest": không làm tiêu đề nữa. Chuyển thành **đặc quyền dành cho khách đã may hoặc mua vest tại mayLEHUONG**.
- Làm cho cả điện thoại và máy tính, đủ 6 ngôn ngữ. Làm trên bản thử GitHub trước, VPS chỉ đổi khi chủ shop nói "đăng lên web/VPS".

## Vấn đề của trang cũ
- Tiêu đề lớn đều nói "miễn phí" hoặc "chỉ từ 500.000đ", tức là định vị giá rẻ.
- Có 4 khối "vì sao chọn", 1 khối quy trình và 1 khối SEO nhắc lại đúng 3 dịch vụ, nên nội dung lặp nhiều.
- Không có bậc dịch vụ, không có ảnh tay nghề, không có ảnh so sánh.

## Cấu trúc trang mới (theo mẫu trang May Đo)
1. **Phần đầu trang:** H1 "Dịch vụ âu phục cao cấp tại Biên Hòa và Hà Nội". Hai nút "Đặt lịch tư vấn" và "Xem bảng giá dịch vụ". Bốn con số thật đã chốt: hơn nửa thế kỷ, bảo hành đường may trọn đời, 25 số đo, 2 showroom.
2. **Thanh chuyển nhanh** giữa 4 nhóm dịch vụ.
3. **Mỗi nhóm dịch vụ có:**
   - một đoạn nêu vấn đề khách gặp;
   - ảnh so sánh "nơi khác | mayLEHUONG", nhãn đặt dưới ảnh, không có chữ trong ảnh;
   - 2–3 thẻ bậc dịch vụ. Mỗi thẻ ghi: tên bậc, làm những gì, ai làm (thợ cả hay thợ chuyên), thời gian, "từ … đ".
4. **Đặc quyền khách mayLEHUONG:** sửa vest miễn phí và hấp ủi miễn phí cho vest đã may hoặc mua tại shop, kèm bảo hành đường may trọn đời.
5. **Quy trình 4 bước** (tiếp nhận → kiểm tra → thực hiện → bàn giao và hướng dẫn bảo quản), mỗi bước một ảnh.
6. **Câu hỏi thường gặp:** tối đa 6 câu, đánh dấu Schema FAQ.
7. **Phần SEO Biên Hòa:** viết lại ngắn theo hướng cao cấp, giữ địa chỉ và từ khóa.
8. **Khối kêu gọi cuối trang:** tư vấn, Zalo, hotline.

## Đề xuất bậc dịch vụ (chủ shop sửa và điền giá)
Giá KiotViet hiện có chỉ để tham khảo: sửa 250k / 700k / 1tr, hấp 50k / 100k, thuê "từ 500k" trên web cũ.

| Nhóm | Bậc đề xuất | Nội dung | Giá "từ" |
|---|---|---|---|
| Sửa & tinh chỉnh | Tinh chỉnh | Lên/xuống gấu, ống tay, lai quần | ? |
| | Chỉnh phom | Bóp eo, hạ size, chỉnh vai, chỉnh lưng | ? |
| | Tái cấu trúc / phục hồi | Vest cũ hoặc vest hãng: dựng lại phom, thay lót, thùa khuyết tay | ? |
| Chăm sóc & giặt hấp | Hấp định hình | Hấp hơi, ủi phom 3D | ? |
| | Giặt khô cao cấp | Giặt khô, xử lý vết bẩn, hấp định hình | ? |
| | Chăm sóc trọn gói | Giặt, phục hồi phom, thay cúc, bọc bảo quản | ? |
| Thuê vest | Tiêu chuẩn | ? | ? |
| | Cao cấp | ? | ? |
| | Thiết kế / sự kiện | ? | ? |
| Gói trọn gói | Ví dụ gói Cưới (chú rể + gia đình), gói Doanh nhân | ? | ? |

## Việc cần chủ shop gửi trước khi làm
1. Giá "từ" của từng bậc. Sửa hoặc bỏ những bậc chưa đúng.
2. Gói trọn gói cụ thể: tên gói, gồm những gì, giá.
3. Thời gian thực hiện của từng bậc (ví dụ: hấp trong ngày, sửa 2–3 ngày).
4. Thuê vest: điều kiện cọc có muốn ghi lên trang không. Nghiệp vụ cọc trong Admin đã chốt: tiền mặt bằng giá trị vest, hoặc giữ căn cước.

## Các bước làm
1. Viết `PROMPT-ANTI-DICH-VU-CAO-CAP-20261106.md`. Xong.
2. Tạo ảnh so sánh và ảnh quy trình, không có chữ trong ảnh (Antigravity tạo, hoặc chủ shop gửi ảnh thật).
3. Dựng HTML bằng công cụ `tools/dich_vu_v2_20261106.py`, chạy trên nguồn tiếng Việt. Giữ nguyên head SEO, canonical và schema có sẵn, chỉ cập nhật cho đúng nội dung mới.
4. Dịch sang 5 ngôn ngữ, build strict 0 chuỗi thiếu.
5. Kiểm tra ở khổ 320, 390, 1366: không tràn ngang, quét tương phản, không có chữ đè lên ảnh, nút bấm không nổi cả hàng.
6. Đưa lên bản thử GitHub, chờ chủ shop duyệt rồi mới hỏi về VPS.
