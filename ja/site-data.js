/**
 * site-data.js
 * mayLEHUONG — Real Company Data Injector
 * Công ty TNHH Thời Trang Lê Hương | MST: 3603652314
 *
 * Finds placeholder contact data in the DOM and replaces with real info.
 * Run AFTER the page loads (defer). Non-destructive.
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // REAL COMPANY INFORMATION
  // Source: masothue.com, yellowpages.vn, interbra.vn, dongnaireview.vn
  // ─────────────────────────────────────────────
  const COMPANY = {
    name:       'Công ty TNHH Thời Trang Lê Hương',
    brand:      'mayLEHUONG Suit&Uniform',
    trademark:  'mayLEHUONG Suit&Uniform',
    mst:        '3603652314',
    tagline:    'Chất Lượng – Uy Tín – Phong Cách',
    address:    '1797 Nguyễn Ái Quốc, Khu Phố 10, Tam Hiệp, Thành Phố Đồng Nai',
    address2:   'Số 7 Chính Vân, Chuyên Mỹ, Thành Phố Hà Nội',
    phone:      '0948.954.848',
    phone2:     '0786.291.468',
    email:      'xuongvestcuoibh9999@gmail.com',
    website:    'vestlehuong.com',
    website2:   'maylehuong.vn',
    facebook:   'https://www.facebook.com/LhVeston/',
    fbHandle:   'fb.com/LhVeston',
    mapEmbed:   'https://maps.app.goo.gl/FeAS2gpS5ceTvait7',
    mapEmbedHn: 'https://maps.app.goo.gl/crUReRz7Dok9r7P86',
    description: 'Chuyên thiết kế, may đo và cung cấp các sản phẩm Âu phục cao cấp và đồng phục chuyên nghiệp. Với phương châm "Chất lượng – Uy tín – Phong cách", mayLEHUONG cam kết đem lại những sản phẩm chất lượng cao, dịch vụ tận tâm và trải nghiệm may mặc đẳng cấp.',
    industries: ['May Đồng Phục', 'Đồng Phục Công Sở', 'Vest & Âu Phục', 'May Đo Riêng'],
    type:       'Nhà sản xuất',
    market:     'Toàn quốc',
  };

  // ─────────────────────────────────────────────
  // PLACEHOLDER → REAL TEXT MAP
  // ─────────────────────────────────────────────
  const TEXT_REPLACEMENTS = [
    // Addresses
    [/123 Phố Huế[^<]*/g,                            COMPANY.address],
    [/45 Nguyễn Trãi[^<]*/g,                         COMPANY.address2],
    // Phone
    [/0901[\s.]?234[\s.]?567/g,                        COMPANY.phone],
    [/024[\s.]?3\d{3}[\s.]?\d{4}/g,                   COMPANY.phone],
    [/028[\s.]?3\d{3}[\s.]?\d{4}/g,                   COMPANY.phone2],
    // Email
    [/info@vestlehuong\.(vn|com)/g,                    COMPANY.email],
    [/contact@vestlehuong\.(vn|com)/g,                 COMPANY.email],
    [/support@vestlehuong\.(vn|com)/g,                 COMPANY.email],
    // Website
    [/vestlehuong\.vn/g,                               COMPANY.website],
    [/www\.vestlehuong\.vn/g,                          COMPANY.website],
    // Facebook
    [/facebook\.com\/vestlehuong/g,                    'facebook.com/LhVeston'],
    [/fb\.com\/vestlehuong/g,                          COMPANY.fbHandle],
    // Tagline
    [/Luxury · Craftsmanship · Heritage/g,             COMPANY.tagline],
    [/Luxury - Craftsmanship - Heritage/g,             COMPANY.tagline],
  ];

  // ─────────────────────────────────────────────
  // INJECT COMPANY DATA INTO DOM
  // 1. Walk text nodes and replace placeholders
  // 2. Fix href attrs for phone, email, links
  // 3. Inject structured footer contact if missing
  // ─────────────────────────────────────────────

  function fixBrandSpans(root) {
    var container = root || document.body;
    if (!container) return;
    var elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th, b, strong, em');
    elements.forEach(function (el) {
      if (el.closest('header, nav, footer, #lhv-global-footer, .site-logo, .logo, #site-logo')) return;
      if (el.closest('.tu-van-social-grid, .social-section, [class*="social"], [id*="social"], [class*="fanpage"], a[href*="facebook.com"], a[href*="zalo"], a[href*="youtube.com"], a[href*="tiktok.com"]')) return;
      if (el.classList.contains('brand-maylehuong') || el.classList.contains('brand-may') || el.classList.contains('brand-lh')) return;
      if (el.children.length === 0 && el.textContent.includes('mayLEHUONG')) {
        el.innerHTML = el.innerHTML.replace(/mayLEHUONG/g, '<span class="brand-maylehuong"><span class="brand-may">may</span><span class="brand-lh">LEHUONG</span></span>');
      }
    });
  }

  function fixTextNodes(root) {
    const walker = document.createTreeWalker(
      root || document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node;
    while ((node = walker.nextNode())) {
      let changed = false;
      let text = node.nodeValue;
      TEXT_REPLACEMENTS.forEach(([pattern, replacement]) => {
        if (pattern.test(text)) {
          text = text.replace(pattern, replacement);
          changed = true;
        }
      });
      if (changed) node.nodeValue = text;
    }
  }

  function fixLinks() {
    // Fix tel: links
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      const raw = a.href.replace('tel:', '').replace(/[^0-9+]/g, '');
      // If it's clearly a placeholder (starts with 090123 or 024 3)
      if (raw.startsWith('0901234') || raw.startsWith('02439') || raw.startsWith('02839')) {
        a.href = 'tel:0948954848';
        if (a.textContent.match(/0901|024\s?3|028\s?3/)) {
          a.textContent = COMPANY.phone;
        }
      }
    });

    // Fix mailto: links
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      if (a.href.includes('@vestlehuong')) {
        a.href = 'mailto:' + COMPANY.email;
        if (a.textContent.includes('@vestlehuong')) {
          a.textContent = COMPANY.email;
        }
      }
    });

    // Fix Facebook links
    document.querySelectorAll('a[href*="facebook.com/vestlehuong"], a[href*="fb.com/vestlehuong"]').forEach(a => {
      a.href = COMPANY.facebook;
    });
  }

  // Add <title> tag update if title contains wrong info
  function fixTitle() {
    if (document.title && document.title.includes('mayLEHUONG')) return; // already correct
  }

  // Inject real Zalo floating button (Zalo is primary contact in Vietnam)
  function injectZaloButton() {
    if (document.querySelector('.lux-zalo-btn')) return; // already present
    const phone = '0948954848';
    const btn = document.createElement('a');
    btn.className = 'lux-zalo-btn';
    btn.href = 'https://zalo.me/' + phone;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.title = 'Chat Zalo với mayLEHUONG';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:28px;height:28px;fill:#fff">
        <path d="M24 4C13 4 4 13 4 24c0 5.27 2.03 10.06 5.34 13.64L7 44l6.65-2.29A19.9 19.9 0 0 0 24 44c11 0 20-9 20-20S35 4 24 4zm9.5 26.5l-2.5-1.5c-.5-.3-.8-.4-1.1.1-.4.6-1.4 1.7-1.7 2-.3.3-.6.4-1.1.1-4.5-2.25-7.5-6-8-8.5-.1-.5 0-.8.4-1.1.4-.3 1-.9 1.4-1.4.3-.4.4-.7.1-1.2l-2-4.5c-.2-.5-.5-.5-1-.5-.4 0-1 0-1.5.5S14 16.5 14 19c0 2.4 1.5 5 2.5 6.5 2 3 5 7.5 11 9.5 2 .6 3.5.7 5 .4 1.6-.3 2.5-1.2 3.5-2.5.7-1 .5-1.9 0-2.4z"/>
      </svg>
      <span style="font-size:12px;font-weight:600;letter-spacing:0.04em">Zalo</span>
    `;
    btn.style.cssText = `
      position: fixed;
      bottom: 140px;
      right: 16px;
      z-index: 9990;
      background: #0068FF;
      border-radius: 50px;
      padding: 10px 16px 10px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #fff;
      text-decoration: none;
      box-shadow: 0 8px 28px rgba(0,104,255,0.35);
      transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s cubic-bezier(0.22,1,0.36,1);
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px)';
      btn.style.boxShadow = '0 14px 36px rgba(0,104,255,0.45)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.boxShadow = '0 8px 28px rgba(0,104,255,0.35)';
    });

    // Floating call button
    const callBtn = document.createElement('a');
    callBtn.className = 'floating-cta lux-call-btn';
    callBtn.href = 'tel:0948954848';
    callBtn.title = 'Gọi mayLEHUONG';
    callBtn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 16px;
      z-index: 999;
      width: 52px;
      height: 52px;
      background: #9D0208;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(157,2,8,0.4);
      transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
      animation: lux-pulse 2.5s ease-in-out infinite;
    `;
    callBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:22px;height:22px;fill:white">
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </svg>
    `;
    callBtn.addEventListener('mouseenter', () => {
      callBtn.style.transform = 'scale(1.08)';
    });
    callBtn.addEventListener('mouseleave', () => {
      callBtn.style.transform = '';
    });

    // Pulse animation for call button
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
      @keyframes lux-pulse {
        0%, 100% { box-shadow: 0 8px 24px rgba(157,2,8,0.4); }
        50% { box-shadow: 0 8px 36px rgba(157,2,8,0.65), 0 0 0 8px rgba(157,2,8,0.12); }
      }
    `;
    document.head.appendChild(pulseStyle);
    document.body.appendChild(btn);
    document.body.appendChild(callBtn);
  }

  // ─────────────────────────────────────────────
  // FIX NAVIGATION — logo + broken href=# links
  // Runs in the browser so Vietnamese text works perfectly
  // ─────────────────────────────────────────────
  function fixNavLinks() {
    var nav = document.querySelector('nav') || document.querySelector('header');
    if (!nav) return;

    // ── 1. Page-name → href map (trim + lowercase for matching)
    var NAV_MAP = [
      { text: /đồng phục|dong phuc|d[oồ]ng ph[uụ]c/i,  href: '/ja/dong-phuc.html'  },
      { text: /giới thiệu|gioi thieu/i,                  href: '/ja/gioi-thieu.html' },
      { text: /sản phẩm|san pham/i,                      href: '/ja/products.html'   },
      { text: /may đo|may do/i,                          href: '/ja/may-do.html'     },
      { text: /tư vấn|tu van|đặt lịch/i,                 href: '/ja/tu-van.html'     },
      { text: /trang chủ|trang chu/i,                    href: '/'      },
    ];

    // ── 2. Fix <a href="#"> that are nav page links
    nav.querySelectorAll('a[href="#"]').forEach(function (a) {
      var txt = (a.textContent || '').trim();
      for (var i = 0; i < NAV_MAP.length; i++) {
        if (NAV_MAP[i].text.test(txt)) {
          a.setAttribute('href', NAV_MAP[i].href);
          break;
        }
      }
    });

    // ── 3. Logo: make any logo element clickable → index.html
    //    Handles: <div class="...">mayLEHUONG</div>  OR  <img logo.png>  not in <a>
    var logoSelectors = [
      'nav [class*="logo"]',
      'nav [class*="brand"]',
      'header [class*="logo"]',
      'header [class*="brand"]',
      'nav img[alt*="Vest"]',
      'nav img[src*="logo"]',
      'header img[src*="logo"]',
    ];

    logoSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        // If already inside an <a>, just ensure href is correct
        var parent = el.closest('a');
        if (parent) {
          parent.setAttribute('href', '/');
          parent.style.cursor = 'pointer';
          parent.style.textDecoration = 'none';
        } else {
          // Wrap in <a>
          var wrapper = document.createElement('a');
          wrapper.setAttribute('href', '/');
          wrapper.style.cursor = 'pointer';
          wrapper.style.textDecoration = 'none';
          wrapper.style.display = 'inline-flex';
          wrapper.style.alignItems = 'center';
          el.parentNode.insertBefore(wrapper, el);
          wrapper.appendChild(el);
        }
      });
    });

    // ── 4. Any text node in nav that says brand name but isn't in <a>
    nav.querySelectorAll('div, span').forEach(function (el) {
      if (el.closest('a')) return; // already in a link
      var txt = (el.textContent || '').trim();
      if (/vest\s*l[êe]\s*h[ươu]ng/i.test(txt) && el.children.length === 0) {
        var wrapper = document.createElement('a');
        wrapper.setAttribute('href', '/');
        wrapper.style.cssText = 'cursor:pointer;text-decoration:none;display:inline-block;';
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
      }
    });
  }

  // ─────────────────────────────────────────────
  // FIX PRODUCTS PAGE — card links + filter tabs
  // Only runs on products.html
  // ─────────────────────────────────────────────
  function fixProductPage() {
    if (window.MLH_API || document.getElementById('products-grid')) return;
    // Only run on products page
    if (!window.location.pathname.match(/products\.html/i) &&
        !window.location.href.match(/products\.html/i)) return;

    // ── 1. Wire "Xem Chi Tiết" buttons → product-detail.html ──────────
    // Product cards: <div class="group relative flex flex-col">
    var cards = document.querySelectorAll('.group.relative.flex.flex-col');
    var CATEGORIES = ['suit-may-san', 'vest-waistcoat', 'phu-kien', 'may-do'];

    cards.forEach(function (card, idx) {
      // Assign category by scanning label text in card
      var labelEl = card.querySelector('span');
      var labelText = (labelEl ? labelEl.textContent : '').toLowerCase();
      var cat = 'suit-may-san'; // default
      if (/heritage|vest|waistcoat|gi l[eê]/i.test(labelText)) cat = 'vest-waistcoat';
      else if (/phu kien|ph[uụ] ki[eệ]n|acces/i.test(labelText)) cat = 'phu-kien';
      else if (/bespoke|may do|đặt riêng/i.test(labelText)) cat = 'may-do';
      card.setAttribute('data-category', cat);
      card.style.cursor = 'pointer';

      // Get product name for the detail page URL (use idx as ID)
      var productName = card.querySelector('h3');
      var nameSlug = productName ? encodeURIComponent(productName.textContent.trim()) : 'sp-' + (idx + 1);

      // Make whole card clickable
      card.addEventListener('click', function (e) {
        // Don't intercept if clicking an existing link inside
        if (e.target.closest('a')) return;
        window.location.href = '/ja/products.html';
      });

      // Also convert the "Xem Chi Tiết" button to a proper link look
      var btn = card.querySelector('button');
      if (btn) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', function (e) {
          e.stopPropagation(); // prevent double fire from card click
          window.location.href = '/ja/products.html';
        });
      }

      // Hover: highlight whole card
      card.addEventListener('mouseenter', function () {
        card.style.opacity = '1';
        if (btn) {
          btn.style.backgroundColor = 'rgba(157,2,8,0.15)';
          btn.style.borderColor = '#9D0208';
        }
      });
      card.addEventListener('mouseleave', function () {
        if (btn) {
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
        }
      });
    });

    // ── 2. Make filter tabs functional ────────────────────────────────
    var filterBtns = document.querySelectorAll(
      'button[class*="whitespace-nowrap"], button[class*="pb-1"][class*="px-1"]'
    );

    if (filterBtns.length === 0) return; // No filters on this page

    var GOLD       = '#E6C364';
    var ACTIVE_CLS_PATTERN = /border-b-2|text-secondary\b/;

    filterBtns.forEach(function (btn, i) {
      btn.style.cursor = 'pointer';
      btn.style.transition = 'color 0.3s, border-color 0.3s';

      btn.addEventListener('click', function () {
        // Deactivate all
        filterBtns.forEach(function (b) {
          b.style.color = 'rgba(255,255,255,0.55)';
          b.style.borderBottom = '2px solid transparent';
          b.style.fontWeight = '400';
        });
        // Activate clicked
        btn.style.color = GOLD;
        btn.style.borderBottom = '2px solid ' + GOLD;
        btn.style.fontWeight = '600';

        // Filter cards
        var txt = btn.textContent.trim().toLowerCase();
        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category') || '';
          var show = true;
          if (txt.match(/t[aấ]t c[aả]/)) {
            show = true; // show all
          } else if (txt.match(/suit may s[aẵ]n|may s[aẵ]n/)) {
            show = cat === 'suit-may-san';
          } else if (txt.match(/vest|waistcoat/)) {
            show = cat === 'vest-waistcoat';
          } else if (txt.match(/ph[uụ] ki[eệ]n|accessories/)) {
            show = cat === 'phu-kien';
          } else if (txt.match(/may [đd]o|bespoke/)) {
            show = cat === 'may-do';
          }

          // Animate show/hide
          if (show) {
            card.style.display = '';
            setTimeout(function () {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            setTimeout(function () { card.style.display = 'none'; }, 350);
          }
        });
      });
    });

    // Set first filter (Tất Cả) as active initially
    if (filterBtns[0]) {
      filterBtns[0].style.color = GOLD;
      filterBtns[0].style.borderBottom = '2px solid ' + GOLD;
      filterBtns[0].style.fontWeight = '600';
    }

    // Add cursor:pointer to cards (CSS)
    var style = document.createElement('style');
    style.textContent =
      '.group.relative.flex.flex-col { cursor: pointer; transition: opacity 0.3s, transform 0.3s; }' +
      '.group.relative.flex.flex-col:hover h3 { color: #E6C364 !important; }';
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // HIGHLIGHT ACTIVE NAV ITEM (lift + bold effect)
  // ──────────────────────────────────────────────
  function highlightActiveNav() {
    // Inject CSS for the lift animation
    var css = document.createElement('style');
    css.textContent = [
      /* All nav links: smooth transition for lift + color */
      'nav a:not([class*="btn"]):not([class*="cta"]):not([class*="logo"]):not([class*="brand"]) {',
      '  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), color 0.25s ease, font-weight 0s !important;',
      '  display: inline-block;',
      '}',
      /* Hover lift on non-active links */
      'nav a:not([class*="btn"]):not([class*="cta"]):not([class*="logo"]):not([class*="brand"]):not(.lhv-active):hover {',
      '  transform: translateY(-2px) !important;',
      '}',
      /* ACTIVE page link: raised + bold */
      'nav a.lhv-active {',
      '  transform: translateY(-3px) !important;',
      '  font-weight: 700 !important;',
      '  color: #ffffff !important;',
      '  letter-spacing: 0.14em !important;',
      '}',
      /* Active underline: red, animated width */
      'nav a.lhv-active::after {',
      '  content: "";',
      '  display: block;',
      '  height: 2px;',
      '  background: #9d0208;',
      '  margin-top: 2px;',
      '  width: 100%;',
      '  animation: lhv-underline-grow 0.4s cubic-bezier(0.22,1,0.36,1) forwards;',
      '}',
      '@keyframes lhv-underline-grow {',
      '  from { width: 0; opacity: 0; }',
      '  to   { width: 100%; opacity: 1; }',
      '}',
    ].join('\n');
    document.head.appendChild(css);

    // Detect current page filename
    var path = window.location.pathname || window.location.href;
    var page = path.split('/').pop().split('?')[0].toLowerCase() || 'index.html';
    if (!page || page === '') page = 'index.html';

    // Map: page file → nav link text pattern
    var PAGE_MAP = [
      { files: ['index.html', ''],        pattern: /trang\s*ch[uủ]/i },
      { files: ['products.html','vest-nam-trung-nien.html','vest-nam-tre.html','vest-nu.html'], pattern: /s[aả]n\s*ph[aẩ]m/i },
      { files: ['may-do.html'],            pattern: /may\s*[đd]o/i },
      { files: ['dong-phuc.html'],         pattern: /[đd][oô]ng\s*ph[uụ]c/i },
      { files: ['tu-van.html'],            pattern: /t[uư]\s*v[aấ]n/i },
      { files: ['gioi-thieu.html'],        pattern: /gi[oớ]i\s*thi[eệ]u/i },
    ];

    var activePattern = null;
    for (var i = 0; i < PAGE_MAP.length; i++) {
      if (PAGE_MAP[i].files.indexOf(page) !== -1) {
        activePattern = PAGE_MAP[i].pattern;
        break;
      }
    }
    if (!activePattern) return;

    // ── STEP 1: Reset ALL nav links (clear any leftover HTML active styles) ──
    var allNavLinks = document.querySelectorAll('nav a');
    allNavLinks.forEach(function(a) {
      if (a.closest('.lhv-dropdown')) return; // skip dropdown items
      // Remove Tailwind active classes that produce visible active states
      a.classList.remove('lhv-active');
      a.style.borderBottom  = 'none';
      a.style.transform     = '';
      a.style.fontWeight    = '';
      a.style.color         = '';
      // Remove border-b Tailwind classes by replacing with neutral
      var cls = a.className;
      // Strip border-b-* and border-[#...] classes that act as underline
      a.className = cls
        .replace(/border-b(?:-\d+)?/g, '')
        .replace(/border-\[#[^\]]+\]/g, '')
        .replace(/pb-\d+\s*/g, '')
        .replace(/font-bold/g, '')
        .trim();
      a.style.opacity = '0.8';
    });

    // ── STEP 2: Mark the single correct active link ──
    var navLinks = document.querySelectorAll('nav a:not([class*="btn"]):not([class*="cta"])');
    navLinks.forEach(function(a) {
      if (a.closest('.lhv-dropdown')) return;
      var txt = (a.textContent || '').replace(/[▾→]/g, '').trim();
      if (activePattern.test(txt)) {
        a.classList.add('lhv-active');
        a.style.opacity = '1';
      }
    });
  }


  // ──────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // FIX CART BUTTON → cart.html (all pages)
  // ──────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // MOBILE HAMBURGER MENU (all pages)
  // ──────────────────────────────────────────────
  function optimizeProductPagesMobile() {
    var path = window.location.pathname || window.location.href;
    var isHome = path.endsWith('index.html') || path === '/' || path.match(/^https?:\/\/[^/]+\/?$/);
    var isDetailPage = path.indexOf('/ja/san-pham/') !== -1 || path.indexOf('product-detail') !== -1 || path.indexOf('-detail') !== -1;
    var isProductLike = path.indexOf('vest') !== -1 || path.indexOf('blazer') !== -1 || path.indexOf('product') !== -1;
    
    if (isHome || isDetailPage || !isProductLike) return;

    // Apply classes for CSS to hook into easily
    var hero = document.querySelector('main > section:first-of-type') || document.querySelector('section.hero-sec');
    if (hero) {
      var headerInner = hero.querySelector('div.relative.z-10');
      if (headerInner) headerInner.classList.add('product-header');
    }

    var style = document.createElement('style');
    style.textContent = [
      '/* Apply this layout consistently across ALL product pages. */',
      '@media (max-width: 768px) {',
      '  /* 1. FIX HEADER DANH MỤC -> ĐƯA VÀO BOX */',
      '  .product-header {',
      '    background: rgba(255,255,255,0.03) !important;',
      '    padding: 16px !important;',
      '    border-radius: 8px !important;',
      '    margin: 16px !important;',
      '  }',
      '  .breadcrumb, main > section:first-of-type nav {',
      '    font-size: 11px !important;',
      '    opacity: 0.7 !important;',
      '    margin-bottom: 6px !important;',
      '  }',
      '  .product-header h1, .product-title {',
      '    font-size: 20px !important;',
      '    font-weight: 600 !important;',
      '    line-height: 1.3 !important;',
      '  }',
      '  /* 3. FIX LAYOUT BỊ TRỐNG */',
      '  .product-hero, section.hero-sec, main > section:first-of-type {',
      '    min-height: auto !important;',
      '    padding: 80px 16px 24px !important;',
      '    height: auto !important;',
      '  }',
      '  main {',
      '    padding-top: 16px !important;',
      '  }',
      '  /* 4. FIX GRID SẢN PHẨM: HIỂN THỊ 2 CỘT SONG SONG TRÊN MOBILE */',
      '  .product-grid, .prod-grid, #product-grid, #sg-product-grid, #blazer-grid, #products-grid {',
      '    display: grid !important;',
      '    grid-template-columns: repeat(2, 1fr) !important;',
      '    gap: 12px !important;',
      '    padding: 12px 0 !important;',
      '  }',
      '  .product-card, .lux-card {',
      '    width: 100% !important;',
      '  }',
      '  /* 2B. FIX CSS ĐỂ ẢNH HIỂN THỊ */',
      '  .product-card img, .lux-card img {',
      '    width: 100% !important;',
      '    height: auto !important;',
      '    display: block !important;',
      '  }',
      '  /* Reset padding to prevent overlap since img is auto height now */',
      '  .lux-card .card-gallery { height: auto !important; padding-top: 0 !important; }',
      '  .lux-card .card-gallery .gallery-img { position: relative !important; opacity: 1 !important; display: none; }',
      '  .lux-card .card-gallery .gallery-img.active { display: block !important; }',
      '  /* 5. FIX BUTTON TRONG CARD */',
      '  .product-card button, .lux-card .flex-grow > button:last-of-type, .lux-card .btn-detail {',
      '    width: 100% !important;',
      '    height: 44px !important;',
      '    font-size: 13px !important;',
      '    display: flex !important;',
      '    align-items: center !important;',
      '    justify-content: center !important;',
      '    padding: 0 !important;',
      '  }',
      '  /* 6. FIX SPACING TOÀN TRANG */',
      '  .product-page, body {',
      '    padding-bottom: 100px !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function injectSanPhamDropdown() {
    // Inject CSS once
    var css = document.createElement('style');
    css.textContent = [
      '.lhv-nav-group { position: relative; display: inline-flex; align-items: center; }',
      '.lhv-nav-group > a { display: inline-flex; align-items: center; gap: 4px; }',
      '.lhv-nav-group > a .lhv-caret { font-size: 10px; opacity: 0.7; transition: transform 0.25s; display: inline-block; line-height: 1; }',
      '.lhv-nav-group:hover > a .lhv-caret { transform: rotate(180deg); }',
      '.lhv-dropdown {',
      '  position: absolute; top: 100%; left: 50%; transform: translateX(-50%);',
      '  background: #1a1714; border: 1px solid rgba(255,255,255,0.08);',
      '  box-shadow: 0 20px 50px rgba(0,0,0,0.7); min-width: 220px; z-index: 9999;',
      '  padding-top: 10px;',
      '  opacity: 0; visibility: hidden; pointer-events: none;',
      '  transition: opacity 0.2s ease 0s, transform 0.2s ease 0s, visibility 0s ease 0.2s;',
      '  transform: translateX(-50%) translateY(-4px);',
      '}',
      '.lhv-nav-group:hover .lhv-dropdown {',
      '  opacity: 1; visibility: visible; pointer-events: auto;',
      '  transform: translateX(-50%) translateY(0);',
      '}',
      '.lhv-dropdown::before {',
      '  content: ""; position: absolute; top: -6px; left: 50%; transform: translateX(-50%);',
      '  border-left: 6px solid transparent; border-right: 6px solid transparent;',
      '  border-bottom: 6px solid rgba(255,255,255,0.08);',
      '}',
      '.lhv-dropdown a {',
      '  display: block !important; padding: 11px 20px !important;',
      '  font-family: "Inter", sans-serif !important; font-size: 11px !important;',
      '  font-weight: 500 !important; letter-spacing: 0.1em !important;',
      '  text-transform: uppercase !important; color: rgba(233,225,219,0.75) !important;',
      '  text-decoration: none !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important;',
      '  transition: color 0.2s, background 0.2s, padding-left 0.2s !important;',
      '  white-space: nowrap !important;',
      '}',
      '.lhv-dropdown a:last-child { border-bottom: none !important; }',
      '.lhv-dropdown a:hover { color: #e6c364 !important; background: rgba(230,195,100,0.05) !important; padding-left: 26px !important; }',
      '.lhv-dropdown a .lhv-sub-arrow { margin-left: 6px; opacity: 0; transition: opacity 0.2s; font-size: 9px; }',
      '.lhv-dropdown a:hover .lhv-sub-arrow { opacity: 1; }',
    ].join('\n');
    document.head.appendChild(css);

    // Sub-categories to show
    var SUBCATS = [
      { label: 'Vest Nam Trung Niên', href: '/ja/vest-nam-trung-nien.html' },
      { label: 'Vest Nam Trẻ',        href: '/ja/vest-nam-tre.html'        },
      { label: 'Vest Nữ',             href: '/ja/vest-nu.html'             },
    ];

    // Find the "Sản Phẩm" nav link on this page
    var navLinks = document.querySelectorAll('nav a, header a');
    var sanPhamLink = null;
    navLinks.forEach(function(a) {
      var txt = (a.textContent || '').trim();
      if (/s[aả]n ph[aẩ]m/i.test(txt) && (a.href || '').match(/products\.html/i)) {
        sanPhamLink = a;
      }
    });
    if (!sanPhamLink) return;

    // Add caret to the link text
    var caret = document.createElement('span');
    caret.className = 'lhv-caret';
    caret.textContent = '▾';
    sanPhamLink.appendChild(caret);

    // Build dropdown panel
    var dropdown = document.createElement('div');
    dropdown.className = 'lhv-dropdown';
    SUBCATS.forEach(function(sc) {
      var a = document.createElement('a');
      a.href = sc.href;
      a.innerHTML = sc.label + '<span class="lhv-sub-arrow">→</span>';
      dropdown.appendChild(a);
    });

    // Wrap link + dropdown in group div
    var group = document.createElement('div');
    group.className = 'lhv-nav-group';
    sanPhamLink.parentNode.insertBefore(group, sanPhamLink);
    group.appendChild(sanPhamLink);
    group.appendChild(dropdown);
  }

  // ──────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // FIX CART BUTTON → cart.html (all pages)
  // ──────────────────────────────────────────────

  // ──────────────────────────────────────────────
  // MOBILE HAMBURGER MENU (all pages)
  // ──────────────────────────────────────────────
  function injectMobileMenu() {
    if (document.getElementById('lhv-header') || document.getElementById('lhv-mobile-drawer') || document.getElementById('lhv-hamburger')) return;
    var header = document.querySelector('header, nav.fixed, [class*="fixed"][class*="top-0"]');
    if (!header) return;
    if (document.getElementById('lhv-mobile-btn')) return; // already injected

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = [
      '@media (max-width:1023px){',
      '  #lhv-mobile-overlay{display:block;}',
      '}',
      '#lhv-mobile-drawer{',
      '  position:fixed;top:0;right:0;height:100vh;width:80vw;max-width:320px;',
      '  background:linear-gradient(160deg,#1a1210 0%,#2d0002 100%);',
      '  z-index:9999;transform:translateX(100%);transition:transform 0.38s cubic-bezier(.4,0,.2,1);',
      '  display:flex;flex-direction:column;padding:24px 28px 40px;border-left:1px solid rgba(157,2,8,0.3);',
      '  box-shadow:-12px 0 40px rgba(0,0,0,0.6);',
      '}',
      '#lhv-mobile-drawer.open{transform:translateX(0);}',
      '#lhv-mobile-backdrop{',
      '  position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9998;',
      '  opacity:0;pointer-events:none;transition:opacity 0.35s ease;backdrop-filter:blur(4px);',
      '}',
      '#lhv-mobile-backdrop.open{opacity:1;pointer-events:all;}',
      '#lhv-mobile-drawer a{',
      '  color:rgba(233,225,220,0.85);font-family:\'Inter\',sans-serif;',
      '  font-size:13px;letter-spacing:0.12em;text-transform:uppercase;',
      '  text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);',
      '  transition:color 0.2s,padding-left 0.2s;display:block;',
      '}',
      '#lhv-mobile-drawer a:hover,#lhv-mobile-drawer a.lhv-active{',
      '  color:#e6c364;padding-left:8px;',
      '}',
      '#lhv-mobile-btn{display:none;}',
      '@media (max-width:1023px){#lhv-mobile-btn{display:flex;}}',
    ].join('');
    document.head.appendChild(style);

    // Hamburger button
    var btn = document.createElement('button');
    btn.id = 'lhv-mobile-btn';
    btn.setAttribute('aria-label', 'Mở menu');
    btn.style.cssText = 'align-items:center;justify-content:center;width:40px;height:40px;color:#e6c364;background:transparent;border:none;cursor:pointer;z-index:10000;';
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:26px;">menu</span>';
    var rightContainer = header.querySelector('.flex.items-center.space-x-6') || header.querySelector('.flex.items-center:last-of-type') || header;
    rightContainer.appendChild(btn);

    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.id = 'lhv-mobile-backdrop';
    document.body.appendChild(backdrop);

    // Drawer
    var drawer = document.createElement('div');
    drawer.id = 'lhv-mobile-drawer';

    // Logo in drawer
    var logo = document.createElement('div');
    logo.style.cssText = 'font-family:"Noto Serif",serif;font-size:1.1rem;font-weight:700;color:#e6c364;letter-spacing:0.04em;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(230,195,100,0.2);display:flex;justify-content:space-between;align-items:center;';
    logo.innerHTML = '<div style="flex:1;"></div><button id="lhv-close-btn" style="background:transparent;border:none;color:#1a1a1a;cursor:pointer;"><span class="material-symbols-outlined" style="font-size:22px;">close</span></button>';
    drawer.appendChild(logo);

    // Nav links
    var pages = [
      {href:'/', label:'Trang Chủ'},
      {href:'/ja/products.html', label:'Sản Phẩm'},
      {href:'/ja/may-do.html', label:'May Đo'},
      {href:'/ja/dich-vu.html', label:'Dịch Vụ'},
      {href:'/ja/dong-phuc.html', label:'Đồng Phục'},
      {href:'/ja/tu-van.html', label:'Tư Vấn Đặt Lịch'},
      {href:'/ja/gioi-thieu.html', label:'Giới Thiệu'},
      {href:'/ja/chinh-sach.html', label:'Chính Sách'},
    ];
    var curPage = window.location.pathname.split('/').pop() || 'index.html';
    pages.forEach(function(p) {
      var a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.label;
      if (curPage === p.href) a.classList.add('lhv-active');
      drawer.appendChild(a);
    });

    // CTA at bottom
    var cta = document.createElement('a');
    cta.href = '/ja/tu-van.html';
    cta.style.cssText = 'margin-top:32px;background:#9d0208;color:#fff;text-align:center;padding:14px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;border:none;border-bottom:none;display:block;';
    cta.textContent = 'Đặt Lịch Ngay';
    drawer.appendChild(cta);

    document.body.appendChild(drawer);

    // Toggle logic
    function openMenu() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:26px;">close</span>';
    }
    function closeMenu() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:26px;">menu</span>';
    }

    btn.addEventListener('click', function() {
      if (drawer.classList.contains('open')) closeMenu(); else openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    document.getElementById('lhv-close-btn').addEventListener('click', closeMenu);
    drawer.querySelectorAll('a[href]').forEach(function(a) {
      if (!a.closest('#lhv-close-btn')) a.addEventListener('click', closeMenu);
    });
  }
  function fixCartButton() {
    if (document.getElementById('lhv-header') || document.getElementById('lhv-cart-drawer')) return;
    var els = document.querySelectorAll('nav button, nav a, header button, header a');
    els.forEach(function(el) {
      var icon = el.querySelector('.material-symbols-outlined');
      if (!icon) return;
      if (!icon.textContent || icon.textContent.trim().indexOf('shopping') === -1) return;
      // Highlight when on cart page
      var isCart = (window.location.href.indexOf('cart.html') !== -1);
      if (isCart) {
        icon.style.fontVariationSettings = "'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24";
        icon.style.color = '#e6c364';
      }
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        window.location.href = '/ja/cart.html';
      });
    });
  }
  function init() {
    fixNavLinks();
    fixBrandSpans();
    fixTextNodes();
    fixLinks();
    fixTitle();
    fixProductPage();
    injectSanPhamDropdown();
    injectMobileMenu();
    fixCartButton();
    injectZaloButton();
    optimizeProductPagesMobile();

    // Expose company data globally for any inline scripts
    window.VEST_LE_HUONG = COMPANY;
  }



  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
