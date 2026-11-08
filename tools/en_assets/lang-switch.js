/* mayLEHUONG language switcher & first-visit language selector modal (VI · EN · 中文 · 한국어 · 日本語 · हिन्दी). Shared by every language version. */
(function () {
  'use strict';
  if (window.__MLH_LANG_SWITCH__) return;
  window.__MLH_LANG_SWITCH__ = true;

  var ALL = [
    { k: 'vi', label: 'VI', name: 'Tiếng Việt', full: 'Tiếng Việt', hreflang: 'vi', pfx: '', recTag: 'Gợi ý' },
    { k: 'en', label: 'EN', name: 'English', full: 'English', hreflang: 'en', pfx: '/en', recTag: 'Suggested' },
    { k: 'zh', label: '中文', name: '中文', full: '中文 (简体)', hreflang: 'zh-Hans', pfx: '/zh', recTag: '推荐' },
    { k: 'ko', label: 'KO', name: '한국어', full: '한국어', hreflang: 'ko', pfx: '/ko', recTag: '추천' },
    { k: 'ja', label: 'JA', name: '日本語', full: '日本語', hreflang: 'ja', pfx: '/ja', recTag: 'おすすめ' },
    { k: 'hi', label: 'HI', name: 'हिन्दी', full: 'हिन्दी', hreflang: 'hi', pfx: '/hi', recTag: 'सुझाव' }
  ];
  var only = window.MLH_LANGS; // optional list of published languages, e.g. ['vi','en']
  var LANGS = ALL.filter(function (l) { return !only || only.indexOf(l.k) !== -1; });

  var path = location.pathname || '/';
  var cur = LANGS[0];
  LANGS.forEach(function (l) { if (l.pfx && (path === l.pfx || path.indexOf(l.pfx + '/') === 0)) cur = l; });

  function viPath() {
    var p = location.pathname || '/';
    if (cur.pfx) p = p.slice(cur.pfx.length) || '/';
    if (p === '/index.html' || p === '/index-mobile.html') p = '/';
    return p;
  }
  function urlFor(l) {
    var p = viPath(), rest = location.search + location.hash;
    return (l.pfx ? l.pfx + p : p) + rest;
  }
  function remember(k) {
    try { document.cookie = 'mlh_lang=' + k + ';path=/;max-age=31536000;SameSite=Lax'; } catch (e) {}
  }
  function hasCookie() { return /(?:^|;\s*)mlh_lang=/.test(document.cookie || ''); }
  function isBot() { return /bot|crawl|spider|lighthouse/i.test(navigator.userAgent || ''); }

  function detectPreferredLang() {
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ''];
    var first = String(list[0] || '').trim().toLowerCase();
    var m = first.match(/^(vi|zh|ko|ja|hi)\b/);
    var code = m ? m[1] : 'en';
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i].k === code) return LANGS[i];
    }
    return cur || LANGS[0];
  }

  var FONT_STACK = "'Be Vietnam Pro',system-ui,-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei','Malgun Gothic'," +
    "'Apple SD Gothic Neo','Hiragino Sans','Yu Gothic','Meiryo','Nirmala UI','Noto Sans Devanagari',sans-serif";
  // With more than three languages the desktop pill becomes a dropdown like the mobile one, so the header keeps its width.
  var COMPACT = LANGS.length > 3;

  var css = document.getElementById('mlh-lang-switch-css');
  if (!css) {
    css = document.createElement('style');
    css.id = 'mlh-lang-switch-css';
    (document.head || document.documentElement).appendChild(css);
  }
  css.textContent = [
    '.mlh-lang-pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;margin:0 6px;',
    'border:1px solid #a17f22;border-radius:999px;background:#fffdf8;color:#15110e;',
    'font:700 11px/1 ' + FONT_STACK + ';letter-spacing:.06em;',
    'white-space:nowrap;flex-shrink:0;position:relative}',
    '.mlh-lang-pill a{color:#15110e;text-decoration:none;padding:4px 1px}',
    '.mlh-lang-pill a:hover{color:#9d0208}',
    '.mlh-lang-pill a.on{color:#9d0208}',
    '.mlh-lang-pill i{display:block;width:1px;height:12px;background:#a17f22}',
    '.mlh-lang-pill button{display:none}',
    '.lhv-mob-actions .mlh-lang-pill{height:24px;min-width:32px;padding:0;margin:0 2px 0 0;justify-content:center;font-size:10.5px}',
    '.lhv-mob-actions .mlh-lang-pill>a,.lhv-mob-actions .mlh-lang-pill>i{display:none}',
    '.lhv-mob-actions .mlh-lang-pill button{display:block;border:0;background:none;color:#9d0208;font:inherit;padding:0 7px;height:100%;cursor:pointer}',
    '.mlh-lang-pill.mlh-compact{padding:0;gap:0}',
    '.mlh-lang-pill.mlh-compact>a,.mlh-lang-pill.mlh-compact>i{display:none}',
    '.mlh-lang-pill.mlh-compact button{display:inline-flex;align-items:center;gap:5px;border:0;background:none;color:#9d0208;font:inherit;padding:0 11px;height:100%;cursor:pointer}',
    '.lhv-mob-actions .mlh-lang-pill.mlh-compact button{padding:0 7px;gap:3px;color:#9d0208}',
    '.mlh-lang-pill.mlh-compact button:hover,.mlh-lang-pill.mlh-compact button[aria-expanded="true"]{color:#15110e}',
    '.mlh-lang-menu{display:none;position:fixed;z-index:100001;min-width:140px;padding:6px;',
    'background:#fffdf8;border:1px solid #a17f22;border-radius:10px;box-shadow:0 8px 24px rgba(21,17,14,.18);font:600 14px/1.2 ' + FONT_STACK + '}',
    '.mlh-lang-menu.open{display:block}',
    '.mlh-lang-menu a{display:block;padding:11px 12px;min-height:44px;box-sizing:border-box;border-radius:6px;letter-spacing:0;color:#15110e;text-decoration:none}',
    '.mlh-lang-menu a.on{color:#9d0208;background:#f6efe2}',
    '.mlh-lang-pill.mlh-lang-float{position:fixed;left:14px;bottom:14px;z-index:9990;box-shadow:0 4px 14px rgba(21,17,14,.12)}',
    'html.mlh-lang-lock,body.mlh-lang-lock{overflow:hidden!important;overscroll-behavior:contain!important}',
    '#mlh-lang-popup.mlh-lp-backdrop{position:fixed!important;inset:0!important;z-index:2147483000!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important;',
    'background:rgba(21,17,14,.46)!important;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);',
    'box-sizing:border-box!important;font-family:' + FONT_STACK + '!important}',
    '#mlh-lang-popup .mlh-lp-card{position:relative!important;width:calc(100vw - 32px)!important;max-width:452px!important;',
    'margin:0!important;padding:22px 20px 20px!important;background:#fffdf8!important;color:#15110e!important;',
    'border:1.5px solid #a17f22!important;border-radius:16px!important;box-sizing:border-box!important;',
    'box-shadow:0 20px 50px rgba(21,17,14,.28),0 0 0 1px rgba(161,127,34,.16)!important;',
    'font-family:' + FONT_STACK + '!important;text-align:center!important}',
    '#mlh-lang-popup button.mlh-lp-close{position:absolute!important;top:12px!important;right:12px!important;',
    'display:inline-flex!important;align-items:center!important;justify-content:center!important;',
    'width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;',
    'padding:0!important;margin:0!important;border:1px solid #cdb682!important;border-radius:999px!important;',
    'background:#f7f0e2!important;color:#15110e!important;font-size:20px!important;font-weight:600!important;',
    'line-height:1!important;cursor:pointer!important;transition:background-color .15s ease,color .15s ease,border-color .15s ease!important}',
    '#mlh-lang-popup button.mlh-lp-close:hover,#mlh-lang-popup button.mlh-lp-close:focus-visible{',
    'background:#9d0208!important;color:#ffffff!important;border-color:#9d0208!important;outline:2px solid #9d0208!important;outline-offset:2px!important}',
    '#mlh-lang-popup .mlh-lp-brand{display:flex!important;justify-content:center!important;margin:0 auto 12px!important;padding:0!important;line-height:0!important}',
    '#mlh-lang-popup .mlh-lp-brand img{display:block!important;height:56px!important;width:auto!important;max-width:60%!important;object-fit:contain!important;mix-blend-mode:multiply!important}',
    '#mlh-lang-popup .mlh-lp-title{margin:0 0 16px!important;padding:0 4px!important;color:#15110e!important;',
    'font-family:' + FONT_STACK + '!important;font-size:14.5px!important;font-weight:800!important;',
    'line-height:1.45!important;letter-spacing:0!important;text-transform:none!important}',
    '#mlh-lang-popup .mlh-lp-tpart{white-space:nowrap!important;color:#15110e!important}',
    '#mlh-lang-popup .mlh-lp-tsep{color:#6e5417!important;font-weight:700!important}',
    '#mlh-lang-popup .mlh-lp-card{max-height:calc(100vh - 32px)!important;max-height:calc(100dvh - 32px)!important;overflow-y:auto!important;overscroll-behavior:contain!important}',
    '#mlh-lang-popup .mlh-lp-list{display:flex!important;flex-direction:column!important;gap:9px!important;margin:0!important;padding:0!important}',
    '#mlh-lang-popup a.mlh-lp-opt{display:flex!important;align-items:center!important;justify-content:space-between!important;',
    'gap:10px!important;width:100%!important;min-height:52px!important;padding:10px 14px!important;box-sizing:border-box!important;',
    'border:1.5px solid #c6ae74!important;border-radius:12px!important;background:#ffffff!important;color:#15110e!important;',
    'text-decoration:none!important;cursor:pointer!important;transition:background-color .15s ease,border-color .15s ease,transform .12s ease!important}',
    '#mlh-lang-popup a.mlh-lp-opt.rec{background:#fdf6e9!important;border:2px solid #9d0208!important;box-shadow:0 4px 14px rgba(157,2,8,.1)!important}',
    '#mlh-lang-popup a.mlh-lp-opt:hover,#mlh-lang-popup a.mlh-lp-opt:focus-visible{',
    'background:#f9eedb!important;border-color:#9d0208!important;color:#15110e!important;outline:2px solid #9d0208!important;outline-offset:2px!important}',
    '#mlh-lang-popup .mlh-lp-left{display:inline-flex!important;align-items:center!important;gap:11px!important;min-width:0!important;text-align:left!important}',
    '#mlh-lang-popup .mlh-lp-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;',
    'min-width:36px!important;height:26px!important;padding:0 7px!important;border-radius:6px!important;',
    'background:#f3ebdc!important;border:1px solid #d4be8d!important;color:#15110e!important;',
    'font-size:11.5px!important;font-weight:800!important;letter-spacing:.04em!important;line-height:1!important;flex-shrink:0!important}',
    '#mlh-lang-popup a.mlh-lp-opt.rec .mlh-lp-code{background:#9d0208!important;border-color:#9d0208!important;color:#ffffff!important}',
    '#mlh-lang-popup .mlh-lp-text{color:#15110e!important;font-size:15.5px!important;font-weight:700!important;line-height:1.3!important;letter-spacing:0!important;text-transform:none!important}',
    '#mlh-lang-popup .mlh-lp-right{display:inline-flex!important;align-items:center!important;gap:8px!important;flex-shrink:0!important}',
    '#mlh-lang-popup .mlh-lp-chip{display:inline-flex!important;align-items:center!important;padding:4px 9px!important;',
    'border-radius:999px!important;background:#9d0208!important;color:#ffffff!important;',
    'font-size:11px!important;font-weight:700!important;line-height:1.1!important;letter-spacing:.02em!important;text-transform:none!important}',
    '#mlh-lang-popup .mlh-lp-arrow{color:#4a3f35!important;font-size:16px!important;font-weight:700!important;line-height:1!important}',
    '#mlh-lang-popup a.mlh-lp-opt.rec .mlh-lp-arrow,#mlh-lang-popup a.mlh-lp-opt:hover .mlh-lp-arrow{color:#9d0208!important}',
    '@media (max-width:360px){',
    '#mlh-lang-popup .mlh-lp-card{padding:18px 14px 16px!important}',
    '#mlh-lang-popup .mlh-lp-title{font-size:13.5px!important;padding:0 2px!important}',
    '#mlh-lang-popup a.mlh-lp-opt{padding:9px 11px!important;min-height:48px!important}',
    '#mlh-lang-popup .mlh-lp-text{font-size:14.5px!important}',
    '}'
  ].join('');

  // Desktop menu size per language. nav-component.js writes inline !important sizes (and rewrites them on resize),
  // so scale those values instead of overriding them in CSS: CJK glyphs look small, English capitals look large.
  var SCALE = {
    zh: { nav: 1.16, cta: 1.12, drop: 1.07, track: '0.08em' },
    ja: { nav: 1.14, cta: 1.1, drop: 1.07, track: '0.06em' },
    ko: { nav: 1.1, cta: 1.06, drop: 1.05, track: '0.03em' },
    hi: { nav: 1.08, cta: 1.04, drop: 1.05, track: '0.02em' },
    en: { nav: 0.92, cta: 0.95, drop: 1, track: '' }
  }[cur.k];
  function scaleEl(el, f, track) {
    var cur0 = el.style.getPropertyValue('font-size');
    if (!cur0 || el.getAttribute('data-mlh-fs') === cur0) return;
    var px = Math.round(parseFloat(cur0) * f * 2) / 2 + 'px';
    el.style.setProperty('font-size', px, 'important');
    if (track) el.style.setProperty('letter-spacing', track, 'important');
    el.setAttribute('data-mlh-fs', px);
  }
  function tune() {
    if (!SCALE || window.innerWidth < 1024) return;
    var h = document.getElementById('lhv-header');
    if (!h) return;
    var q = function (sel, f, t) { var l = h.querySelectorAll(sel); for (var i = 0; i < l.length; i++) scaleEl(l[i], f, t); };
    q('.lhv-nav-link', SCALE.nav, SCALE.track);
    q('.lhv-cta-booking', SCALE.cta, SCALE.track);
    if (SCALE.drop !== 1) q('.lhv-dropdown-link', SCALE.drop, '');
  }

  var savedScrollX = 0;
  var savedScrollY = 0;
  var keyHandler = null;

  function lockScroll() {
    savedScrollX = window.scrollX || window.pageXOffset || 0;
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('mlh-lang-lock');
    if (document.body) document.body.classList.add('mlh-lang-lock');
  }

  function unlockScroll() {
    document.documentElement.classList.remove('mlh-lang-lock');
    if (document.body) document.body.classList.remove('mlh-lang-lock');
    window.scrollTo(savedScrollX, savedScrollY);
  }

  function closePopup() {
    var pop = document.getElementById('mlh-lang-popup');
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler, true);
      keyHandler = null;
    }
    if (pop) {
      pop.remove();
      unlockScroll();
    }
  }

  function dismissPopup() {
    remember(cur.k);
    closePopup();
  }

  function link(l, cls) {
    var a = document.createElement('a');
    a.href = urlFor(l);
    a.textContent = cls === 'menu' ? l.name : l.label;
    a.setAttribute('hreflang', l.hreflang);
    a.setAttribute('lang', l.k);
    a.title = l.name;
    if (l === cur) { a.className = 'on'; a.setAttribute('aria-current', 'true'); }
    a.addEventListener('click', function (e) {
      remember(l.k);
      closePopup();
      if (l.k === cur.k) {
        e.preventDefault();
        closeMenus();
      }
    });
    return a;
  }

  function pill(cls) {
    var box = document.createElement('span');
    box.className = 'mlh-lang-pill' + (COMPACT ? ' mlh-compact' : '') + (cls ? ' ' + cls : '');
    box.setAttribute('data-no-tr', '');
    LANGS.forEach(function (l, i) {
      if (i) { var sep = document.createElement('i'); sep.setAttribute('aria-hidden', 'true'); box.appendChild(sep); }
      box.appendChild(link(l));
    });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = COMPACT ? cur.label + ' \u25BE' : cur.label;
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Language / Ngôn ngữ / 语言');
    var menu = document.createElement('span');
    menu.className = 'mlh-lang-menu';
    LANGS.forEach(function (l) { menu.appendChild(link(l, 'menu')); });
    menu.setAttribute('data-no-tr', '');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !menu.classList.contains('open');
      closeMenus();
      if (!open) return;
      // The mobile header clips overflow, so the menu floats on <body> under the button.
      var r = btn.getBoundingClientRect();
      menu.style.top = Math.round(r.bottom + 6) + 'px';
      menu.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + 'px';
      document.body.appendChild(menu);
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    });
    box.appendChild(btn);
    return box;
  }
  function closeMenus() {
    var o = document.querySelectorAll('.mlh-lang-menu.open');
    for (var i = 0; i < o.length; i++) o[i].classList.remove('open');
    var b = document.querySelectorAll('.mlh-lang-pill button[aria-expanded="true"]');
    for (var j = 0; j < b.length; j++) b[j].setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', closeMenus);
  window.addEventListener('scroll', closeMenus, { passive: true });
  window.addEventListener('resize', closeMenus);

  function place() {
    var ok = false;
    var desk = document.querySelector('#lhv-header .lhv-actions-wrap');
    if (desk) {
      if (!desk.querySelector('.mlh-lang-pill')) desk.insertBefore(pill(), desk.querySelector('.lhv-divider'));
      ok = true;
    }
    var mob = document.querySelector('#lhv-header .lhv-mob-actions');
    if (mob) {
      if (!mob.querySelector('.mlh-lang-pill')) mob.insertBefore(pill(), mob.firstChild);
      ok = true;
    }
    return ok;
  }

  function showLanguagePopup() {
    if (hasCookie() || isBot() || LANGS.length < 2) return;
    if (document.getElementById('mlh-lang-popup')) return;

    var pref = detectPreferredLang();

    var backdrop = document.createElement('div');
    backdrop.id = 'mlh-lang-popup';
    backdrop.className = 'mlh-lp-backdrop';
    backdrop.setAttribute('data-no-tr', '');

    var card = document.createElement('div');
    card.className = 'mlh-lp-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'mlh-lang-modal-title');
    card.setAttribute('data-no-tr', '');

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mlh-lp-close';
    closeBtn.setAttribute('aria-label', 'Đóng / Close / 关闭');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dismissPopup();
    });

    var brand = document.createElement('div');
    brand.className = 'mlh-lp-brand';
    brand.setAttribute('aria-hidden', 'true');
    // The shop's own logo, same file as the site header.
    var logo = document.createElement('img');
    logo.src = '/assets/brand-20261108/logo-nav.webp';
    logo.alt = 'mayLEHUONG';
    logo.decoding = 'async';
    brand.appendChild(logo);

    var title = document.createElement('h2');
    title.id = 'mlh-lang-modal-title';
    title.className = 'mlh-lp-title';
    ['Chọn ngôn ngữ', 'Choose your language', '选择语言', '언어 선택', '言語を選択', 'भाषा चुनें'].forEach(function (part, idx) {
      if (idx) {
        var sep = document.createElement('span');
        sep.className = 'mlh-lp-tsep';
        sep.textContent = ' · ';
        title.appendChild(sep);
      }
      var sp = document.createElement('span');
      sp.className = 'mlh-lp-tpart';
      sp.textContent = part;
      title.appendChild(sp);
    });

    var list = document.createElement('div');
    list.className = 'mlh-lp-list';

    var recOptEl = null;

    LANGS.forEach(function (l) {
      var isRec = l.k === pref.k;
      var a = document.createElement('a');
      a.className = 'mlh-lp-opt' + (isRec ? ' rec' : '');
      a.href = urlFor(l);
      a.setAttribute('lang', l.k);
      a.setAttribute('hreflang', l.hreflang);
      if (l.k === cur.k) a.setAttribute('aria-current', 'true');

      var left = document.createElement('span');
      left.className = 'mlh-lp-left';
      var code = document.createElement('span');
      code.className = 'mlh-lp-code';
      code.setAttribute('aria-hidden', 'true');
      code.textContent = l.label;
      var text = document.createElement('span');
      text.className = 'mlh-lp-text';
      text.textContent = l.full;
      left.appendChild(code);
      left.appendChild(text);

      var right = document.createElement('span');
      right.className = 'mlh-lp-right';
      if (isRec) {
        var chip = document.createElement('span');
        chip.className = 'mlh-lp-chip';
        chip.textContent = l.recTag;
        right.appendChild(chip);
      }
      var arrow = document.createElement('span');
      arrow.className = 'mlh-lp-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      right.appendChild(arrow);

      a.appendChild(left);
      a.appendChild(right);

      a.addEventListener('click', function (e) {
        remember(l.k);
        if (l.k === cur.k) {
          e.preventDefault();
          closePopup();
        } else {
          unlockScroll();
        }
      });

      if (isRec) recOptEl = a;
      list.appendChild(a);
    });

    card.appendChild(closeBtn);
    card.appendChild(brand);
    card.appendChild(title);
    card.appendChild(list);
    backdrop.appendChild(card);

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) {
        dismissPopup();
      }
    });

    backdrop.addEventListener('touchmove', function (e) {
      if (!card.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });

    keyHandler = function (e) {
      if (!document.getElementById('mlh-lang-popup')) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        dismissPopup();
        return;
      }
      if (e.key === 'Tab') {
        var focusables = card.querySelectorAll('a.mlh-lp-opt, button.mlh-lp-close');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        var active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !card.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !card.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', keyHandler, true);

    lockScroll();
    document.body.appendChild(backdrop);

    var targetFocus = recOptEl || card.querySelector('a.mlh-lp-opt') || closeBtn;
    if (targetFocus && typeof targetFocus.focus === 'function') {
      try { targetFocus.focus({ preventScroll: true }); } catch (e) { try { targetFocus.focus(); } catch (_) {} }
    }
  }

  function start() {
    var found = place(), queued = false;
    // The header can be rebuilt by nav-component.js; keep the switcher in place.
    var mo = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; if (place()) found = true; tune(); });
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    tune();
    setTimeout(function () {
      if (!found && !document.querySelector('.mlh-lang-pill')) document.body.appendChild(pill('mlh-lang-float'));
    }, 6000);
    showLanguagePopup();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
