# Báo cáo rà soát bản dịch tiếng Nhật — mayLEHUONG (04/11/2026)

## Phạm vi và phương pháp
- Rà **2019 mục**: toàn bộ 1832 chuỗi (`units.json`) và 187 tên sản phẩm (`names.json`). Mỗi mục được đối chiếu với tiếng Việt gốc, bản tiếng Anh tham khảo và `GLOSSARY.md`.
- Đọc lại các trang tiếng Nhật đã dựng để xem các mảnh câu khi ghép lại trên trang: index, may-do, dong-phuc, dich-vu, gioi-thieu, products, vest-nu, vest-nam-tre, phu-kien…, tu-van, cart.
- Áp dụng quy trình của 4 skill:
  - `reviewing-translations`: rà nhiều lượt về nghĩa, thuật ngữ, ngôn ngữ, định dạng theo vùng và cấu trúc.
  - `translating-japanese`: kính ngữ, trật tự câu, nút bấm ngắn gọn.
  - `practical-localizer`: chữ có vừa giao diện không, dấu câu toàn độ rộng / bán độ rộng.
  - `yomiyasu`: bỏ văn phong "dịch máy". Đã chạy `yomiyasu_lint.py`; công cụ chủ yếu báo dấu "：" cuối nhãn và emoji, đều có sẵn trong bản gốc nên giữ nguyên.
- Kiểm tra tự động:
  - Mọi khóa đều tồn tại, placeholder `{N1} {C1} {D1}…` giữ đủ, không có giá trị rỗng.
  - Không đổi đường dẫn ảnh, CSS, tên thương hiệu, đ/₫/VNĐ, tên đường và tên phường.

## Kết quả
- **Sửa 106 mục** (99 chuỗi + 7 tên sản phẩm), lưu ở `i18n/ja/review/fixes.json`.
- Khoảng 95% còn lại đạt: lịch sự đúng kiểu です・ます, thuật ngữ khớp glossary.

## Các nhóm lỗi chính và ví dụ (trước → sau)

### 1. Lệch dòng: bản dịch bị trượt 1 ô
6 tiêu đề/nút "Tư Vấn…" nhận nhầm bản dịch của dòng bên cạnh, nên hiện sai trên may-do, dong-phuc và trang chủ.
- "Tư Vấn & Đặt Lịch": オーダーメイドのご相談 → **ご相談＆ご予約**
- "Tư Vấn Ngay": コーディネート相談＆ (bị cụt) → **今すぐ相談**
- "Tư Vấn & Thiết Kế Riêng": ご相談＆ご予約 → **個別相談＆オリジナルデザイン**

### 2. Mảnh câu ghép lại sai ngữ pháp hoặc vô nghĩa
- Trang chủ, "Gần 1 Nửa Thế Kỷ…": ほぼ1半世紀 → **ほぼ1/2世紀にわたり、ベトナムの紳士を形づくる**
- 10 trang danh mục: 「専門家集団 mayLEHUONG お客様に…」 → **「経験豊かな mayLEHUONG の専門家が、お客様に…」**
- Trang products: 「まだ見つからない ぴったりのスタイル?」 → **「お気に入りの スタイルがまだ見つかりませんか?」**
- Trang vest-nu: 「…23デザイン をご試着いただけるほか、サービス …」 → **「…を店頭でご試着いただけるほか、…のオーダーメイドも、アジア人の体型に合わせて承ります。」**
- Giỏ hàng:
  - 「お客様は次の対象です： 送料無料!」 → **「条件達成： 送料無料!」**
  - 「あと X₫ 以上のご購入で」 → **「あと X₫ のご購入で」**

### 3. Sai nghĩa hoặc sai thuật ngữ thời trang
- "Cổ lá sen" (cổ Peter Pan): ロータスリーフカラー / ハスの葉カラー (dịch từng chữ) → **ピーターパンカラー** (8 mục)
- "Thử vest hoặc tiếp nhận sản phẩm" (shop nhận đồ của khách): お受け取り → **お預かり**
- "Tương Đối" (độ vừa của đồ may sẵn): 目安 → **標準的**
- "Quan Trọng" (nhãn bước 4): 必須 (nghĩa là bắt buộc) → **重要**

### 4. Không thống nhất
- "Tuyết mưa" lúc dịch là 霜降り生地, lúc để nguyên tiếng Việt → thống nhất **霜降り生地**.
- "BE 4K" lúc để 4K, lúc dịch 4つボタン → thống nhất **4つボタン**.
- Giỏ hàng dùng lẫn ngoặc nửa độ rộng và toàn độ rộng.

### 5. Mô tả meta bị cắt dở
Khoảng 25 mục kết thúc lơ lửng, ví dụ bằng 「ネクタイを」「留めて」「、」. Đã viết lại thành câu hoàn chỉnh.

### 6. Văn phong "dịch máy"
- 「初日のようにぴったり」 → **「仕立てた日のようにぴったり」**
- 「ご相談のお問い合わせ」 → **「ご相談・お問い合わせ」**
- 「{D1}/{D2}に正式に営業を開始」 → **「{D2}年{D1}月に…」**

## Rủi ro còn lại — cần người bản ngữ Nhật kiểm tra
- **"BE 2K/4K/6K"**: đã hiểu K là số khuy, theo bản tiếng Anh "4B". Nếu K mang nghĩa khác thì phải sửa lại 8 mục này.
- **"ほぼ1/2世紀"** là cách viết bắt buộc để giữ placeholder. Nếu bỏ được số "1" trong mã nguồn tiếng Việt thì nên viết **半世紀近く**.
- **Mảnh câu vẫn gượng** do dấu phẩy hoặc chữ tiếng Việt nằm ngoài từ điển. Phải sửa ở HTML hoặc công cụ dựng trang, không sửa được trong từ điển:
  - dich-vu: 「サービスに加えて ビスポーク・オーダーメイド, …」
  - vest-nu: 「拠点： ドンナイ・ビエンホア, mayLEHUONG は…」
  - 「TP.ビエンホア」; "Qatar" và "Vest" chưa được dịch.
  - Chú thích HTML "2. THUÊ -> 3. HẤP ỦI) -->" lộ ra trên trang dich-vu.
- **Danh mục trống**: câu 「現在、商品がないカテゴリー： このカテゴリー」 bị lặp ý. Chưa tìm được ngữ cảnh gốc nên chưa sửa.
- **Cần xác nhận**:
  - "Cổ khăn" đang dịch lẫn スカーフカラー và ショールカラー.
  - Tab "ĐÁNH GIÁ & BẢO HÀNH" theo glossary là ショールームと保証.
- **Cần người Nhật duyệt trước khi đăng**: tên công ty tiếng Nhật (レーフオン・ファッション有限会社) và giọng văn quảng cáo (鎧, 旅…).
