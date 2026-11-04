# Báo cáo rà soát bản dịch tiếng Hàn – mayLEHUONG (04/11/2026)

## Phạm vi và phương pháp
- Đã rà **2.019 mục**: 1.832 mục trong `units.json` và 187 tên sản phẩm trong `names.json`. Trong đó 143 mục là đường dẫn ảnh, mã hoặc chú thích CSS, được giữ nguyên và chỉ kiểm tra cấu trúc.
- Áp dụng phương pháp của các skill:
  - `translating-products`: dùng `GLOSSARY.md` làm bối cảnh đã duyệt.
  - `reviewing-translations`: rà 6 lượt (nghĩa, thuật ngữ, ngôn ngữ, định dạng theo vùng, cấu trúc, bề mặt hiển thị).
  - `translating-core`, `translating-web`, `translating-marketing`.
  - `translating-korean`: kính ngữ 합니다/하세요, trợ từ, đơn vị đếm, khoảng cách.
  - `practical-localizer`: review-methodology, ui-fit, locale-formatting.
- Đối chiếu ngữ cảnh thật: so các trang tiếng Hàn đã dựng (`.codex-local/i18n-preview-20261104/site/ko/`) với trang gốc tiếng Việt, và đọc các câu bị thẻ HTML cắt thành nhiều mảnh sau khi ghép lại.
- **Kết quả: 147 mục cần sửa** (115 khóa trong units, 34 khóa trong names; 2 khóa có ở cả hai file). File sửa là `i18n/ko/review/fixes.json`; chưa ghi đè vào units hay names.
- Kiểm tra tự động đạt:
  - mọi khóa đều tồn tại;
  - placeholder `{N1} {C1} {D1}…` khớp;
  - không có giá trị rỗng;
  - giữ nguyên đ/₫, tên thương hiệu, tên đường và tên phường.

## Nhóm lỗi chính
1. **Câu bị cắt mảnh, ghép lại đọc sai (lỗi nặng nhất, khoảng 45 mục).**
   - Người dịch trước thêm "다음…:" hoặc để thiếu trợ từ, nên câu ghép lại vô nghĩa.
   - Gặp ở trang Giới thiệu, Vest nữ, Dịch vụ, May đo, Tư vấn, 8 trang phụ kiện và giỏ hàng.
   - Đã viết lại từng mảnh để câu ghép tự nhiên. Không đặt trợ từ ở đầu mảnh, vì trang tự chèn dấu cách sau mỗi thẻ.
2. **Thuật ngữ không thống nhất.** Mỗi cặp dưới đây đang dùng lẫn hai cách viết; đã chọn một cách cho mỗi thuật ngữ:
   - 슈트 / 수트
   - Bespoke / 비스포크
   - 롱 스커트 / 롱스커트
   - 크림 아이보리 / 아이보리
   - 슬리브 / 소매
   - "패턴 베이지" / "베이지 패턴"
   - "XL · 스탠다드" / "L · 일반"
   - "Tuyết mưa" có tới ba cách viết.
3. **Trật tự tên sản phẩm.**
   - Một số tên đặt màu ở cuối như tiếng Việt; đã đưa màu lên trước giống các tên khác.
   - Tên giày Tây trộn chữ Latin không tự nhiên; đã đổi sang cách gọi tiếng Hàn.
4. **Sai hoặc lệch nghĩa nhỏ.**
   - "đối tác" bị dịch thành khách hàng.
   - "tiếp nhận sản phẩm" bị dịch thành "giao hàng".
   - "cúc song song" bị dịch máy móc.
   - "tạm đóng" bị dịch thành "nghỉ kinh doanh" (휴업).

## Ví dụ trước → sau
| Tiếng Việt | Trước | Sau | Giải thích |
|---|---|---|---|
| Hãy để những chuyên gia của **mayLEHUONG** tư vấn chọn mẫu Cà Vạt… | 다음 전문가들에게 맡겨 주세요: mayLEHUONG 고객님의 정장에… | 믿고 맡겨 주세요. mayLEHUONG 전문가가 고객님의 정장에… 도와드립니다. | Câu ghép cũ vô nghĩa (8 trang phụ kiện và 2 trang vest) |
| Nắm bắt cơ hội… đặt viên gạch khôi phục **Làng nghề Từ Thuận (Hà Nội)**. | …다음을 되살리는 첫 벽돌을 놓은 선구자가 되었습니다: Từ Thuận… 마을 (하노이). | …선대는 선구자로서 하노이 Từ Thuận 양복 공예 마을을 되살리는 첫 벽돌을 놓았습니다. | Bỏ cấu trúc "다음…:" gượng ép |
| Bạn cần mua thêm **X₫** để được **MIỄN PHÍ VẬN CHUYỂN** | 추가로 구매하셔야 할 금액 X₫ 더 구매하시면 무료 배송 | 앞으로 X₫ 더 구매하시면 무료 배송 | Câu cũ lặp ý, sai ngữ pháp |
| Quý khách đã đủ điều kiện **MIỄN PHÍ VẬN CHUYỂN**! | 고객님은 다음 혜택 대상입니다 무료 배송! | 이번 주문은 무료 배송! | Câu cũ đứt gãy |
| 1. Đặt lịch tư vấn tại **mayLEHUONG** có mất phí không? | 1. 상담 예약 시 mayLEHUONG 비용이 드나요? | 1. 상담을 예약하면 mayLEHUONG 상담료가 발생하나요? | Thiếu liên kết giữa các mảnh |
| Chưa tìm được **phong cách phù hợp**? | 아직 찾지 못하셨나요 알맞은 스타일을 ? | 아직 찾지 못하셨나요, 나에게 꼭 맞는 스타일? | Trật tự từ sai khi ghép |
| Hài Lòng Với **Phong Cách Vest Nam Trẻ** | 만족도 남성 정장 스타일 | 만족스러운 젊은 감각의 남성 정장 스타일 | Tiêu đề cũ vô nghĩa |
| Gần 1 Nửa Thế Kỷ Định Hình Quý Ông Việt | 1 반세기 가까이… | 1/2세기 가까이 베트남 신사의 품격을 빚어 오다 | Số "1" đứng trơ trọi |
| Đồng hành trọn đời cùng quý đối tác. | 고객님과 평생 함께합니다. | 파트너사와 평생 함께합니다. | Trang đồng phục doanh nghiệp: đối tác khác khách lẻ |
| Trang Blazer hiện tạm đóng. | …현재 임시 휴업 중입니다. | …현재 잠시 운영을 중단했습니다. | 휴업 là cửa hàng nghỉ kinh doanh, không hợp với trang web |
| Bộ Vest Nam Thiết Kế Be Cát | 남성 디자이너 정장 세트 샌드 베이지 | 샌드 베이지 남성 디자이너 정장 세트 | Thống nhất đặt màu trước |
| Giày Tây Nam Penny Loafer Da Bò Màu Đen | 남성 구두 Penny Loafer 소가죽 블랙 | 블랙 소가죽 페니 로퍼 남성 구두 | Tên giày tự nhiên theo kiểu Hàn |

## Rủi ro còn lại – cần người bản ngữ Hàn xem
- Đây là rà soát của AI, **không thay thế người Hàn bản ngữ**. Sau khi áp dụng fixes.json, nên nhờ người bản ngữ đọc lại trang Giới thiệu, Vest nữ và Dịch vụ.
- Một số câu ghép vẫn phải dùng dấu "—" hoặc ":" vì thứ tự các mảnh là cố định. Đọc hiểu được nhưng chưa thật mượt. Ví dụ:
  - "남부 시장으로 진출해 쇼룸을 열었습니다 — TP. 비엔호아 (동나이)"
  - "현지 시장인 동나이 비엔호아, mayLEHUONG 브랜드는…"
- Một số chuỗi **không nằm trong units**, nên trang vẫn lộ tiếng Việt hoặc chữ viết tắt:
  - "TP. 비엔호아 (동나이)" (chữ "TP.");
  - "Fanpage 1: LH Veston";
  - "Qatar" (chưa phiên âm thành 카타르).
  
  Cần bổ sung các khóa này trong công cụ dựng trang.
- Chưa rõ ký hiệu "2K/4K/6K" trong tên mẫu vest nữ thiết kế nghĩa là gì (có thể là số khuy). Đã giữ nguyên "베이지 {D2}K" cho thống nhất, không đoán nghĩa; chủ shop nên xác nhận.
- "Tuyết Mưa" (loại vải) đang giữ chữ Latin như tên dòng sản phẩm. Nếu muốn dùng tên tiếng Hàn thì cần chốt một tên duy nhất.
- Mô tả meta bị cắt dở ngay ở nguồn (ví dụ "…tạo điểm.") vẫn được dịch đúng theo chỗ cắt; nên sửa ở nguồn tiếng Việt.
- Chưa kiểm tra hiển thị thực tế trên điện thoại (chữ tràn khỏi nút hoặc menu); mới đo độ dài chuỗi, chưa xem trên trình duyệt.
