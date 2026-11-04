# Rà soát bản dịch tiếng Trung giản thể — mayLEHUONG (04/11/2026)

## Phương pháp
Áp dụng các skill: `translating-products` (điều phối, dùng GLOSSARY.md làm ngữ cảnh đã duyệt), `reviewing-translations`, `translating-core`, `translating-web`, `translating-marketing`, `translating-chinese` (zh-Hans, thị trường Trung Quốc đại lục) và `practical-localizer` (review-methodology, ui-fit, locale-formatting).

Các lượt kiểm tra:
1. Đọc toàn bộ 1.832 chuỗi `units.json` + 187 tên `names.json`, đối chiếu tiếng Việt gốc.
2. Đọc lại **trang tiếng Trung đã dựng** (trang chủ, giới thiệu, may đo, dịch vụ, đồng phục, tư vấn, vest nữ, vest nam trẻ, sản phẩm, giỏ hàng, cà vạt, chi tiết sản phẩm p01), ghép từng dòng với trang tiếng Việt để thấy các mảnh câu khi ghép lại.
3. Kiểm tra thuật ngữ có nhất quán với GLOSSARY không, tên sản phẩm giữa `units` và `names` có khớp không, kiểm tra nút/CTA ngắn, tiêu đề và mô tả meta.
4. Kiểm tra kỹ thuật bằng Python: khóa giữ nguyên, placeholder `{N}{C}{D}` khớp số lượng, giữ đ/₫/VNĐ, không có chuỗi rỗng.

**Kết quả:** đã rà 2.019 mục và sửa **139 mục** (trong `fixes.json`). Phần còn lại dịch tốt, văn phong sang trọng, tự nhiên.

## Nhóm lỗi chính và ví dụ

**1. Mảnh câu ghép sai (nghiêm trọng nhất, hiện trên hàng trăm trang)**
- Địa chỉ trên ~170 trang sản phẩm bị **mất "Tam Hiệp"**: `…展厅（1797 Nguyễn Ái Quốc，坊，同奈）` → `…展厅（Nguyễn Ái Quốc 路1797号，Tam Hiệp 坊，同奈）及河内展厅现场试穿…`. Câu cũ còn làm mất ý "đặt may đo riêng".
- Mô tả sơ mi lặp chữ "坊": `…路1797号，坊Tam Hiệp 坊）` → `…路1797号，Tam Hiệp 坊）`.
- Trang Giới thiệu có dấu "……" giữa câu: `奠下了重振……的第一块基石 Từ Thuận…` → `老一辈人率先投身复兴Từ Thuận西装手工艺村`.
- Trang Vest nữ: `在市场： 边和，同奈, mayLEHUONG 提供…` → `立足边和，同奈，mayLEHUONG 提供…`.
- Trang Dịch vụ: `除了服务之外 Bespoke高级定制` → `除了高级定制服务，…`.
- Trang Vest nam: `满意于 男士西装风格` (cứng, sai ý) → `寻找心仪的男士西装风格`. Câu `请让 mayLEHUONG 为您挑选…` → `请让 mayLEHUONG 的专家为您挑选…`.
- Câu hỏi bị **hai dấu hỏi**: `尚未找到合适的风格了吗？?` → `尚未找到合适的风格?`.
- Giỏ hàng: `您需要另外购买 500.000₫ 以便获得 免费配送` → `还需再购 500.000₫ 即可享受免费配送`; `顾问 mayLEHUONG 将尽快致电` → `随后，mayLEHUONG 顾问将尽快致电…`.

**2. Dịch sai nghĩa**
- `THIẾT KẾ` (thuộc tính kiểu dáng) bị dịch thành `设计师` (nhà thiết kế) → `设计款`.
- `Vòng Bụng` bị dịch thành `腰围` (vòng eo) → `腹围` (vòng bụng).
- `Ông Sui` bị dịch thành `新郎父亲` (bố chú rể; sai vì có thể là bố cô dâu) → `婚礼长辈`.
- `Công sở tuyết mưa` bị dịch nghĩa đen thành `雪雨` (vô nghĩa) → giữ tên vải: `Tuyết Mưa职业款`, thống nhất với các chỗ khác.
- Nhãn so sánh `Tương Đối` → `大致` (mơ hồ), sửa thành `一般`. Chữ `Từ` (giá từ) dịch là `起` nhưng đứng trước con số nên đọc sai, sửa thành `起价`.

**3. Thuật ngữ và tên sản phẩm chưa nhất quán**
- "Vest Sui Gia" trong tên sản phẩm là `中年男士西装`, nơi khác lại là `婚礼长辈西装` (theo glossary) → thống nhất `婚礼长辈西装` (10 tên).
- `BE 6K/4K/2K` lúc là `米色 6K`, lúc là `米色六粒扣` → thống nhất `米色六粒扣…`.
- "Pastel" dịch máy móc thành `粉彩粉色` → `浅粉色`. `Blazer Burgundy` lúc là `勃艮第红`, lúc là `酒红色` → thống nhất `酒红色`.
- `MÃ` lúc là `SKU`, lúc là `编码` → thống nhất `编码`.
- Tên vest nam thiết kế có dấu cách giữa chữ Hán: `男士设计款西装 沙米色` → `沙米色男士设计款西装`.

**4. Mô tả meta bị cắt cụt:** 14 câu tiếng Việt bị cắt giữa chừng, bản tiếng Trung kết thúc lửng (`…帮助固。`, `…纹样。`, `…出自。`). Đã viết lại thành câu ngắn hoàn chỉnh.

**5. Văn phong, câu cứng:** ví dụ `一套漂亮的西装需要合身于肩、腰、袖和裤长` → `一套好西装，肩、腰、袖长与裤长都需合身`; `服装映照一个人` → `衣如其人`.

## Rủi ro còn lại (cần người bản ngữ hoặc sửa bộ dựng trang)
- **"Gần {D1} Nửa Thế Kỷ"** hiện thành `近1半个世纪`, sai tiếng Trung. Không sửa được trong từ điển vì bắt buộc giữ `{D1}`. Cần sửa ở bộ dựng trang (cho phép bỏ số), nên đổi thành `近半个世纪…`.
- Chữ **`TP.`** còn sót tiếng Việt (`TP.边和（同奈）`, `Showroom TP.`) vì không có trong từ điển; cần bộ dựng trang xử lý.
- **Định dạng giá không đồng nhất:** chỗ hiện `1,850,000₫`, chỗ hiện `3.800.000₫` (giá do JS hiển thị). Nên chuẩn hóa về một kiểu.
- Một số dấu câu ASCII nằm ngoài chuỗi dịch (`.` `,` `?` sau thẻ HTML) vẫn hiện theo kiểu tiếng Việt. Tiêu đề cột `Size` trong bảng size chưa được dịch.
- Tên vải riêng (`Tuyết Mưa`), cách gọi Blazer nữ (đang lẫn giữa `Blazer` và `休闲西装`) và độ sang trọng của các khẩu hiệu nên được người bản ngữ Trung Quốc xem lại trước khi đăng chính thức.
