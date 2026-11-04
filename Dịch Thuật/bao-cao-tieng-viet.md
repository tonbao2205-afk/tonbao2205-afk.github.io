# Báo cáo rà soát chữ tiếng Việt gốc của website mayLEHUONG

Ngày 04/11/2026. **Chỉ báo cáo**: không sửa file nào trên website hay trong `i18n/`. Bản tiếng Việt trên VPS chỉ đổi khi chủ shop quyết định.

## 1. Đã rà soát gì, theo cách nào

- **Dữ liệu**: 1.832 câu chữ tiếng Việt (khóa của `i18n/en/units.json`) và 187 tên sản phẩm (`i18n/en/names.json`). Để biết câu nằm ở trang nào, tôi tra trong bản chụp trang tại `.codex-local/en-site-20261104/vps/web/` (29 trang chính, 187 trang `san-pham/`, các file JS chung).
- **Phương pháp** lấy từ các skill dịch thuật trong `.claude/skills/` (practical-localizer: context-analysis, review-methodology, terminology; translating-core/web/marketing; localizing-software; reviewing-translations). Tôi áp dụng phần "kiểm tra chất lượng nguồn và mức sẵn sàng để dịch":
  1. **Kỹ thuật**: câu bị cắt đôi vì có thẻ HTML/link chen giữa, câu bị ngắt sai ở chữ viết tắt "P.", "TP.", mô tả bị cắt cụt, đường dẫn ảnh hoặc chú thích CSS lọt vào danh sách cần dịch.
  2. **Thuật ngữ**: một khái niệm đang có nhiều cách gọi. Tôi đếm từng dạng rồi đề xuất **chọn một trong các dạng đang có**, không thêm dạng thứ ba.
  3. **Chính tả, dấu, viết hoa** và các cặp câu gần trùng nhau.
  4. **Tuyên bố tiếp thị và cam kết**: những con số hoặc chính sách tự mâu thuẫn, hoặc không có bằng chứng. Phần này bản dịch buộc phải giữ nguyên ý.
  5. **Mức độ** (theo review-methodology): CAO = sai nghĩa, mâu thuẫn hoặc chặn bản dịch; TRUNG BÌNH = thiếu nhất quán, khó dịch; THẤP = trau chuốt câu chữ.
- **Chưa làm**: chưa đọc từng câu trong 187 trang sản phẩm. Mô tả sản phẩm chỉ kiểm theo mẫu, qua các câu lặp lại trong `units.json`. Tôi cũng không kiểm chữ nằm trong ảnh banner.

**Kết quả: 36 vấn đề.** CAO 12, TRUNG BÌNH 16, THẤP 8.

---

## 2. Danh sách vấn đề (quan trọng nhất trước)

### A. Mức CAO

**1. Số năm kinh nghiệm và năm thành lập tự mâu thuẫn**
- Trang chủ (`index.html`, `index-mobile.html`) ghi: "**Gần 1 Nửa Thế Kỷ** Định Hình Quý Ông Việt" và "48 NĂM KINH NGHIỆM".
- Trang chủ và `gioi-thieu.html` lại ghi: "Hành Trình Di Sản **Hơn** Nửa Thế Kỷ" và "Kế thừa di sản hơn nửa thế kỷ".
- `gioi-thieu.html`: thẻ mô tả ghi "Hành trình phát triển **từ năm 2010**", phần thân ghi "Chính thức đi vào hoạt động từ tháng **06/2019**", mốc thời gian ghi "**2018 – NAY**".
- **Đề xuất**: chủ shop chốt một con số và một cách nói. Ví dụ: "Gần nửa thế kỷ" (khớp 48 năm) dùng cho truyền thống gia đình, còn "2019" dùng cho năm thành lập công ty. Riêng cụm "Gần 1 Nửa" nên sửa thành "**Gần Nửa Thế Kỷ**": chữ số "1" đọc lủng củng và bị dịch thành "nearly 1 half".

**2. Chính sách bảo hành tự mâu thuẫn**
- "Bảo hành trọn đời đường kim mũi chỉ và phụ kiện" (`may-do.html`, `dong-phuc.html`) và "Bảo hành đường may trọn đời" (chân trang, mọi trang).
- `dong-phuc.html` lại ghi "Bảo Hành Vàng 12 Tháng".
- `dich-vu.html` ghi "Nội dung này **không mặc định cam kết miễn phí trọn đời** hoặc không giới hạn số lần."
- **Đề xuất**: thống nhất một chính sách (bao lâu, phạm vi gồm gì) rồi dùng đúng câu đó ở mọi nơi. Bản dịch sẽ chép nguyên mâu thuẫn này sang 5 ngôn ngữ.

**3. Số lượng số đo không thống nhất**
- "theo **25** số đo cơ thể" (thẻ mô tả `may-do.html`).
- "Lấy **hơn 30** thông số", "Chuẩn **30+** Thông Số Cá Nhân", "Tuyệt Đối (Lấy 30+ số đo)".
- Cụm "hơn {số}+" thừa ý ("hơn 30+", và "kho vải **hơn 500+** chất liệu" ở `dong-phuc.html`).
- **Đề xuất**: chọn một con số. Dùng "hơn 30" **hoặc** "30+", không dùng cả hai cùng lúc.

**4. Chính sách chân trang (mọi trang, `footer-component.js`) mơ hồ hoặc chưa được xác nhận**
- "Đổi Trả Dễ Dàng – **Trong vòng 30 ngày tận nhà**": cụm này khó hiểu (đổi tận nhà? hay nhận lại tận nhà?). Ngoài ra chưa thấy chính sách đổi trả 30 ngày nào được chốt.
- "Freeship Toàn Quốc – Cho đơn hàng từ 500.000đ" đi cùng "MIỄN PHÍ VẬN CHUYỂN" và "Giao hàng toàn quốc 3–5 ngày": cần xác nhận ba câu này cùng nói về một chính sách.
- **Đề xuất**: "Đổi trả trong 30 ngày, nhận hàng tận nơi" (chỉ dùng nếu đúng thực tế). Nếu không đúng thì bỏ.

**5. Cam kết thời gian phản hồi còn sót**
- `dong-phuc.html` ghi "CHÚNG TÔI SẼ PHẢN HỒI TRONG VÒNG 2 GIỜ LÀM VIỆC".
- Trong khi đó, biểu mẫu ở `tu-van.html` đã bỏ cam kết 2 giờ ngày 15/10, và các trang khác dùng "Nhà may sẽ liên hệ xác nhận thời gian phù hợp".
- **Đề xuất**: dùng chung câu "Nhà may sẽ liên hệ để xác nhận" cho mọi trang.

**6. Lời tự nhận "hàng đầu" và đối tác chưa có bằng chứng**
- "Thương hiệu … Cao Cấp **hàng đầu Việt Nam**" (chân trang), "Khẳng Định Vị Thế Hàng Đầu", "thương hiệu thời trang nam cao cấp **dẫn đầu**", "Thương hiệu May Đo & Đồng Phục Hàng Đầu" (`gioi-thieu.html`).
- Tên khách hàng doanh nghiệp: "Vingroup, SaiGon Coop, Khang Điền…", "Thế Giới Di Động, FPT Retail, MasanGroup…" (`dong-phuc.html`), "Tổng Công ty Tín Nghĩa, Sonadezi, Nha khoa Tâm An…".
- Câu "(*Các hình ảnh mô phỏng được thể hiện dựa trên thực tế dự án…)" cho thấy ảnh dự án chỉ là ảnh mô phỏng.
- Xuất khẩu "Qatar và nhiều thị trường quốc tế khó tính"; "trang phục cho các **nguyên thủ quốc gia**".
- **Đề xuất**: chỉ giữ tên khách hàng có hợp đồng hoặc được phép nêu tên. Đổi "hàng đầu Việt Nam" thành câu kiểm chứng được, ví dụ "nhà may vest với truyền thống gia đình gần nửa thế kỷ". Ở các thị trường EN/DE/FR, lời quảng cáo so sánh không chứng minh được dễ bị coi là gây hiểu lầm.

**7. Chất liệu và xuất xứ cần chứng từ**
- "Khăn Lụa Nữ mayLEHUONG **100% tơ tằm**" (`phu-kien-khan-lua.html`), "Giày Tây **Da Bò Ý**" (`phu-kien-giay-tay.html`), "Cài Cà Vạt **Mạ Vàng 18K**", "Vải … **Wool 100%** … nhập khẩu từ Ý, Anh, Pháp" (`may-do.html`), "Cà vạt lụa".
- **Đề xuất**: chỉ ghi khi có chứng từ nhà cung cấp. Nếu không, dùng "lụa cao cấp", "da bò thật"… Bản dịch không được tự làm mềm các câu này, nên nguồn phải đúng ngay từ đầu.

**8. Câu bị cắt đôi vì có thẻ HTML hoặc link chen giữa (khó dịch đúng ngữ pháp)**

Các mảnh lẻ đang nằm riêng trong danh sách cần dịch:
- "Hãy để những chuyên gia của" + [logo mayLEHUONG] + "tư vấn chọn mẫu Cà Vạt phù hợp nhất…" (10 trang `phu-kien-*`).
- "Tư Vấn Phối Đồ &" + *Cà Vạt Lụa* (8 trang phụ kiện).
- "Quý khách có thể đặt" + [link may đo vest nữ Bespoke] + "theo số đo cá nhân hoặc sử dụng trọn gói" + "để quý cô mặc thử trực tiếp và dịch vụ" + "để được" (`vest-nu.html`).
- "Tại thị trường" + **Biên Hòa, Đồng Nai** + "mang đến giải pháp Âu phục nữ toàn diện: kết hợp giữa" (`vest-nu.html`).
- "Mở rộng thị trường miền Nam với Showroom tại" + **TP. Biên Hòa (Đồng Nai)**; "Cơ sở tự hào là một phần của" + **Hợp tác xã…** (`gioi-thieu.html`).
- "Hiện tại chưa có sản phẩm nào trong" + "danh mục này"; "Không tìm thấy sản phẩm khớp với \"" ; "Chi Tiết Giỏ Hàng (" … "sản phẩm):"; "Tạm tính ("; "(HIỂN THỊ" … ", GÕ THÊM ĐỂ LỌC)".

Tiếng Anh, Đức, Pháp, Trung, Nhật có trật tự từ khác tiếng Việt, nên ghép từng mảnh sẽ sai câu (đặc biệt tiếng Nhật và tiếng Trung đặt động từ hoặc giới từ ở vị trí khác).

**Đề xuất**: viết lại thành câu trọn vẹn, có ô thay thế (ví dụ "Tìm thấy {count} sản phẩm phù hợp") để người dịch thấy được cả câu.

**9. Câu bị ngắt sai ở chữ viết tắt "P." và "TP."**
- "…tại {số} Nguyễn Ái Quốc, **P.**" | "Tam Hiệp)." (các trang danh mục, `vest-nu.html`).
- "MẠNG XÃ HỘI - **TP.**" | "ĐỒNG NAI" (`tu-van.html`).
- Hai mảnh này bị dịch riêng nên bản dịch xuất hiện "P." và "TP." lơ lửng.
- **Đề xuất**: viết đầy đủ "Phường Tam Hiệp" và "Thành phố Đồng Nai" (hoặc "Biên Hòa, Đồng Nai"), không viết tắt có dấu chấm.

**10. Mô tả sản phẩm bị cắt cụt giữa chừng**
- Ví dụ: "{Tên} (Mã …) có bề mặt lụa mềm mượt, họa tiết **tinh.**", "…giúp **cố.**", "…là thiết kế gilet nữ công sở cao cấp **của.**", "…thiết kế chuẩn phom **Hàn.**".
- Khoảng 40 biến thể cắt ở các độ dài khác nhau (thẻ mô tả, og:description, dữ liệu API).
- **Đề xuất**: cắt ở cuối câu hoặc ở dấu phẩy, hoặc viết riêng một câu mô tả ngắn dưới 155 ký tự. Hiện mỗi độ dài cắt sinh ra một "câu" mới phải dịch, và bản dịch cũng bị cụt.

**11. Họ tên trong mục "Bộ vest nữ thiết kế" không nhất quán, và nhãn màu chứa lỗi**
- Số mẫu: "Bộ vest nữ thiết kế **01** – BE ĐẬM" so với "Bộ vest nữ thiết kế **TK10** – GHI SÁNG" (trộn "01" và "TK10").
- "ĐỎ **DÔ**": sai chính tả, phải là "**ĐỎ ĐÔ**". Các trang phụ kiện đang viết đúng "Đỏ Đô".
- "**XANH TAY XẺ**": "tay xẻ" là kiểu tay áo, không phải màu. Nên tách thành màu "XANH" và kiểu "Tay xẻ".
- "**ZILE** GHI / ZILE HỒNG": "Zile" là cách đọc của "Gilet". Xem mục 13.
- "BE 2K / BE 4K / BE 6K": người ngoài không hiểu "2K" là gì (mã vải? số khuy?).
- **Đề xuất**: dùng một dạng "TK01…TK42". Màu ghi chữ thường, có dấu ("Đỏ đô"). Kiểu dáng để vào ô riêng.

**12. Chữ chưa có dấu và mã không dấu lọt ra giao diện**
- "{Tên} - Anh bia trong hop", "Anh ca vat chi tiet", "Anh thuc te trong hop" (chữ thay ảnh của cà vạt hộp): phải là "Ảnh bìa trong hộp", "Ảnh cà vạt chi tiết", "Ảnh thực tế trong hộp".
- "MÃ: DEN", "{Tên} (DEN) – Giá…", nhãn màu "DEN": mã nội bộ đang hiện như tên màu. Nên hiện "Đen", còn mã để riêng.
- "CÀI QUÀI" ở ô "Kiểu dáng" (`san-pham/p21.html`): từ không rõ nghĩa, có thể là "cài quai". Cần chủ shop xác nhận.
- "LẠNH ĐEN" ở ô "Màu sắc" (`nam-vai-lanh-den.html`): "Vải lạnh" là chất liệu, màu chỉ là "Đen".

### B. Mức TRUNG BÌNH: thuật ngữ thiếu nhất quán

**13. Ghi lê / Gilet / Gile / Zile**
- Đang có 4 dạng: "Gilet" (khoảng 30 câu), "Gile" ("Áo Gile" ở `may-do.html`, 9 trang), "ZILE" (5 tên mẫu), "Ghi lê" (trong bảng giá NCC).
- **Đề xuất**: dùng "**Gilet**" trên web (dạng phổ biến nhất), sửa "Gile" và "Zile".

**14. Sơ mi / Sơmi / Sơ Mi**
- "Sơmi Nam" (20 nơi: trang chủ, menu), "Áo Sơmi Nam Cao Cấp - …" (10 tên sản phẩm), "Sơ mi nam" / "Áo Sơ Mi Nam" (trang phụ kiện, 3 sản phẩm mới).
- **Đề xuất**: dùng "**Sơ mi**" (đúng chính tả, tách hai âm tiết).

**15. Khuy / Nút / Cúc (cùng chỉ chiếc cúc áo)**
- "2 Khuy, 6 Khuy, 1/2 Khuy" (nhiều nhất), "Hai hàng nút" / "2 Hàng Nút" (vest nữ), "Thiết kế 2 cúc song song", "Đơm cúc".
- **Đề xuất**: dùng "**khuy**" thống nhất, ví dụ "2 hàng khuy". "1/2 Khuy" nên viết "1 hoặc 2 khuy" vì dễ bị hiểu thành "nửa khuy".

**16. Phom / Form**
- "phom" chiếm đa số. "form" còn ở: "chuẩn form", "Độ rủ (Drape) & Form dáng", "Quy trình Fitting (thử form)", "đứng form".
- **Đề xuất**: dùng "**phom**" ở mọi nơi.

**17. Quần âu / Quần tây; Ủi / Là**
- "Quần âu" và "Quần Tây/quần tây" dùng lẫn lộn.
- "giặt khô **là** hơi Âu phục" (từ miền Bắc, nằm trong schema của `dich-vu.html`) bên cạnh "**ủi** hơi" và "Hấp ủi" ở mọi nơi khác.
- **Đề xuất**: chọn "Quần âu" và "ủi".

**18. Một phụ kiện mang 4–5 tên khác nhau**
- Cài ve: "Cài Ve", "Cài Ve Áo", "Cài Ve Áo Vest (Lapel Pins)", "Cài ve áo suit", "Ghim Cài Ve Áo Vest (Lapel Pin)".
- Cài cà vạt: "Cài Cà Vạt", "Kẹp Cài Cà Vạt", "kẹp cài cà vạt (tie clip)".
- Nơ: "Nơ", "Nơ Nam", "Nơ Đeo Cổ", "Nơ Đeo Cổ Nam (Bowtie)".
- **Đề xuất**: mỗi danh mục một tên chính (ví dụ "Ghim cài ve áo", "Kẹp cà vạt", "Nơ đeo cổ nam"), dùng giống nhau ở menu, tiêu đề và đường dẫn.

**19. Vest Sui Gia / Vest Ông Sui / Vest Trung Niên / Suit Sui Gia**
- Cùng một danh mục nhưng có 4 tên: "Vest Nam Trung Niên", "Vest Sui Gia", "Vest Ông Sui & Sui Gia", "Suit Sui Gia".
- Tương tự: "Vest Nam Trẻ", "Suit Nam Trẻ", "Vest & Suit Nam".
- **Đề xuất**: chủ shop chọn tên chính cho từng danh mục (ví dụ "Vest nam trung niên – sui gia"). Suit hay Vest nên quy ước: "Vest" là tên gọi chung, "Suit" chỉ dùng trong tên riêng như "Suit cưới".

**20. Tên thương hiệu và tên cửa hàng**
- "mayLEHUONG" (chuẩn).
- "**May Lê Hương**" (3 trang sơ mi: "Xem tồn kho theo size tại May Lê Hương", "{Tên} | May Lê Hương").
- "**nhà may Lê Hương**" (14 trang, gồm thẻ mô tả `may-do.html`).
- "**LH Veston** - Biên Hòa" (tên Fanpage 1, `tu-van.html`), "nhà may mayLEHUONG" (lặp chữ "may").
- **Đề xuất**: thay "May Lê Hương" và "nhà may Lê Hương" bằng "mayLEHUONG". Tên Fanpage thật thì giữ đúng như trên Facebook. Giữ tên pháp nhân "Công ty TNHH Thời Trang Lê Hương" như đã chốt.
- Lưu ý thêm: tên pháp nhân đang viết hoa lẫn lộn, "Thời **t**rang" và "Thời **T**rang". Nên thống nhất "Thời Trang".

**21. Tên showroom và địa chỉ**
- Cùng một showroom đang có 6 cách gọi: "Showroom Biên Hòa", "Showroom Đồng Nai", "Showroom Tam Hiệp • Biên Hòa", "Showroom Miền Nam", "cửa hàng Tam Hiệp", "Khu Vực Miền Nam".
- Địa chỉ có lúc có "Phường", có lúc không ("Khu Phố 10, **Phường** Tam Hiệp, Thành Phố Đồng Nai" so với "Khu Phố 10, Tam Hiệp, Thành Phố Đồng Nai"). Có nơi còn ghi "TP. Biên Hòa (Đồng Nai)", trong khi schema ghi "Thành Phố Đồng Nai".
- **Đề xuất**: dùng một tên ("Showroom Biên Hòa") và một địa chỉ đầy đủ ở mọi nơi.

**22. "SHOWROOM TOÀN QUỐC"**
- Hiện đi kèm bộ đếm số showroom (2) trên `gioi-thieu.html`. "Toàn quốc" với 2 showroom là nói quá.
- **Đề xuất**: "SHOWROOM" hoặc "Showroom tại Biên Hòa & Hà Nội".

**23. Size: S–XXL và 2XL lẫn lộn**
- "Đủ size S – XXL", "S, M, L, XL, XXL" so với "2XL, 3XL, 4XL, 5XL" (sơ mi).
- **Đề xuất**: thống nhất "2XL/3XL…" hoặc "XXL/XXXL". Dấu gạch ngang nên viết liền "S–XXL".

**24. Màu sắc viết nhiều kiểu**
- "Nâu cafe" và "Nâu cà phê"; "Than Chì" và "Đen than" và "Xám than (Charcoal)"; "Ghi" và "Xám" và "Xám ghi".
- Tên cà vạt "Màu Nâu Đen" mơ hồ: nâu hay đen?
- "Cà vạt Màu Be 1": số "1" thừa.
- "Họa Tiết H": chữ "H" không rõ nghĩa. Nếu là họa tiết kiểu Hermès thì có rủi ro thương hiệu.
- **Đề xuất**: lập một bảng màu chuẩn (một tên cho mỗi màu) dùng chung cho Kiot và web.

**25. Ma-nơ-canh / manocanh**
- "ảnh minh họa ma-nơ-canh" so với "Sơ mi sọc trắng trên **manocanh** — ảnh minh họa AI".
- **Đề xuất**: dùng "ma-nơ-canh".

**26. Viết hoa từng chữ (Title Case) không nhất quán: nhiều cặp câu gần trùng**
- "Thử Lại"/"Thử lại", "Xem Chi Tiết"/"Xem chi tiết", "Trang Chủ"/"Trang chủ", "Dịch Vụ"/"Dịch vụ", "Chỉ Đường"/"Chỉ đường Google Maps", "Size Bộ"/"Size bộ", "Bảng chọn size"/"BẢNG CHỌN SIZE", "Liên Hệ Tư Vấn"/"Liên hệ tư vấn".
- Tiếng Việt không có quy tắc viết hoa từng chữ trong câu. Mỗi biến thể lại thành một chuỗi riêng phải dịch.
- **Đề xuất**: nút và nhãn chỉ viết hoa chữ đầu ("Thử lại", "Xem chi tiết"). Tiêu đề chữ hoa toàn bộ thì làm bằng CSS `uppercase`, không gõ chữ hoa trong nội dung.

**27. Câu tiếp thị đại trà, khó dịch, trùng lặp**
- Khoảng 10 câu "Đặc Quyền…": "Đặc Quyền Dịch Vụ", "Đặc Quyền Dịch Vụ Khách Hàng", "Đặc Quyền Dịch Vụ Dành Cho Khách Hàng mayLEHUONG", "Đặc Quyền Dành Cho Khách Hàng mayLEHUONG", "Đặc quyền khách hàng"…
- Khoảng 6 câu "Tư Vấn…Ngay".
- Nhiều câu "kiến tạo / đẳng cấp / quyền lực / tuyệt đối / hoàn hảo" xếp chồng, ví dụ "phẳng phiu tựa lớp áo giáp che giấu mọi khuyết điểm", "sự vừa vặn tuyệt đối mà sản phẩm may sẵn không bao giờ thay thế được".
- **Đề xuất**: gộp lại thành 1–2 dạng cho mỗi tiêu đề. Bớt từ tuyệt đối ("hoàn hảo", "không bao giờ"), vì các thị trường EN/DE/FR coi đó là lời hứa không kiểm chứng.

**28. Tiếng Anh chen giữa câu**
- "Fitting", "Travel Suit", "Melange", "Drape", "Matte", "RTW", "Official", "Freeship", "Premium", "fitted", "cape".
- Ví dụ: "Kiểu dáng suit nữ dáng ôm cổ chữ V hai hàng nút blazer fitted và chân váy bút chì". Câu như vậy vừa khó đọc với khách Việt, vừa làm bản dịch lặp từ (ví dụ "fitted blazer fitted").
- **Đề xuất**: dùng tiếng Việt kèm tiếng Anh trong ngoặc ở lần đầu, ví dụ "buổi thử đồ (fitting)", "áo blazer ôm (fitted)". Bỏ "Freeship" và "Official".

### C. Mức THẤP

**29. Lỗi chính tả, dấu và từ lặp**
- "**Qúy** khách chỉ cần mặc trang phục thoải mái" (`tu-van.html`) → "**Quý** khách".
- "Sắc đen truyền thống quyền lực, **chuẩn chuẩn mực**…" (dữ liệu sản phẩm) → "chuẩn mực".
- "độ **lỳ**", "bề mặt **lỳ**" (`may-do.html`) → "**lì**" (chính tả chuẩn).
- "không **dặm** ngứa" → "không **gây** ngứa".
- "cá nhân **hoá**" (1 chỗ) bên cạnh "cá nhân **hóa**" (đa số) → thống nhất kiểu đặt dấu "hóa".

**30. Đơn vị ghi sai**
- "Định lượng chuẩn (300 **g/m**)" → "**g/m²**".
- "Khổ vải … {58}/{60}"" (inch): ghi rõ "inch" để bản dịch đổi được đơn vị.

**31. Cụm "Ủi hơi phom 3D" / "Ủi Hơi Định Hình 3D"**
- "3D" không rõ nghĩa. Nên mô tả cụ thể, ví dụ "ủi hơi định hình theo phom".

**32. Khuyến mãi theo tháng nằm trong chữ thay ảnh và trong ảnh**
- "Siêu sale tháng 10 - Mua vest bố tặng vest con" (chữ thay ảnh banner, trang chủ). Nay đã sang tháng 11.
- Chữ trong ảnh banner không dịch được.
- **Đề xuất**: cập nhật hoặc bỏ. Banner cho bản dịch cần ảnh không có chữ, chữ đặt lớp HTML phía trên.

**33. Dữ liệu ví dụ trong ô nhập**
- "Công ty Tập Đoàn ABC", "Nguyễn Văn A", "Ngân hàng / Bất động sản..." là chữ gợi ý (placeholder) nên chấp nhận được. Riêng "Công ty **Tập Đoàn** ABC" lặp ý; đề xuất "Công ty ABC".

**34. Thông báo trạng thái cũ không còn đúng**
- "Đặt lịch trực tuyến chưa được triển khai" (trang chủ) nằm cạnh nút "Đặt Lịch Ngay" và "Đặt Lịch Hẹn Tư Vấn". Hai thứ trái nhau.
- **Đề xuất**: chọn một cách nói, ví dụ "Gửi yêu cầu tư vấn – nhà may sẽ gọi lại xác nhận lịch".

**35. Đường dẫn ảnh và chú thích CSS lọt vào danh sách cần dịch**
- Khoảng 200 dòng dạng "images/Phụ Kiện/Cà Vạt/Màu Be 1/Ảnh Bìa.png", cùng các dòng "FIX CSS ĐỂ ẢNH HIỂN THỊ */", "FIX GRID SẢN PHẨM…" (trong `site-data.js`).
- Đây không phải chữ hiển thị. Tên thư mục có dấu tiếng Việt và khoảng trắng dễ làm hỏng đường dẫn khi bị "dịch".
- **Đề xuất (cho công cụ)**: loại khỏi danh sách dịch. Về lâu dài, đổi tên thư mục ảnh sang không dấu, không khoảng trắng.

**36. Chuỗi ghép từ nhiều size**
- "1 khuy, 2 khuy" / "2 khuy, 1 khuy", "THƯỜNG, THIẾT KẾ", "{2}XL, {3}XL, …, Chưa rõ size, S, M, L, XL": danh sách size đang được ghép thành một chuỗi, thứ tự lộn xộn (2XL đứng trước S).
- **Đề xuất**: sắp xếp size theo thứ tự chuẩn S → 5XL. Mỗi giá trị nên là một chuỗi riêng để dịch.

---

## 3. Ảnh hưởng tới bản dịch

1. **Mâu thuẫn ở nguồn thành mâu thuẫn ở cả 5 ngôn ngữ** (mục 1–7). Người dịch phải giữ đúng ý gốc, nên sai sót sẽ được chép nguyên: "nearly half a century" và "more than half a century" trên cùng một trang, bảo hành "lifetime" và "12 months". Ở thị trường EN/DE/FR, những câu như "#1 in Vietnam", "100% silk", tên khách hàng lớn hay "free returns within 30 days" không có bằng chứng còn là rủi ro pháp lý (quảng cáo gây hiểu lầm), nặng hơn so với ở Việt Nam.
2. **Câu cắt mảnh** (mục 8–10, 36) là nguyên nhân chính khiến bản dịch sai ngữ pháp. Tiếng Anh, Đức, Pháp đặt giới từ và tính từ khác vị trí. Tiếng Trung và tiếng Nhật đảo cả cấu trúc câu, nên ghép mảnh "Hãy để những chuyên gia của" + [logo] + "tư vấn…" không thể ra câu đúng. "P." và "TP." đứng lẻ thì bị dịch thành ký tự vô nghĩa. Mô tả cụt kết thúc ở "tinh.", "cố." sinh ra hàng chục chuỗi rác phải dịch.
3. **Một khái niệm nhiều tên** (mục 13–21) buộc bảng thuật ngữ phải chọn một dạng. Khách đọc bản dịch sẽ thấy cùng một món hàng mang tên khác nhau giữa menu và trang sản phẩm. Gilet, Gile và Zile có thể bị hiểu thành 3 sản phẩm khác nhau. "1/2 Khuy" dễ bị dịch thành "half button".
4. **Viết hoa từng chữ và câu gần trùng** (mục 26–27) làm số chuỗi cần dịch tăng ước khoảng 10–15%. Bản dịch tiếng Đức (danh từ viết hoa) và tiếng Pháp (chỉ viết hoa chữ đầu) cũng khó giữ đúng kiểu chữ.
5. **Chữ nằm trong ảnh, chữ không dấu, mã nội bộ** (mục 12, 32, 35): ảnh banner không dịch được. "Anh bia trong hop" và "DEN" khiến người dịch đoán nghĩa. Đường dẫn ảnh lẫn vào danh sách dịch có nguy cơ làm vỡ ảnh nếu bị thay chữ.
6. **Tiếng Anh chen trong câu tiếng Việt** (mục 28) gây lặp từ hoặc lẫn ngôn ngữ trong bản dịch, nhất là tiếng Trung và tiếng Nhật (ví dụ "fitted西装外套fitted").

**Gợi ý thứ tự xử lý** (khi chủ shop đồng ý sửa bản tiếng Việt):
1. Chốt các con số và chính sách ở mục 1–7.
2. Lập bảng thuật ngữ cho mục 13–25 (một tên cho mỗi khái niệm).
3. Viết lại các câu bị cắt mảnh ở mục 8–10.
4. Sửa các lỗi chính tả nhỏ.

Sau đó, chạy lại công cụ tách chuỗi trong `i18n/` để bản dịch nhận nguồn đã sạch.
