/* mayLEHUONG language switcher (VI | EN | 中文). Shared by every language version. */
(function () {
  'use strict';
  if (window.__MLH_LANG_SWITCH__) return;
  window.__MLH_LANG_SWITCH__ = true;

  var ALL = [
    { k: 'vi', label: 'VI', name: 'Tiếng Việt', pfx: '', hint: '', go: '' },
    { k: 'en', label: 'EN', name: 'English', pfx: '/en', hint: 'View this page in English?', go: 'English' },
    { k: 'zh', label: '中文', name: '中文', pfx: '/zh', hint: '用中文浏览此页面？', go: '中文' }
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

  var css = document.createElement('style');
  css.id = 'mlh-lang-switch-css';
  css.textContent = [
    '.mlh-lang-pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;margin:0 6px;',
    'border:1px solid #a17f22;border-radius:999px;background:#fffdf8;color:#15110e;',
    "font:700 11px/1 'Be Vietnam Pro',system-ui,-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;letter-spacing:.06em;",
    'white-space:nowrap;flex-shrink:0;position:relative}',
    '.mlh-lang-pill a{color:#15110e;text-decoration:none;padding:4px 1px}',
    '.mlh-lang-pill a:hover{color:#9d0208}',
    '.mlh-lang-pill a.on{color:#9d0208}',
    '.mlh-lang-pill i{display:block;width:1px;height:12px;background:#a17f22}',
    '.mlh-lang-pill button{display:none}',
    '.lhv-mob-actions .mlh-lang-pill{height:24px;min-width:32px;padding:0;margin:0 2px 0 0;justify-content:center;font-size:10.5px}',
    '.lhv-mob-actions .mlh-lang-pill>a,.lhv-mob-actions .mlh-lang-pill>i{display:none}',
    '.lhv-mob-actions .mlh-lang-pill button{display:block;border:0;background:none;color:#9d0208;font:inherit;padding:0 7px;height:100%;cursor:pointer}',
    '.mlh-lang-menu{display:none;position:fixed;z-index:100001;min-width:140px;padding:6px;',
    "background:#fffdf8;border:1px solid #a17f22;border-radius:10px;box-shadow:0 8px 24px rgba(21,17,14,.18);font:600 14px/1.2 'Be Vietnam Pro',system-ui,'PingFang SC','Microsoft YaHei',sans-serif}",
    '.mlh-lang-menu.open{display:block}',
    '.mlh-lang-menu a{display:block;padding:11px 12px;min-height:44px;box-sizing:border-box;border-radius:6px;letter-spacing:0;color:#15110e;text-decoration:none}',
    '.mlh-lang-menu a.on{color:#9d0208;background:#f6efe2}',
    '.mlh-lang-pill.mlh-lang-float{position:fixed;left:14px;bottom:14px;z-index:9990;box-shadow:0 4px 14px rgba(21,17,14,.12)}',
    '.mlh-lang-hint{position:fixed;left:14px;bottom:14px;z-index:9991;display:flex;align-items:center;gap:10px;',
    'max-width:calc(100vw - 28px);padding:10px 12px 10px 14px;background:#fffdf8;color:#15110e;border:1px solid #a17f22;',
    "border-radius:12px;box-shadow:0 8px 24px rgba(21,17,14,.16);font:500 13px/1.35 'Be Vietnam Pro',system-ui,'PingFang SC','Microsoft YaHei',sans-serif}",
    '.mlh-lang-hint a{flex-shrink:0;color:#fff;background:#9d0208;border-radius:999px;padding:6px 12px;font-weight:700;text-decoration:none;white-space:nowrap}',
    '.mlh-lang-hint button{flex-shrink:0;border:0;background:none;color:#15110e;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}'
  ].join('');
  (document.head || document.documentElement).appendChild(css);

  function link(l, cls) {
    var a = document.createElement('a');
    a.href = urlFor(l);
    a.textContent = cls === 'menu' ? l.name : l.label;
    a.setAttribute('hreflang', l.k === 'zh' ? 'zh-Hans' : l.k);
    a.setAttribute('lang', l.k);
    a.title = l.name;
    if (l === cur) { a.className = 'on'; a.setAttribute('aria-current', 'true'); }
    a.addEventListener('click', function () { remember(l.k); });
    return a;
  }

  function pill(cls) {
    var box = document.createElement('span');
    box.className = 'mlh-lang-pill' + (cls ? ' ' + cls : '');
    box.setAttribute('data-no-tr', '');
    LANGS.forEach(function (l, i) {
      if (i) { var sep = document.createElement('i'); sep.setAttribute('aria-hidden', 'true'); box.appendChild(sep); }
      box.appendChild(link(l));
    });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = cur.label;
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

  function hint() {
    if (cur.k !== 'vi' || hasCookie()) return;
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']);
    var first = langs[0] || '';
    if (!first || /^vi\b/i.test(first) || /bot|crawl|spider|lighthouse/i.test(navigator.userAgent)) return;
    var want = null;
    LANGS.forEach(function (l) { if (l.k === 'zh' && /^zh\b/i.test(first)) want = l; });
    if (!want) LANGS.forEach(function (l) { if (l.k === 'en') want = l; });
    if (!want) return;
    var box = document.createElement('div');
    box.className = 'mlh-lang-hint';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Language');
    box.setAttribute('data-no-tr', '');
    var t = document.createElement('span');
    t.textContent = want.hint;
    var go = document.createElement('a');
    go.href = urlFor(want);
    go.textContent = want.go;
    go.addEventListener('click', function () { remember(want.k); });
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '×';
    x.addEventListener('click', function () { remember('vi'); box.remove(); });
    box.appendChild(t);
    box.appendChild(go);
    box.appendChild(x);
    document.body.appendChild(box);
  }

  function start() {
    var found = place(), queued = false;
    // The header can be rebuilt by nav-component.js; keep the switcher in place.
    var mo = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; if (place()) found = true; });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () {
      if (!found && !document.querySelector('.mlh-lang-pill')) document.body.appendChild(pill('mlh-lang-float'));
    }, 6000);
    setTimeout(hint, 1500);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
