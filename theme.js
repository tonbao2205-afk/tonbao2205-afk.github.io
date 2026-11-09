/* mayLEHUONG - nut chuyen sang/toi. Ban sang khong chay bo mau nao. */
(function () {
  'use strict';
  var KEY = 'mlh_theme', CSS_URL = '/dark-theme.css?v=20261109-dark1', root = document.documentElement;
  var isNative = root.hasAttribute('data-theme-native');
  var C = { base: '#181411', card: '#221d19', soft: '#2c2621', line: 'rgba(255,255,255,.16)', ink: '#f4efe8', muted: '#cfc6ba', red: '#ff9d94', gold: '#e6c364', green: '#7ee2a5', dark: '#141210' };
  var touched = new Set(), rec = new WeakMap(), mo = null, pending = new Set(), shallowOnly = new Set(), timer = 0;
  var SKIP = /^(SCRIPT|STYLE|LINK|META|NOSCRIPT|IMG|PICTURE|SOURCE|VIDEO|IFRAME|CANVAS|BR|HR|HEAD|TITLE|OPTION|PATH|G|CIRCLE|RECT|LINE|POLYGON|POLYLINE|USE|DEFS)$/i;

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function parse(s) {
    var m = s && s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function sat(c) { var a = Math.max(c.r, c.g, c.b), b = Math.min(c.r, c.g, c.b); return a ? (a - b) / a : 0; }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function hex(h) { return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 }; }
  function lightNeutral(c) { return c && c.a > 0.5 && lum(c) > 0.35 && sat(c) < 0.3; }

  function surfaceFor(c) {
    if (c.r >= 250 && c.g >= 250 && c.b >= 250) return C.card;
    if (lum(c) < 0.72) return C.soft;
    return C.base;
  }
  function textFor(c) {
    var L = lum(c), s = sat(c);
    if (s < 0.25) return L < 0.06 ? C.ink : L < 0.42 ? C.muted : null;
    var max = Math.max(c.r, c.g, c.b);
    if (max === c.r && c.g < c.r * 0.45 && L < 0.25) return C.red;
    if (max === c.r && c.b < c.g && L < 0.4) return C.gold;
    if (max === c.g && L < 0.3) return C.green;
    if (L < 0.2) return C.ink;
    return null;
  }
  function setProp(el, prop, value) {
    var r = rec.get(el);
    if (!r) { r = {}; rec.set(el, r); touched.add(el); }
    if (!(prop in r)) r[prop] = [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop), ''];
    el.style.setProperty(prop, value, 'important');
    r[prop][2] = el.style.getPropertyValue(prop);
  }
  function restore(el) {
    var r = rec.get(el);
    if (!r) return;
    Object.keys(r).forEach(function (p) {
      /* web da tu doi gia tri nay sau khi ta ghi thi giu gia tri cua web */
      if (el.style.getPropertyValue(p) !== r[p][2]) return;
      if (r[p][0]) el.style.setProperty(p, r[p][0], r[p][1]); else el.style.removeProperty(p);
    });
    rec.delete(el); touched.delete(el);
  }
  function ownText(el) {
    if (/^(INPUT|TEXTAREA|SELECT|svg)$/i.test(el.tagName)) return true;
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    return false;
  }
  /* menu co transition !important, phai chot xong moi doc duoc mau that */
  function finishTransitions() {
    void root.offsetHeight;
    if (!document.getAnimations || typeof CSSTransition === 'undefined') return;
    document.getAnimations().forEach(function (a) { if (a instanceof CSSTransition) { try { a.finish(); } catch (e) {} } });
  }
  function skip(el) { return SKIP.test(el.tagName) || el.closest('[data-theme-keep],.mlh-retry-btn') !== null; }

  /* doc het roi moi ghi, tranh tinh lai bo cuc nhieu lan */
  function apply(roots, shallow) {
    var list = [], planBg = new Map(), writes = [];
    roots.forEach(function (r) {
      if (r.nodeType !== 1) return;
      list.push(r);
      if (shallow && shallow.has(r)) return;
      r.querySelectorAll('*').forEach(function (e) { list.push(e); });
    });
    root.classList.add('mlh-dm-pass'); /* tat transition de doc dung mau cuoi */
    list.forEach(restore);
    finishTransitions();
    function effectiveBg(el) {
      if (el.closest('#lhv-header') && !el.closest('.lhv-cart-drawer,[class*="dropdown"]')) return hex(C.card);
      for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
        if (planBg.has(e)) { var v = planBg.get(e); if (v) return v; continue; }
        var cs = getComputedStyle(e), img = cs.backgroundImage, val = null;
        if (img && img !== 'none' && !/gradient/.test(img)) val = 'img';
        if (!val) { var c = parse(cs.backgroundColor); if (c && c.a > 0.5) val = c; }
        if (!val && img && img !== 'none') { var st = img.match(/rgba?\([^)]+\)/g), c0 = st && parse(st[0]); if (c0 && c0.a > 0.5) val = c0; }
        planBg.set(e, val);
        if (val) return val;
      }
      return hex(C.dark);
    }
    list.forEach(function (el) {
      if (skip(el)) return;
      var cs = getComputedStyle(el), bg = parse(cs.backgroundColor), img = cs.backgroundImage;
      var box = el.getBoundingClientRect();
      var chip = !el.firstElementChild && !ownText(el) && box.width < 64 && box.height < 64;
      var hasGrad = img && /gradient/.test(img), hasUrl = img && /url\(/.test(img);
      if (!chip && !hasUrl) {
        var surf = null;
        if (lightNeutral(bg)) surf = surfaceFor(bg);
        if (hasGrad) {
          var stops = (img.match(/rgba?\([^)]+\)/g) || []).map(parse);
          if (stops.length && stops.every(function (s) { return lightNeutral(s) || s.a < 0.5; }) && stops.some(lightNeutral)) {
            writes.push([el, 'background-image', 'none']);
            surf = surf || surfaceFor(stops.filter(lightNeutral)[0]);
          }
        }
        if (surf) { writes.push([el, 'background-color', surf]); planBg.set(el, hex(surf)); }
      }
      var bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      if (bw > 0) {
        ['Top', 'Right', 'Bottom', 'Left'].some(function (s) {
          var bc = parse(cs['border' + s + 'Color']), w = parseFloat(cs['border' + s + 'Width']);
          if (!bc || bc.a <= 0 || w <= 0) return false;
          if ((lum(bc) < 0.2 && sat(bc) < 0.3) || (bc.a > 0.5 && lum(bc) > 0.6 && sat(bc) < 0.3)) { writes.push([el, 'border-color', C.line]); return true; }
          return false;
        });
      }
    });
    list.forEach(function (el) {
      if (skip(el) || !ownText(el)) return;
      var cs = getComputedStyle(el);
      var fill = cs.webkitTextFillColor, fc = parse(fill && fill !== cs.color ? fill : cs.color);
      if (!fc || fc.a < 0.05) return;
      var bg = effectiveBg(el), next;
      if (bg === 'img') return;
      if (lum(bg) > 0.2) {
        if (sat(bg) > 0.3 && ratio(fc, bg) < 4.5) next = '#15110e';
      } else {
        next = textFor(fc);
        if (ratio(next ? hex(next) : fc, bg) < 4.5) next = C.ink;
      }
      if (next) {
        writes.push([el, 'color', next]);
        writes.push([el, '-webkit-text-fill-color', next]);
      }
    });
    writes.forEach(function (w) { setProp(w[0], w[1], w[2]); });
    finishTransitions();
    root.classList.remove('mlh-dm-pass');
    if (mo) mo.takeRecords(); /* bo qua thay doi do chinh minh ghi, tranh lap vo han */
  }

  function swapLogos(dark) {
    document.querySelectorAll('img.lhv-logo-img').forEach(function (img) {
      if (dark && !img.hasAttribute('data-light-src')) {
        img.setAttribute('data-light-src', img.getAttribute('src') || '');
        img.setAttribute('data-light-srcset', img.getAttribute('srcset') || '');
        img.removeAttribute('srcset');
        img.src = '/assets/dzuong-20261109/mlh-logo-white.webp';
      } else if (!dark && img.hasAttribute('data-light-src')) {
        img.src = img.getAttribute('data-light-src');
        var s = img.getAttribute('data-light-srcset');
        if (s) img.setAttribute('srcset', s);
        img.removeAttribute('data-light-src');
        img.removeAttribute('data-light-srcset');
      }
    });
  }
  function flush() {
    timer = 0;
    if (!isDark() || isNative) { pending.clear(); return; }
    var roots = [], only = new Set();
    pending.forEach(function (n) { if (n.isConnected) roots.push(n); });
    pending.clear();
    shallowOnly.forEach(function (n) { only.add(n); });
    shallowOnly.clear();
    roots = roots.filter(function (n) { return !roots.some(function (o) { return o !== n && !only.has(o) && o.contains(n); }); });
    apply(roots, only);
    swapLogos(true);
  }
  function queue(n, shallow) {
    if (shallow) { if (!pending.has(n)) shallowOnly.add(n); } else shallowOnly.delete(n);
    pending.add(n);
    if (!timer) timer = setTimeout(flush, 50);
  }
  function startEngine() {
    if (isNative) return;
    apply([document.body]);
    swapLogos(true);
    if (mo) return;
    mo = new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        if (r.type === 'childList') r.addedNodes.forEach(function (n) {
          if (n.nodeType === 1 && !SKIP.test(n.tagName)) queue(n);
          else if (n.nodeType === 3 && n.nodeValue.trim() && !SKIP.test(r.target.tagName)) queue(r.target, true); /* chu chen muon vao the co san */
        });
        else if (r.target === document.body || r.target === root || SKIP.test(r.target.tagName)) return;
        else if (r.attributeName === 'class') queue(r.target);
        else if (/color|background/.test(r.target.getAttribute('style') || '')) queue(r.target, true);
      });
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
    if (!startEngine.bound) {
      startEngine.bound = true;
      /* nav-component ep lai mau menu khi load/resize */
      var again = function () { setTimeout(function () { var h = document.getElementById('lhv-header'); if (h && isDark()) queue(h); }, 120); };
      ['load', 'pageshow', 'focus', 'resize'].forEach(function (ev) { window.addEventListener(ev, again); });
      if (document.readyState === 'complete') again();
    }
  }
  function stopEngine() {
    if (mo) { mo.disconnect(); mo = null; }
    pending.clear();
    Array.from(touched).forEach(restore);
    swapLogos(false);
  }
  function loadCss(done) {
    if (isNative || document.getElementById('mlh-dark-css')) return done();
    var l = document.createElement('link');
    l.id = 'mlh-dark-css'; l.rel = 'stylesheet'; l.href = CSS_URL;
    l.onload = done; l.onerror = done;
    document.head.appendChild(l);
  }
  function save(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
  var ICON_MOON = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2 6 6M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>';
  function paintButtons() {
    var dark = isDark();
    document.querySelectorAll('[data-mlh-theme-toggle]').forEach(function (b) {
      b.innerHTML = dark ? ICON_SUN : ICON_MOON;
      b.setAttribute('aria-label', dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
      b.title = dark ? 'Giao diện sáng' : 'Giao diện tối';
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      if (b.hasAttribute('data-theme-keep')) b.style.color = dark ? C.ink : '#15110e';
    });
  }
  function toggle() {
    if (isDark()) {
      root.removeAttribute('data-theme');
      save('light');
      if (!isNative) stopEngine();
      paintButtons();
    } else {
      save('dark');
      loadCss(function () {
        root.setAttribute('data-theme', 'dark');
        startEngine();
        paintButtons();
      });
    }
  }
  function makeButton() {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-mlh-theme-toggle', '');
    b.setAttribute('data-theme-keep', '');
    b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;flex:0 0 38px;padding:0;margin:0;background:transparent;border:0;border-radius:50%;cursor:pointer;';
    return b;
  }
  function bind() {
    document.querySelectorAll('[data-mlh-theme-toggle]').forEach(function (b) {
      if (b.__mlhBound) return;
      b.__mlhBound = true;
      b.addEventListener('click', toggle);
    });
    paintButtons();
  }
  function mountHeader() {
    var header = document.getElementById('lhv-header');
    if (!header) return false;
    ['.lhv-actions-wrap', '.lhv-mob-actions'].forEach(function (sel) {
      var box = header.querySelector(sel);
      if (box && !box.querySelector('[data-mlh-theme-toggle]')) box.insertBefore(makeButton(), box.firstChild);
    });
    bind();
    return true;
  }
  function init() {
    bind();
    if (isDark() && !isNative) startEngine();
    if (isNative) return;
    var tries = 0;
    (function wait() { if (!mountHeader() && ++tries < 60) setTimeout(wait, 150); })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
