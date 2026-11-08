# Đưa maylehuong.com và dzuongtailor.com qua Cloudflare (gói miễn phí)

**Trạng thái 08/11/2026: mới chuẩn bị, CHƯA áp dụng.** Chủ shop dặn chỉ làm trên GitHub, chưa đăng lên VPS. DNS, Cloudflare và VPS chưa đổi. Chỉ chạy các bước dưới khi chủ shop nói rõ.

Cloudflare không gắn được vào bản thử `tonbao2205-afk.github.io`: tên miền đó của GitHub, không đổi DNS được, và GitHub Pages đã có CDN riêng.

## Hiện trạng đã đọc từ VPS và DNS

| Mục | Giá trị |
|---|---|
| IP VPS | `103.159.53.73`, chưa có AAAA, chưa có MX |
| Nameserver | maylehuong.com ở `dns1-4.p03.nsone.net` (Name.com); dzuongtailor.com ở `ns1,2.7host.vn` |
| TXT maylehuong.com (phải giữ) | `google-site-verification=Fv8a__ZZvx_GbBoG-z0MtzZ8uU3EUQvZO8_F7YvPu0A` và `zalo-platform-site-verification=U-FZBAliCoCgsxelx-zW6MtCzJc1kYPdC3Kp` |
| Chứng chỉ | Let's Encrypt, cách xác thực HTTP qua nginx. maylehuong.com hết hạn 22/12/2026, dzuongtailor.com 14/01/2027 |
| Nơi gọi vào VPS không phải trình duyệt | KiotViet `POST /api/webhooks/kiotviet`, n8n `POST /api/integrations/finance/n8n/expenses`, Zalo `/api/zalo/oa/callback` |

Mở trang DNS của từng nhà cung cấp, chép đủ mọi bản ghi trước khi đổi. Bảng trên chỉ gồm những gì tra được từ ngoài, tên miền con lạ có thể còn thiếu.

## Thứ tự làm

Tài khoản Cloudflare và việc đổi nameserver do chủ shop làm. Các bước trên VPS do agent làm.

1. **VPS, trước khi đổi DNS:** `origin.sh realip`. Thiếu bước này, mọi khách sẽ mang IP của Cloudflare và giới hạn đăng nhập theo IP sẽ khóa nhầm cả shop. Chưa đi qua Cloudflare thì file này không có tác dụng gì.
2. **Cloudflare:** thêm 2 tên miền (gói Free), kiểm tra đủ bản ghi, A gốc và `www` bật đám mây cam, giữ 2 TXT.
3. **Cloudflare:** cài đặt như mục dưới, cho cả 2 tên miền, **trước khi** đổi nameserver.
4. **Name.com và 7host:** đổi nameserver theo Cloudflare cấp. Làm từng tên miền, dzuongtailor.com trước vì ít ảnh hưởng hơn.
5. **Kiểm tra** như mục dưới trên từng tên miền.
6. **VPS: đổi cách gia hạn chứng chỉ** sang xác thực DNS, như mục dưới.
7. **VPS, sau cùng:** `origin.sh lock`. Chỉ cho Cloudflare vào cổng 80/443, không có bước này bot vẫn đánh thẳng được vào IP. Lệnh tự từ chối nếu còn tên miền chưa qua Cloudflare.

## Cài đặt trên Cloudflare

**SSL/TLS**
- Chế độ **Full (strict)**, Minimum TLS 1.2.
- Không bật HSTS ở Cloudflare, nginx đã gửi rồi.

**Phải TẮT, vì làm hỏng web hoặc chặn webhook**
- **Bot Fight Mode:** gói Free không tạo được ngoại lệ, sẽ chặn KiotViet, n8n, Zalo.
- **Browser Integrity Check:** có thể chặn request thiếu User-Agent của webhook.
- **Rocket Loader, Email Address Obfuscation:** chèn script vào trang, CSP của site sẽ chặn.
- **Under Attack Mode:** chỉ bật lúc đang bị tấn công thật. Khi bật, webhook KiotViet, n8n, Zalo sẽ không vào được, phải tắt ngay khi xong.

**Cache Rules, tạo 1 luật Bypass cache**

```
(starts_with(http.request.uri.path, "/api/")) or (starts_with(http.request.uri.path, "/q/")) or (starts_with(http.request.uri.path, "/uploads/")) or (starts_with(http.request.uri.path, "/admin/"))
```

Bắt buộc có `/uploads/`: nginx gửi `public, immutable` cho thư mục này, thiếu luật thì ảnh đơn đã xóa vẫn còn trên Cloudflare tới 30 ngày.

**TUYỆT ĐỐI KHÔNG dùng "Cache Everything".** Trang `/` trả HTML khác nhau cho điện thoại và máy tính theo User-Agent, và HTML của trang thường đều có thể đổi. Để mặc định thì Cloudflare chỉ giữ ảnh, CSS, JS, font.

**Rate limiting (gói Free được 1 luật):** để dành cho đăng nhập, biểu thức `http.request.uri.path eq "/api/admin/login"`, 10 lần trong 10 giây mỗi IP, hành động Block.

Khi thay ảnh mà giữ nguyên tên file thì phải Purge đúng URL đó trên Cloudflare. Ảnh mới đổi tên hoặc đổi `?v=` thì không cần.

## Chứng chỉ

Certbot đang xác thực qua cổng 80. Với Full (strict), Cloudflare nối về VPS bằng cổng 443 nên lần gia hạn tới có nguy cơ thất bại. Certbot thường gia hạn khi còn 30 ngày, tức maylehuong.com từ khoảng 22/11/2026, nên phải xử lý trong đợt này.

Cách chọn: xác thực DNS, vẫn là chứng chỉ Let's Encrypt nên tắt Cloudflare vẫn chạy được ngay.

1. Tạo API Token Cloudflare, quyền chỉ `Zone:DNS:Edit` cho 2 tên miền. Không dán token vào chat hay repo.
2. Trên VPS: cài `python3-certbot-dns-cloudflare` (đúng kiểu cài của certbot đang có), lưu token vào `/etc/letsencrypt/cloudflare.ini` quyền 0600.
3. Cấp lại từng tên miền: `certbot certonly --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini --cert-name maylehuong.com -d maylehuong.com -d www.maylehuong.com --deploy-hook "systemctl reload nginx"`. Tương tự với dzuongtailor.com.
4. `certbot renew --dry-run` phải đạt.

## Kiểm tra sau khi đổi DNS

- `curl -sI https://maylehuong.com/` có `cf-ray`; làm tương tự với dzuongtailor.com.
- `/` trả đúng trang điện thoại với User-Agent iPhone, đúng trang máy tính với User-Agent Windows.
- `cf-cache-status` là `DYNAMIC` hoặc `BYPASS` ở `/api/health`, `/admin/`, một trang `/q/`, một ảnh `/uploads/`. Một ảnh `/images/...` tải lần hai là `HIT`.
- Log nginx và log API ghi IP thật của máy thử, không phải IP Cloudflare.
- Đăng nhập Admin trên web và trên app Windows. API admin qua dzuongtailor.com vẫn 403.
- Trong log API có webhook KiotViet mới được nhận sau khi có hóa đơn hoặc đổi tồn, và đồng bộ tài chính vẫn LIVE. Không gửi tin Zalo thử.
- Ghi lại 3 container healthy, restart 0.

## Quay lui

1. VPS: `origin.sh unlock`.
2. Cloudflare: chuyển bản ghi sang DNS only (đám mây xám), hoặc đổi nameserver về chỗ cũ.
3. Không cần xóa file real-IP, nó không ảnh hưởng khi không qua Cloudflare.

Dữ liệu đơn, số đo, tài chính không liên quan tới đợt này, không restore gì.

Khi Cloudflare công bố dải IP mới, chạy lại `origin.sh realip`, rồi `origin.sh unlock` và `origin.sh lock`.
