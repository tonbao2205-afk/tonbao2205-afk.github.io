# mayLEHUONG — công cụ dịch website (nhánh `source`)

Nhánh này giữ công cụ và từ điển dịch. Bản thử đã dựng nằm ở nhánh `main` và chạy tại https://tonbao2205-afk.github.io/

## Ngôn ngữ
| Mã | Đường dẫn | Từ điển |
|---|---|---|
| `en` | `/en/` | `i18n/en/units.json` (câu), `names.json` (tên sản phẩm), `GLOSSARY.md` |
| `zh` | `/zh/` (tiếng Trung giản thể) | `i18n/zh/units.json`, `names.json`, `GLOSSARY.md` |
| `ko` | `/ko/` (tiếng Hàn) | `i18n/ko/units.json`, `names.json`, `GLOSSARY.md` |
| `ja` | `/ja/` (tiếng Nhật) | `i18n/ja/units.json`, `names.json`, `GLOSSARY.md` |
| `hi` | `/hi/` (tiếng Hindi) | `i18n/hi/units.json`, `names.json`, `GLOSSARY.md` |

`i18n/en/runtime-seen.json` là danh sách chữ do JS tạo ra, dùng chung cho mọi ngôn ngữ.

## Quy trình cập nhật ngôn ngữ (chỉ GitHub, không lên VPS)
1. Lấy bản web hiện hành từ VPS (`/opt/maylehuong-docker/current/web`) và `/api/products` về máy. Chỉ đọc, không sửa VPS.
2. Dựng bản dịch:
   ```
   python -I tools/build_en_site.py --web <web> --out build --products products.json --langs en,zh,ko,ja,hi --version <tag> --strict --report report.json
   ```
   `--strict` báo lỗi nếu còn câu chưa dịch. Câu thiếu nằm trong `report.json` → thêm vào `units.json` / `names.json` của từng ngôn ngữ rồi dựng lại.
3. Đóng gói bản thử cho GitHub Pages:
   ```
   python -I tools/github_preview/make_preview.py --web <web> --build build --products products.json --out <checkout nhánh main>
   ```
4. Kiểm tra trên máy (điện thoại 390 + máy tính 1366), rồi commit và push nhánh `main`.

## Bản thử khác web thật ở đâu
`tools/github_preview/` chỉ dùng cho GitHub:
- `noindex` + `robots.txt` chặn toàn bộ.
- Sản phẩm lấy từ ảnh chụp `api-snapshot/products.json`.
- Ảnh tải từ maylehuong.com.
- `preview-mode.js` chặn mọi lệnh gửi (form, đặt hàng, webhook).

Khi chủ shop cho đăng lên web thật, KHÔNG dùng bản trong `main`. Phải dựng lại từ web hiện hành bằng `build_en_site.py` (không qua `make_preview.py`) và phát hành theo quy trình Docker của dự án.
