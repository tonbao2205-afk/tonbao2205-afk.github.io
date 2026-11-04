/**
 * luxury-animations.js  v2 — Unified Motion System
 * mayLEHUONG | "Chất Lượng – Uy Tín – Phong Cách"
 *
 * ONE system. ALL pages. SAME feel.
 * Easing: cubic-bezier(0.22, 1, 0.36, 1)  — "the luxury ease"
 * Durations: 0.6s – 1.0s
 * Philosophy: Dior / Tom Ford — slow, controlled, invisible craft
 */

(function () {
  'use strict';
  if (window.__MLH_MOTION_STARTED__) return;
  window.__MLH_MOTION_STARTED__ = true;

  /* ─────────────────────────────────────────────────────────────
     CONSTANTS — change here to update the entire site at once
  ───────────────────────────────────────────────────────────── */
  var EASE      = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var DUR_FAST  = '0.55s';
  var DUR_BASE  = '0.75s';
  var DUR_SLOW  = '1.0s';
  var REVEAL_Y  = '18px';   // uniform scroll-reveal lift distance


  /* ═══════════════════════════════════════════════════════════
     1. INJECT BASE CSS
     All motion logic lives here. JS only adds/removes classes.
  ═══════════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('lux-css')) return;
    var s = document.createElement('style');
    s.id = 'lux-css';
    s.textContent = [

      '@media(max-width:768px){',
        '.lux-r{opacity:1 !important;transform:none !important;transition:none !important;animation:none !important;}',
        '.lux-r.lux-v{opacity:1 !important;transform:none !important;}',
        '.vip-card-3d,.lh-product-card,.lux-card{transform:none !important;transition:none !important;}',
      '}',

      /* ── Scroll-reveal base (every section/card/block) ── */
      '.lux-r{',
        'opacity:0 !important;',
        'transform:translateY(36px) scale(0.98);',
        'transition:opacity ' + DUR_BASE + ' ' + EASE + ', transform ' + DUR_BASE + ' ' + EASE + ';',
        'will-change:opacity,transform;',
      '}',
      '.lux-r.lux-v{',
        'opacity:1 !important;',
        'transform:translateY(0) scale(1) !important;',
      '}',

      /* stagger delays for direct children of grid/flex parents */
      '.lux-grid.lux-v>.lux-r:nth-child(1),.lux-grid>.lux-r.lux-v:nth-child(1){transition-delay:0s}',
      '.lux-grid.lux-v>.lux-r:nth-child(2),.lux-grid>.lux-r.lux-v:nth-child(2){transition-delay:.08s}',
      '.lux-grid.lux-v>.lux-r:nth-child(3),.lux-grid>.lux-r.lux-v:nth-child(3){transition-delay:.16s}',
      '.lux-grid.lux-v>.lux-r:nth-child(4),.lux-grid>.lux-r.lux-v:nth-child(4){transition-delay:.24s}',
      '.lux-grid.lux-v>.lux-r:nth-child(5),.lux-grid>.lux-r.lux-v:nth-child(5){transition-delay:.32s}',
      '.lux-grid.lux-v>.lux-r:nth-child(6),.lux-grid>.lux-r.lux-v:nth-child(6){transition-delay:.40s}',
      '.lux-grid.lux-v>.lux-r:nth-child(7),.lux-grid>.lux-r.lux-v:nth-child(7){transition-delay:.48s}',
      '.lux-grid.lux-v>.lux-r:nth-child(8),.lux-grid>.lux-r.lux-v:nth-child(8){transition-delay:.56s}',
      '.lux-grid.lux-v>.lux-r:nth-child(n+9),.lux-grid>.lux-r.lux-v:nth-child(n+9){transition-delay:.60s}',


      /* ── Hero text layers — ALWAYS VISIBLE IMMEDIATELY ── */
      '.lux-h-tag,.lux-h-title,.lux-h-sub,.lux-h-cta{',
        'opacity:1 !important;',
        'transition:opacity ' + DUR_SLOW + ' ' + EASE + ';',
        'will-change:opacity;',
      '}',
      '.lux-h-tag.lux-hl  { transition-delay:0.10s }',
      '.lux-h-title.lux-hl{ transition-delay:0.28s }',
      '.lux-h-sub.lux-hl  { transition-delay:0.46s }',
      '.lux-h-cta.lux-hl  { transition-delay:0.62s }',
      '.lux-h-tag.lux-hl,.lux-h-title.lux-hl,.lux-h-sub.lux-hl,.lux-h-cta.lux-hl{',
        'opacity:1 !important;',
      '}',

      /* Hero image scale — identical on every page */
      '.lux-h-img{',
        'transform:scale(1.07);',
        'transition:transform 1.4s ' + EASE + ';',
        'will-change:transform;',
      '}',
      '.lux-h-img.lux-hl{transform:scale(1);}',

      /* ── Navbar scroll solidification ── */
      'nav.lux-nav-scrolled,header.lux-nav-scrolled{',
        'background:rgba(22,19,16,0.96) !important;',
        'backdrop-filter:blur(24px) saturate(160%) !important;',
        '-webkit-backdrop-filter:blur(24px) saturate(160%) !important;',
        'border-bottom:1px solid rgba(230,195,100,0.10) !important;',
        'box-shadow:0 6px 32px rgba(0,0,0,0.30) !important;',
      '}',
      'nav,header{',
        'transition:',
          'background ' + DUR_BASE + ' ' + EASE + ',',
          'box-shadow ' + DUR_BASE + ' ' + EASE + ',',
          'border-color ' + DUR_BASE + ' ' + EASE + ' !important;',
      '}',

      /* ── Card hover — luxury lift ── */
      '.lux-card{',
        'transition:',
          'transform ' + DUR_BASE + ' ' + EASE + ',',
          'box-shadow ' + DUR_BASE + ' ' + EASE + ';',
        'will-change:transform,box-shadow;',
      '}',
      '.lux-card:hover{',
        'transform:translateY(-5px);',
        'box-shadow:0 20px 48px rgba(0,0,0,0.40),0 0 32px rgba(157,2,8,0.07);',
      '}',
      '.lux-card .lux-ci{',                           /* card image */
        'overflow:hidden;',
      '}',
      '.lux-card .lux-ci img{',
        'transition:transform 0.9s ' + EASE + ';',
        'will-change:transform;',
      '}',
      '.lux-card:hover .lux-ci img{transform:scale(1.05);}',

      /* ── Button micro-interaction ── */
      '.lux-btn{',
        'transition:',
          'transform ' + DUR_FAST + ' ' + EASE + ',',
          'letter-spacing ' + DUR_FAST + ' ' + EASE + ',',
          'box-shadow ' + DUR_FAST + ' ' + EASE + ' !important;',
        'will-change:transform;',
        'display:inline-block;',
      '}',
      '.lux-btn:hover{',
        'transform:translateY(-2px);',
        'letter-spacing:0.03em;',
        'box-shadow:0 10px 28px rgba(157,2,8,0.25) !important;',
      '}',
      '.lux-btn:active{transform:translateY(0);transition-duration:.15s;}',

      /* ── Cursor glow (desktop) ── */
      '@media(hover:hover){',
        '#lux-glow{',
          'position:fixed;top:0;left:0;',
          'width:320px;height:320px;border-radius:50%;',
          'pointer-events:none;z-index:9998;',
          'background:radial-gradient(circle,rgba(157,2,8,0.05) 0%,transparent 70%);',
          'transform:translate(-50%,-50%);',
          'will-change:left,top;',
        '}',
      '}',

    ].join('');
    document.head.appendChild(s);
  }


  /* ═══════════════════════════════════════════════════════════
     2. UNIFIED PAGE LOADER & TRANSITION SYSTEM (mayLEHUONG)
     - Single unified loading overlay with logo, spinner, text
     - Dismisses cleanly once required fold data is rendered
     - Does not wait for offscreen lazy media
     - Handles network lag / timeout with friendly retry dialog
     - 100% resilient on Back/Forward (bfcache pageshow)
  ═══════════════════════════════════════════════════════════ */
  var curtain = null;
  var isDismissed = false;
  var timeoutTimer = null;
  var dismissTimer = null;
  var pendingData = 0;
  var domReady = document.readyState !== 'loading';
  // Pages that ship their content in HTML (SEO product pages, static product grids) are readable as soon as
  // the DOM is ready; live price/stock hydration must not keep them covered.
  function hasPrerenderedContent() {
    return Boolean(document.querySelector('[data-prerendered], .vn-card'));
  }

  function settlePage() {
    if (!domReady || isDismissed) return;
    if (pendingData && !hasPrerenderedContent()) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (domReady && (!pendingData || hasPrerenderedContent())) MLH_LOADER.dismiss();
      });
    });
  }

  function createCurtain() {
    curtain = document.getElementById('lux-curtain');
    if (!curtain) {
      curtain = document.createElement('div');
      curtain.id = 'lux-curtain';
      curtain.setAttribute('role', 'status');
      curtain.setAttribute('aria-live', 'polite');
      curtain.innerHTML = [
        '<div class="lux-loading-card">',
        '  <img src="/images/Logo Lê Hương Web.png" alt="mayLEHUONG" class="lux-loading-logo" onerror="this.onerror=null;this.src=\'/images/logo.png\';" />',
        '  <div class="lux-loading-spinner" aria-hidden="true"></div>',
        '  <div class="lux-loading-text">Đang tải...</div>',
        '  <div id="lux-loading-error" class="lux-loading-error-box" style="display:none;">',
        '    <div class="lux-loading-error-text">Kết nối mạng chậm hoặc không ổn định</div>',
        '    <div class="lux-loading-btn-group">',
        '      <button type="button" class="lux-loading-retry-btn" onclick="window.location.reload()">Thử lại</button>',
        '      <button type="button" class="lux-loading-dismiss-btn" onclick="if(window.MLH_LOADER)window.MLH_LOADER.dismissImmediate()">Bỏ qua &amp; Xem tiếp</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
      if (document.body) {
        document.body.insertBefore(curtain, document.body.firstChild);
      } else {
        document.documentElement.appendChild(curtain);
      }
    }
  }

  var MLH_LOADER = {
    beginData: function () { pendingData++; },
    endData: function () { pendingData = Math.max(0, pendingData - 1); settlePage(); },
    show: function () {
      createCurtain();
      isDismissed = false;
      if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
      if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }

      var errBox = document.getElementById('lux-loading-error');
      if (errBox) errBox.style.display = 'none';

      curtain.classList.remove('lux-hidden');
      curtain.removeAttribute('inert');
      curtain.setAttribute('aria-hidden', 'false');

      // Safety timeout: after 9s of slow connection, show retry prompt
      timeoutTimer = setTimeout(function () {
        if (!isDismissed && curtain && !curtain.classList.contains('lux-hidden')) {
          MLH_LOADER.showTimeoutError();
        }
      }, 9000);
    },

    dismiss: function () {
      if (isDismissed) return;
      isDismissed = true;
      if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
      createCurtain();
      curtain.classList.add('lux-hidden');
      curtain.setAttribute('inert', '');
      curtain.setAttribute('aria-hidden', 'true');
    },

    dismissImmediate: function () {
      isDismissed = true;
      if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
      if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
      createCurtain();
      curtain.classList.add('lux-hidden');
      curtain.setAttribute('inert', '');
      curtain.setAttribute('aria-hidden', 'true');
    },

    showTimeoutError: function () {
      createCurtain();
      var errBox = document.getElementById('lux-loading-error');
      if (errBox) {
        errBox.style.display = 'flex';
      }
    }
  };
  window.MLH_LOADER = MLH_LOADER;

  function pageEnter() {
    MLH_LOADER.show();
    settlePage();
    document.addEventListener('DOMContentLoaded', function () {
      domReady = true;
      settlePage();
    }, { once: true });
  }

  function pageLeave(href) {
    // Show the curtain for the transition but navigate at once instead of delaying every click.
    MLH_LOADER.show();
    window.location.href = href;
  }

  /* Wire internal page transitions — single loading cycle per navigation */
  function wirePageTransitions() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;

      // Skip non-navigational clicks
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // primary mouse button only
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target === '_blank') return;
      if (link.hasAttribute('download')) return;
      if (link.closest('#cta-widget') || link.closest('#cta-overlay')) return;
      if (link.getAttribute('role') === 'tab' || link.classList.contains('tab-btn')) return;

      var href = link.getAttribute('href');
      if (!href) return;
      href = href.trim();
      if (
        href === '' ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return;

      // Validate internal origin
      try {
        var targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;
        // Same page anchor jump
        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search && targetUrl.hash) return;
        if (targetUrl.href === window.location.href) return;
      } catch (err) {
        return;
      }

      e.preventDefault();
      pageLeave(link.href);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     3. HERO ANIMATION — IDENTICAL on every page
     Strategy: find the FIRST full-height or prominent section
               and classify its key children into layers.
  ═══════════════════════════════════════════════════════════ */
  function initHero() {
    /* Candidates: first <section>, or any element with hero/banner in class */
    var hero =
      document.querySelector('[class*="hero"]') ||
      document.querySelector('[id*="hero"]') ||
      document.querySelector('main > section:first-child') ||
      document.querySelector('section:first-of-type');

    if (!hero) return;

    /* Hero images */
    hero.querySelectorAll('img').forEach(function (img) {
      img.classList.add('lux-h-img');
    });

    /* Classify text layers — use tag hierarchy and position */
    var allText = Array.from(
      hero.querySelectorAll('h1,h2,h3,h4,p,a,button,[class*="btn"]')
    );

    var tagged   = false;
    var titled   = false;
    var subbed   = false;
    var ctaGroup = null;

    allText.forEach(function (el) {
      var tag = el.tagName.toLowerCase();
      var cls = el.className || '';

      /* Skip nav elements */
      if (el.closest('nav') || el.closest('header')) return;

      if (!tagged && (tag === 'p' || cls.match(/label|tag|eyebrow|kicker|badge|sub/i))) {
        el.classList.add('lux-h-tag');
        tagged = true;
      } else if (!titled && (tag === 'h1' || tag === 'h2')) {
        el.classList.add('lux-h-title');
        titled = true;
      } else if (!subbed && tag === 'p') {
        el.classList.add('lux-h-sub');
        subbed = true;
      } else if (!ctaGroup && (tag === 'a' || tag === 'button' || cls.match(/btn|cta/i))) {
        /* grab the whole CTA container */
        ctaGroup = el.parentElement;
        ctaGroup.classList.add('lux-h-cta');
      }
    });

    /* Fallback: if nothing was found, grab first children */
    if (!titled) {
      var firstH = hero.querySelector('h1,h2,h3');
      if (firstH) firstH.classList.add('lux-h-title');
    }

    /* Trigger all layers — stagger is handled purely by CSS delay */
    requestAnimationFrame(function () {
      setTimeout(function () {
        hero.querySelectorAll('.lux-h-img,.lux-h-tag,.lux-h-title,.lux-h-sub,.lux-h-cta')
          .forEach(function (el) { el.classList.add('lux-hl'); });
      }, 60);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. SCROLL REVEAL — GLOBAL, UNIFIED
  ═══════════════════════════════════════════════════════════ */
  var revealObserver;

  function initScrollReveal() {
    /* ON MOBILE: SKIP SCROLL REVEAL TO PREVENT LAG — RENDER INSTANTLY */
    if (window.innerWidth <= 768) {
      document.querySelectorAll('.lux-r').forEach(function (el) {
        el.classList.add('lux-v');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    /* ON DESKTOP: PROPER INTERSECTION OBSERVER FOR LUXURY SCROLL ANIMATIONS */
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('lux-v');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      /* 0: khoi cao (luoi 60+ the) chi lot ~5% vao man hinh van phai hien */
      threshold: 0,
      rootMargin: '0px 0px -50px 0px'
    });

    /* Selectors: every meaningful block, NOT the hero */
    var SELECTORS = [
      'section',
      'article',
      'form',
      'footer',
      '[class*="card"]',
      '[class*="step"]',
      '[class*="benefit"]',
      '[class*="feature"]',
      '[class*="pricing"]',
      '[class*="timeline"]',
      '[class*="process"]',
      '[class*="team"]',
      '[class*="stat"]',
      '[class*="faq"]',
      '[class*="gallery"]',
      '[class*="banner"]',
    ].join(',');

    var heroEl =
      document.querySelector('[class*="hero"]') ||
      document.querySelector('main > section:first-child') ||
      document.querySelector('section:first-of-type');

    var seen = new WeakSet();

    document.querySelectorAll(SELECTORS).forEach(function (el) {
      if (el === heroEl) return;       // hero handled separately
      if (el.closest('nav')) return;   // skip nav
      if (el.offsetHeight < 20) return;
      if (seen.has(el)) return;
      seen.add(el);

      el.classList.add('lux-r');
      revealObserver.observe(el);
    });

    /* Also explicitly observe all elements pre-tagged with .lux-r */
    document.querySelectorAll('.lux-r').forEach(function (el) {
      if (el.closest('nav')) return;
      if (!seen.has(el)) {
        seen.add(el);
        revealObserver.observe(el);
      }
    });

    /* Stagger grid cards */
    markGrids(seen);
  }

  function markGrids(seen) {
    var gridParents = document.querySelectorAll(
      '[class*="grid"]:not(nav [class*="grid"]),' +
      '[class*="cards"],' +
      '[class*="products"],' +
      '[class*="team"]'
    );
    gridParents.forEach(function (parent) {
      var kids = Array.from(parent.children).filter(function (c) {
        return c.offsetHeight > 20;
      });
      if (kids.length < 2 || kids.length > 16) return;

      parent.classList.add('lux-grid');

      kids.forEach(function (kid) {
        if (!seen || !seen.has(kid)) {
          kid.classList.add('lux-r');
          revealObserver.observe(kid);
          if (seen) seen.add(kid);
        }
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     5. NAVBAR — SAME BEHAVIOR ALL PAGES
  ═══════════════════════════════════════════════════════════ */
  function initNavbar() {
    var nav = document.querySelector('nav') || document.querySelector('header');
    if (!nav) return;

    function tick() {
      if (window.scrollY > 56) nav.classList.add('lux-nav-scrolled');
      else nav.classList.remove('lux-nav-scrolled');
    }
    tick();
    window.addEventListener('scroll', tick, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════
     6. LOGO FIX — Always points to index.html
  ═══════════════════════════════════════════════════════════ */
  function fixLogo() {
    /* Find logo elements: <a> in nav containing an img or a brand text */
    var candidates = document.querySelectorAll(
      'nav a, header a, [class*="logo"], [id*="logo"]'
    );
    candidates.forEach(function (el) {
      var tagName = el.tagName.toLowerCase();
      /* Is it (or does it contain) a logo-like element? */
      var hasImg  = el.querySelector('img') || el.tagName === 'IMG';
      var hasBrand = /vest\s*l[êe]\s*h[ươu]ng|logo|brand/i.test(
        (el.className || '') + (el.textContent || '') + (el.id || '')
      );

      if (tagName === 'a' && (hasImg || hasBrand)) {
        el.setAttribute('href', '/');
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     7. CARDS & BUTTONS — global class application
  ═══════════════════════════════════════════════════════════ */
  function initCards() {
    document.querySelectorAll(
      '[class*="product-card"],[class*="card-item"],[class*="suit-card"],[class*="item-card"]'
    ).forEach(function (card) {
      if (card.closest('nav')) return;
      card.classList.add('lux-card');
      var img = card.querySelector('img');
      if (img) {
        var wrap = img.parentElement;
        wrap.classList.add('lux-ci');
      }
    });
  }

  function initButtons() {
    document.querySelectorAll(
      'a[class*="bg-"],button[class*="bg-"],[class*="btn-primary"],[class*="cta"]'
    ).forEach(function (btn) {
      if (btn.closest('nav') || btn.closest('#cta-widget') || btn.id === 'cta-toggle' || btn.classList.contains('cta-nhun-nhay')) return;
      btn.classList.add('lux-btn');
    });
  }


  /* ═══════════════════════════════════════════════════════════
     8. CURSOR GLOW (desktop only — subtle luxury detail)
  ═══════════════════════════════════════════════════════════ */
  function initCursorGlow() {
    if (window.matchMedia('(hover:none)').matches) return;

    var glow = document.getElementById('lux-glow');
    if (!glow) {
      glow = document.createElement('div');
      glow.id = 'lux-glow';
      document.body.appendChild(glow);
    }

    var tx = -999, ty = -999, cx = -999, cy = -999, raf;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(animate);
    });

    function animate() {
      cx += (tx - cx) * 0.10;
      cy += (ty - cy) * 0.10;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    }
  }


  /* ═══════════════════════════════════════════════════════════
     9. SMOOTH ANCHOR SCROLL
  ═══════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     10. MOBILE SWIPE — inject touch handlers on all slider containers
         Only active on mobile (≤768px). Desktop uses arrow buttons.
  ═══════════════════════════════════════════════════════════ */
  function initMobileSwipe() {
    if (window.innerWidth > 768) return;

    /* ── Easing spring: ease-out cubic ──────────────────────────
       Returns tweened value between `from` and `to` using t ∈ [0,1]
       where t is elapsed / duration.
    ───────────────────────────────────────────────────────────── */
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); } // cubic ease-out

    /* ── Core swipe helper ───────────────────────────────────────
       Attaches touchstart / touchmove / touchend to `el`.
       Calls onNext() / onPrev() after a confirmed horizontal swipe.
       Applies rubber-band resistance if `canResist(dir)` returns true.
       `el` must already be positioned (relative/absolute/fixed).
    ───────────────────────────────────────────────────────────── */
    function addSwipe(el, onNext, onPrev, canResist) {
      if (!el || el._swipeInit) return;
      el._swipeInit = true;

      var startX = 0, startY = 0;
      var movedX = 0;
      var locked = null;          // 'h' | 'v' | null
      var LOCK_THRESHOLD = 10;    // px dead-zone before locking direction
      var SWIPE_THRESHOLD = 38;   // px minimum to trigger slide change
      var RESIST = 0.30;          // rubber-band coefficient (0 = walls, 1 = free)

      el.addEventListener('touchstart', function (e) {
        startX  = e.touches[0].clientX;
        startY  = e.touches[0].pageY;
        movedX  = 0;
        locked  = null;
        el.style.transition = 'none'; // kill any running CSS transition
      }, { passive: true });

      el.addEventListener('touchmove', function (e) {
        var dx = e.touches[0].clientX - startX;
        var dy = e.touches[0].pageY   - startY;

        if (!locked) {
          if (Math.abs(dx) > LOCK_THRESHOLD || Math.abs(dy) > LOCK_THRESHOLD) {
            locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
          }
        }

        if (locked !== 'h') return; // vertical scroll — let browser handle

        movedX = dx;
        // Resistance at edges
        var atEdge = canResist && canResist(dx < 0 ? 'next' : 'prev');
        var translateX = atEdge ? dx * RESIST : dx;
        el.style.transition = 'none';
        el.style.transform   = 'translateX(' + translateX + 'px)';
      }, { passive: true });

      el.addEventListener('touchend', function () {
        var dx = movedX;
        // Spring back with ease-out transition
        el.style.transition  = 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        el.style.transform   = 'translateX(0)';

        if (Math.abs(dx) < SWIPE_THRESHOLD) return; // too short

        if (dx < 0) onNext();
        else onPrev();
      }, { passive: true });
    }

    /* ── index.html: hero banner ─────────────────────────────── */
    var heroSec = document.querySelector('section[class*="hero"]') ||
                  document.querySelector('[id*="hero"]');
    if (heroSec && typeof goToSlide === 'function') {
      var _hIdx = 0;
      var _hSlides = [];

      function refreshHeroSlides() {
        _hSlides = Array.from(
          document.querySelectorAll('[class*="hero-slide"],[id*="hero-slide"],[data-slide]')
        );
        _hIdx = _hSlides.findIndex(function (s) {
          return s.classList.contains('active') || s.style.opacity === '1';
        });
        if (_hIdx < 0) _hIdx = 0;
      }

      addSwipe(heroSec,
        function ()  { // onNext
          refreshHeroSlides();
          var next = (_hIdx + 1) % (_hSlides.length || 1);
          goToSlide(next);
        },
        function ()  { // onPrev
          refreshHeroSlides();
          var len  = _hSlides.length || 1;
          var prev = (_hIdx - 1 + len) % len;
          goToSlide(prev);
        },
        function (dir) { // canResist — bounce at first/last
          refreshHeroSlides();
          if (dir === 'next') return _hIdx >= _hSlides.length - 1;
          return _hIdx <= 0;
        }
      );
    }

    /* ── blazer-nam.html: .card-gallery images ───────────────── */
    document.querySelectorAll('.card-gallery').forEach(function (gal) {
      // Count images in this gallery
      function galLen() {
        return gal.querySelectorAll('img').length;
      }
      function galCur() {
        var imgs = gal.querySelectorAll('img');
        return Array.from(imgs).findIndex(function (img) {
          return img.style.display !== 'none' && img.style.opacity !== '0';
        });
      }
      addSwipe(gal,
        function () {
          if (typeof gGo === 'function')
            gGo(gal, 1, { preventDefault: function(){}, stopPropagation: function(){} });
        },
        function () {
          if (typeof gGo === 'function')
            gGo(gal, -1, { preventDefault: function(){}, stopPropagation: function(){} });
        },
        function (dir) { // resistance at edges
          var cur = galCur();
          var len = galLen();
          if (dir === 'next') return cur >= len - 1;
          return cur <= 0;
        }
      );
    });

    /* ── product-detail-vn.html: main image viewer ───────────── */
    var detailWrap = document.getElementById('main-img-wrap')   ||
                     document.getElementById('main-img-viewer') ||
                     document.querySelector('.pd-gallery');
    if (detailWrap) {
      addSwipe(detailWrap,
        function () { var b = document.getElementById('img-next'); if (b) b.click(); },
        function () { var b = document.getElementById('img-prev'); if (b) b.click(); },
        function (dir) {
          var thumbs = document.querySelectorAll('[data-idx],[data-thumb]');
          var cur    = Array.from(thumbs).findIndex(function (t) {
            return t.classList.contains('active') || t.getAttribute('aria-selected') === 'true';
          });
          if (dir === 'next') return cur >= thumbs.length - 1;
          return cur <= 0;
        }
      );
    }

    // Re-attach if screen rotates to mobile after being desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth <= 768) initMobileSwipe();
    }, { once: true });
  }

  /* Product gallery on mobile is now pure CSS (.lehuong-mobile-gallery in global.css).
     No JS DOM manipulation needed. HTML is pre-built in product-detail.html. */


  /* ═══════════════════════════════════════════════════════════
     11. VIP GOLD PARTICLES ENGINE (Subtle Ambient Sparkle)
  ═══════════════════════════════════════════════════════════ */
  function initGoldParticles() {
    if (matchMedia('(max-width:768px), (prefers-reduced-motion:reduce)').matches) return;
    var targets = document.querySelectorAll('.vip-gold-particles, section:first-of-type, #stats-section');
    if (!targets.length) return;

    targets.forEach(function(target) {
      if (target.querySelector('.vip-particle-canvas')) return;

      if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }

      var canvas = document.createElement('canvas');
      canvas.className = 'vip-particle-canvas';
      canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.65;';
      target.insertBefore(canvas, target.firstChild);

      var ctx = canvas.getContext('2d');
      var width = canvas.width = target.offsetWidth;
      var height = canvas.height = target.offsetHeight;

      var particles = [];
      var particleCount = Math.min(Math.floor(width / 35), 30);

      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.7 + 0.2,
          speedY: -(Math.random() * 0.35 + 0.15),
          speedX: (Math.random() - 0.5) * 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01
        });
      }

      function resize() {
        if (!target) return;
        width = canvas.width = target.offsetWidth;
        height = canvas.height = target.offsetHeight;
      }
      window.addEventListener('resize', resize, { passive: true });

      var frame = 0, visible = false, lastFrame = 0;
      var motion = matchMedia('(prefers-reduced-motion:reduce)');
      function active() { return visible && !document.hidden && innerWidth > 768 && !motion.matches; }
      function update() {
        if (active()) { if (!frame) frame = requestAnimationFrame(render); }
        else if (frame) { cancelAnimationFrame(frame); frame = 0; }
      }
      var visibility = new IntersectionObserver(function(entries) { visible = entries[0].isIntersecting; update(); });
      visibility.observe(target);
      document.addEventListener('visibilitychange', update);
      window.addEventListener('resize', update, { passive: true });
      if (motion.addEventListener) motion.addEventListener('change', update);
      function render(time) {
        frame = 0;
        if (!active()) return;
        if (time - lastFrame < 33) { frame = requestAnimationFrame(render); return; }
        lastFrame = time;
        ctx.clearRect(0, 0, width, height);
        particles.forEach(function(p) {
          p.y += p.speedY * 2;
          p.x += p.speedX * 2;
          p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(230, 195, 100, ' + Math.max(0.1, Math.min(0.8, p.alpha)) + ')';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#d4af37';
          ctx.fill();
        });
        frame = requestAnimationFrame(render);
      }
      update();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     12. VIP 3D CARD PARALLAX TILT (Desktop Hover & Mobile Touch)
  ═══════════════════════════════════════════════════════════ */
  function init3DCardParallax() {
    var cards = document.querySelectorAll('.vip-card-3d, .lh-product-card, .video-playlist-box');
    if (!cards.length) return;

    cards.forEach(function(card) {
      if (card._tiltInit) return;
      card._tiltInit = true;

      card.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 768) return;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -5;
        var rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT — ordered, single execution
  ═══════════════════════════════════════════════════════════ */
  function init() {
    injectCSS();
    if (curtain && document.body) document.body.prepend(curtain);
    initNavbar();
    fixLogo();
    initHero();
    initScrollReveal();
    initCards();
    initButtons();
    initCursorGlow();
    initSmoothScroll();
    initMobileSwipe();  /* ← direction-lock swipe on mobile */
    initGoldParticles(); /* VIP Gold Particle Engine */
    init3DCardParallax(); /* VIP 3D Card Parallax Tilt */
    wirePageTransitions();
  }

  injectCSS();
  pageEnter();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ═══════════════════════════════════════════════════════════
     BFCACHE FIX — pageshow fires when page is restored from
     browser back/forward cache (bfcache). The curtain is left
     opaque from the page-leave animation; we must reset it.
  ═══════════════════════════════════════════════════════════ */
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    /* Always ensure the curtain is dismissed when returning via Back/Forward cache */
    if (window.MLH_LOADER) {
      window.MLH_LOADER.dismissImmediate();
    }
    var heroEls = document.querySelectorAll('.lux-h-img,.lux-h-tag,.lux-h-title,.lux-h-sub,.lux-h-cta');
    heroEls.forEach(function (el) {
      /* Briefly reset to ensure transition re-fires */
      el.classList.remove('lux-hl');
      el.offsetHeight; /* force reflow */
    });
    setTimeout(function () {
      heroEls.forEach(function (el) { el.classList.add('lux-hl'); });
    }, 80);

    /* Scroll-reveal: re-check visible elements */
    if (typeof revealObserver !== 'undefined' && revealObserver) {
      document.querySelectorAll('.lux-r').forEach(function (el) {
        revealObserver.unobserve(el);
        revealObserver.observe(el);
      });
    }
  });

})();

