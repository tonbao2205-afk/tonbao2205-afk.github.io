/* mayLEHUONG translation runtime (en, zh …): translates text that shared scripts render after load
   (menu, footer, cart, product data from the API). Mirrors tools/en_i18n.py.
   Dictionary: window.MLH_EN = {u: units, n: product names}. Never changes page logic. */
(function () {
  'use strict';
  if (window.__MLH_EN_RUNTIME__) return;
  window.__MLH_EN_RUNTIME__ = true;
  var D = window.MLH_I18N || window.MLH_EN || { u: {}, n: {} };
  var PFX = D.p || '/en', JOIN = typeof D.j === 'string' ? D.j : ' ';
  var U = D.u || {}, N = D.n || {};
  var VI = /[À-ÃÈ-ÊÌÍÒ-ÕÙÚÝà-ãè-êìíò-õùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/;
  var LETTER = /[A-Za-zÀ-ỹ]/;
  var SENT = /([.!?…])\s+(?=\S)/g;
  var PRICE = /^(\d{1,3}(?:\.\d{3})+)(\s*[₫đ])$/;
  var collect = /[?&]mlh_collect=1/.test(location.search);
  var missing = collect ? new Set() : null;

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var names = Object.keys(N).filter(function (n) { return n.length >= 6; }).sort(function (a, b) { return b.length - a.length; });
  var nameRe = names.length ? new RegExp(names.map(esc).join('|'), 'g') : null;
  var codes = (D.c || []).slice().sort(function (a, b) { return b.length - a.length; });
  var codeListRe = codes.length ? new RegExp('(^|[^A-Za-z0-9\\u0000])(' + codes.map(esc).join('|') + ')(?![A-Za-z0-9])', 'g') : null;
  var codeRe = /(^|[^A-Za-z0-9\u0000])([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?![A-Za-z0-9])/g;
  var numRe = /\d+(?:[.,]\d+)*/g;

  function polish(s) { return s.replace(/(\d)\s?đ(?![A-Za-zÀ-ỹ])/g, '$1₫').replace(/VNĐ/g, 'VND'); }
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function enNumber(v) {
    if (/^\d{1,3}(?:\.\d{3})+$/.test(v)) return v.replace(/\./g, ',');
    if (/^\d+,\d{1,2}$/.test(v)) return v.replace(',', '.');
    return v;
  }

  function templatize(s) {
    var slots = { N: [], C: [], D: [] };
    function put(k, v) { slots[k].push(v); return '\u0000' + k + String.fromCharCode(0xE000 + slots[k].length) + '\u0000'; }
    var t = s;
    if (nameRe) t = t.replace(nameRe, function (m) { return put('N', m); });
    if (codeListRe) t = t.replace(codeListRe, function (m, pre, c) { return pre + put('C', c); });
    t = t.replace(codeRe, function (m, pre, c) { return pre + put('C', c); });
    t = t.replace(numRe, function (m) { return put('D', m); });
    t = t.replace(/\u0000([NCD])([-])\u0000/g, function (m, k, i) { return '{' + k + (i.charCodeAt(0) - 0xE000) + '}'; });
    return { t: t, s: slots };
  }

  function fill(tpl, slots) {
    var ok = true;
    var out = tpl.replace(/\{([NCD])(\d+)\}/g, function (m, k, i) {
      var v = (slots[k] || [])[i - 1];
      if (v === undefined) { ok = false; return m; }
      if (k === 'N') { if (!(v in N)) { ok = false; return v; } return N[v]; }
      if (k === 'D') return enNumber(v);
      return v;
    });
    return ok ? out : null;
  }

  function lookup(s) {
    if (Object.prototype.hasOwnProperty.call(U, s)) return U[s];
    if (Object.prototype.hasOwnProperty.call(N, s)) return N[s];
    var x = templatize(s);
    if (!Object.prototype.hasOwnProperty.call(U, x.t)) return null;
    return fill(U[x.t], x.s);
  }

  var LIST_SEP = / · | \| | \/ |, | – | - |: /;
  function splitList(s) {
    var bits = s.split(new RegExp('(' + LIST_SEP.source + ')'));
    if (bits.length < 3) return null;
    var out = [];
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      if (i % 2 === 1) { out.push(b); continue; }
      if (!VI.test(b)) { out.push(Object.prototype.hasOwnProperty.call(U, b) ? U[b] : b); continue; }
      var t = lookup(b);
      if (t === null) return null;
      out.push(t);
    }
    return out.join('');
  }

  var cache = new Map();
  function tr(text) {
    if (!text || !LETTER.test(text)) {
      var pm = text && norm(text).match(PRICE);
      return pm ? polish(text.replace(pm[1], enNumber(pm[1]))) : text;
    }
    if (cache.has(text)) return cache.get(text);
    var lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
    var s = norm(text), en = null;
    if (!VI.test(s)) {
      en = Object.prototype.hasOwnProperty.call(U, s) ? U[s] : null;
    } else {
      en = lookup(s);
      if (en === null) {
        var parts = s.replace(SENT, '$1\u0001').split('\u0001');
        if (parts.length > 1) {
          var outs = parts.map(function (p) { return VI.test(p) ? lookup(p) : (U[p] || p); });
          if (outs.every(function (o) { return o !== null; })) en = outs.join(JOIN);
        }
      }
      if (en === null) en = splitList(s);
      if (en === null) {
        var pm2 = s.match(/^(\d{1,3}(?:\.\d{3})+)\s*(đ|₫|VNĐ)$/);
        if (pm2) en = enNumber(pm2[1]) + '₫';
      }
      if (en === null && missing) missing.add(s);
    }
    var res = en === null ? text : lead + polish(en) + trail;
    if (cache.size > 5000) cache.clear();
    cache.set(text, res);
    return res;
  }
  window.MLH_EN_T = window.MLH_I18N_T = function (s) { return tr(String(s == null ? '' : s)); };

  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };
  function skipEl(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (SKIP[e.tagName] || e.hasAttribute('data-no-tr')) return true;
      var c = e.className;
      if (typeof c === 'string' && c.indexOf('material-symbols') !== -1) return true;
    }
    return false;
  }

  var ATTRS = ['alt', 'title', 'placeholder', 'aria-label'];
  var PAGE = /^\/(?:[a-z0-9-]+\.html|san-pham\/[A-Za-z0-9_-]+\.html)?(?:[?#].*)?$/;
  function fixHref(el) {
    var h = el.getAttribute('href');
    if (!h || h.charAt(0) !== '/' || h.indexOf(PFX + '/') === 0 || h === PFX) return;
    if (!PAGE.test(h)) return;
    var p = h.replace(/^\/(index(?:-mobile)?\.html)?(?=$|[?#])/, '/');
    el.setAttribute('href', PFX + p);
  }

  function doText(node) {
    var v = node.nodeValue;
    if (!v || (!VI.test(v) && !/\d\.\d{3}/.test(v) && !Object.prototype.hasOwnProperty.call(U, norm(v)))) return;
    var p = node.parentElement;
    if (!p || skipEl(p)) return;
    var t = tr(v);
    if (t !== v) node.nodeValue = t;
  }
  function doEl(el) {
    if (skipEl(el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute(ATTRS[i]);
      if (a && VI.test(a)) { var t = tr(a); if (t !== a) el.setAttribute(ATTRS[i], t); }
    }
    if (el.tagName === 'INPUT' && /^(submit|button|reset)$/i.test(el.type) && VI.test(el.value)) el.value = tr(el.value);
    if (el.tagName === 'A') fixHref(el);
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (SKIP[root.tagName]) return; doEl(root); }
    var w = document.createTreeWalker(root, 5, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) doText(n);
      else doEl(n);
    }
  }

  var mo = new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      } else if (m.type === 'characterData') {
        doText(m.target);
      } else if (m.type === 'attributes') {
        doEl(m.target);
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['href']) });

  ['alert', 'confirm', 'prompt'].forEach(function (k) {
    var orig = window[k];
    if (typeof orig !== 'function') return;
    window[k] = function (msg) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof msg === 'string') args[0] = tr(msg);
      return orig.apply(window, args);
    };
  });

  function initial() { walk(document.documentElement); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initial);
  initial();

  if (collect) {
    setInterval(function () {
      var pre = document.getElementById('mlh-en-missing');
      if (!pre) { pre = document.createElement('pre'); pre.id = 'mlh-en-missing'; pre.setAttribute('data-no-tr', ''); pre.style.display = 'none'; (document.body || document.documentElement).appendChild(pre); }
      pre.textContent = JSON.stringify(Array.from(missing));
    }, 500);
  }
})();
