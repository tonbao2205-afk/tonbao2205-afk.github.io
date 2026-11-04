/* mayLEHUONG GitHub preview mode. Only shipped in the GitHub Pages test copy, never on the VPS.
   - /api/products* answered from a static snapshot (/api-snapshot/products.json)
   - every POST/PUT/DELETE (forms, orders, webhooks) is blocked: nothing reaches the shop's systems
   - mobile visitors of a home page get index-mobile.html (the VPS does this by User-Agent) */
(function () {
  'use strict';
  if (window.__MLH_PREVIEW__) return;
  window.__MLH_PREVIEW__ = true;
  window.ADMIN_API_BASE = ''; // always the static snapshot below, never a local/production API

  var path = location.pathname || '/';
  var lm = path.match(/^\/(en|zh|ko|ja|hi)(\/|$)/);
  var lang = lm ? lm[1] : 'vi';
  var MSG = {
    vi: 'Bản thử nghiệm: không gửi dữ liệu. Vui lòng đặt hàng/tư vấn tại maylehuong.com hoặc gọi hotline.',
    en: 'Preview site: nothing is sent. Please order or book at maylehuong.com or call our hotline.',
    zh: '预览版：不会发送任何数据。请前往 maylehuong.com 下单或预约，或拨打热线。',
    ko: '미리보기 사이트입니다. 데이터가 전송되지 않습니다. maylehuong.com에서 주문·예약하시거나 핫라인으로 연락해 주세요.',
    ja: 'プレビュー版のため、データは送信されません。ご注文・ご予約は maylehuong.com またはホットラインへお願いいたします。',
    hi: 'यह प्रीव्यू साइट है: कोई डेटा नहीं भेजा जाता। ऑर्डर या बुकिंग के लिए maylehuong.com पर जाएँ या हॉटलाइन पर कॉल करें।'
  };
  var BADGE = { vi: 'BẢN THỬ', en: 'PREVIEW', zh: '预览版', ko: '미리보기', ja: 'プレビュー', hi: 'प्रीव्यू' };

  // ---- mobile home page (nginx serves index-mobile.html at the same URL on the VPS)
  //      GitHub cannot do that, so pick by device type OR a phone-sized screen.
  var phone = /Mobile|Android|iPhone|iPod|Windows Phone/i.test(navigator.userAgent || '') ||
    (window.matchMedia && matchMedia('(max-width: 767px)').matches);
  var mh = path.match(/^(\/(?:(?:en|zh|ko|ja|hi)\/)?)(index\.html|index-mobile\.html)?$/);
  if (mh) {
    var onMobile = mh[2] === 'index-mobile.html';
    if (phone && !onMobile) { location.replace(mh[1] + 'index-mobile.html' + location.search + location.hash); return; }
    if (!phone && onMobile) { location.replace(mh[1] + location.search + location.hash); return; }
  }

  function notice() {
    try {
      var id = 'mlh-preview-toast', t = document.getElementById(id);
      if (!t) {
        t = document.createElement('div');
        t.id = id;
        t.setAttribute('data-no-tr', '');
        t.setAttribute('role', 'status');
        t.style.cssText = 'position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:100000;max-width:calc(100vw - 28px);' +
          'padding:12px 16px;background:#15110e;color:#fff;border:1px solid #a17f22;border-radius:12px;font:500 14px/1.45 system-ui,sans-serif;' +
          'box-shadow:0 8px 24px rgba(0,0,0,.25);text-align:center';
        (document.body || document.documentElement).appendChild(t);
      }
      t.textContent = MSG[lang];
      clearTimeout(t._h);
      t._h = setTimeout(function () { t.remove(); }, 6000);
    } catch (e) {}
  }
  function json(status, body) {
    return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } });
  }

  var origFetch = window.fetch.bind(window);
  var snap = null;
  function load() {
    if (!snap) snap = origFetch('/api-snapshot/products.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
    return snap;
  }
  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input || '');
    var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      notice();
      return Promise.resolve(json(503, { ok: false, error: 'preview', message: MSG[lang] }));
    }
    var u = null;
    try { u = new URL(url, location.href); } catch (e) {}
    if (u && (u.origin === location.origin || /(^|\.)maylehuong\.com$/.test(u.hostname)) && u.pathname.indexOf('/api/') === 0) {
      var one = u.pathname.match(/^\/api\/products\/([^/]+)$/);
      if (/^\/api\/products\/?$/.test(u.pathname)) {
        return load().then(function (list) {
          var c = u.searchParams.get('category'), sc = u.searchParams.get('subcategory'), q = fold(u.searchParams.get('q'));
          return json(200, list.filter(function (p) {
            if (c && p.category !== c) return false;
            if (sc && p.subcategory !== sc) return false;
            if (q && fold([p.name, p.sku, p.id, p.slug].join(' ')).indexOf(q) === -1) return false;
            return true;
          }));
        });
      }
      if (one) {
        var id = decodeURIComponent(one[1]);
        return load().then(function (list) {
          for (var i = 0; i < list.length; i++) if (list[i].id === id || list[i].slug === id) return json(200, list[i]);
          return json(404, { error: 'Not found' });
        });
      }
      return Promise.resolve(json(503, { error: 'preview' }));
    }
    return origFetch(input, init);
  };

  var XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method) { this.__mlhM = String(method || 'GET').toUpperCase(); return XO.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    if (this.__mlhM && this.__mlhM !== 'GET' && this.__mlhM !== 'HEAD') { notice(); try { this.abort(); } catch (e) {} return; }
    return XS.apply(this, arguments);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = function () { return false; };
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && String(f.method || '').toLowerCase() === 'post') { e.preventDefault(); notice(); }
  }, true);

  // ---- media (/images, /videos, /uploads) is not copied to GitHub: load it from the live site
  var ORIGIN = location.origin.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  var MEDIA = new RegExp('^(?:' + ORIGIN + ')?/?(images|videos|uploads)/');
  function abs(v) { return 'https://maylehuong.com/' + v.slice(v.indexOf(location.origin) === 0 ? location.origin.length : 0).replace(/^\//, ''); }
  function fixSrcset(v) {
    return v.split(',').map(function (part) {
      var t = part.trim(); return MEDIA.test(t) ? part.replace(t.split(/\s+/)[0], abs(t.split(/\s+/)[0])) : part;
    }).join(',');
  }
  function fixEl(el) {
    if (el.nodeType !== 1) return;
    var a, v;
    var attrs = ['src', 'poster', 'data-src'];
    if (el.tagName === 'LINK' || el.tagName === 'A') attrs.push('href');
    for (var i = 0; i < attrs.length; i++) {
      a = attrs[i]; v = el.getAttribute(a);
      if (v && MEDIA.test(v)) el.setAttribute(a, abs(v));
    }
    ['srcset', 'data-srcset', 'imagesrcset'].forEach(function (k) {
      v = el.getAttribute(k);
      if (v && /(^|,)\s*\/?(images|videos|uploads)\//.test(v)) el.setAttribute(k, fixSrcset(v));
    });
    v = el.getAttribute('style');
    if (v && /url\(\s*['"]?\/?(images|videos|uploads)\//.test(v)) {
      el.setAttribute('style', v.replace(/url\(\s*(['"]?)\/?((?:images|videos|uploads)\/)/g, 'url($1https://maylehuong.com/$2'));
    }
  }
  function fixTree(n) {
    if (n.nodeType !== 1) return;
    fixEl(n);
    var all = n.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) fixEl(all[i]);
  }
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'attributes') fixEl(m.target);
      else for (var j = 0; j < m.addedNodes.length; j++) fixTree(m.addedNodes[j]);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true,
    attributeFilter: ['src', 'srcset', 'data-src', 'data-srcset', 'poster', 'style', 'href', 'imagesrcset'] });

  function badge() {
    var b = document.createElement('div');
    b.setAttribute('data-no-tr', '');
    b.setAttribute('aria-hidden', 'true');
    b.textContent = BADGE[lang];
    b.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;pointer-events:none;' +
      'padding:2px 7px;border-radius:999px;background:#15110e;color:#fff;opacity:.7;font:700 9px/1.4 system-ui,sans-serif;letter-spacing:.1em';
    document.body.appendChild(b);
  }
  if (document.body) badge(); else document.addEventListener('DOMContentLoaded', badge);
})();
