# Dịch Thuật — bộ Agent Skills rà soát bản dịch website mayLEHUONG

Tải về ngày 04/11/2026 theo yêu cầu của chủ shop. Dùng để rà bản dịch website ở các ngôn ngữ VI · EN · 中文 · 한국어 · 日本語 · हिन्दी.

| Thư mục | Nguồn | Dùng cho |
|---|---|---|
| `practical-localizer/` | https://github.com/soumyaRauth/skills-hub/tree/main/skills/practical-localizer | Skill nền: phân tích ngữ cảnh, rà bản dịch, định dạng theo vùng, độ vừa giao diện; có ví dụ Hindi và Nhật |
| `translating-products/` | https://github.com/BrunoMiguens/translating-products-skill | Bộ skill cho nội dung sản phẩm/website: `translating-products` (điều phối), `reviewing-translations`, `translating-web`, `translating-marketing`, `translating-core`, chuyên biệt `translating-chinese` / `-japanese` / `-korean` … |
| `yomiyasu/` | https://github.com/yelban/yomiyasu.TW | Biên tập tiếng Nhật cho tự nhiên, bỏ văn phong "máy dịch" |

## Đã cài vào đâu
- Bản tải về giữ nguyên trong thư mục này (bỏ `.git`). Giấy phép của từng bộ nằm trong `LICENSE` tương ứng.
- Claude Code chỉ nạp skill từ `.claude/skills/<tên>/SKILL.md`, nên các thư mục skill đã được chép vào `.claude/skills/` của dự án: `practical-localizer`, `yomiyasu` và 23 skill của translating-products.
- Đã đọc qua trước khi cài: chỉ là tài liệu hướng dẫn và vài script Python xử lý văn bản trên máy, không gọi mạng. Chưa chạy script nào.

## Cập nhật
Tải lại từ đúng nguồn ở bảng trên. Đọc lại thay đổi trước khi chép đè vào `.claude/skills/`.
