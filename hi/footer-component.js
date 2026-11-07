/**
 * footer-component.js v5 — mayLEHUONG (Old Sailor Style E-Commerce Footer)
 * Full E-Commerce Footer with Policy Icons, Showrooms, Customer Care & Copyright
 */
(function() {
  'use strict';

  function initFooter() {
    if (document.getElementById('lhv-global-footer')) return;

    var style = document.createElement('style');
    style.id = 'lhv-footer-css';
    style.textContent = [
      '/* Global Layout Hacks */',
      'body { display: flex !important; flex-direction: column !important; min-height: 100vh !important; margin: 0; }',
      'main { flex: 1 1 auto !important; }',
      '',
      '/* Footer Styling */',
      '#lhv-global-footer {',
      '  margin-top: auto !important;',
      '  width: 100% !important;',
      '  background: #111111 !important;',
      '  color: #ffffff !important;',
      '  border-top: 3px solid #9d0208 !important;',
      '  font-family: "Inter", system-ui, sans-serif !important;',
      '  box-sizing: border-box !important;',
      '  position: relative !important;',
      '  z-index: 999 !important;',
      '}',
      '#lhv-global-footer * { box-sizing: border-box; }',
      '.lhv-footer-policy {',
      '  background: #1a1a1a !important;',
      '  border-bottom: 1px solid rgba(255,255,255,0.1) !important;',
      '  padding: 24px 16px !important;',
      '}',
      '.lhv-policy-item { text-align: center !important; }',
      '.lhv-policy-item span { font-size: 28px !important; color: #e6c364 !important; margin-bottom: 6px !important; display: block !important; }',
      '.lhv-policy-title { font-size: 13px !important; font-weight: 700 !important; color: #ffffff !important; text-transform: uppercase !important; }',
      '.lhv-policy-desc { font-size: 12px !important; color: #d1d5db !important; margin-top: 2px !important; }',
      '.lhv-footer-main { padding: 40px 24px 24px !important; max-width: 1200px !important; margin: 0 auto !important; }',
      '.lhv-footer-col h4 { font-size: 14px !important; font-weight: 700 !important; color: #e6c364 !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; margin-bottom: 16px !important; }',
      '.lhv-footer-col p, .lhv-footer-col a { font-size: 13px !important; color: #ffffff !important; text-decoration: none !important; display: block !important; margin-bottom: 10px !important; transition: color .2s !important; }',
      '.lhv-footer-col a:hover { color: #e6c364 !important; }',
      '.lhv-footer-bottom { border-top: 1px solid rgba(255,255,255,0.1) !important; padding: 18px 16px !important; text-align: center !important; font-size: 12.5px !important; color: #d1d5db !important; }'
    ].join('\n');
    document.head.appendChild(style);

    var footer = document.createElement('footer');
    footer.id = 'lhv-global-footer';
    footer.innerHTML = [
      '<!-- Old Sailor Style Policy Bar -->',
      '<div class="lhv-footer-policy">',
      '  <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">',
      '    <div class="lhv-policy-item">',
      '      <span class="material-symbols-outlined" style="color: #e6c364 !important;">local_shipping</span>',
      '      <div class="lhv-policy-title" style="color: #ffffff !important;">Miễn Phí Giao Hàng</div>',
      '      <div class="lhv-policy-desc" style="color: #d1d5db !important;">Toàn quốc, đơn từ 500.000đ</div>',
      '    </div>',
      '    <div class="lhv-policy-item">',
      '      <span class="material-symbols-outlined" style="color: #e6c364 !important;">published_with_changes</span>',
      '      <div class="lhv-policy-title" style="color: #ffffff !important;">Đổi Trả Dễ Dàng</div>',
      '      <div class="lhv-policy-desc" style="color: #d1d5db !important;">Đổi trả trong vòng 30 ngày</div>',
      '    </div>',
      '    <div class="lhv-policy-item">',
      '      <span class="material-symbols-outlined" style="color: #e6c364 !important;">workspace_premium</span>',
      '      <div class="lhv-policy-title" style="color: #ffffff !important;">Chất Lượng May Đo</div>',
      '      <div class="lhv-policy-desc" style="color: #d1d5db !important;">Bảo hành đường may trọn đời</div>',
      '    </div>',
      '    <div class="lhv-policy-item">',
      '      <span class="material-symbols-outlined" style="color: #e6c364 !important;">support_agent</span>',
      '      <div class="lhv-policy-title" style="color: #ffffff !important;">Hotline Tư Vấn</div>',
      '      <div class="lhv-policy-desc" style="color: #d1d5db !important;">0948 954 848 (8:00 - 22:00)</div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<!-- Main Footer Content -->',
      '<div class="lhv-footer-main">',
      '  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">',
      '    <div class="lhv-footer-col">',
      '      <h4 style="color: #e6c364 !important;">MAYLEHUONG SUIT & UNIFORM</h4>',
      '      <p style="color: #ffffff !important;">Thương hiệu Suit Nam, Vest Nữ & May Đo Bespoke Cao Cấp hàng đầu Việt Nam.</p>',
      '      <p style="color: #ffffff !important;">📍 Showroom Đồng Nai: 1797 Nguyễn Ái Quốc, Khu Phố 10, Phường Tam Hiệp, Thành Phố Đồng Nai</p>',
      '      <p style="color: #ffffff !important;">📍 Showroom Hà Nội: Số 7 Chính Vân, Chuyên Mỹ, Thành Phố Hà Nội</p>',
      '    </div>',
      '    <div class="lhv-footer-col">',
      '      <h4 style="color: #e6c364 !important;">Danh Mục Sản Phẩm</h4>',
      '      <a href="/hi/vest-nam-tre.html" style="color: #ffffff !important;">Suit Nam Trẻ Cao Cấp</a>',
      '      <a href="/hi/vest-nu.html" style="color: #ffffff !important;">Vest Nữ Blazer Thời Thượng</a>',
      '      <a href="/hi/vest-nam-trung-nien.html" style="color: #ffffff !important;">Vest Ông Sui & Sui Gia</a>',
      '      <a href="/hi/may-do.html" style="color: #ffffff !important;">Dịch Vụ May Đo Bespoke</a>',
      '      <a href="/hi/dong-phuc.html" style="color: #ffffff !important;">Đồng Phục Doanh Nghiệp</a>',
      '    </div>',
      '    <div class="lhv-footer-col">',
      '      <h4 style="color: #e6c364 !important;">Hỗ Trợ Khách Hàng</h4>',
      '      <a href="/hi/dich-vu.html" style="color: #ffffff !important;">Đặc Quyền Dịch Vụ Khách Hàng</a>',
      '      <a href="/hi/tu-van.html" style="color: #ffffff !important;">Liên Hệ Tư Vấn</a>',
      '      <a href="/hi/gioi-thieu.html" style="color: #ffffff !important;">Giới Thiệu Thương Hiệu</a>',
      '      <p style="color: #ffffff !important;">📞 Hotline Đồng Nai: 0948.954.848</p>',
      '      <p style="color: #ffffff !important;">📞 Hotline Hà Nội: 0786.291.468</p>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="lhv-footer-bottom" style="color: #d1d5db !important;">',
      '  © Công Ty TNHH Thời Trang Lê Hương. All Rights Reserved. - Design by HarryDuong · Planning by Haris Nguyen · Coding by Sophie Tran',
      '</div>'
    ].join('\n');
    
    document.body.appendChild(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();
