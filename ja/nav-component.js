/**
 * nav-component.js v5 — mayLEHUONG Luxury Navigation System
 * Brand-New Unified Architecture for all Main Pages and Sub-Pages
 */
(function () {
  'use strict';

  // Product data comes from the catalog API (Admin/KiotViet), so it is escaped before it reaches innerHTML.
  function escHtml(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Allow site paths and http(s) URLs only; returns the fallback for javascript:, data:, etc.
  function safeUrl(raw, fallback) {
    var s = String(raw == null ? '' : raw).trim();
    if (s.indexOf('images/') === 0) return '/' + s;
    if (/^https?:\/\//i.test(s) || (s.charAt(0) === '/' && s.charAt(1) !== '/') || /^[\w.-][\w./%?=&#-]*$/.test(s)) return s;
    return fallback || '';
  }

  /* ══════════════════════════════════════════════
     1. CONFIG & NAVIGATION DATA
  ══════════════════════════════════════════════ */
  var LOGO_SRC   = '/assets/brand-20261108/logo-nav.webp';
  var LOGO_ALT   = 'mayLEHUONG Suit & Uniform';
  var NAV_HEIGHT = 68; // px

  var PAGES = [
    { label: 'Trang Chủ', href: '/' },
    {
      label: 'Sản Phẩm',
      href: '/ja/products.html',
      dropdown: [
        { label: 'Vest Nam Trẻ', href: '/ja/vest-nam-tre.html' },
        { label: 'Vest Nữ', href: '/ja/vest-nu.html' },
        { label: 'Vest Sui Gia', href: '/ja/vest-nam-trung-nien.html' }
      ]
    },
    {
      label: 'Phụ Kiện',
      href: '/ja/phu-kien.html',
      dropdown: [
        { label: 'Cà Vạt', href: '/ja/phu-kien-ca-vat.html' },
        { label: 'Cài Cà Vạt', href: '/ja/phu-kien-cai-ca-vat.html' },
        { label: 'Khăn Lụa Nữ', href: '/ja/phu-kien-khan-lua.html' },
        { label: 'Giày Tây Nam', href: '/ja/phu-kien-giay-tay.html' },
        { label: 'Sơ Mi', href: '/ja/phu-kien-so-mi.html' },
        { label: 'Cài Ve', href: '/ja/phu-kien-cai-ve.html' },
        { label: 'Nơ', href: '/ja/phu-kien-no.html' }
      ]
    },
    { label: 'May Đo', href: '/ja/may-do.html' },
    { label: 'Dịch Vụ', href: '/ja/dich-vu.html' },
    { label: 'Đồng Phục', href: '/ja/dong-phuc.html' },
    { label: 'Tư Vấn', href: '/ja/tu-van.html' },
    { label: 'Giới Thiệu', href: '/ja/gioi-thieu.html' },
    { label: 'Chính Sách', href: '/ja/chinh-sach.html' }
  ];

  /* Detect active page filename */
  function getActivePage() {
    var path = window.location.pathname || '/';
    if (path.indexOf('/ja/san-pham/') === 0) return '/ja/products.html';
    var page = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
    if (!page || page === '' || page === 'index' || page === 'index.html' || page === 'index-mobile.html') return '/';
    if (page === 'product-detail.html' || page === 'product-detail') return '/ja/products.html';
    return '/' + (page.indexOf('.') === -1 ? page + '.html' : page);
  }

  /* ══════════════════════════════════════════════
     2. CSS STYLING INJECTION
  ══════════════════════════════════════════════ */
  function injectStyles() {
    if (!document.getElementById('lhv-mat-symbols') && !document.querySelector('link[href*="Material+Symbols"]')) {
      var matFont = document.createElement('link');
      matFont.id = 'lhv-mat-symbols';
      matFont.rel = 'stylesheet';
      matFont.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0';
      document.head.appendChild(matFont);
    }
    if (!document.getElementById('lhv-luxury-fonts') && !document.querySelector('link[href*="Noto+Serif"]')) {
      var luxFonts = document.createElement('link');
      luxFonts.id = 'lhv-luxury-fonts';
      luxFonts.rel = 'stylesheet';
      luxFonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400..900;1,400..900&family=Be+Vietnam+Pro:ital,wght@0,300..900;1,300..900&family=Montserrat:wght@600;700;800&display=swap';
      document.head.appendChild(luxFonts);
    }
    if (document.getElementById('lhv-nav-v5-css')) return;

    var css = '' +
      '/* Fix mobile font scale */\n' +
      'html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }\n' +
      '/* Hide old static navs/headers */\n' +
      '.lhv-old-nav, .lhv-old-header { display: none !important; }\n' +
      '/* Header root bar */\n' +
      '#lhv-header {\n' +
      '  position: fixed !important;\n' +
      '  top: 0 !important;\n' +
      '  left: 0 !important;\n' +
      '  right: 0 !important;\n' +
      '  z-index: 9999 !important;\n' +
      '  height: ' + NAV_HEIGHT + 'px !important;\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  justify-content: space-between !important;\n' +
      '  padding: 0 36px !important;\n' +
      '  background: #ffffff !important;\n' +
      '  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;\n' +
      '  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;\n' +
      '  box-sizing: border-box !important;\n' +
      '  font-family: "Montserrat", "Plus Jakarta Sans", "Be Vietnam Pro", "Inter", system-ui, -apple-system, sans-serif !important;\n' +
      '}\n' +
      '@media (max-width: 1023px) {\n' +
      '  #lhv-header {\n' +
      '    padding: 0 10px !important;\n' +
      '    background: #ffffff !important;\n' +
      '    border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;\n' +
      '    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;\n' +
      '  }\n' +
      '}\n' +
      '/* Logo */\n' +
      '.lhv-logo-link {\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  gap: 8px !important;\n' +
      '  text-decoration: none !important;\n' +
      '  flex-shrink: 0 !important;\n' +
      '  z-index: 2 !important;\n' +
      '}\n' +
      '.lhv-logo-img {\n' +
      '  height: 58px !important;\n' +
      '  max-height: 58px !important;\n' +
      '  width: auto !important;\n' +
      '  object-fit: contain !important;\n' +
      '  display: block !important;\n' +
      '}\n' +
      '@media (max-width: 768px) {\n' +
      '  .lhv-logo-img { height: 46px !important; max-height: 46px !important; }\n' +
      '}\n' +
      '.lhv-brand-lh { color: #1a1a1a !important; font-weight: 700 !important; }\n' +
      '@media (max-width: 1023px) {\n' +
      '  .lhv-brand-text { display: none !important; }\n' +
      '}\n' +
      '/* Desktop Nav List */\n' +
      '.lhv-desktop-menu {\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  gap: clamp(14px, 1.8vw, 26px) !important;\n' +
      '  list-style: none !important;\n' +
      '  margin: 0 !important;\n' +
      '  padding: 0 !important;\n' +
      '  height: 100% !important;\n' +
      '}\n' +
      '@media (min-width: 1360px) {\n' +
      '  .lhv-desktop-menu { gap: 28px !important; }\n' +
      '}\n' +
      '@media (max-width: 1023px) {\n' +
      '  .lhv-desktop-menu { display: none !important; }\n' +
      '}\n' +
      '.lhv-nav-item {\n' +
      '  position: relative !important;\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  height: 100% !important;\n' +
      '}\n' +
      '/* Navigation Link Token */\n' +
      '#lhv-header .lhv-nav-link {\n' +
      '  font-family: "Montserrat", "Plus Jakarta Sans", sans-serif !important;\n' +
      '  font-size: 13.5px !important;\n' +
      '  font-weight: 700 !important;\n' +
      '  letter-spacing: 0.05em !important;\n' +
      '  line-height: 1 !important;\n' +
      '  text-transform: uppercase !important;\n' +
      '  text-decoration: none !important;\n' +
      '  color: #1a1a1a !important;\n' +
      '  position: relative !important;\n' +
      '  padding: 24px 0 !important;\n' +
      '  background: transparent !important;\n' +
      '  border: none !important;\n' +
      '  cursor: pointer !important;\n' +
      '  display: inline-flex !important;\n' +
      '  align-items: center !important;\n' +
      '  gap: 4px !important;\n' +
      '  white-space: nowrap !important;\n' +
      '  transition: color 0.2s ease !important;\n' +
      '}\n' +
      '#lhv-header .lhv-nav-link:hover { color: #9d0208 !important; }\n' +
      '#lhv-header .lhv-nav-link.lhv-active { color: #9d0208 !important; font-weight: 800 !important; }\n' +
      '/* Active Red Underline Indicator on Desktop */\n' +
      '#lhv-header .lhv-nav-link.lhv-active::after,\n' +
      '#lhv-header .lhv-nav-link:hover::after {\n' +
      '  content: "" !important;\n' +
      '  position: absolute !important;\n' +
      '  bottom: 0px !important;\n' +
      '  left: 0 !important;\n' +
      '  right: 0 !important;\n' +
      '  height: 3.5px !important;\n' +
      '  background-color: #9d0208 !important;\n' +
      '  border-radius: 3px 3px 0 0 !important;\n' +
      '  box-shadow: 0 -2px 8px rgba(157, 2, 8, 0.4) !important;\n' +
      '  animation: lhv-line-glow 2s infinite ease-in-out !important;\n' +
      '}\n' +
      '@keyframes lhv-line-glow {\n' +
      '  0%, 100% { opacity: 0.85; transform: scaleX(1); }\n' +
      '  50% { opacity: 1; transform: scaleX(1.05); }\n' +
      '}\n' +
      '/* Dropdown Chevron Arrow SVG */\n' +
      '.lhv-chevron-svg {\n' +
      '  width: 9px !important;\n' +
      '  height: 6px !important;\n' +
      '  fill: none !important;\n' +
      '  stroke: currentColor !important;\n' +
      '  stroke-width: 1.8 !important;\n' +
      '  margin-left: 2px !important;\n' +
      '  transition: transform 0.25s ease !important;\n' +
      '}\n' +
      '.lhv-nav-item:hover .lhv-chevron-svg, .lhv-nav-item:focus-within .lhv-chevron-svg {\n' +
      '  transform: rotate(180deg) !important;\n' +
      '}\n' +
      '/* Desktop Dropdown Menu */\n' +
      '.lhv-dropdown-menu {\n' +
      '  position: absolute !important;\n' +
      '  top: 100% !important;\n' +
      '  left: 50% !important;\n' +
      '  transform: translateX(-50%) translateY(8px) !important;\n' +
      '  background: #ffffff !important;\n' +
      '  min-width: 190px !important;\n' +
      '  border-radius: 8px !important;\n' +
      '  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04) !important;\n' +
      '  border: 1px solid rgba(0, 0, 0, 0.08) !important;\n' +
      '  padding: 8px 0 !important;\n' +
      '  opacity: 0 !important;\n' +
      '  visibility: hidden !important;\n' +
      '  pointer-events: none !important;\n' +
      '  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease !important;\n' +
      '  z-index: 10000 !important;\n' +
      '}\n' +
      '.lhv-nav-item:hover .lhv-dropdown-menu, .lhv-nav-item:focus-within .lhv-dropdown-menu {\n' +
      '  opacity: 1 !important;\n' +
      '  visibility: visible !important;\n' +
      '  pointer-events: auto !important;\n' +
      '  transform: translateX(-50%) translateY(0) !important;\n' +
      '}\n' +
      '.lhv-dropdown-link {\n' +
      '  font-family: "Montserrat", "Plus Jakarta Sans", sans-serif !important;\n' +
      '  font-size: 14px !important;\n' +
      '  font-weight: 600 !important;\n' +
      '  color: #222222 !important;\n' +
      '  text-decoration: none !important;\n' +
      '  display: block !important;\n' +
      '  padding: 9px 18px !important;\n' +
      '  white-space: nowrap !important;\n' +
      '  transition: background 0.2s ease, color 0.2s ease !important;\n' +
      '  text-transform: none !important;\n' +
      '}\n' +
      '.lhv-dropdown-link:hover, .lhv-dropdown-link.lhv-active {\n' +
      '  background: #f8f5f2 !important;\n' +
      '  color: #9d0208 !important;\n' +
      '}\n' +
      '/* Desktop Actions Wrap */\n' +
      '.lhv-actions-wrap {\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  gap: 10px !important;\n' +
      '}\n' +
      '@media (max-width: 1023px) {\n' +
      '  .lhv-actions-wrap { display: none !important; }\n' +
      '}\n' +
      '/* Action Buttons (Gold Accent on mobile, Dark on desktop) */\n' +
      '.lhv-action-btn {\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  justify-content: center !important;\n' +
      '  width: 34px !important;\n' +
      '  height: 34px !important;\n' +
      '  background: transparent !important;\n' +
      '  border: none !important;\n' +
      '  border-radius: 50% !important;\n' +
      '  color: #3a3a3a !important;\n' +
      '  cursor: pointer !important;\n' +
      '  text-decoration: none !important;\n' +
      '  transition: color 0.2s ease, transform 0.2s ease !important;\n' +
      '  position: relative !important;\n' +
      '}\n' +
      '.lhv-action-btn:hover { color: #9d0208 !important; transform: scale(1.08) !important; }\n' +
      '.lhv-action-btn .material-symbols-outlined { font-size: 20px !important; line-height: 1 !important; }\n' +
      '@media (max-width: 1023px) {\n' +
      '  .lhv-action-btn { color: #1a1a1a !important; }\n' +
      '  .lhv-action-btn:hover { color: #9d0208 !important; }\n' +
      '}\n' +
      '/* Cart Badge Counter */\n' +
      '.lhv-cart-badge {\n' +
      '  position: absolute !important;\n' +
      '  top: -2px !important;\n' +
      '  right: -2px !important;\n' +
      '  background: #9d0208 !important;\n' +
      '  color: #ffffff !important;\n' +
      '  font-size: 10px !important;\n' +
      '  font-weight: 800 !important;\n' +
      '  min-width: 16px !important;\n' +
      '  height: 16px !important;\n' +
      '  border-radius: 10px !important;\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  justify-content: center !important;\n' +
      '  padding: 0 4px !important;\n' +
      '  box-sizing: border-box !important;\n' +
      '  border: 1.5px solid #ffffff !important;\n' +
      '}\n' +
      '/* Divider Line */\n' +
      '.lhv-divider {\n' +
      '  width: 1px !important;\n' +
      '  height: 22px !important;\n' +
      '  background: #e0e0e0 !important;\n' +
      '  margin: 0 4px !important;\n' +
      '  display: inline-block !important;\n' +
      '}\n' +
      '/* CTA Booking Button */\n' +
      '.lhv-cta-booking {\n' +
      '  font-family: "Montserrat", "Plus Jakarta Sans", sans-serif !important;\n' +
      '  font-size: 12px !important;\n' +
      '  font-weight: 700 !important;\n' +
      '  color: #ffffff !important;\n' +
      '  background: #9d0208 !important;\n' +
      '  letter-spacing: 0.06em !important;\n' +
      '  text-transform: uppercase !important;\n' +
      '  padding: 9px 18px !important;\n' +
      '  border-radius: 6px !important;\n' +
      '  text-decoration: none !important;\n' +
      '  box-shadow: 0 2px 8px rgba(157, 2, 8, 0.25) !important;\n' +
      '  transition: background 0.2s ease, transform 0.2s ease !important;\n' +
      '  display: inline-flex !important;\n' +
      '  align-items: center !important;\n' +
      '  justify-content: center !important;\n' +
      '  white-space: nowrap !important;\n' +
      '}\n' +
      '.lhv-cta-booking:hover {\n' +
      '  background: #800000 !important;\n' +
      '  transform: translateY(-1px) !important;\n' +
      '}\n' +
      '.lhv-nav-item:focus-within .lhv-dropdown-menu {\n' +
      '  opacity: 1 !important;\n' +
      '  visibility: visible !important;\n' +
      '  pointer-events: auto !important;\n' +
      '  transform: translateY(0) !important;\n' +
      '}\n' +
      '@media (min-width: 1024px) and (max-width: 1440px) {\n' +
      '  #lhv-header {\n' +
      '    height: 62px !important;\n' +
      '    min-height: 62px !important;\n' +
      '    max-height: 62px !important;\n' +
      '    padding: 0 clamp(12px, 1.4vw, 22px) !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-logo-img {\n' +
      '    height: clamp(38px, 3.4vw, 48px) !important;\n' +
      '    max-height: clamp(38px, 3.4vw, 48px) !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-desktop-menu {\n' +
      '    gap: clamp(6px, 1vw, 16px) !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-nav-link {\n' +
      '    font-size: clamp(10.5px, 0.9vw, 13px) !important;\n' +
      '    letter-spacing: 0.015em !important;\n' +
      '    padding: 18px 0 !important;\n' +
      '    gap: 2px !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-chevron {\n' +
      '    font-size: 13px !important;\n' +
      '    margin-left: 1px !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-actions-wrap {\n' +
      '    gap: clamp(4px, 0.5vw, 8px) !important;\n' +
      '    flex-shrink: 0 !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-action-btn {\n' +
      '    width: 28px !important;\n' +
      '    height: 28px !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-action-btn .material-symbols-outlined {\n' +
      '    font-size: 18px !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-divider {\n' +
      '    margin: 0 2px !important;\n' +
      '    height: 18px !important;\n' +
      '  }\n' +
      '  #lhv-header .lhv-cta-booking {\n' +
      '    font-size: clamp(10px, 0.82vw, 11.5px) !important;\n' +
      '    letter-spacing: 0.02em !important;\n' +
      '    padding: 7px clamp(8px, 0.9vw, 14px) !important;\n' +
      '  }\n' +
      '}\n' +
      '/* Mobile Right Actions Cluster */\n' +
      '.lhv-mob-actions {\n' +
      '  display: none;\n' +
      '  align-items: center;\n' +
      '  gap: 4px;\n' +
      '}\n' +
      '@media (max-width: 1023px) {\n' +
      '  .lhv-mob-actions { display: flex !important; }\n' +
      '}\n' +
      '.lhv-burger-btn {\n' +
      '  display: none;\n' +
      '  flex-direction: column;\n' +
      '  justify-content: center;\n' +
      '  align-items: center;\n' +
      '  width: 36px;\n' +
      '  height: 36px;\n' +
      '  background: transparent;\n' +
      '  border: none;\n' +
      '  cursor: pointer;\n' +
      '  border-radius: 6px;\n' +
      '  gap: 4px;\n' +
      '  margin-left: 2px;\n' +
      '}\n' +
      '@media (max-width: 1023px) {\n' +
      '  .lhv-burger-btn { display: flex !important; }\n' +
      '}\n' +
      '.lhv-burger-bar {\n' +
      '  width: 20px;\n' +
      '  height: 2px;\n' +
      '  background: #1a1a1a !important;\n' +
      '  border-radius: 2px;\n' +
      '  transition: transform 0.3s ease, opacity 0.3s ease;\n' +
      '}\n' +
      '.lhv-burger-btn.is-active .lhv-burger-bar:nth-child(1) {\n' +
      '  transform: translateY(6px) rotate(45deg);\n' +
      '  background: #9d0208 !important;\n' +
      '}\n' +
      '.lhv-burger-btn.is-active .lhv-burger-bar:nth-child(2) { opacity: 0; }\n' +
      '.lhv-burger-btn.is-active .lhv-burger-bar:nth-child(3) {\n' +
      '  transform: translateY(-6px) rotate(-45deg);\n' +
      '  background: #9d0208 !important;\n' +
      '}\n' +
      '/* Mobile Backdrop Dim + Blur Filter */\n' +
      '#lhv-mob-backdrop {\n' +
      '  position: fixed !important;\n' +
      '  top: 0 !important;\n' +
      '  left: 0 !important;\n' +
      '  right: 0 !important;\n' +
      '  bottom: 0 !important;\n' +
      '  background: rgba(0, 0, 0, 0.55) !important;\n' +
      '  backdrop-filter: blur(6px) !important;\n' +
      '  -webkit-backdrop-filter: blur(6px) !important;\n' +
      '  z-index: 9997 !important;\n' +
      '  opacity: 0 !important;\n' +
      '  pointer-events: none !important;\n' +
      '  transition: opacity 0.35s ease !important;\n' +
      '}\n' +
      '#lhv-mob-backdrop.is-open {\n' +
      '  opacity: 1 !important;\n' +
      '  pointer-events: auto !important;\n' +
      '}\n' +
      '/* Mobile Drawer Side Navigation */\n' +
      '#lhv-mobile-drawer {\n' +
      '  position: fixed !important;\n' +
      '  top: 0 !important;\n' +
      '  left: 0 !important;\n' +
      '  bottom: 0 !important;\n' +
      '  width: 78% !important;\n' +
      '  max-width: 320px !important;\n' +
      '  background: #ffffff !important;\n' +
      '  z-index: 9998 !important;\n' +
      '  display: flex !important;\n' +
      '  flex-direction: column !important;\n' +
      '  visibility: hidden !important;\n' +
      '  pointer-events: none !important;\n' +
      '  opacity: 0 !important;\n' +
      '  transform: translateX(-100%) !important;\n' +
      '  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, visibility 0.35s !important;\n' +
      '  overflow-y: auto !important;\n' +
      '  padding: 16px 20px 80px !important;\n' +
      '  box-sizing: border-box !important;\n' +
      '  border-top-right-radius: 20px !important;\n' +
      '  border-bottom-right-radius: 20px !important;\n' +
      '  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.25) !important;\n' +
      '}\n' +
      '#lhv-mobile-drawer.is-open { transform: translateX(0) !important; visibility: visible !important; pointer-events: auto !important; opacity: 1 !important; }\n' +
      '.lhv-mob-link {\n' +
      '  font-family: "Montserrat", "Plus Jakarta Sans", sans-serif !important;\n' +
      '  font-size: 15px !important;\n' +
      '  font-weight: 700 !important;\n' +
      '  text-transform: uppercase !important;\n' +
      '  letter-spacing: 0.05em !important;\n' +
      '  color: #1a1a1a !important;\n' +
      '  text-decoration: none !important;\n' +
      '  padding: 14px 0 !important;\n' +
      '  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;\n' +
      '  display: flex !important;\n' +
      '  align-items: center !important;\n' +
      '  justify-content: space-between !important;\n' +
      '}\n' +
      '.lhv-mob-link.lhv-active {\n' +
      '  color: #9d0208 !important;\n' +
      '  font-weight: 800 !important;\n' +
      '  background: rgba(157, 2, 8, 0.08) !important;\n' +
      '  border-left: 4px solid #9d0208 !important;\n' +
      '  padding-left: 12px !important;\n' +
      '  border-radius: 0 8px 8px 0 !important;\n' +
      '  animation: lhv-active-glow 2.5s ease-in-out infinite !important;\n' +
      '  transition: all 0.3s ease !important;\n' +
      '}\n' +
      '@keyframes lhv-active-glow {\n' +
      '  0%, 100% {\n' +
      '    background: rgba(157, 2, 8, 0.08) !important;\n' +
      '    box-shadow: inset 3px 0 0 #9d0208 !important;\n' +
      '  }\n' +
      '  50% {\n' +
      '    background: rgba(157, 2, 8, 0.14) !important;\n' +
      '    box-shadow: inset 4px 0 0 #ba020a, 0 4px 15px rgba(157, 2, 8, 0.15) !important;\n' +
      '  }\n' +
      '}\n' +
      '.lhv-mob-accordion { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; padding-left: 16px; }\n' +
      '.lhv-mob-sublink {\n' +
      '  font-family: "Montserrat", "Plus Jakarta Sans", sans-serif !important;\n' +
      '  font-size: 14px !important;\n' +
      '  font-weight: 600 !important;\n' +
      '  color: #333333 !important;\n' +
      '  text-decoration: none !important;\n' +
      '  display: block !important;\n' +
      '  padding: 10px 0 !important;\n' +
      '  border-bottom: 1px dashed rgba(0, 0, 0, 0.06) !important;\n' +
      '}\n' +
      '.lhv-mob-sublink.lhv-active {\n' +
      '  color: #9d0208 !important;\n' +
      '  font-weight: 800 !important;\n' +
      '  padding-left: 8px !important;\n' +
      '  border-left: 3px solid #9d0208 !important;\n' +
      '}\n' +
      '/* Mini Cart Drawer Styles */\n' +
      '#lhv-cart-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0, 0, 0, 0.6) !important; backdrop-filter: blur(4px) !important; -webkit-backdrop-filter: blur(4px) !important; z-index: 999990 !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; transition: opacity 0.35s ease, visibility 0.35s !important; }\n' +
      '#lhv-cart-backdrop.is-open { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; }\n' +
      '#lhv-cart-drawer { position: fixed !important; top: 0 !important; right: 0 !important; width: 420px !important; max-width: 100vw !important; height: 100vh !important; background: #ffffff !important; z-index: 999995 !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; transform: translateX(100%) !important; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, visibility 0.35s !important; display: flex !important; flex-direction: column !important; box-shadow: -10px 0 30px rgba(0,0,0,0.15) !important; font-family: "Inter", sans-serif !important; border-radius: 24px 0 0 24px !important; overflow: hidden !important; }\n' +
      '#lhv-cart-drawer.is-open { transform: translateX(0) !important; visibility: visible !important; pointer-events: auto !important; opacity: 1 !important; }\n' +
      '.lhv-cart-drag-handle { width: 36px !important; height: 4px !important; background: #e0e0e0 !important; border-radius: 2px !important; margin: 8px auto 0 !important; display: none !important; }\n' +
      '@media (max-width: 767px) {\n' +
      '  .lhv-cart-drag-handle { display: block !important; }\n' +
      '  #lhv-cart-drawer {\n' +
      '    top: auto !important;\n' +
      '    bottom: 0 !important;\n' +
      '    left: 0 !important;\n' +
      '    right: 0 !important;\n' +
      '    width: 100% !important;\n' +
      '    max-width: 100vw !important;\n' +
      '    height: 75vh !important;\n' +
      '    max-height: 80vh !important;\n' +
      '    border-radius: 24px 24px 0 0 !important;\n' +
      '    overflow: hidden !important;\n' +
      '    visibility: hidden !important;\n' +
      '    pointer-events: none !important;\n' +
      '    opacity: 0 !important;\n' +
      '    transform: translateY(100%) !important;\n' +
      '    box-shadow: 0 -10px 30px rgba(0,0,0,0.25) !important;\n' +
      '  }\n' +
      '  #lhv-cart-drawer.is-open {\n' +
      '    transform: translateY(0) !important;\n' +
      '    visibility: visible !important;\n' +
      '    pointer-events: auto !important;\n' +
      '    opacity: 1 !important;\n' +
      '  }\n' +
      '}\n' +
      '.lhv-cart-header { padding: 14px 20px 16px !important; border-bottom: 1px solid #eee !important; display: flex !important; align-items: center !important; justify-content: space-between !important; background: #ffffff !important; position: relative !important; }\n' +
      '.lhv-cart-title { font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; font-weight: 800 !important; font-size: 18px !important; color: #000000 !important; margin: 0 !important; letter-spacing: -0.02em !important; }\n' +
      '.lhv-cart-close { background: none !important; border: none !important; cursor: pointer !important; padding: 4px !important; color: #666 !important; transition: color 0.2s !important; display: flex !important; align-items: center !important; justify-content: center !important; }\n' +
      '.lhv-cart-close:hover { color: #9d0208 !important; }\n' +
      '.lhv-freeship-box { background: #fdfbf7 !important; border: 1px solid #f0e6d8 !important; border-radius: 12px !important; padding: 12px 16px !important; margin: 12px 20px 0 !important; font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; }\n' +
      '.lhv-freeship-text { font-size: 12px !important; color: #333 !important; margin-bottom: 8px !important; text-align: center !important; font-weight: 600 !important; font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; }\n' +
      '.lhv-freeship-track { position: relative !important; height: 8px !important; background: #e9ecef !important; border-radius: 999px !important; overflow: visible !important; }\n' +
      '.lhv-freeship-fill { height: 100% !important; background: linear-gradient(90deg, #9d0208, #d90429) !important; border-radius: 999px !important; transition: width 0.4s ease !important; position: relative !important; }\n' +
      '.lhv-freeship-icon { position: absolute !important; right: -10px !important; top: -6px !important; background: #9d0208 !important; color: #ffffff !important; width: 20px !important; height: 20px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 12px !important; box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important; }\n' +
      '.lhv-cart-body { flex: 1 !important; overflow-y: auto !important; padding: 16px 20px !important; font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-item { display: flex !important; gap: 12px !important; padding: 12px !important; margin-bottom: 12px !important; border: 1px solid #f0f0f0 !important; border-radius: 14px !important; background: #ffffff !important; box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important; position: relative !important; font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-item-img { width: 70px !important; height: 85px !important; object-fit: cover !important; border-radius: 10px !important; background: #f8f8f8 !important; flex-shrink: 0 !important; }\n' +
      '.lhv-cart-item-info { flex: 1 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }\n' +
      '.lhv-cart-item-title { font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; font-size: 13.5px !important; font-weight: 700 !important; color: #111 !important; line-height: 1.35 !important; margin-bottom: 4px !important; padding-right: 20px !important; letter-spacing: -0.01em !important; }\n' +
      '.lhv-cart-item-spec { font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; font-size: 11.5px !important; color: #666 !important; margin-bottom: 6px !important; font-weight: 500 !important; }\n' +
      '.lhv-cart-item-bottom { display: flex !important; align-items: center !important; justify-content: space-between !important; margin-top: 6px !important; }\n' +
      '.lhv-cart-qty-ctrl { display: flex !important; align-items: center !important; border: 1px solid #ddd !important; border-radius: 8px !important; overflow: hidden !important; background: #fff !important; }\n' +
      '.lhv-cart-qty-btn { width: 26px !important; height: 26px !important; border: none !important; background: #f8f8f8 !important; color: #333 !important; font-weight: 700 !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-qty-btn:hover { background: #e9ecef !important; }\n' +
      '.lhv-cart-qty-num { width: 32px !important; text-align: center !important; font-size: 12px !important; font-weight: 700 !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-item-price { font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; font-size: 14.5px !important; font-weight: 800 !important; color: #9d0208 !important; letter-spacing: -0.01em !important; }\n' +
      '.lhv-cart-item-remove { position: absolute !important; top: 8px !important; right: 8px !important; background: none !important; border: none !important; color: #999 !important; cursor: pointer !important; font-size: 16px !important; padding: 2px !important; }\n' +
      '.lhv-cart-item-remove:hover { color: #9d0208 !important; }\n' +
      '.lhv-cart-empty { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; padding: 45px 20px !important; color: #666 !important; width: 100% !important; box-sizing: border-box !important; margin: 0 auto !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-empty-icon { font-size: 52px !important; color: #d4af37 !important; margin-bottom: 16px !important; display: block !important; }\n' +
      '.lhv-cart-empty-btn { display: inline-flex !important; align-items: center !important; justify-content: center !important; background: #9d0208 !important; color: #ffffff !important; border: none !important; padding: 12px 28px !important; border-radius: 999px !important; font-weight: 700 !important; font-size: 12px !important; cursor: pointer !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin: 0 auto !important; box-shadow: 0 4px 12px rgba(157, 2, 8, 0.25) !important; transition: all 0.2s ease !important; text-align: center !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-empty-btn:hover { background: #800020 !important; transform: translateY(-1px) !important; }\n' +
      '.lhv-cart-footer { padding: 16px 20px !important; border-top: 1px solid #eee !important; background: #ffffff !important; box-shadow: 0 -4px 15px rgba(0,0,0,0.03) !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-total-row { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 12px !important; }\n' +
      '.lhv-cart-total-label { font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; font-size: 13px !important; font-weight: 700 !important; color: #333 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }\n' +
      '.lhv-cart-total-price { font-family: "Be Vietnam Pro", "Plus Jakarta Sans", "Inter", sans-serif !important; font-size: 19px !important; font-weight: 800 !important; color: #9d0208 !important; letter-spacing: -0.01em !important; }\n' +
      '.lhv-cart-checkout-btn { display: block !important; width: 100% !important; padding: 14px !important; background: #9d0208 !important; color: #ffffff !important; font-size: 13px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; text-align: center !important; border-radius: 14px !important; border: none !important; cursor: pointer !important; transition: background 0.2s !important; box-shadow: 0 4px 12px rgba(157, 2, 8, 0.25) !important; text-decoration: none !important; box-sizing: border-box !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-checkout-btn:hover { background: #800020 !important; }\n' +
      '.lhv-cart-view-link { display: block !important; text-align: center !important; margin-top: 10px !important; font-size: 12px !important; color: #666 !important; text-decoration: underline !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-cart-view-link:hover { color: #9d0208 !important; }\n' +
      '/* Quick Size Selector Modal Styles */\n' +
      '#lhv-quicksize-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0, 0, 0, 0.6) !important; backdrop-filter: blur(4px) !important; -webkit-backdrop-filter: blur(4px) !important; z-index: 999998 !important; display: flex !important; align-items: center !important; justify-content: center !important; opacity: 0 !important; pointer-events: none !important; transition: opacity 0.3s ease !important; padding: 16px !important; box-sizing: border-box !important; }\n' +
      '#lhv-quicksize-backdrop.is-open { opacity: 1 !important; pointer-events: auto !important; }\n' +
      '#lhv-quicksize-modal { background: #ffffff !important; border-radius: 20px !important; width: 420px !important; max-width: 100% !important; padding: 24px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important; position: relative !important; transform: scale(0.9) translateY(10px) !important; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important; box-sizing: border-box !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '#lhv-quicksize-backdrop.is-open #lhv-quicksize-modal { transform: scale(1) translateY(0) !important; }\n' +
      '.lhv-qs-header { display: flex !important; gap: 14px !important; padding-bottom: 16px !important; border-bottom: 1px solid #eee !important; margin-bottom: 16px !important; position: relative !important; text-align: left !important; }\n' +
      '.lhv-qs-img { width: 75px !important; height: 90px !important; object-fit: cover !important; border-radius: 10px !important; background: #f8f8f8 !important; flex-shrink: 0 !important; }\n' +
      '.lhv-qs-title { font-size: 14px !important; font-weight: 700 !important; color: #111 !important; line-height: 1.35 !important; margin-bottom: 6px !important; padding-right: 24px !important; text-align: left !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-price { font-size: 16px !important; font-weight: 800 !important; color: #9d0208 !important; text-align: left !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-close { position: absolute !important; top: 0 !important; right: 0 !important; background: none !important; border: none !important; font-size: 20px !important; color: #888 !important; cursor: pointer !important; padding: 2px !important; }\n' +
      '.lhv-qs-close:hover { color: #9d0208 !important; }\n' +
      '.lhv-qs-label-row { display: flex !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 12px !important; text-align: left !important; }\n' +
      '.lhv-qs-label { font-size: 11.5px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; color: #a17f22 !important; margin: 0 !important; display: block !important; text-align: left !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-guide-btn { background: none !important; border: none !important; color: #9d0208 !important; font-size: 11.5px !important; font-weight: 600 !important; text-decoration: underline !important; text-underline-offset: 2px !important; cursor: pointer !important; padding: 0 !important; font-family: inherit !important; transition: color 0.2s !important; display: inline-flex !important; align-items: center !important; gap: 3px !important; }\n' +
      '.lhv-qs-guide-btn:hover { color: #111111 !important; }\n' +
      '/* Global Size Guide Modal Styles */\n' +
      '#lhv-sizeguide-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0, 0, 0, 0.65) !important; backdrop-filter: blur(5px) !important; -webkit-backdrop-filter: blur(5px) !important; z-index: 999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; opacity: 0 !important; pointer-events: none !important; transition: opacity 0.3s ease !important; padding: 16px !important; box-sizing: border-box !important; }\n' +
      '#lhv-sizeguide-backdrop.is-open { opacity: 1 !important; pointer-events: auto !important; }\n' +
      '#lhv-sizeguide-modal { background: #ffffff !important; border-radius: 20px !important; width: 560px !important; max-width: 100% !important; max-height: 88vh !important; overflow-y: auto !important; padding: 24px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.35) !important; position: relative !important; transform: scale(0.9) translateY(10px) !important; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important; box-sizing: border-box !important; font-family: "Inter", sans-serif !important; text-align: left !important; }\n' +
      '#lhv-sizeguide-backdrop.is-open #lhv-sizeguide-modal { transform: scale(1) translateY(0) !important; }\n' +
      '.lhv-sg-header { display: flex !important; justify-content: space-between !important; align-items: flex-start !important; border-bottom: 1px solid #eee !important; padding-bottom: 12px !important; margin-bottom: 16px !important; text-align: left !important; }\n' +
      '.lhv-sg-title { font-family: "Be Vietnam Pro", "Inter", sans-serif !important; font-size: 15px !important; font-weight: 700 !important; color: #111 !important; margin: 0 0 4px 0 !important; text-align: left !important; }\n' +
      '.lhv-sg-subtitle { font-size: 12px !important; color: #666 !important; margin: 0 !important; text-align: left !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-sg-close { background: none !important; border: none !important; font-size: 20px !important; color: #888 !important; cursor: pointer !important; padding: 2px 6px !important; border-radius: 50% !important; line-height: 1 !important; }\n' +
      '.lhv-sg-close:hover { color: #9d0208 !important; background: #f5f5f5 !important; }\n' +
      '.lhv-sg-tabs { display: flex !important; gap: 6px !important; border-bottom: 2px solid #eee !important; margin-bottom: 16px !important; overflow-x: auto !important; }\n' +
      '.lhv-sg-tab { padding: 8px 14px !important; font-size: 12px !important; font-weight: 700 !important; color: #666 !important; background: none !important; border: none !important; border-bottom: 3px solid transparent !important; cursor: pointer !important; transition: all 0.2s !important; white-space: nowrap !important; margin-bottom: -2px !important; font-family: inherit !important; }\n' +
      '.lhv-sg-tab.active { color: #9d0208 !important; border-bottom-color: #9d0208 !important; background: rgba(157, 2, 8, 0.05) !important; }\n' +
      '.lhv-sg-table { width: 100% !important; border-collapse: collapse !important; font-size: 12px !important; text-align: center !important; margin-bottom: 16px !important; border-radius: 8px !important; overflow: hidden !important; border: 1px solid #e8e8e8 !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-sg-table th { background: #f9f6f0 !important; color: #111 !important; padding: 10px 8px !important; border: 1px solid #e5e0d8 !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 11px !important; }\n' +
      '.lhv-sg-table td { padding: 9px 8px !important; border: 1px solid #eee !important; color: #333 !important; font-weight: 500 !important; }\n' +
      '.lhv-sg-table tr:nth-child(even) { background: #fafafa !important; }\n' +
      '.lhv-sg-advice { background: #fdfbf7 !important; border: 1px solid #f0e6d8 !important; border-radius: 12px !important; padding: 12px 16px !important; font-size: 11.5px !important; color: #444 !important; line-height: 1.55 !important; text-align: left !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-grid { display: flex !important; flex-wrap: wrap !important; gap: 10px !important; margin-bottom: 16px !important; }\n' +
      '.lhv-qs-btn { min-width: 44px !important; height: 42px !important; padding: 0 12px !important; border: 1.5px solid #ddd !important; border-radius: 8px !important; background: #ffffff !important; color: #222 !important; font-size: 13px !important; font-weight: 700 !important; cursor: pointer !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-btn:hover { border-color: #9d0208 !important; color: #9d0208 !important; }\n' +
      '.lhv-qs-btn.selected { background: #9d0208 !important; border-color: #9d0208 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(157, 2, 8, 0.3) !important; }\n' +
      '.lhv-qs-warn { font-size: 12px !important; font-weight: 700 !important; color: #9d0208 !important; margin-bottom: 12px !important; display: none; text-align: center !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-confirm-btn { width: 100% !important; padding: 14px !important; background: #9d0208 !important; color: #ffffff !important; font-size: 13px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; border-radius: 12px !important; border: none !important; cursor: pointer !important; transition: background 0.2s !important; box-shadow: 0 4px 15px rgba(157, 2, 8, 0.25) !important; font-family: "Be Vietnam Pro", "Inter", sans-serif !important; }\n' +
      '.lhv-qs-confirm-btn:hover { background: #800020 !important; }\n';

    if (!document.getElementById('lhv-cart-gfonts')) {
      var gfLink = document.createElement('link');
      gfLink.id = 'lhv-cart-gfonts';
      gfLink.rel = 'stylesheet';
      gfLink.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(gfLink);
    }

    var el = document.createElement('style');
    el.id = 'lhv-nav-v5-css';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ══════════════════════════════════════════════
     3. BUILD AND INJECT NAV BAR
  ══════════════════════════════════════════════ */
  function buildNavBar() {
    if (document.getElementById('lhv-header')) return;

    var active = getActivePage();

    /* Hide any old legacy static headers */
    var oldSelectors = ['header:not(#lhv-header)', 'nav.fixed:not(#lhv-header)', 'nav[class*="fixed"]:not(#lhv-header)'];
    oldSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (node) {
        node.classList.add('lhv-old-nav');
        node.style.display = 'none';
      });
    });

    /* Logo HTML (Left Side) */
    var logoHTML = '' +
      '<a href="/ja/" class="lhv-logo-link" aria-label="' + LOGO_ALT + '">' +
        '<img class="lhv-logo-img" src="' + LOGO_SRC + '" alt="' + LOGO_ALT + '" onerror="this.style.display=\'none\'">' +
      '</a>';

    /* Desktop Navigation List */
    var navHTML = '<ul class="lhv-desktop-menu" role="list">';
    PAGES.forEach(function (p) {
      var isActive = active === p.href || (p.dropdown && p.dropdown.some(function (d) { return d.href === active; }));
      var hasDd = !!p.dropdown;

      navHTML += '<li class="lhv-nav-item">';
      if (hasDd) {
        navHTML += '<a href="' + p.href + '" class="lhv-nav-link' + (isActive ? ' lhv-active' : '') + '">' +
          p.label +
          '<svg class="lhv-chevron-svg" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4"/></svg>' +
        '</a>';
        navHTML += '<div class="lhv-dropdown-menu">';
        p.dropdown.forEach(function (d) {
          navHTML += '<a href="' + d.href + '" class="lhv-dropdown-link' + (active === d.href ? ' lhv-active' : '') + '">' + d.label + '</a>';
        });
        navHTML += '</div>';
      } else {
        navHTML += '<a href="' + p.href + '" class="lhv-nav-link' + (isActive ? ' lhv-active' : '') + '">' + p.label + '</a>';
      }
      navHTML += '</li>';
    });
    navHTML += '</ul>';

    /* Desktop Right Action Buttons */
    var actionsHTML = '' +
      '<div class="lhv-actions-wrap">' +
        '<button onclick="openSearchModal()" class="lhv-action-btn" aria-label="Tìm kiếm" title="Tìm kiếm">' +
          '<span class="material-symbols-outlined">search</span>' +
        '</button>' +
        '<button onclick="openNewsModal()" class="lhv-action-btn" aria-label="Bảng tin" title="Bảng tin">' +
          '<span class="material-symbols-outlined">newspaper</span>' +
        '</button>' +
        '<button onclick="window.openCartDrawer(event)" class="lhv-action-btn" aria-label="Giỏ hàng" title="Giỏ hàng" style="background:none;border:none;cursor:pointer;">' +
          '<span class="material-symbols-outlined">shopping_bag</span>' +
          '<span class="lhv-cart-badge"></span>' +
        '</button>' +
        '<span class="lhv-divider"></span>' +
        '<a href="/ja/tu-van.html" class="lhv-cta-booking">Tư Vấn</a>' +
      '</div>';

    /* Mobile 3-bar Hamburger Button (FAR LEFT SIDE) */
    var mobBurgerHTML = '' +
      '<button id="lhv-burger-btn" class="lhv-burger-btn" aria-label="Menu">' +
        '<span class="lhv-burger-bar"></span>' +
        '<span class="lhv-burger-bar"></span>' +
        '<span class="lhv-burger-bar"></span>' +
      '</button>';

    /* Mobile Actions Cluster (FAR RIGHT SIDE: Search -> News -> Account -> Cart) */
    var mobActionsHTML = '' +
      '<div class="lhv-mob-actions">' +
        '<button onclick="openSearchModal()" class="lhv-action-btn" aria-label="Tìm kiếm">' +
          '<span class="material-symbols-outlined">search</span>' +
        '</button>' +
        '<button onclick="openNewsModal()" class="lhv-action-btn" aria-label="Bảng tin">' +
          '<span class="material-symbols-outlined">newspaper</span>' +
        '</button>' +
        '<button onclick="window.openCartDrawer(event)" class="lhv-action-btn" aria-label="Giỏ hàng" style="background:none;border:none;cursor:pointer;">' +
          '<span class="material-symbols-outlined">shopping_bag</span>' +
          '<span class="lhv-cart-badge"></span>' +
        '</button>' +
      '</div>';

    /* Create Header Root Node */
    var headerNode = document.createElement('header');
    headerNode.id = 'lhv-header';
    headerNode.setAttribute('role', 'banner');
    headerNode.innerHTML = mobBurgerHTML + logoHTML + navHTML + actionsHTML + mobActionsHTML;

    /* Create Mobile Backdrop Node */
    var backdropNode = document.createElement('div');
    backdropNode.id = 'lhv-mob-backdrop';

    /* Create Mobile Drawer Node */
    var drawerNode = document.createElement('div');
    drawerNode.id = 'lhv-mobile-drawer';

    var mobDrawerHTML = '' +
      '<div style="display: flex; align-items: center; justify-content: flex-end; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);">' +
        '<button id="lhv-drawer-close-btn" style="background: transparent; border: none; font-size: 22px; cursor: pointer; color: #1a1a1a; padding: 4px 8px; display: flex; align-items: center;">✕</button>' +
      '</div>';
    PAGES.forEach(function (p, idx) {
      var isActive = active === p.href || (p.dropdown && p.dropdown.some(function (d) { return d.href === active; }));
      if (p.dropdown) {
        mobDrawerHTML += '' +
          '<div>' +
            '<div class="lhv-mob-link' + (isActive ? ' lhv-active' : '') + '" onclick="toggleMobAcc(' + idx + ')">' +
              '<span>' + p.label + '</span>' +
              '<span class="lhv-mob-chevron" aria-hidden="true" style="display:inline-flex;width:20px;height:20px;flex:0 0 20px;align-items:center;justify-content:center;transition:transform 160ms ease;" id="mob-arrow-' + idx + '"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 7l5 5 5-5"/></svg></span>' +
            '</div>' +
            '<div class="lhv-mob-accordion" id="mob-acc-' + idx + '">';
        p.dropdown.forEach(function (d) {
          mobDrawerHTML += '<a href="' + d.href + '" class="lhv-mob-sublink">' + d.label + '</a>';
        });
        mobDrawerHTML += '</div></div>';
      } else {
        mobDrawerHTML += '<a href="' + p.href + '" class="lhv-mob-link' + (isActive ? ' lhv-active' : '') + '">' + p.label + '</a>';
      }
    });
    mobDrawerHTML += '' +
      '<div style="margin-top: 24px;">' +
        '<a href="/ja/tu-van.html" class="lhv-cta-booking" style="width: 100%; text-align: center; display: block; box-sizing: border-box; padding: 14px 0; font-size: 14px;">Tư Vấn May Đo</a>' +
      '</div>';
    drawerNode.innerHTML = mobDrawerHTML;

    /* Create Mini Cart Backdrop & Drawer Nodes */
    var cartBackdropNode = document.createElement('div');
    cartBackdropNode.id = 'lhv-cart-backdrop';

    var cartDrawerNode = document.createElement('div');
    cartDrawerNode.id = 'lhv-cart-drawer';

    /* Prepend to BODY */
    if (document.body.firstChild) {
      document.body.insertBefore(headerNode, document.body.firstChild);
    } else {
      document.body.appendChild(headerNode);
    }
    document.body.appendChild(backdropNode);
    document.body.appendChild(drawerNode);
    document.body.appendChild(cartBackdropNode);
    document.body.appendChild(cartDrawerNode);

    /* Mobile Drawer & Backdrop Toggle Events */
    var burgerBtn = document.getElementById('lhv-burger-btn');

    function closeDrawer() {
      if (burgerBtn) burgerBtn.classList.remove('is-active');
      drawerNode.classList.remove('is-open');
      if (backdropNode) backdropNode.classList.remove('is-open');
    }

    function toggleDrawer() {
      var isOpen = drawerNode.classList.toggle('is-open');
      if (burgerBtn) burgerBtn.classList.toggle('is-active', isOpen);
      if (backdropNode) backdropNode.classList.toggle('is-open', isOpen);
    }

    if (burgerBtn) burgerBtn.addEventListener('click', toggleDrawer);
    if (backdropNode) backdropNode.addEventListener('click', closeDrawer);

    setTimeout(function() {
      var closeBtn = document.getElementById('lhv-drawer-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    }, 100);

    /* Cart Drawer Global Event Listeners & Functions */
    window.openCartDrawer = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      var drawer = document.getElementById('lhv-cart-drawer');
      var backdrop = document.getElementById('lhv-cart-backdrop');
      if (drawer && backdrop) {
        window.renderCartDrawer();
        drawer.classList.add('is-open');
        backdrop.classList.add('is-open');
      }
    };

    window.closeCartDrawer = function() {
      var drawer = document.getElementById('lhv-cart-drawer');
      var backdrop = document.getElementById('lhv-cart-backdrop');
      if (drawer) drawer.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
    };

    if (cartBackdropNode) {
      cartBackdropNode.addEventListener('click', window.closeCartDrawer);
    }

    function esc(val) {
      return String(val == null ? '' : val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function safeCartImgUrl(raw) {
      var s = String(raw || '').trim();
      if (!s || /^(?:javascript|vbscript|data:text)/i.test(s)) {
        return '/images/Phụ Kiện/Cài cà vạt/2.webp';
      }
      if (s.indexOf('images/') === 0) return '/' + s;
      return s;
    }

    window.renderCartDrawer = function() {
      var drawer = document.getElementById('lhv-cart-drawer');
      if (!drawer) return;
      
      var cart = [];
      try {
        cart = JSON.parse(localStorage.getItem('maylehuong_cart') || '[]');
        if (!Array.isArray(cart)) cart = [];
      } catch(err) { cart = []; }

      var totalPrice = 0;
      cart.forEach(function(item) {
        var qty = Math.max(1, Math.min(99, parseInt(item.quantity || item.qty || 1, 10) || 1));
        var rawPrice = parseInt(String(item.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
        totalPrice += rawPrice * qty;
      });

      var freeShipThreshold = 500000;
      var freeShipPercent = Math.min(100, Math.round((totalPrice / freeShipThreshold) * 100));
      var freeShipNeeded = Math.max(0, freeShipThreshold - totalPrice);

      var freeshipHTML = '';
      if (totalPrice >= freeShipThreshold) {
        freeshipHTML = '<div class="lhv-freeship-box">' +
            '<div class="lhv-freeship-text" style="color: #9d0208; font-weight: 700;">' +
              '<span class="material-symbols-outlined" style="font-size: 14px; vertical-align: text-bottom;">verified</span> Quý khách đã đủ điều kiện <strong>MIỄN PHÍ VẬN CHUYỂN</strong>!' +
            '</div>' +
            '<div class="lhv-freeship-track">' +
              '<div class="lhv-freeship-fill" style="width: 100%;">' +
                '<div class="lhv-freeship-icon"><span class="material-symbols-outlined" style="font-size:12px;">local_shipping</span></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      } else {
        freeshipHTML = '<div class="lhv-freeship-box">' +
            '<div class="lhv-freeship-text">' +
              'Bạn cần mua thêm <strong style="color: #9d0208;">' + freeShipNeeded.toLocaleString('ja-JP') + '₫</strong> để được <strong>MIỄN PHÍ VẬN CHUYỂN</strong>' +
            '</div>' +
            '<div class="lhv-freeship-track">' +
              '<div class="lhv-freeship-fill" style="width: ' + freeShipPercent + '%;">' +
                '<div class="lhv-freeship-icon"><span class="material-symbols-outlined" style="font-size:12px;">local_shipping</span></div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      var bodyHTML = '';
      if (cart.length === 0) {
        bodyHTML = '<div class="lhv-cart-empty">' +
            '<span class="material-symbols-outlined lhv-cart-empty-icon" style="color: #d4af37 !important;">shopping_bag</span>' +
            '<p style="font-size: 15px; font-weight: 700; color: #111; margin-bottom: 8px; text-align: center;">Giỏ hàng của bạn đang trống</p>' +
            '<p style="font-size: 12px; color: #666; margin-bottom: 24px; text-align: center; max-width: 260px; margin-left: auto; margin-right: auto;">Hãy chọn những món phụ kiện ưng ý để làm mới phong cách!</p>' +
            '<button type="button" class="lhv-cart-empty-btn" onclick="window.closeCartDrawer()">TIẾP TỤC MUA SẮM</button>' +
          '</div>';
      } else {
        bodyHTML += '<div style="display: flex; flex-direction: column;">';
        cart.forEach(function(item, idx) {
          var qty = Math.max(1, Math.min(99, parseInt(item.quantity || item.qty || 1, 10) || 1));
          var priceNum = parseInt(String(item.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
          var itemTotal = (priceNum * qty).toLocaleString('ja-JP') + '₫';
          var imgSrc = esc(safeCartImgUrl(item.img || item.image || '/images/Phụ Kiện/Cài cà vạt/2.webp'));
          var safeName = esc(item.name || 'Sản phẩm');
          var safeSize = item.size ? esc(item.size) : '';
          
          bodyHTML += '<div class="lhv-cart-item">' +
              '<img src="' + imgSrc + '" alt="' + safeName + '" class="lhv-cart-item-img" onerror="this.src=\'/images/Phụ Kiện/Cài cà vạt/2.webp\'">' +
              '<div class="lhv-cart-item-info">' +
                '<div>' +
                  '<div class="lhv-cart-item-title">' + safeName + '</div>' +
                  (safeSize ? '<div class="lhv-cart-item-spec">Size: ' + safeSize + '</div>' : '') +
                '</div>' +
                '<div class="lhv-cart-item-bottom">' +
                  '<div class="lhv-cart-qty-ctrl">' +
                    '<button type="button" class="lhv-cart-qty-btn" onclick="window.updateDrawerQty(' + idx + ', -1)">-</button>' +
                    '<span class="lhv-cart-qty-num">' + qty + '</span>' +
                    '<button type="button" class="lhv-cart-qty-btn" onclick="window.updateDrawerQty(' + idx + ', 1)">+</button>' +
                  '</div>' +
                  '<span class="lhv-cart-item-price">' + itemTotal + '</span>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="lhv-cart-item-remove" onclick="window.removeDrawerItem(' + idx + ')" title="Xóa sản phẩm">✕</button>' +
            '</div>';
        });
        bodyHTML += '</div>';
      }

      var formattedTotal = totalPrice.toLocaleString('ja-JP') + '₫';

      var drawerHTML = '' +
        '<div class="lhv-cart-drag-handle"></div>' +
        '<div class="lhv-cart-header">' +
          '<h2 class="lhv-cart-title">Giỏ hàng</h2>' +
          '<button type="button" class="lhv-cart-close" onclick="window.closeCartDrawer()" aria-label="Đóng">' +
            '<span class="material-symbols-outlined">close</span>' +
          '</button>' +
        '</div>' +
        (cart.length > 0 ? freeshipHTML : '') +
        '<div class="lhv-cart-body">' +
          bodyHTML +
        '</div>' +
        (cart.length > 0 ? '' +
        '<div class="lhv-cart-footer">' +
          '<div class="lhv-cart-total-row">' +
            '<span class="lhv-cart-total-label">TỔNG TIỀN:</span>' +
            '<span class="lhv-cart-total-price">' + formattedTotal + '</span>' +
          '</div>' +
          '<a href="/ja/cart.html" class="lhv-cart-checkout-btn">THANH TOÁN</a>' +
          '<a href="/ja/cart.html" class="lhv-cart-view-link">Xem giỏ hàng chi tiết</a>' +
        '</div>' : '');

      drawer.innerHTML = drawerHTML;
    };

    window.updateDrawerQty = function(idx, delta) {
      try {
        var cart = JSON.parse(localStorage.getItem('maylehuong_cart') || '[]');
        if (cart[idx]) {
          var curQty = cart[idx].quantity || cart[idx].qty || 1;
          curQty += delta;
          if (curQty <= 0) {
            cart.splice(idx, 1);
          } else {
            cart[idx].quantity = curQty;
            cart[idx].qty = curQty;
          }
          localStorage.setItem('maylehuong_cart', JSON.stringify(cart));
          localStorage.setItem('cart', JSON.stringify(cart));
          if (window.updateCartBadge) window.updateCartBadge();
          window.renderCartDrawer();
        }
      } catch(err) { console.error(err); }
    };

    /* Create Quick Size Selector Backdrop Node */
    var quickSizeBackdropNode = document.createElement('div');
    quickSizeBackdropNode.id = 'lhv-quicksize-backdrop';
    document.body.appendChild(quickSizeBackdropNode);

    window.closeQuickSizeModal = function() {
      var backdrop = document.getElementById('lhv-quicksize-backdrop');
      if (backdrop) backdrop.classList.remove('is-open');
    };

    window.openQuickSizeModal = function(name, price, img, sizes, action) {
      var backdrop = document.getElementById('lhv-quicksize-backdrop');
      if (!backdrop) return;

      var currentSelectedSize = null;
      var safeName = escHtml(name || 'Sản phẩm');
      var imgUrl = safeUrl(img, '/images/Phụ Kiện/Sơmi/Màu Trắng/Ảnh Bìa.webp');
      var imgSrc = escHtml(imgUrl);

      var isGiay = (sizes && sizes.indexOf('38') !== -1) || (name && name.toLowerCase().indexOf('giày') !== -1);
      var isVest = (name && (name.toLowerCase().indexOf('vest') !== -1 || name.toLowerCase().indexOf('suit') !== -1));
      var catType = isGiay ? 'giay' : (isVest ? 'vest' : 'somi');

      var sizesHTML = '';
      (sizes || ['S', 'M', 'L', 'XL', 'XXL']).forEach(function(sz) {
        sizesHTML += '<button type="button" class="lhv-qs-btn" data-size="' + escHtml(sz) + '">' + escHtml(sz) + '</button>';
      });

      var modalHTML = '' +
        '<div id="lhv-quicksize-modal">' +
          '<div class="lhv-qs-header">' +
            '<img src="' + imgSrc + '" alt="' + safeName + '" class="lhv-qs-img" onerror="this.src=\'/images/Phụ Kiện/Sơmi/Màu Trắng/Ảnh Bìa.webp\'">' +
            '<div>' +
              '<div class="lhv-qs-title">' + safeName + '</div>' +
              '<div class="lhv-qs-price">' + escHtml(price) + '</div>' +
            '</div>' +
            '<button type="button" class="lhv-qs-close" onclick="window.closeQuickSizeModal()">✕</button>' +
          '</div>' +
          '<div class="lhv-qs-label-row">' +
            '<span class="lhv-qs-label">VUI LÒNG CHỌN SIZE:</span>' +
            '<button type="button" class="lhv-qs-guide-btn" onclick="window.openGlobalSizeGuideModal(\'' + catType + '\')">📐 Hướng dẫn chọn size</button>' +
          '</div>' +
          '<div class="lhv-qs-grid" id="lhv-qs-btns">' +
            sizesHTML +
          '</div>' +
          '<div class="lhv-qs-warn" id="lhv-qs-warn">⚠️ Vui lòng chọn 1 size sản phẩm!</div>' +
          '<button type="button" class="lhv-qs-confirm-btn" id="lhv-qs-submit">' +
            (action === 'buy' ? 'XÁC NHẬN MUA NGAY' : 'XÁC NHẬN THÊM VÀO GIỎ') +
          '</button>' +
        '</div>';

      backdrop.innerHTML = modalHTML;
      backdrop.classList.add('is-open');

      var qsBtns = backdrop.querySelectorAll('.lhv-qs-btn');
      var warnEl = backdrop.querySelector('#lhv-qs-warn');
      qsBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          qsBtns.forEach(function(b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          currentSelectedSize = btn.getAttribute('data-size');
          if (warnEl) warnEl.style.display = 'none';
        });
      });

      var submitBtn = backdrop.querySelector('#lhv-qs-submit');
      submitBtn.addEventListener('click', function() {
        if (!currentSelectedSize) {
          if (warnEl) warnEl.style.display = 'block';
          return;
        }
        try {
          var cart = JSON.parse(localStorage.getItem('maylehuong_cart') || '[]');
          var existing = cart.find(function(item) { return item.name === name && item.size === currentSelectedSize; });
          if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
            existing.qty = existing.quantity;
          } else {
            cart.push({
              name: name,
              price: price,
              img: imgUrl,
              size: currentSelectedSize,
              quantity: 1,
              qty: 1,
              id: 'PK-' + Date.now()
            });
          }
          localStorage.setItem('maylehuong_cart', JSON.stringify(cart));
          localStorage.setItem('cart', JSON.stringify(cart));
          if (window.updateCartBadge) window.updateCartBadge();
          window.closeQuickSizeModal();
          if (action === 'buy') {
            window.location.href = '/ja/cart.html';
          } else {
            if (window.openCartDrawer) window.openCartDrawer();
          }
        } catch(err) { console.error(err); }
      });
    };

    /* Global Size Guide Modal Functionality */
    window.openGlobalSizeGuideModal = function(categoryHint) {
      var backdrop = document.getElementById('lhv-sizeguide-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'lhv-sizeguide-backdrop';
        document.body.appendChild(backdrop);
      }

      var defaultCategory = 'somi';
      if (categoryHint === 'giay' || categoryHint === 'giay-tay') {
        defaultCategory = 'giay';
      } else if (categoryHint === 'vest' || categoryHint === 'suit') {
        defaultCategory = 'vest';
      }

      function getTableHTML(cat) {
        if (cat === 'giay') {
          return '' +
            '<table class="lhv-sg-table">' +
              '<thead>' +
                '<tr><th>Size EU</th><th>Dài Bàn Chân (cm)</th><th>Vòng Bàn Chân (cm)</th><th>Gợi Ý Size</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr><td><strong>38</strong></td><td>23.5 - 24.0 cm</td><td>22.0 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 38</span></td></tr>' +
                '<tr><td><strong>39</strong></td><td>24.1 - 24.5 cm</td><td>22.5 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 39</span></td></tr>' +
                '<tr><td><strong>40</strong></td><td>24.6 - 25.0 cm</td><td>23.0 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 40</span></td></tr>' +
                '<tr><td><strong>41</strong></td><td>25.1 - 25.5 cm</td><td>23.5 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 41</span></td></tr>' +
                '<tr><td><strong>42</strong></td><td>25.6 - 26.0 cm</td><td>24.0 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 42</span></td></tr>' +
                '<tr><td><strong>43</strong></td><td>26.1 - 26.5 cm</td><td>24.5 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 43</span></td></tr>' +
                '<tr><td><strong>44</strong></td><td>26.6 - 27.0 cm</td><td>25.0 cm</td><td><span style="color:#9d0208;font-weight:700;">Size 44</span></td></tr>' +
              '</tbody>' +
            '</table>';
        } else if (cat === 'vest') {
          return '' +
            '<table class="lhv-sg-table">' +
              '<thead>' +
                '<tr><th>Size</th><th>Chiều Cao (cm)</th><th>Cân Nặng (kg)</th><th>Vòng Bụng (cm)</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr><td><strong>S</strong></td><td>1m55 - 1m65</td><td>52 - 60 kg</td><td>72 - 76 cm</td></tr>' +
                '<tr><td><strong>M</strong></td><td>1m62 - 1m72</td><td>60 - 68 kg</td><td>76 - 80 cm</td></tr>' +
                '<tr><td><strong>L</strong></td><td>1m68 - 1m76</td><td>68 - 75 kg</td><td>80 - 84 cm</td></tr>' +
                '<tr><td><strong>XL</strong></td><td>1m74 - 1m82</td><td>75 - 83 kg</td><td>84 - 88 cm</td></tr>' +
                '<tr><td><strong>XXL</strong></td><td>1m78 - 1m88</td><td>83 - 92 kg</td><td>88 - 94 cm</td></tr>' +
              '</tbody>' +
            '</table>';
        } else {
          return '' +
            '<table class="lhv-sg-table">' +
              '<thead>' +
                '<tr><th>Size</th><th>Size VN</th><th>Chiều Cao (cm)</th><th>Cân Nặng (kg)</th><th>Vòng Ngực</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<tr><td><strong>S</strong></td><td>38</td><td>1m55 - 1m65</td><td>50 - 58 kg</td><td>88 - 92 cm</td></tr>' +
                '<tr><td><strong>M</strong></td><td>39</td><td>1m60 - 1m70</td><td>58 - 65 kg</td><td>92 - 96 cm</td></tr>' +
                '<tr><td><strong>L</strong></td><td>40</td><td>1m68 - 1m75</td><td>65 - 73 kg</td><td>96 - 100 cm</td></tr>' +
                '<tr><td><strong>XL</strong></td><td>41</td><td>1m73 - 1m80</td><td>73 - 80 kg</td><td>100 - 104 cm</td></tr>' +
                '<tr><td><strong>XXL</strong></td><td>42</td><td>1m78 - 1m85</td><td>80 - 88 kg</td><td>104 - 108 cm</td></tr>' +
              '</tbody>' +
            '</table>';
        }
      }

      function renderModalContent(currentCat) {
        var modalHTML = '' +
          '<div id="lhv-sizeguide-modal">' +
            '<div class="lhv-sg-header">' +
              '<div>' +
                '<h3 class="lhv-sg-title">📐 BẢNG HƯỚNG DẪN CHỌN SIZE CHUẨN</h3>' +
                '<p class="lhv-sg-subtitle">Lựa chọn kích thước vừa vặn nhất với vóc dáng của bạn</p>' +
              '</div>' +
              '<button type="button" class="lhv-sg-close" onclick="window.closeGlobalSizeGuideModal()">✕</button>' +
            '</div>' +
            '<div class="lhv-sg-tabs">' +
              '<button type="button" class="lhv-sg-tab ' + (currentCat === 'somi' ? 'active' : '') + '" data-cat="somi">👔 Áo Sơ Mi Nam</button>' +
              '<button type="button" class="lhv-sg-tab ' + (currentCat === 'giay' ? 'active' : '') + '" data-cat="giay">👞 Giày Tây Nam</button>' +
              '<button type="button" class="lhv-sg-tab ' + (currentCat === 'vest' ? 'active' : '') + '" data-cat="vest">🤵 Vest / Suits</button>' +
            '</div>' +
            '<div id="lhv-sg-content">' +
              getTableHTML(currentCat) +
            '</div>' +
            '<div class="lhv-sg-advice">' +
              '<strong style="color:#9d0208;">💡 LƯU Ý KHI CHỌN SIZE:</strong><br>' +
              '• Nếu số đo Chiều cao &amp; Cân nặng thuộc 2 size khác nhau, quý khách nên ưu tiên chọn size theo <strong>Cân nặng</strong>.<br>' +
              '• Cần hỗ trợ tư vấn số đo chuẩn phom nhất? Liên hệ Zalo hotline: <a href="https://zalo.me/0948954848" target="_blank" style="color:#9d0208;font-weight:700;text-decoration:underline;">0948.954.848</a>' +
            '</div>' +
          '</div>';

        backdrop.innerHTML = modalHTML;
        backdrop.classList.add('is-open');

        var tabs = backdrop.querySelectorAll('.lhv-sg-tab');
        tabs.forEach(function(t) {
          t.addEventListener('click', function() {
            var cat = t.getAttribute('data-cat');
            renderModalContent(cat);
          });
        });
      }

      renderModalContent(defaultCategory);
    };

    window.closeGlobalSizeGuideModal = function() {
      var backdrop = document.getElementById('lhv-sizeguide-backdrop');
      if (backdrop) backdrop.classList.remove('is-open');
    };

    window.openSizeGuide = function() {
      window.openGlobalSizeGuideModal('somi');
    };

    /* Update Cart Badge Counter */
    window.updateCartBadge = function () {
      try {
        var cart = JSON.parse(localStorage.getItem('maylehuong_cart') || '[]');
        var total = cart.reduce(function (sum, item) { return sum + (item.quantity || 1); }, 0);
        document.querySelectorAll('.lhv-cart-badge').forEach(function (badge) {
          if (total > 0) {
            badge.textContent = total;
            badge.style.display = 'flex';
          } else {
            badge.style.display = 'none';
          }
        });
      } catch (e) {}
    };

    window.updateCartBadge();
  }

  /* Global helper for mobile drawer accordion */
  window.toggleMobAcc = function (idx) {
    var acc = document.getElementById('mob-acc-' + idx);
    var arrow = document.getElementById('mob-arrow-' + idx);
    if (!acc) return;
    if (acc.style.maxHeight && acc.style.maxHeight !== '0px') {
      acc.style.maxHeight = '0px';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
      acc.style.maxHeight = acc.scrollHeight + 'px';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  };

  /* ══════════════════════════════════════════════
     4. FORCE INLINE STYLES — Nuclear Override
        Inline style attrs beat ALL stylesheets,
        including Tailwind CDN @layer base preflight.
        Runs after build + after 100ms delay to
        catch async Tailwind CDN late application.
  ══════════════════════════════════════════════ */
  function forceNavStyles() {
    var hdr = document.getElementById('lhv-header');
    if (!hdr) return;

    var w = window.innerWidth;
    var isMobile = w <= 1023;
    var isLaptop13 = w >= 1024 && w <= 1440;
    var hdrHeight = isLaptop13 ? 62 : NAV_HEIGHT;
    var hdrPad = isMobile ? '0 10px' : (isLaptop13 ? (w < 1150 ? '0 14px' : (w < 1300 ? '0 20px' : '0 24px')) : '0 36px');

    /* ── HEADER BAR LAYOUT ── */
    hdr.style.setProperty('display', 'flex', 'important');
    hdr.style.setProperty('align-items', 'center', 'important');
    hdr.style.setProperty('justify-content', 'space-between', 'important');
    hdr.style.setProperty('padding', hdrPad, 'important');
    hdr.style.setProperty('height', hdrHeight + 'px', 'important');
    hdr.style.setProperty('min-height', hdrHeight + 'px', 'important');
    hdr.style.setProperty('max-height', hdrHeight + 'px', 'important');
    hdr.style.setProperty('font-family', '"Montserrat", "Plus Jakarta Sans", sans-serif', 'important');
    hdr.style.setProperty('box-sizing', 'border-box', 'important');
    /* Responsive background */
    hdr.style.setProperty('background', '#ffffff', 'important');
    hdr.style.setProperty('background-color', '#ffffff', 'important');
    hdr.style.setProperty('border-bottom', '1px solid rgba(0, 0, 0, 0.08)', 'important');
    hdr.style.setProperty('box-shadow', '0 2px 12px rgba(0, 0, 0, 0.06)', 'important');

    /* ── MOBILE CONTROLS & LOGO ── */
    var burgerBtn = hdr.querySelector('.lhv-burger-btn');
    if (burgerBtn) {
      burgerBtn.style.setProperty('display', isMobile ? 'flex' : 'none', 'important');
    }

    var mobActions = hdr.querySelector('.lhv-mob-actions');
    if (mobActions) {
      mobActions.style.setProperty('display', isMobile ? 'flex' : 'none', 'important');
      mobActions.style.setProperty('align-items', 'center', 'important');
      mobActions.style.setProperty('gap', '4px', 'important');
    }

    /* Hide text 'mayLEHUONG' on mobile, keep logo image only */
    hdr.querySelectorAll('.lhv-brand-text').forEach(function (textEl) {
      textEl.style.setProperty('display', isMobile ? 'none' : 'inline-block', 'important');
    });

    hdr.querySelectorAll('.lhv-logo-link').forEach(function (logo) {
      logo.style.setProperty('position', 'static', 'important');
      logo.style.setProperty('transform', 'none', 'important');
      logo.style.setProperty('display', 'flex', 'important');
      logo.style.setProperty('align-items', 'center', 'important');
      logo.style.setProperty('flex-shrink', '0', 'important');
    });

    /* ── LOGO IMAGE ── */
    var logoImgH = isMobile ? '34px' : (isLaptop13 ? (w < 1150 ? '36px' : '40px') : '42px');
    hdr.querySelectorAll('.lhv-logo-img').forEach(function (el) {
      el.style.setProperty('height', logoImgH, 'important');
      el.style.setProperty('max-height', logoImgH, 'important');
      el.style.setProperty('width', 'auto', 'important');
      el.style.setProperty('object-fit', 'contain', 'important');
    });

    /* ── ACTION BUTTONS COLOR & SIZE ── */
    var actBtnSize = isLaptop13 ? (w < 1150 ? '28px' : '30px') : '34px';
    hdr.querySelectorAll('.lhv-action-btn').forEach(function (el) {
      el.style.setProperty('color', isMobile ? '#e6c364' : '#3a3a3a', 'important');
      if (!isMobile) {
        el.style.setProperty('width', actBtnSize, 'important');
        el.style.setProperty('height', actBtnSize, 'important');
      }
    });

    /* ── DESKTOP MENU — Gap between items ── */
    var desktopMenu = hdr.querySelector('.lhv-desktop-menu');
    var menuGap = isLaptop13 ? (w < 1120 ? '10px' : (w < 1240 ? '14px' : (w < 1340 ? '18px' : '22px'))) : '32px';
    if (desktopMenu) {
      desktopMenu.style.setProperty('display', isMobile ? 'none' : 'flex', 'important');
      desktopMenu.style.setProperty('align-items', 'center', 'important');
      desktopMenu.style.setProperty('gap', menuGap, 'important');
      desktopMenu.style.setProperty('list-style', 'none', 'important');
      desktopMenu.style.setProperty('margin', '0', 'important');
      desktopMenu.style.setProperty('padding', '0', 'important');
      desktopMenu.style.setProperty('height', '100%', 'important');
      desktopMenu.style.setProperty('flex-shrink', '0', 'important');
    }

    var actionsWrap = hdr.querySelector('.lhv-actions-wrap');
    if (actionsWrap) {
      actionsWrap.style.setProperty('display', isMobile ? 'none' : 'flex', 'important');
      actionsWrap.style.setProperty('gap', isLaptop13 ? (w < 1150 ? '4px' : '6px') : '10px', 'important');
      actionsWrap.style.setProperty('flex-shrink', '0', 'important');
    }

    /* ── NAV ITEMS ── */
    hdr.querySelectorAll('.lhv-nav-item').forEach(function (el) {
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('display', 'flex', 'important');
      el.style.setProperty('align-items', 'center', 'important');
      el.style.setProperty('list-style', 'none', 'important');
      el.style.setProperty('height', '100%', 'important');
    });

    /* NAV LINKS — responsive color & padding */
    var navFontSize = isLaptop13 ? (w < 1120 ? '11px' : (w < 1240 ? '11.5px' : (w < 1340 ? '12px' : '12.5px'))) : '13.5px';
    var navTracking = isLaptop13 ? (w < 1200 ? '0.02em' : '0.035em') : '0.05em';
    var navPad = isMobile ? '10px 0' : (isLaptop13 ? '18px 0' : '24px 0');
    hdr.querySelectorAll('.lhv-nav-link').forEach(function (el) {
      el.style.setProperty('font-family', '"Montserrat", "Plus Jakarta Sans", sans-serif', 'important');
      el.style.setProperty('font-size', navFontSize, 'important');
      el.style.setProperty('font-weight', '700', 'important');
      el.style.setProperty('letter-spacing', navTracking, 'important');
      el.style.setProperty('text-transform', 'uppercase', 'important');
      el.style.setProperty('color', '#1a1a1a', 'important');
      el.style.setProperty('text-decoration', 'none', 'important');
      el.style.setProperty('line-height', '1', 'important');
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('border', 'none', 'important');
      el.style.setProperty('white-space', 'nowrap', 'important');
      el.style.setProperty('padding', navPad, 'important');
    });

    /* DROPDOWN LINKS */
    hdr.querySelectorAll('.lhv-dropdown-link').forEach(function (el) {
      el.style.setProperty('font-family', '"Montserrat", "Plus Jakarta Sans", sans-serif', 'important');
      el.style.setProperty('font-size', '14px', 'important');
      el.style.setProperty('font-weight', '600', 'important');
      el.style.setProperty('color', '#000000', 'important');
      el.style.setProperty('text-decoration', 'none', 'important');
    });

    /* CTA BOOKING BUTTON */
    var ctaFontSize = isLaptop13 ? (w < 1150 ? '10.5px' : '11px') : '12px';
    var ctaPad = isLaptop13 ? (w < 1150 ? '7px 10px' : '8px 14px') : '9px 20px';
    var ctaTracking = isLaptop13 ? '0.03em' : '0.08em';
    hdr.querySelectorAll('.lhv-cta-booking').forEach(function (el) {
      el.style.setProperty('font-family', '"Montserrat", "Plus Jakarta Sans", sans-serif', 'important');
      el.style.setProperty('font-size', ctaFontSize, 'important');
      el.style.setProperty('font-weight', '700', 'important');
      el.style.setProperty('color', '#ffffff', 'important');
      el.style.setProperty('background', '#9d0208', 'important');
      el.style.setProperty('letter-spacing', ctaTracking, 'important');
      el.style.setProperty('text-transform', 'uppercase', 'important');
      el.style.setProperty('padding', ctaPad, 'important');
      el.style.setProperty('border-radius', '8px', 'important');
    });

    /* Mobile Drawer items style enforcement */
    var drawer = document.getElementById('lhv-mobile-drawer');
    if (drawer) {
      drawer.style.setProperty('background', '#ffffff', 'important');
      drawer.style.setProperty('background-color', '#ffffff', 'important');
      drawer.querySelectorAll('.lhv-mob-link').forEach(function (el) {
        if (!el.classList.contains('lhv-active')) {
          el.style.setProperty('color', '#1a1a1a', 'important');
          el.style.setProperty('background', 'transparent', 'important');
          el.style.setProperty('border-left', 'none', 'important');
          el.style.setProperty('padding-left', '0', 'important');
        } else {
          el.style.setProperty('color', '#9d0208', 'important');
          el.style.setProperty('font-weight', '800', 'important');
          el.style.setProperty('background', 'rgba(157, 2, 8, 0.08)', 'important');
          el.style.setProperty('border-left', '4px solid #9d0208', 'important');
          el.style.setProperty('padding-left', '12px', 'important');
          el.style.setProperty('border-radius', '0 8px 8px 0', 'important');
        }
        el.style.setProperty('border-bottom', '1px solid rgba(0, 0, 0, 0.08)', 'important');
      });
      drawer.querySelectorAll('.lhv-mob-sublink').forEach(function (el) {
        el.style.setProperty('color', '#333333', 'important');
      });
      drawer.querySelectorAll('.material-symbols-outlined').forEach(function (el) {
        el.style.setProperty('color', '#1a1a1a', 'important');
      });
    }

    /* Chrome Webkit Render Layer Lock */
    hdr.style.setProperty('-webkit-text-size-adjust', '100%', 'important');
    hdr.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
    hdr.style.setProperty('transform', 'translateZ(0)', 'important');
  }

  /* Anti-Cache Meta Tag Injector for Chrome */
  function injectChromeAntiCache() {
    if (!document.head) return;
    if (document.getElementById('lhv-chrome-nocache')) return;
    var meta1 = document.createElement('meta');
    meta1.id = 'lhv-chrome-nocache';
    meta1.httpEquiv = 'Cache-Control';
    meta1.content = 'no-cache, no-store, must-revalidate';
    var meta2 = document.createElement('meta');
    meta2.httpEquiv = 'Pragma';
    meta2.content = 'no-cache';
    var meta3 = document.createElement('meta');
    meta3.httpEquiv = 'Expires';
    meta3.content = '0';
    document.head.appendChild(meta1);
    document.head.appendChild(meta2);
    document.head.appendChild(meta3);
  }

  /* Initialize */
  function init() {
    injectChromeAntiCache();
    injectStyles();
    buildNavBar();
    forceNavStyles();
    /* Re-run after 120ms to beat async Tailwind CDN late style application */
    setTimeout(forceNavStyles, 120);
    /* Re-run after 500ms as final safety net */
    setTimeout(forceNavStyles, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Listeners for Chrome bfcache, tab switch, page reload, and window resize */
  window.addEventListener('pageshow', forceNavStyles);
  window.addEventListener('load', forceNavStyles);
  window.addEventListener('focus', forceNavStyles);
  window.addEventListener('resize', forceNavStyles);

  /* ══════════════════════════════════════════════
     7. LIVE SEARCH MODAL & ACTIONS SYSTEM
  ══════════════════════════════════════════════ */
  var SEARCH_CATALOG = [
    // ── CÀ VẠT LỤA (CV-01 đến CV-19) ──
    { code: 'CV-01', name: 'Cà vạt nam lụa cao cấp - Màu Đen', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Đen/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-den.html' },
    { code: 'CV-02', name: 'Cà vạt nam lụa cao cấp - Màu Đen Họa Tiết', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Đen Họa Tiết/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-den-hoa-tiet.html' },
    { code: 'CV-03', name: 'Cà vạt nam lụa cao cấp - Màu Đỏ Quyền Lực', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Đỏ/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-do.html' },
    { code: 'CV-04', name: 'Cà vạt nam lụa cao cấp - Màu Đỏ Họa Tiết', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Đỏ Họa Tiết/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-do-hoa-tiet.html' },
    { code: 'CV-05', name: 'Cà vạt nam lụa cao cấp - Màu Navy Đĩnh Đạc', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Navy/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-navy.html' },
    { code: 'CV-06', name: 'Cà vạt nam lụa cao cấp - Màu Navy Sọc', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Navy Sọc/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-navy-soc.html' },
    { code: 'CV-07', name: 'Cà vạt nam lụa cao cấp - Màu Be Thanh Lịch', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Be 1/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-be-1.html' },
    { code: 'CV-08', name: 'Cà vạt nam lụa cao cấp - Màu Bạc Sang Trọng', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Bạc/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-bac.html' },
    { code: 'CV-09', name: 'Cà vạt nam lụa cao cấp - Màu Bạc Sọc', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Bạc Sọc/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-bac-soc.html' },
    { code: 'CV-10', name: 'Cà vạt nam lụa cao cấp - Màu Chấm Bi Cổ Điển', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Chấm Bi/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-cham-bi.html' },
    { code: 'CV-11', name: 'Cà vạt nam lụa cao cấp - Màu Ghi Chì Caro', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Ghi Chì Caro/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-ghi-chi-caro.html' },
    { code: 'CV-12', name: 'Cà vạt nam lụa cao cấp - Màu Nâu Ấm Áp', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Nâu/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-nau.html' },
    { code: 'CV-13', name: 'Cà vạt nam lụa cao cấp - Màu Rêu Độc Đáo', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Rêu/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-reu.html' },
    { code: 'CV-14', name: 'Cà vạt nam lụa cao cấp - Màu Rêu Họa Tiết', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Rêu Họa Tiết/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-reu-hoa-tiet.html' },
    { code: 'CV-15', name: 'Cà vạt nam lụa cao cấp - Màu Sọc Đồng', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Sọc Đồng/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-soc-dong.html' },
    { code: 'CV-16', name: 'Cà vạt nam lụa cao cấp - Màu Than Chì', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Than Chì/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-than-chi.html' },
    { code: 'CV-17', name: 'Cà vạt nam lụa cao cấp - Màu Tím Caro', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Tím Caro/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-tim-caro.html' },
    { code: 'CV-18', name: 'Cà vạt nam lụa cao cấp - Màu Xanh Thanh Lịch', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Xanh/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-xanh.html' },
    { code: 'CV-19', name: 'Cà vạt nam lụa cao cấp - Màu Xanh Họa Tiết', price: '250.000₫', tag: 'Cà Vạt', img: '/images/Phụ Kiện/Cà Vạt/Màu Xanh Họa Tiết/Ảnh Bìa.webp', link: '/ja/san-pham/cv-color-mau-xanh-hoa-tiet.html' },

    // ── GIÀY TÂY (GT-01 đến GT-10) ──
    { code: 'GT-01', name: 'Giày Tây Nam Oxford Cap Toe Da Bò Màu Đen', price: '1.250.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p1/1.webp', link: '/ja/san-pham/gt1.html' },
    { code: 'GT-02', name: 'Giày Tây Nam Derby Plain Toe Da Bò Màu Nâu Đen', price: '1.250.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p2/1.webp', link: '/ja/san-pham/gt2.html' },
    { code: 'GT-03', name: 'Giày Tây Nam Double Monk Strap Da Bò Màu Nâu Vàng', price: '1.350.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p3/1.webp', link: '/ja/san-pham/gt3.html' },
    { code: 'GT-04', name: 'Giày Tây Nam Penny Loafer Da Bò Màu Đen', price: '1.150.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p4/1.webp', link: '/ja/san-pham/gt4.html' },
    { code: 'GT-05', name: 'Giày Tây Nam Brogues Wingtip Da Bò Màu Nâu Đen', price: '1.350.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p5/1.webp', link: '/ja/san-pham/gt5.html' },
    { code: 'GT-06', name: 'Giày Tây Nam Brogues Wingtip Oxford Màu Đen', price: '1.350.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p6/1.webp', link: '/ja/san-pham/gt6.html' },
    { code: 'GT-07', name: 'Giày Tây Nam Wholecut Oxford Da Bò Nguyên Tấm', price: '1.450.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p7/1.webp', link: '/ja/san-pham/gt7.html' },
    { code: 'GT-08', name: 'Giày Tây Nam Double Monk Strap Da Bò Màu Đen', price: '1.350.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p8/1.webp', link: '/ja/san-pham/gt8.html' },
    { code: 'GT-09', name: 'Giày Tây Nam Penny Loafer Da Bò Màu Nâu Vàng', price: '1.150.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p9/1.webp', link: '/ja/san-pham/gt9.html' },
    { code: 'GT-10', name: 'Giày Tây Nam Tassel Loafer Chuông Da Bò Màu Đen', price: '1.250.000₫', tag: 'Giày Tây', img: '/images/products/phu-kien/giaytay/p10/1.webp', link: '/ja/san-pham/gt10.html' },

    // ── ÁO SƠ MI (SM-01 đến SM-10) ──
    { code: 'SM-01', name: 'Áo Sơmi Nam Cao Cấp - Màu Be Nhã Nhặn', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Be/Ảnh Bìa.webp', link: '/ja/san-pham/sm1.html' },
    { code: 'SM-02', name: 'Áo Sơmi Nam Cao Cấp - Màu Hồng Pastel', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Hồng/Ảnh Bìa.webp', link: '/ja/san-pham/sm2.html' },
    { code: 'SM-03', name: 'Áo Sơmi Nam Cao Cấp - Màu Trắng Tinh Khôi', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Trắng/Ảnh Bìa.webp', link: '/ja/san-pham/sm3.html' },
    { code: 'SM-04', name: 'Áo Sơmi Nam Cao Cấp - Màu Navy Lịch Lãm', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Navy/Ảnh Bìa.webp', link: '/ja/san-pham/sm4.html' },
    { code: 'SM-05', name: 'Áo Sơmi Nam Cao Cấp - Màu Rêu Hiện Đại', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Rêu/Ảnh Bìa.webp', link: '/ja/san-pham/sm5.html' },
    { code: 'SM-06', name: 'Áo Sơmi Nam Cao Cấp - Màu Xám Ghi Thanh Lịch', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Xám/Ảnh Bìa.webp', link: '/ja/san-pham/sm6.html' },
    { code: 'SM-07', name: 'Áo Sơmi Nam Cao Cấp - Màu Đen Quyến Rũ', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Màu Đen/Ảnh Bìa.webp', link: '/ja/san-pham/sm7.html' },
    { code: 'SM-08', name: 'Áo Sơmi Nam Cao Cấp - Xanh Da Trời Trẻ Trung', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Xanh Da Trời/Ảnh Bìa.webp', link: '/ja/san-pham/sm8.html' },
    { code: 'SM-09', name: 'Áo Sơmi Nam Cao Cấp - Xanh Ngọc Tươi Sáng', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Xanh Ngọc/Ảnh Bìa.webp', link: '/ja/san-pham/sm9.html' },
    { code: 'SM-10', name: 'Áo Sơmi Nam Cao Cấp - Xanh Olive Độc Đáo', price: '350.000₫', tag: 'Sơ Mi', img: '/images/Phụ Kiện/Sơmi/Xanh Olive/Ảnh Bìa.webp', link: '/ja/san-pham/sm10.html' },

    // ── KHĂN LỤA (KL-01 đến KL-10) ──
    { code: 'KL-01', name: 'Khăn Lụa Nữ Cao Cấp - Màu Trắng Chấm Bi', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p1/1.webp', link: '/ja/san-pham/kl1.html' },
    { code: 'KL-02', name: 'Khăn Lụa Nữ Cao Cấp - Màu Be Họa Tiết Xích Nâu', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p2/1.webp', link: '/ja/san-pham/kl2.html' },
    { code: 'KL-03', name: 'Khăn Lụa Nữ Cao Cấp - Màu Xanh Navy Kẻ Viền', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p3/1.webp', link: '/ja/san-pham/kl3.html' },
    { code: 'KL-04', name: 'Khăn Lụa Nữ Cao Cấp - Màu Hồng Pastel Họa Tiết Răng Cưa', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p4/1.webp', link: '/ja/san-pham/kl4.html' },
    { code: 'KL-05', name: 'Khăn Lụa Nữ Cao Cấp - Màu Đỏ Đô Kẻ Sọc', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p5/1.webp', link: '/ja/san-pham/kl5.html' },
    { code: 'KL-06', name: 'Khăn Lụa Nữ Cao Cấp - Màu Đen Họa Tiết Xích Vàng', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p6/1.webp', link: '/ja/san-pham/kl6.html' },
    { code: 'KL-07', name: 'Khăn Lụa Nữ Cao Cấp - Màu Xanh Da Trời Nhạt', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p7/1.webp', link: '/ja/san-pham/kl7.html' },
    { code: 'KL-08', name: 'Khăn Lụa Nữ Cao Cấp - Màu Xanh Ngọc Họa Tiết H', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p8/1.webp', link: '/ja/san-pham/kl8.html' },
    { code: 'KL-09', name: 'Khăn Lụa Nữ Cao Cấp - Màu Xám Ghi Thanh Lịch', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p9/1.webp', link: '/ja/san-pham/kl9.html' },
    { code: 'KL-10', name: 'Khăn Lụa Nữ Cao Cấp - Màu Đỏ Rượu Burgundy Họa Tiết H', price: '100.000₫', tag: 'Khăn Lụa', img: '/images/products/phu-kien/khanlua/p10/1.webp', link: '/ja/san-pham/kl10.html' },

    // ── NƠ ĐEO CỔ (NO-01 đến NO-10) ──
    { code: 'NO-01', name: 'Nơ Nam Lụa Cao Cấp - Màu Đen Cổ Điển', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Đen/Ảnh Bìa.webp', link: '/ja/san-pham/no1.html' },
    { code: 'NO-02', name: 'Nơ Nam Lụa Cao Cấp - Màu Đỏ Rượu Burgundy', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Đỏ/Ảnh Bìa.webp', link: '/ja/san-pham/no2.html' },
    { code: 'NO-03', name: 'Nơ Nam Lụa Cao Cấp - Màu Trắng Chú Rể', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Trắng/Ảnh Bìa.webp', link: '/ja/san-pham/no3.html' },
    { code: 'NO-04', name: 'Nơ Nam Lụa Cao Cấp - Màu Navy Sang Trọng', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Navy/Ảnh Bìa.webp', link: '/ja/san-pham/no4.html' },
    { code: 'NO-05', name: 'Nơ Nam Lụa Cao Cấp - Màu Rêu Đĩnh Đạc', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Rêu/Ảnh Bìa.webp', link: '/ja/san-pham/no5.html' },
    { code: 'NO-06', name: 'Nơ Nam Lụa Cao Cấp - Màu Hồng Pastel', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Hồng/Ảnh Bìa.webp', link: '/ja/san-pham/no6.html' },
    { code: 'NO-07', name: 'Nơ Nam Lụa Cao Cấp - Màu Tím Lavender', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Tím/Ảnh Bìa.webp', link: '/ja/san-pham/no7.html' },
    { code: 'NO-08', name: 'Nơ Nam Lụa Cao Cấp - Màu Xanh Dương', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu Xanh/Ảnh Bìa.webp', link: '/ja/san-pham/no8.html' },
    { code: 'NO-09', name: 'Nơ Nam Lụa Cao Cấp - Màu Be Trẻ Trung', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu be/Ảnh Bìa.webp', link: '/ja/san-pham/no9.html' },
    { code: 'NO-10', name: 'Nơ Nam Họa Tiết Chấm Bi Tinh Tế', price: '180.000₫', tag: 'Nơ Đeo Cổ', img: '/images/Phụ Kiện/Nơ/Màu chấm bi/Ảnh Bìa.webp', link: '/ja/san-pham/no10.html' },

    // ── CÀI CÀ VẠT (CCV-01 đến CCV-10) ──
    { code: 'CCV-01', name: 'Cài Cà Vạt Kim Loại Mạ Vàng Cổ Điển Mẫu 01', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/2.webp', link: '/ja/san-pham/ccv1.html' },
    { code: 'CCV-02', name: 'Cài Cà Vạt Kim Loại Mạ Bạc Đẳng Cấp Mẫu 02', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/3.webp', link: '/ja/san-pham/ccv2.html' },
    { code: 'CCV-03', name: 'Cài Cà Vạt Nam Họa Tiết Phay Xước Mẫu 03', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/4.webp', link: '/ja/san-pham/ccv3.html' },
    { code: 'CCV-04', name: 'Cài Cà Vạt Kim Loại Đen Nhám Mẫu 04', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/5.webp', link: '/ja/san-pham/ccv4.html' },
    { code: 'CCV-05', name: 'Cài Cà Vạt Dạng Kẹp Đính Đá Mẫu 05', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/6.webp', link: '/ja/san-pham/ccv5.html' },
    { code: 'CCV-06', name: 'Cài Cà Vạt Vàng Hồng Thanh Lịch Mẫu 06', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/7.webp', link: '/ja/san-pham/ccv6.html' },
    { code: 'CCV-07', name: 'Cài Cà Vạt Thép Không Gỉ Mẫu 07', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/8.webp', link: '/ja/san-pham/ccv7.html' },
    { code: 'CCV-08', name: 'Cài Cà Vạt Hoàng Gia Mẫu 08', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/9.webp', link: '/ja/san-pham/ccv8.html' },
    { code: 'CCV-09', name: 'Cài Cà Vạt Mạ Vàng 18K Mẫu 09', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/10.webp', link: '/ja/san-pham/ccv9.html' },
    { code: 'CCV-10', name: 'Cài Cà Vạt Thiết Kế Độc Bản Mẫu 10', price: '150.000₫', tag: 'Cài Cà Vạt', img: '/images/Phụ Kiện/Cài cà vạt/11.webp', link: '/ja/san-pham/ccv10.html' },

    // ── VEST NAM THIẾT KẾ & TRẺ ──
    { code: 'MLH-NA-TK-01', name: 'Bộ Vest Nam Thiết Kế Xanh Đen Sọc', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/01-xanh-den-soc-05_manocanh_mac-2f5597d723f9.webp', link: '/ja/san-pham/nam-tk-01.html' },
    { code: 'MLH-NA-TK-02', name: 'Bộ Vest Nam Thiết Kế Đen Than Sọc', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/02-den-than-soc-05_manocanh_mac-480d8f19e04b.webp', link: '/ja/san-pham/nam-tk-02.html' },
    { code: 'MLH-NA-TK-03', name: 'Bộ Vest Nam Thiết Kế Kem Ngà', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/03-kem-nga-05_manocanh_mac-4682f7b5c084.webp', link: '/ja/san-pham/nam-tk-03.html' },
    { code: 'MLH-NA-TK-04', name: 'Bộ Vest Nam Thiết Kế Be Cát', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/04-be-cat-05_manocanh_mac-f99893274318.webp', link: '/ja/san-pham/nam-tk-04.html' },
    { code: 'MLH-NA-TK-05', name: 'Bộ Vest Nam Thiết Kế Ghi Sọc', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/05-ghi-soc-05_manocanh_mac-2514e9e6a205.webp', link: '/ja/san-pham/nam-tk-05.html' },
    { code: 'MLH-NA-TK-06', name: 'Bộ Vest Nam Thiết Kế Nâu Cà Phê', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/06-nau-ca-phe-05_manocanh_mac-a143ec56ff45.webp', link: '/ja/san-pham/nam-tk-06.html' },
    { code: 'MLH-NA-TK-07', name: 'Bộ Vest Nam Thiết Kế Nâu Vàng', price: '3.800.000₫ / bộ', tag: 'Vest Nam Thiết Kế', img: '/images/nam-thiet-ke-20261026/07-nau-vang-05_manocanh_mac-5e9f3e32bf68.webp', link: '/ja/san-pham/nam-tk-07.html' },
    { code: 'VN-02', name: 'Suit Đen Slim Fit', price: '2.850.000₫ / bộ', tag: 'Suit Nam Trẻ', img: '/images/products/vest-nam-tre/n02/1.webp', link: '/ja/san-pham/vnam2.html' },
    { code: 'VN-03', name: 'Suit Đen 6 Khuy', price: '2.850.000₫ / bộ', tag: 'Suit Nam Trẻ', img: '/images/products/vest-nam-tre/n03/1.webp', link: '/ja/san-pham/vnam3.html' },
    { code: 'VN-04', name: 'Suit Ghi Chì Slim Fit', price: '2.850.000₫ / bộ', tag: 'Suit Nam Trẻ', img: '/images/products/vest-nam-tre/n04/1.webp', link: '/ja/san-pham/vnam4.html' },
    { code: 'VN-06', name: 'Suit Ghi Sáng Slim Fit', price: '2.850.000₫ / bộ', tag: 'Suit Nam Trẻ', img: '/images/products/vest-nam-tre/n06/1.webp', link: '/ja/san-pham/vnam6.html' }
  ];

  var _searchCatalogHydrated = false;
  function hydrateSearchCatalogFromAPI() {
    if (_searchCatalogHydrated || !window.MLH_API || typeof window.MLH_API.fetchProducts !== 'function') return;
    _searchCatalogHydrated = true;
    window.MLH_API.fetchProducts({}).then(function(list) {
      if (!Array.isArray(list) || !list.length) return;
      var byLink = new Set();
      var merged = [];
      list.forEach(function(p) {
        if (!p || !p.id) return;
        var link = '/ja/san-pham/' + encodeURIComponent(p.id) + '.html';
        byLink.add(link);
        var primaryImg = p.img || (p.images && p.images[0]) || '/images/logo.webp';
        merged.push({
          code: p.sku || p.id.toUpperCase(),
          name: p.name || p.id,
          price: window.MLH_API.productPrice ? window.MLH_API.productPrice(p) : (window.MLH_API.formatMoney(p.price)),
          tag: p.product_line || p.category || 'Sản Phẩm',
          img: window.MLH_API.getProductImageUrl ? window.MLH_API.getProductImageUrl(typeof primaryImg === 'string' ? primaryImg : primaryImg.url) : primaryImg,
          link: link
        });
      });
      SEARCH_CATALOG.forEach(function(item) {
        if (!byLink.has(item.link)) merged.push(item);
      });
      SEARCH_CATALOG = merged;
      var input = document.getElementById('lhv-search-input');
      if (input && input.value.trim()) {
        renderSearchResults(input.value.trim());
      }
    }).catch(function() {});
  }

  function createSearchModal() {
    if (document.getElementById('lhv-search-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'lhv-search-modal';
    modal.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'background: rgba(0, 0, 0, 0.65)',
      'backdrop-filter: blur(6px)',
      '-webkit-backdrop-filter: blur(6px)',
      'z-index: 999999',
      'display: none',
      'align-items: flex-start',
      'justify-content: center',
      'padding: 20px 16px',
      'box-sizing: border-box',
      'opacity: 0',
      'transition: opacity 0.2s ease-in-out'
    ].join(';');

    var content = document.createElement('div');
    content.className = 'lhv-search-box';
    content.style.cssText = [
      'width: 100%',
      'max-width: 650px',
      'margin-top: 60px',
      'background: #ffffff',
      'border-radius: 16px',
      'box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3)',
      'overflow: hidden',
      'display: flex',
      'flex-direction: column',
      'max-height: 80vh'
    ].join(';');

    var header = document.createElement('div');
    header.style.cssText = 'padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; background: #fcfbf9;';

    var searchIcon = document.createElement('span');
    searchIcon.className = 'material-symbols-outlined';
    searchIcon.textContent = 'search';
    searchIcon.style.cssText = 'color: #9d0208; font-size: 24px; flex-shrink: 0;';

    var input = document.createElement('input');
    input.id = 'lhv-search-input';
    input.type = 'text';
    input.placeholder = 'Tìm tên hoặc Mã SP (Ví dụ: CV-01, GT-01, SM-01, VN-01)...';
    input.style.cssText = 'flex: 1; border: none; outline: none; background: transparent; font-size: 15px; font-weight: 600; color: #111111; font-family: inherit;';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'material-symbols-outlined';
    closeBtn.textContent = 'close';
    closeBtn.style.cssText = 'border: none; background: transparent; cursor: pointer; color: #777777; font-size: 22px; padding: 4px; border-radius: 50%;';
    closeBtn.addEventListener('click', window.closeSearchModal);

    header.appendChild(searchIcon);
    header.appendChild(input);
    header.appendChild(closeBtn);

    var body = document.createElement('div');
    body.id = 'lhv-search-results';
    body.style.cssText = 'padding: 16px 20px; overflow-y: auto; flex: 1; min-height: 120px;';

    content.appendChild(header);
    content.appendChild(body);
    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) window.closeSearchModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        window.closeSearchModal();
      }
    });

    // Filter after typing pauses instead of rebuilding the result grid on every keystroke.
    var searchTimer = null;
    input.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() { renderSearchResults(input.value.trim()); }, 150);
    });
  }

  var SEARCH_RESULT_LIMIT = 24;

  function renderSearchResults(query) {
    var container = document.getElementById('lhv-search-results');
    if (!container) return;

    if (!query || query.length === 0) {
      var html = '<div style="margin-bottom: 12px; font-size: 12px; font-weight: 700; uppercase; color: #777; letter-spacing: 0.05em;">MÃ SẢN PHẨM HOẶC TỪ KHÓA GỢI Ý:</div>';
      html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';
      var tags = ['CV-01', 'GT-01', 'SM-01', 'KL-08', 'NO-01', 'CCV-05', 'VN-01', 'Cà Vạt', 'Giày Tây', 'Sơ Mi', 'Khăn Lụa', 'Nơ', 'Cài Cà Vạt'];
      tags.forEach(function(t) {
        html += '<button type="button" onclick="setSearchQuery(\'' + t + '\')" style="padding: 6px 14px; background: #f5f0eb; border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; font-size: 12px; font-weight: 700; color: #9d0208; cursor: pointer; transition: all 0.2s;">' + t + '</button>';
      });
      html += '</div>';
      container.innerHTML = html;
      return;
    }

    var qLower = query.toLowerCase().trim();
    var cleanQuery = qLower.replace(/[-_ ]/g, '');

    var matches = SEARCH_CATALOG.filter(function(item) {
      var nameMatch = item.name.toLowerCase().includes(qLower);
      var tagMatch = item.tag.toLowerCase().includes(qLower);
      var codeMatch = item.code && item.code.toLowerCase().includes(qLower);
      var cleanCode = item.code ? item.code.toLowerCase().replace(/[-_ ]/g, '') : '';
      var cleanCodeMatch = cleanCode && cleanCode.includes(cleanQuery);
      return nameMatch || tagMatch || codeMatch || cleanCodeMatch;
    });

    if (matches.length === 0) {
      var safeQuery = String(query || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      container.innerHTML = '<div style="text-align: center; padding: 24px 0; color: #666; font-size: 14px;">Không tìm thấy sản phẩm khớp với "<strong>' + safeQuery + '</strong>".<br><a href="/ja/phu-kien-ca-vat.html" style="color: #9d0208; font-weight: 700; text-decoration: underline; margin-top: 8px; display: inline-block;">Xem toàn bộ phụ kiện →</a></div>';
      return;
    }

    // Render a bounded list so a short query on a large catalog stays light; typing more narrows it.
    var shown = matches.slice(0, SEARCH_RESULT_LIMIT);
    var resHtml = '<div style="font-size: 12px; font-weight: 700; color: #777; margin-bottom: 12px;">TÌM THẤY ' + matches.length + ' SẢN PHẨM PHÙ HỢP' + (matches.length > shown.length ? ' (HIỂN THỊ ' + shown.length + ', GÕ THÊM ĐỂ LỌC)' : '') + ':</div>';
    resHtml += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">';
    shown.forEach(function(p) {
      var codeBadge = p.code ? '<span style="font-size: 10px; font-weight: 800; background: #9d0208; color: #ffffff; padding: 2px 6px; border-radius: 4px; margin-right: 6px; display: inline-block;">MÃ: ' + escHtml(p.code) + '</span>' : '';
      resHtml += '<a href="' + escHtml(safeUrl(p.link, '#')) + '" style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; text-decoration: none; background: #ffffff; transition: all 0.2s;" onmouseover="this.style.borderColor=\'#9d0208\'; this.style.boxShadow=\'0 4px 12px rgba(157,2,8,0.1)\'" onmouseout="this.style.borderColor=\'rgba(0,0,0,0.1)\'; this.style.boxShadow=\'none\'">';
      resHtml += '  <img src="' + escHtml(safeUrl(p.img)) + '" alt="' + escHtml(p.name) + '" loading="lazy" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f0e8df;" />';
      resHtml += '  <div style="flex: 1; min-width: 0;">';
      resHtml += '    <div style="display: flex; align-items: center; margin-bottom: 2px;">' + codeBadge + '</div>';
      resHtml += '    <h4 style="font-size: 13px; font-weight: 700; color: #111111; margin: 0 0 3px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + escHtml(p.name) + '</h4>';
      resHtml += '    <span style="font-size: 13px; font-weight: 800; color: #9d0208;">' + escHtml(p.price) + '</span>';
      resHtml += '  </div>';
      resHtml += '  <span class="material-symbols-outlined" style="font-size: 18px; color: #999999; flex-shrink: 0;">arrow_forward_ios</span>';
      resHtml += '</a>';
    });
    resHtml += '</div>';
    container.innerHTML = resHtml;
  }

  window.openSearchModal = function() {
    createSearchModal();
    hydrateSearchCatalogFromAPI();
    var modal = document.getElementById('lhv-search-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(function() {
        modal.style.opacity = '1';
      }, 10);
      var input = document.getElementById('lhv-search-input');
      if (input) {
        input.value = '';
        renderSearchResults('');
        setTimeout(function() { input.focus(); }, 100);
      }
    }
  };

  window.closeSearchModal = function() {
    var modal = document.getElementById('lhv-search-modal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(function() {
        modal.style.display = 'none';
      }, 200);
    }
  };

  window.setSearchQuery = function(q) {
    var input = document.getElementById('lhv-search-input');
    if (input) {
      input.value = q;
      renderSearchResults(q);
      input.focus();
    }
  };

  window.openNewsModal = function() {
    window.location.href = '/ja/tin-tuc.html';
  };

})();
