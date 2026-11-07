/**
 * mayLEHUONG Unified Product API & Component Engine
 * Connects all website catalog and detail pages with backend API (127.0.0.1:3001)
 */
(function (window) {
  'use strict';

  const ADMIN_API_BASE = typeof window.ADMIN_API_BASE === 'string'
    ? window.ADMIN_API_BASE
    : (['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://127.0.0.1:3001'
      : '');
  window.ADMIN_API_BASE = ADMIN_API_BASE;

  // Format VND currency
  function formatMoney(amount) {
    if (typeof amount === 'string' && (amount.includes('₫') || amount.includes('đ'))) {
      return amount;
    }
    const num = Number(amount) || 0;
    return num.toLocaleString('ko-KR') + '₫';
  }

  // Normalize image URL
  function getProductImageUrl(url) {
    if (url && typeof url === 'object' && typeof url.url === 'string') {
      url = url.url;
    }
    if (!url || typeof url !== 'string') return '/images/logo.webp';
    const trimmed = url.trim();
    if (!trimmed) return '/images/logo.webp';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }

    if (trimmed.startsWith('/uploads/')) {
      return `${ADMIN_API_BASE}${trimmed}`;
    }
    if (trimmed.startsWith('uploads/')) {
      return `${ADMIN_API_BASE}/${trimmed}`;
    }

    let resolved;
    if (trimmed.startsWith('../images/')) {
      resolved = `/${trimmed.slice(3)}`;
    } else if (trimmed.startsWith('/images/')) {
      resolved = trimmed;
    } else if (trimmed.startsWith('images/')) {
      resolved = `/${trimmed}`;
    } else {
      resolved = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    }
    if (/^\/images\/products\/vest-nu\/p\d+\/cover\.png$/i.test(resolved)) {
      return resolved.replace(/\.png$/i, '.webp');
    }
    return resolved;
  }

  const FRIENDLY_UNMAPPED_NOTE = 'Mẫu thiết kế hiện phục vụ theo hình thức May đo riêng hoặc thử trực tiếp tại Showroom.';

  function sanitizeCustomerText(str) {
    if (!str || typeof str !== 'string') return str;
    return str
      .replace(/(^|\s)chuẩn\s+chuẩn(?=\s|[.,;!?]|$)/gi, '$1chuẩn')
      .replace(/Mẫu ảnh hiện chưa có dòng hàng Kiot\x56iet phù hợp để bán thành bộ\.?/gi, FRIENDLY_UNMAPPED_NOTE)
      .replace(/xem đúng mã Kiot\x56iet, size, giá bán và số lượng còn có thể bán/gi, 'xem đúng mã sản phẩm, size, giá bán và số lượng còn tại Showroom')
      .replace(/Giá và tồn đang cập nhật từ Kiot\x56iet/gi, 'Giá và tình trạng cập nhật tại Showroom')
      .replace(/cập nhật từ Kiot\x56iet/gi, 'cập nhật trực tiếp tại Showroom')
      .replace(/mã Kiot\x56iet/gi, 'mã sản phẩm')
      .replace(/Kiot\x56iet/gi, 'Showroom');
  }

  function dedupeProductImages(images, primaryImg) {
    const rawList = Array.isArray(images) && images.length ? images.slice() : (primaryImg ? [primaryImg] : []);
    const seenStems = new Set();
    const result = [];
    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      const rawUrl = typeof item === 'string' ? item : (item && typeof item.url === 'string' ? item.url : '');
      if (!rawUrl || !rawUrl.trim()) continue;
      const normUrl = getProductImageUrl(rawUrl);
      const stemKey = normUrl.split('?')[0].replace(/\.(jpe?g|png|webp|avif)$/i, '').toLowerCase();
      if (seenStems.has(stemKey)) continue;
      seenStems.add(stemKey);
      result.push(item);
    }
    return result;
  }

  const LEGACY_PRODUCT_ID_ALIASES = {
    'vnam12': 'nam-tk-01',
    'vnam1': 'nam-tk-02',
    'vn-01': 'nam-tk-02',
    'vnam9': 'nam-tk-03',
    'vnam5': 'nam-tk-04',
    'vn-05': 'nam-tk-04',
    'vnam8': 'nam-tk-05',
    'vnam10': 'nam-tk-06',
    'vnam7': 'nam-tk-07',
    'vn-02': 'vnam2',
    'vn-03': 'vnam3',
    'vn-04': 'vnam4',
    'vn-06': 'vnam6',
    'cv-01': 'cv-color-mau-den',
    'cv-02': 'cv-color-mau-den-hoa-tiet',
    'cv-03': 'cv-color-mau-do',
    'cv-04': 'cv-color-do-hoa-tiet',
    'cv-05': 'cv-color-mau-navy',
    'cv-06': 'cv-color-mau-navy-soc',
    'cv-07': 'cv-color-mau-be-1',
    'cv-08': 'cv-color-mau-bac',
    'cv-09': 'cv-color-mau-bac-soc',
    'cv-10': 'cv-color-mau-cham-bi',
    'cv-11': 'cv-color-mau-ghi-chi-caro',
    'cv-12': 'cv-color-mau-nau',
    'cv-13': 'cv-color-mau-reu',
    'cv-14': 'cv-color-mau-reu-hoa-tiet',
    'cv-15': 'cv-color-mau-soc-dong',
    'cv-16': 'cv-color-mau-than-chi',
    'cv-17': 'cv-color-mau-tim-caro',
    'cv-18': 'cv-color-mau-xanh',
    'cv-19': 'cv-color-mau-xanh-hoa-tiet'
  };

  function resolveLegacyProductId(idOrSlug) {
    if (!idOrSlug || typeof idOrSlug !== 'string') return idOrSlug;
    const raw = idOrSlug.trim();
    const lower = raw.toLowerCase();
    if (LEGACY_PRODUCT_ID_ALIASES[lower]) {
      return LEGACY_PRODUCT_ID_ALIASES[lower];
    }
    const accMatch = lower.match(/^(gt|sm|kl|no|ccv|cv)-0*(\d+)$/);
    if (accMatch) {
      return accMatch[1] + String(Number(accMatch[2]));
    }
    return raw;
  }

  const GARMENT_SIZE_RANK = {
    'XXXS': 0, 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5,
    'XL': 6, '2XL': 7, 'XXL': 7, '3XL': 8, 'XXXL': 8,
    '4XL': 9, 'XXXXL': 9, '5XL': 10, 'FREE': 20, 'FREESIZE': 20
  };

  function formatPhraseCase(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    if (s === s.toUpperCase() && s !== s.toLowerCase()) {
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
    return s;
  }

  function getSizeSortKey(sizeStr) {
    var up = String(sizeStr || '').trim().toUpperCase();
    if (/^\d+(?:\.\d+)?$/.test(up)) {
      return { bucket: 1, rank: parseFloat(up), raw: up };
    }
    if (Object.prototype.hasOwnProperty.call(GARMENT_SIZE_RANK, up)) {
      return { bucket: 2, rank: GARMENT_SIZE_RANK[up], raw: up };
    }
    return { bucket: 3, rank: 0, raw: up };
  }

  function sortSizeListString(val) {
    if (!val || typeof val !== 'string') return val;
    if (val.indexOf(',') === -1) return val.trim();
    var tokens = val.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    if (tokens.length <= 1) return val.trim();
    var seen = {};
    var unique = [];
    tokens.forEach(function(t) {
      var k = t.toUpperCase();
      if (!seen[k]) {
        seen[k] = true;
        unique.push(t);
      }
    });
    unique.sort(function(a, b) {
      var ka = getSizeSortKey(a);
      var kb = getSizeSortKey(b);
      if (ka.bucket !== kb.bucket) return ka.bucket - kb.bucket;
      if (ka.rank !== kb.rank) return ka.rank - kb.rank;
      return ka.raw.localeCompare(kb.raw, 'vi', { numeric: true });
    });
    return unique.join(', ');
  }

  function inferDefaultMaterial(p) {
    var existing = p && p.attributes && p.attributes['Chất liệu'];
    if (existing && typeof existing === 'string' && existing.trim() && !/liên\s*hệ/i.test(existing)) {
      return existing.trim();
    }
    return 'Đang cập nhật';
  }

  function normalizeProductAttributes(p) {
    if (!p || typeof p !== 'object') return p;
    var rawAttrs = (p.attributes && typeof p.attributes === 'object') ? p.attributes : {};
    var nextAttrs = {};
    Object.keys(rawAttrs).forEach(function(k) {
      var v = rawAttrs[k];
      if (typeof v === 'string') {
        if (/^size\b/i.test(k.trim())) {
          v = sortSizeListString(v);
        } else if (/^màu\s*sắc$/i.test(k.trim())) {
          v = formatPhraseCase(v);
        } else {
          v = sanitizeCustomerText(v);
        }
      }
      nextAttrs[k] = v;
    });
    if (!nextAttrs['Chất liệu'] || /liên\s*hệ/i.test(String(nextAttrs['Chất liệu']))) {
      nextAttrs['Chất liệu'] = inferDefaultMaterial(p);
    }
    p.attributes = nextAttrs;
    if (Array.isArray(p.sizes) && p.sizes.length > 1) {
      p.sizes = p.sizes.slice().sort(function(a, b) {
        var ka = getSizeSortKey(a);
        var kb = getSizeSortKey(b);
        if (ka.bucket !== kb.bucket) return ka.bucket - kb.bucket;
        if (ka.rank !== kb.rank) return ka.rank - kb.rank;
        return ka.raw.localeCompare(kb.raw, 'vi', { numeric: true });
      });
    }
    if (Array.isArray(p.catalog_options)) {
      p.catalog_options.forEach(normalizeProductAttributes);
    }
    return p;
  }

  function sanitizePublicProduct(p) {
    if (!p || typeof p !== 'object') return p;
    if (Array.isArray(p.images) && p.images.length) {
      p.images = dedupeProductImages(p.images, p.img);
    }
    if (typeof p.image_note === 'string') {
      p.image_note = sanitizeCustomerText(p.image_note);
    } else if (!p.image_note && (p.stock_reason === 'UNMAPPED' || p.price_confirmed === false) && p.category && p.category !== 'phu-kien') {
      p.image_note = FRIENDLY_UNMAPPED_NOTE;
    }
    if (typeof p.description === 'string') p.description = sanitizeCustomerText(p.description);
    if (typeof p.seoDescription === 'string') p.seoDescription = sanitizeCustomerText(p.seoDescription);
    if (typeof p.shortDescription === 'string') p.shortDescription = sanitizeCustomerText(p.shortDescription);
    normalizeProductAttributes(p);
    return p;
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Fetch products from API with status=published
  async function fetchProductsFromAPI(params = {}) {
    const searchParams = new URLSearchParams();
    searchParams.set('status', 'published');

    if (params.category && params.category !== 'all') {
      searchParams.set('category', params.category);
    }
    if (params.subcategory && params.subcategory !== 'all') {
      searchParams.set('subcategory', params.subcategory);
    }
    if (params.q) {
      searchParams.set('q', params.q);
    }

    const url = `${ADMIN_API_BASE}/api/products?${searchParams.toString()}`;
    if (window.MLH_LOADER) window.MLH_LOADER.beginData();
    try {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });

      if (response.ok) {
        const raw = await response.json();
        const rawList = Array.isArray(raw) ? raw : [];
        const list = rawList
          .filter(function(item) {
            if (params.category === 'blazer-nam') return true;
            return item && item.category !== 'blazer-nam' && !/^bz\d+$/i.test(String(item.id || ''));
          })
          .map(sanitizePublicProduct);
        list.products = list;
        list.error = null;
        return list;
      }
      const errList = [];
      errList.products = [];
      errList.error = `HTTP ${response.status}`;
      return errList;
    } catch (netErr) {
      const errList = [];
      errList.products = [];
      errList.error = netErr.message || 'Network error';
      return errList;
    } finally {
      if (window.MLH_LOADER) window.MLH_LOADER.endData();
    }
  }

  // Fetch product detail by ID or Slug
  async function fetchProductDetailFromAPI(idOrSlug) {
    if (!idOrSlug) return { product: null, error: 'No ID or slug provided' };
    const resolvedId = resolveLegacyProductId(idOrSlug);
    const url = `${ADMIN_API_BASE}/api/products/${encodeURIComponent(resolvedId)}`;
    if (window.MLH_LOADER) window.MLH_LOADER.beginData();
    try {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });

      if (response.ok) {
        const data = sanitizePublicProduct(await response.json());
        if (data && data.visible !== false && data.status !== 'draft') {
          data.product = data;
          data.error = null;
          return data;
        }
        return { product: null, error: 'Product is hidden or draft' };
      }

      if (response.status === 404) {
        return { product: null, error: 'Product not found' };
      }

      return { product: null, error: `HTTP ${response.status}` };
    } catch (netErr) {
      return { product: null, error: netErr.message || 'Network error' };
    } finally {
      if (window.MLH_LOADER) window.MLH_LOADER.endData();
    }
  }

  // Inject Skeleton & UI State Styles
  function ensureUIStateStyles() {
    if (document.getElementById('mlh-product-api-styles')) return;
    const style = document.createElement('style');
    style.id = 'mlh-product-api-styles';
    style.textContent = `
      @keyframes mlhShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .mlh-skeleton-card {
        background: #ffffff;
        border: 1px solid rgba(120, 80, 40, 0.12);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .mlh-skeleton-thumb {
        width: 100%;
        padding-top: 125%;
        background: linear-gradient(90deg, #f0eae1 25%, #fcf9f5 50%, #f0eae1 75%);
        background-size: 200% 100%;
        animation: mlhShimmer 1.6s infinite ease-in-out;
      }
      .mlh-skeleton-info {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      }
      .mlh-skeleton-line {
        height: 12px;
        border-radius: 4px;
        background: linear-gradient(90deg, #f0eae1 25%, #fcf9f5 50%, #f0eae1 75%);
        background-size: 200% 100%;
        animation: mlhShimmer 1.6s infinite ease-in-out;
      }
      .mlh-empty-state, .mlh-error-state {
        grid-column: 1 / -1;
        background: #ffffff;
        border: 1px solid rgba(197, 160, 89, 0.25);
        border-radius: 20px;
        padding: 48px 24px;
        text-align: center;
        max-width: 600px;
        margin: 20px auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }
      .mlh-empty-icon, .mlh-error-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
      }
      .mlh-empty-icon {
        background: #fdf8f0;
        color: #c5a059;
      }
      .mlh-error-icon {
        background: #fef2f2;
        color: #9d0208;
      }
      .mlh-retry-btn {
        background: #9d0208;
        color: #ffffff;
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 10px 24px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: background 0.2s;
        margin-top: 14px;
      }
      .mlh-retry-btn:hover {
        background: #800020;
      }
    `;
    document.head.appendChild(style);
  }

  // SEO pages ship real product markup (data-prerendered, or static product cards). Loading and error
  // states must not wipe it: shoppers keep the page and only live price/stock refresh is affected.
  function hasPrerenderedContent(container) {
    return container.hasAttribute('data-prerendered') || Boolean(container.querySelector('.vn-card, [data-product-id]'));
  }

  // Render skeleton loading grid
  function renderSkeletonGrid(container, count = 8) {
    if (typeof container === 'string') container = document.getElementById(container);
    if (!container || hasPrerenderedContent(container)) return;
    ensureUIStateStyles();

    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="mlh-skeleton-card">
          <div class="mlh-skeleton-thumb"></div>
          <div class="mlh-skeleton-info">
            <div class="mlh-skeleton-line" style="width: 40%;"></div>
            <div class="mlh-skeleton-line" style="width: 85%; height: 16px;"></div>
            <div class="mlh-skeleton-line" style="width: 60%;"></div>
            <div class="mlh-skeleton-line" style="width: 100%; height: 32px; margin-top: auto; border-radius: 8px;"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  // Render empty state
  function renderEmptyState(container, categoryName = 'danh mục này') {
    if (typeof container === 'string') container = document.getElementById(container);
    if (!container) return;
    ensureUIStateStyles();

    container.innerHTML = `
      <div class="mlh-empty-state">
        <div class="mlh-empty-icon">
          <span class="material-symbols-outlined" style="font-size: 32px;">inventory_2</span>
        </div>
        <h3 style="font-size: 18px; font-weight: 700; color: #111; margin-bottom: 8px; font-family: 'Noto Serif', serif;">
          Chưa Có Sản Phẩm
        </h3>
        <p style="font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 20px;">
          Hiện tại chưa có sản phẩm nào trong ${escapeHtml(categoryName)}. Quý khách có thể xem các danh mục khác hoặc liên hệ đặt may đo theo yêu cầu riêng.
        </p>
        <a href="/ko/may-do.html" style="background:#9d0208; color:#fff; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:10px 24px; border-radius:10px; text-decoration:none; display:inline-block;">
          Đặt May Đo Bespoke
        </a>
      </div>
    `;
  }

  // Render error state. Pages call either (container, onRetry) or (container, message, onRetry);
  // the technical message is not shown to shoppers, only the retry callback matters.
  function renderErrorState(container, messageOrRetry, maybeRetry) {
    const onRetry = typeof messageOrRetry === 'function' ? messageOrRetry : maybeRetry;
    if (typeof container === 'string') container = document.getElementById(container);
    if (!container) return;
    ensureUIStateStyles();

    if (hasPrerenderedContent(container)) {
      // Keep the page; show one small notice above it instead of the full error screen.
      let notice = container.previousElementSibling;
      if (!notice || !notice.classList.contains('mlh-live-notice')) {
        notice = document.createElement('div');
        notice.className = 'mlh-live-notice';
        notice.setAttribute('role', 'status');
        notice.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:8px auto;padding:8px 14px;max-width:1280px;font-size:13px;color:#7c2d12;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;';
        notice.textContent = 'Chưa cập nhật được giá và tồn kho mới nhất. ';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'mlh-retry-btn';
        retry.textContent = 'Thử lại';
        notice.appendChild(retry);
        container.parentNode.insertBefore(notice, container);
      }
      const retry = notice.querySelector('button');
      retry.onclick = () => { notice.remove(); if (typeof onRetry === 'function') onRetry(); };
      return;
    }

    const errorId = 'btn-retry-' + Math.random().toString(36).slice(2, 7);
    container.innerHTML = `
      <div class="mlh-error-state">
        <div class="mlh-error-icon">
          <span class="material-symbols-outlined" style="font-size: 32px;">cloud_off</span>
        </div>
        <h3 style="font-size: 18px; font-weight: 700; color: #9d0208; margin-bottom: 8px; font-family: 'Noto Serif', serif;">
          Không Thể Tải Dữ Liệu
        </h3>
        <p style="font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px;">
          Đã xảy ra lỗi khi kết nối với máy chủ sản phẩm. Vui lòng kiểm tra lại kết nối và thử lại.
        </p>
        <button type="button" class="mlh-retry-btn" id="${errorId}">
          <span class="material-symbols-outlined text-sm">refresh</span>Thử Lại
        </button>
      </div>
    `;

    const retryBtn = document.getElementById(errorId);
    if (retryBtn && typeof onRetry === 'function') {
      retryBtn.addEventListener('click', onRetry);
    }
  }

  function productPrice(p) {
    if (p.catalog_sync && p.price_confirmed === false) return 'Liên hệ';
    var prefix = p.price_max > p.price_min ? 'Từ ' : '';
    return prefix + formatMoney(p.price) + (p.selling_unit ? ' / ' + p.selling_unit.toLowerCase() : '');
  }
  function catalogSeo(p) {
    if (!window.__MLH_APPLY_PRODUCT_SEO__) return;
    window.__MLH_APPLY_PRODUCT_SEO__({id:p.id,name:p.name,sku:p.sku,cat:p.category,price:p.price_confirmed===false?0:p.price,price_min:p.price_min,price_max:p.price_max,price_confirmed:p.price_confirmed,availability:p.availability,img:getProductImageUrl(p.img),desc:p.description||''});
  }
  function chosenProduct(p,o) {
    return Object.assign({},p,o,{catalog_options:null,product_line:o.label,selling_unit:'Bộ',badge:o.availability==='in_stock'?'Còn hàng':o.availability==='checking'?'Đang kiểm tra tồn':'Hết hàng'});
  }
  function catalogChoice(p) {
    var box=document.getElementById('size-btns'); if(!box)return;
    if(p.catalog_options && p.catalog_options.length>1 && !document.getElementById('catalog-choice')){
      var wrap=document.createElement('div');wrap.style.cssText='margin:0 0 14px;';
      var label=document.createElement('label');label.htmlFor='catalog-choice';label.textContent='Chọn dòng / mẫu';label.style.cssText='display:block;font-weight:700;font-size:13px;color:#141210;margin:0 0 8px;';
      var select=document.createElement('select');select.id='catalog-choice';select.style.cssText='width:100%;max-width:100%;min-width:0;padding:11px 10px;border:1px solid #d4cec3;border-radius:7px;background:white;color:#141210;font:inherit;font-size:13px;';
      var empty=document.createElement('option');empty.value='';empty.textContent='Chọn dòng / mẫu để xem giá và size';select.appendChild(empty);
      p.catalog_options.forEach(function(o,i){var option=document.createElement('option');option.value=String(i);option.textContent=o.label+' — '+productPrice(Object.assign({},o,{catalog_sync:true,selling_unit:'Bộ'}))+(o.availability==='in_stock'?'':o.availability==='checking'?' — Đang kiểm tra tồn':' — Hết hàng');option.disabled=o.availability!=='in_stock';select.appendChild(option);});
      select.addEventListener('change',function(){var o=p.catalog_options[Number(select.value)];if(select.value===''){renderStockDetail(p);catalogSeo(p);return;}var child=chosenProduct(p,o);renderStockDetail(child);catalogSeo(child);});
      wrap.appendChild(label);wrap.appendChild(select);box.insertAdjacentElement('beforebegin',wrap);
    }
    sanitizePublicProduct(p);
    var note=document.getElementById('catalog-image-note');
    if(p.image_note&&!note){note=document.createElement('p');note.id='catalog-image-note';note.style.cssText='font-size:12px;line-height:1.6;color:#666;margin:0 0 14px;';(document.getElementById('prod-stock')||document.getElementById('prod-price')?.parentElement)?.insertAdjacentElement('afterend',note);}
    if(note)note.textContent=sanitizeCustomerText(p.image_note||'');
    var table=document.querySelector('#tab-specs tbody');
    if(table){
      table.replaceChildren();
      var specEntries=Object.entries(p.attributes||{});
      specEntries.forEach(function(entry,idx){
        var tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');
        th.setAttribute('scope','row');
        th.textContent=entry[0];
        td.textContent=entry[1];
        if(idx<specEntries.length-1)tr.style.borderBottom='1px solid rgba(20,18,16,0.06)';
        th.style.cssText='text-align:left;padding:9px 12px 9px 0;color:#9d0208;font-weight:600;width:36%;';
        td.style.cssText='padding:9px 0;overflow-wrap:anywhere;color:#141210;';
        tr.appendChild(th);tr.appendChild(td);table.appendChild(tr);
      });
    }
    var line=document.getElementById('spec-style');if(line&&p.product_line)line.textContent=p.product_line;
  }

  function inferGarmentSubtype(sku, groupLabel, detailParts) {
    var isMixedBottom = /quần.*váy|váy.*quần/i.test(String(groupLabel || ''));
    for (var i = 0; i < detailParts.length; i++) {
      var d = detailParts[i];
      if (/chân\s*váy|váy/i.test(d)) return 'Chân váy';
      if (/quần/i.test(d)) return isMixedBottom ? 'Quần âu' : d;
    }
    if (!isMixedBottom) return '';
    var code = String(sku || '').toUpperCase();
    if (/^MLH-NU-QV-03(?:-|$)/.test(code) || /-(?:Q|QUAN|VQ)-/.test(code)) return 'Quần âu';
    if (/^MLH-NU-QV-0[124](?:-|$)/.test(code) || /-(?:CV|CVD|VAY)-/.test(code)) return 'Chân váy';
    return '';
  }

  function extractVariantColor(v, p) {
    var attrs = (v && v.attributes) || {};
    var keys = Object.keys(attrs);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var norm = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
      if (norm === 'mau sac' && attrs[k]) return formatPhraseCase(attrs[k]);
    }
    var prodColor = (p && p.attributes && p.attributes['Màu sắc']) || '';
    return prodColor ? formatPhraseCase(prodColor) : '';
  }

  function formatGroupTitle(groupLabel, totalGroups) {
    var raw = String(groupLabel || '').trim();
    if (!raw) return 'Kích cỡ:';
    if (/^quần\s*\/\s*chân váy$/i.test(raw)) return 'Quần / chân váy:';
    if (totalGroups === 1 && /^(bộ|sản phẩm|phụ kiện|size)$/i.test(raw)) return 'Kích cỡ:';
    if (/^size\b/i.test(raw)) return raw + ':';
    return 'Size ' + raw.toLowerCase() + ':';
  }

  function prepareGroupVariants(group) {
    var inStock = (group.variants || []).filter(function(v) { return v.stock > 0; });
    var items = inStock.map(function(v) {
      var rawSize = String(v.size || '').trim();
      var rawLabel = String(v.label || rawSize || group.label || '').trim();
      var parts = rawLabel.split(/\s*·\s*/).filter(Boolean);
      var sizeMain = rawSize || parts[0] || String(group.label || 'Tiêu chuẩn').trim();
      var rest = parts.slice(parts.length > 0 && parts[0].toUpperCase() === sizeMain.toUpperCase() ? 1 : (rawSize ? 0 : 1))
        .filter(function(tok) { return tok.toUpperCase() !== sizeMain.toUpperCase(); })
        .map(formatPhraseCase);
      var inferredKind = inferGarmentSubtype(v.sku, group.label, rest);
      var extraDetails = rest.filter(function(tok) {
        if (!inferredKind) return true;
        return !/^(quần|quần\s*âu|chân\s*váy|váy)$/i.test(tok.trim());
      });
      var detailParts = inferredKind ? [inferredKind].concat(extraDetails) : extraDetails.slice();
      var detailText = detailParts.join(' · ');
      var subRank = /^quần/i.test(inferredKind) ? 1 : (/^chân\s*váy/i.test(inferredKind) ? 2 : 0);
      return {
        variant: v,
        sizeMain: sizeMain,
        kindLabel: inferredKind,
        extraMeta: extraDetails.join(' · '),
        detailText: detailText,
        pillMeta: detailText,
        subRank: subRank,
        sortKey: getSizeSortKey(sizeMain)
      };
    });

    items.sort(function(a, b) {
      if (a.subRank !== b.subRank) return a.subRank - b.subRank;
      if (a.sortKey.bucket !== b.sortKey.bucket) return a.sortKey.bucket - b.sortKey.bucket;
      if (a.sortKey.rank !== b.sortKey.rank) return a.sortKey.rank - b.sortKey.rank;
      if (a.sortKey.raw !== b.sortKey.raw) return a.sortKey.raw.localeCompare(b.sortKey.raw, 'vi', { numeric: true });
      return a.detailText.localeCompare(b.detailText, 'vi', { numeric: true });
    });

    var hasRank1 = items.some(function(it) { return it.subRank === 1; });
    var hasRank2 = items.some(function(it) { return it.subRank === 2; });
    var hasSplitKinds = hasRank1 && hasRank2;

    if (hasSplitKinds) {
      items.forEach(function(it) {
        it.pillMeta = it.extraMeta;
      });
    } else if (items.length > 1 && items[0].detailText) {
      var candidate = items[0].detailText;
      var allSame = items.every(function(it) { return it.detailText === candidate; });
      if (allSame) {
        items.forEach(function(it) { it.pillMeta = ''; });
      }
    } else if (items.length === 1) {
      items[0].pillMeta = '';
    }

    var counts = {};
    items.forEach(function(it) {
      var bucketKey = (hasSplitKinds ? it.subRank : 0) + '|' + it.sizeMain.toUpperCase() + '|' + it.pillMeta.toLowerCase();
      counts[bucketKey] = (counts[bucketKey] || 0) + 1;
    });
    items.forEach(function(it) {
      var bucketKey = (hasSplitKinds ? it.subRank : 0) + '|' + it.sizeMain.toUpperCase() + '|' + it.pillMeta.toLowerCase();
      if (counts[bucketKey] > 1) {
        var segs = String(it.variant.sku || '').split('-');
        var series = segs.length >= 2 ? segs[segs.length - 2] : it.variant.sku;
        var extra = series ? ('Mẫu ' + series) : String(it.variant.sku || '');
        it.pillMeta = it.pillMeta ? (it.pillMeta + ' · ' + extra) : extra;
        it.detailText = it.detailText ? (it.detailText + ' · ' + extra) : extra;
      }
    });

    return {
      group: group,
      hasSplitKinds: hasSplitKinds,
      items: items
    };
  }

  function createStepIconSvg(isPlus) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '13');
    svg.setAttribute('height', '13');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.3');
    svg.setAttribute('stroke-linecap', 'round');
    var h = document.createElementNS(ns, 'line');
    h.setAttribute('x1', '5'); h.setAttribute('y1', '12');
    h.setAttribute('x2', '19'); h.setAttribute('y2', '12');
    svg.appendChild(h);
    if (isPlus) {
      var v = document.createElementNS(ns, 'line');
      v.setAttribute('x1', '12'); v.setAttribute('y1', '5');
      v.setAttribute('x2', '12'); v.setAttribute('y2', '19');
      svg.appendChild(v);
    }
    return svg;
  }

  function renderSizeSpecSummary(sizeSummaryEl, p) {
    if (!sizeSummaryEl) return;
    sizeSummaryEl.replaceChildren();
    var attrs = p.attributes || {};
    var sizeKeys = Object.keys(attrs).filter(function(k) {
      return /^size\b/i.test(k.trim()) && attrs[k];
    });
    if (sizeKeys.length === 0) {
      sizeSummaryEl.textContent = p.badge || 'Tiêu chuẩn';
      return;
    }
    sizeKeys.forEach(function(k) {
      var lineEl = document.createElement('span');
      lineEl.className = 'mlh-spec-size-line';
      var shortPrefix = k.replace(/^size\s+/i, '').trim();
      var prefixText = sizeKeys.length > 1 && shortPrefix.toLowerCase() !== 'size'
        ? (shortPrefix.charAt(0).toUpperCase() + shortPrefix.slice(1) + ': ')
        : 'Sẵn size: ';
      var prefixSpan = document.createElement('span');
      prefixSpan.className = 'mlh-spec-size-prefix';
      prefixSpan.textContent = prefixText;
      var valSpan = document.createElement('span');
      valSpan.textContent = sortSizeListString(String(attrs[k]));
      lineEl.appendChild(prefixSpan);
      lineEl.appendChild(valSpan);
      sizeSummaryEl.appendChild(lineEl);
    });
  }

  // Bảng chọn size chỉ hiện cho: các mục con của menu Sản Phẩm (vest nam trẻ, vest nữ,
  // vest sui gia; blazer cũng là áo), sơ mi và quần âu. Phụ kiện khác (cà vạt, cài cà vạt,
  // khăn lụa, giày tây, nơ, cài ve) ẩn nút, tab và popup bảng size.
  var SIZE_GUIDE_CATEGORIES = ['suit-nam-tre', 'vest-nu', 'vest-sui-gia', 'blazer-nam'];
  function productHasSizeGuide(p) {
    if (!p) return true;
    if (SIZE_GUIDE_CATEGORIES.indexOf(p.category) !== -1) return true;
    var sub = String(p.subcategory || '').toLowerCase();
    if (sub === 'somi' || sub === 'quan-au' || sub === 'quanau') return true;
    return /sơ\s*mi|somi|quần\s*âu|quần/i.test(String(p.name || ''));
  }
  function applySizeGuideVisibility(p) {
    var show = productHasSizeGuide(p);
    // product-detail.css đặt display bằng !important, nên phải ẩn kèm 'important'.
    var setShown = function (el) {
      if (!el) return;
      if (show) el.style.removeProperty('display');
      else el.style.setProperty('display', 'none', 'important');
    };
    var guideTrigger = document.getElementById('mlh-size-guide-trigger');
    setShown(guideTrigger);
    var tabBtn = document.querySelector('.mlh-tabs-nav button[onclick*="tab-size"]');
    var tabPanel = document.getElementById('tab-size');
    if (tabBtn) {
      setShown(tabBtn);
      if (!show && tabBtn.classList.contains('active')) {
        var descBtn = document.querySelector('.mlh-tabs-nav button[onclick*="tab-desc"]');
        if (descBtn && typeof window.switchTab === 'function') window.switchTab(descBtn, 'tab-desc');
      }
    }
    if (tabPanel && !show) tabPanel.classList.add('hidden');
    var modal = document.getElementById('size-guide-modal');
    if (modal && !show) modal.classList.remove('open');
  }

  function renderStockDetail(p) {
    sanitizePublicProduct(p);
    applySizeGuideVisibility(p);
    var mat = document.getElementById('spec-mat');
    if (mat) mat.textContent = inferDefaultMaterial(p);
    var materialFeature = document.getElementById('product-material-feature');
    if (materialFeature) materialFeature.textContent = inferDefaultMaterial(p);

    if (!p.catalog_sync) {
      if (p.image_note) catalogChoice(p);
      return;
    }
    if (p.catalog_options && p.catalog_options.length === 1) {
      return renderStockDetail(chosenProduct(p, p.catalog_options[0]));
    }
    var price = document.getElementById('prod-price');
    if (price) {
      price.textContent = productPrice(p);
      var status = document.getElementById('prod-stock');
      if (!status) {
        status = document.createElement('p');
        status.id = 'prod-stock';
        status.setAttribute('role', 'status');
        status.style.cssText = 'margin:10px 0 16px;font-size:14px;font-weight:700;';
        price.parentElement.insertAdjacentElement('afterend', status);
      }
      status.textContent = p.availability === 'in_stock'
        ? 'Còn hàng sẵn tại Showroom'
        : (p.availability === 'checking' ? 'Đang kiểm tra tồn kho Showroom' : 'Tạm hết size may sẵn · Nhận đặt may đo');
      status.dataset.availability = p.availability;
      status.style.color = p.availability === 'in_stock' ? '#166534' : '#9d0208';
    }
    catalogChoice(p);
    var mobile = document.getElementById('mob-price');
    if (mobile) mobile.textContent = productPrice(p);
    var feature = document.getElementById('stock-feature');
    if (feature) feature.textContent = p.badge;
    renderSizeSpecSummary(document.getElementById('spec-sizes'), p);

    var orderLabel = document.getElementById('stock-order-label');
    if (orderLabel) orderLabel.textContent = p.availability === 'in_stock' ? 'ĐẶT HÀNG NGAY' : 'LIÊN HỆ TƯ VẤN';

    var box = document.getElementById('size-btns');
    if (!box) return;
    box.replaceChildren();
    box.style.display = 'block';

    var staleQtyRow = document.getElementById('mlh-qty-row');
    if (staleQtyRow) staleQtyRow.remove();
    var staleSummary = document.getElementById('catalog-sku-summary');
    if (staleSummary) staleSummary.remove();

    var hint = document.getElementById('size-hint');
    if (hint) hint.textContent = '';

    if (p.availability !== 'in_stock') {
      var notice = document.createElement('div');
      notice.className = 'mlh-out-notice';
      notice.textContent = p.availability === 'checking'
        ? 'Hệ thống đang đồng bộ số lượng tồn tại Showroom. Quý khách vui lòng nhấn Liên hệ tư vấn để kiểm tra nhanh.'
        : 'Mẫu này hiện tạm hết size may sẵn tại Showroom — Nhận đặt may đo riêng chuẩn phom theo số đo.';
      box.appendChild(notice);
      return;
    }

    if (p.catalog_options) {
      var promptEl = document.createElement('p');
      promptEl.style.cssText = 'font-size:12.5px;color:#57534e;margin:0;font-weight:600;';
      promptEl.textContent = 'Vui lòng chọn dòng / mẫu ở trên để xem kích cỡ và số lượng sẵn có.';
      box.appendChild(promptEl);
      return;
    }

    var rawGroups = p.variant_groups || [];
    var preparedGroups = rawGroups.map(prepareGroupVariants);
    var isMultiGroup = preparedGroups.length > 1;
    var unitWord = String(p.selling_unit || 'Bộ').toLowerCase();

    var selections = {};
    var groupChoiceNodes = [];
    var groupPriceNodes = [];
    var qty = 1;

    // Build Clean Quantity Stepper & Inline Showroom Stock Row
    var qtyRow = document.createElement('div');
    qtyRow.id = 'mlh-qty-row';
    qtyRow.className = 'mlh-qty-row';

    var qtyCtrl = document.createElement('div');
    qtyCtrl.className = 'mlh-qty-ctrl';

    var qtyTitle = document.createElement('label');
    qtyTitle.className = 'mlh-qty-title';
    qtyTitle.htmlFor = 'mlh-qty-input';
    qtyTitle.textContent = 'Số lượng';

    var stepper = document.createElement('div');
    stepper.className = 'mlh-qty-stepper';

    var minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'mlh-qty-btn';
    minusBtn.setAttribute('aria-label', 'Giảm số lượng');
    minusBtn.appendChild(createStepIconSvg(false));

    var qtyInput = document.createElement('input');
    qtyInput.type = 'text';
    qtyInput.id = 'mlh-qty-input';
    qtyInput.name = 'quantity';
    qtyInput.className = 'mlh-qty-input';
    qtyInput.setAttribute('inputmode', 'numeric');
    qtyInput.setAttribute('pattern', '[0-9]*');
    qtyInput.setAttribute('autocomplete', 'off');
    qtyInput.setAttribute('autocorrect', 'off');
    qtyInput.setAttribute('autocapitalize', 'off');
    qtyInput.setAttribute('spellcheck', 'false');
    qtyInput.setAttribute('aria-describedby', 'mlh-stock-note');
    qtyInput.value = '1';

    var plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'mlh-qty-btn';
    plusBtn.setAttribute('aria-label', 'Tăng số lượng');
    plusBtn.appendChild(createStepIconSvg(true));

    stepper.appendChild(minusBtn);
    stepper.appendChild(qtyInput);
    stepper.appendChild(plusBtn);
    qtyCtrl.appendChild(qtyTitle);
    qtyCtrl.appendChild(stepper);

    var stockNote = document.createElement('div');
    stockNote.id = 'mlh-stock-note';
    stockNote.className = 'mlh-stock-note';
    var stockDot = document.createElement('span');
    stockDot.className = 'mlh-stock-dot';
    stockDot.setAttribute('aria-hidden', 'true');
    var stockText = document.createElement('span');
    stockNote.appendChild(stockDot);
    stockNote.appendChild(stockText);

    qtyRow.appendChild(qtyCtrl);
    qtyRow.appendChild(stockNote);

    // Compact Multi-Quantity Subtotal Footbar (hidden when qty === 1)
    var summary = document.createElement('div');
    summary.id = 'catalog-sku-summary';
    summary.className = 'mlh-sel-footbar is-compact';

    box.insertAdjacentElement('afterend', qtyRow);
    qtyRow.insertAdjacentElement('afterend', summary);

    function computeLimit() {
      var lim = Infinity;
      for (var i = 0; i < preparedGroups.length; i++) {
        var sel = selections[i];
        if (!sel) return 0;
        lim = Math.min(lim, sel.variant.stock);
      }
      return Number.isFinite(lim) && lim > 0 ? lim : 0;
    }

    function formatLiveChoiceText(sel) {
      if (!sel) return 'Chưa chọn';
      var baseSize = sel.sizeMain;
      if (!isMultiGroup && !/^(size|tiêu chuẩn|freesize|free)/i.test(baseSize)) {
        baseSize = 'Size ' + baseSize;
      }
      var parts = [baseSize];
      if (sel.detailText) {
        parts.push(sel.detailText);
      } else if (!isMultiGroup) {
        var colorText = extractVariantColor(sel.variant, p);
        if (colorText && colorText.toLowerCase() !== baseSize.toLowerCase()) {
          parts.push(colorText);
        }
      }
      return parts.join(' · ');
    }

    function updateSelection() {
      summary.replaceChildren();
      var allSelected = preparedGroups.length > 0 && preparedGroups.every(function(_, idx) { return Boolean(selections[idx]); });
      var limit = allSelected ? computeLimit() : 0;
      var codes = [];
      var unitTotal = 0;

      preparedGroups.forEach(function(_, idx) {
        var sel = selections[idx];
        if (groupChoiceNodes[idx]) {
          groupChoiceNodes[idx].textContent = formatLiveChoiceText(sel);
        }
        if (sel) {
          codes.push(sel.variant.sku);
          unitTotal += Number(sel.variant.price) || 0;
          if (groupPriceNodes[idx]) {
            groupPriceNodes[idx].textContent = formatMoney(sel.variant.price);
          }
        }
      });

      if (allSelected && limit > 0) {
        if (qty > limit) qty = limit;
        if (qty < 1) qty = 1;
        qtyInput.value = String(qty);
        qtyInput.disabled = false;
        minusBtn.disabled = qty <= 1;
        plusBtn.disabled = qty >= limit;
        stockText.textContent = 'Còn ' + limit + ' ' + unitWord + ' tại Showroom';

        summary.dataset.skus = JSON.stringify(codes);
        summary.dataset.stock = String(limit);
        summary.dataset.quantity = String(qty);

        var selectedProduct = Object.assign({}, p, { price: unitTotal, price_min: unitTotal, price_max: unitTotal });
        if (price) price.textContent = productPrice(selectedProduct);
        if (mobile) mobile.textContent = productPrice(selectedProduct);
        catalogSeo(selectedProduct);

        if (qty > 1) {
          summary.classList.remove('is-compact');
          var cap = document.createElement('span');
          cap.className = 'mlh-foot-caption';
          cap.textContent = 'Tạm tính (' + qty + ' ' + unitWord + ')';
          var amt = document.createElement('strong');
          amt.className = 'mlh-foot-amount';
          amt.textContent = formatMoney(unitTotal * qty);
          summary.appendChild(cap);
          summary.appendChild(amt);
        } else {
          summary.classList.add('is-compact');
        }
      } else {
        qtyInput.value = '1';
        qtyInput.disabled = true;
        minusBtn.disabled = true;
        plusBtn.disabled = true;
        stockText.textContent = 'Chọn đủ kích cỡ để xem tồn kho';
        delete summary.dataset.skus;
        delete summary.dataset.stock;
        delete summary.dataset.quantity;
        summary.classList.add('is-compact');
      }

      var specIdEl = document.getElementById('spec-id');
      if (specIdEl) {
        specIdEl.textContent = allSelected ? codes.join(' + ') : (p.sku || String(p.id || '').toUpperCase());
        specIdEl.style.overflowWrap = 'anywhere';
      }
    }

    minusBtn.addEventListener('click', function() {
      if (qty > 1) {
        qty -= 1;
        updateSelection();
      }
    });
    plusBtn.addEventListener('click', function() {
      var lim = computeLimit();
      if (lim > 0 && qty < lim) {
        qty += 1;
        updateSelection();
      }
    });
    qtyInput.addEventListener('input', function() {
      var cleaned = qtyInput.value.replace(/[^\d]/g, '');
      if (cleaned !== qtyInput.value) qtyInput.value = cleaned;
    });
    function commitTypedQty() {
      var lim = computeLimit();
      if (lim <= 0) {
        qty = 1;
        qtyInput.value = '1';
        return;
      }
      var parsed = parseInt(qtyInput.value, 10);
      if (!Number.isFinite(parsed) || parsed < 1) parsed = 1;
      if (parsed > lim) parsed = lim;
      qty = parsed;
      updateSelection();
    }
    qtyInput.addEventListener('blur', commitTypedQty);
    qtyInput.addEventListener('keydown', function(e) {
      if (e.isComposing) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        commitTypedQty();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var lim = computeLimit();
        if (lim > 0 && qty < lim) { qty += 1; updateSelection(); }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (qty > 1) { qty -= 1; updateSelection(); }
      }
    });

    function createVariantButton(item, isDefault, groupIndex, groupBlock, hasSplitKinds) {
      var v = item.variant;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sz-btn' + (isDefault ? ' active' : '');
      button.dataset.stock = String(v.stock);
      button.dataset.size = v.size;
      button.dataset.sku = v.sku;
      button.setAttribute('aria-pressed', isDefault ? 'true' : 'false');

      var mainSpan = document.createElement('span');
      mainSpan.className = 'sz-btn-main';
      mainSpan.textContent = item.sizeMain;
      button.appendChild(mainSpan);

      var visibleLabel = item.sizeMain;
      if (item.pillMeta) {
        var metaSpan = document.createElement('span');
        metaSpan.className = 'sz-btn-meta';
        metaSpan.textContent = '· ' + item.pillMeta;
        button.appendChild(metaSpan);
        visibleLabel += ' · ' + item.pillMeta;
      }

      if (hasSplitKinds && item.kindLabel) {
        button.setAttribute('aria-label', visibleLabel + ' · ' + item.kindLabel);
      }

      if (isDefault) {
        selections[groupIndex] = item;
      }

      button.addEventListener('click', function() {
        groupBlock.querySelectorAll('.sz-btn').forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        selections[groupIndex] = item;
        updateSelection();
      });

      return button;
    }

    preparedGroups.forEach(function(pg, index) {
      var block = document.createElement('div');
      block.className = 'mlh-vg';

      var head = document.createElement('div');
      head.className = 'mlh-vg-head';

      var titleP = document.createElement('p');
      titleP.className = 'mlh-vg-title';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'mlh-vg-name';
      nameSpan.textContent = formatGroupTitle(pg.group.label, preparedGroups.length);

      var choiceStrong = document.createElement('strong');
      choiceStrong.className = 'mlh-vg-choice';
      groupChoiceNodes[index] = choiceStrong;

      titleP.appendChild(nameSpan);
      titleP.appendChild(choiceStrong);
      head.appendChild(titleP);

      if (isMultiGroup) {
        var gPrice = document.createElement('span');
        gPrice.className = 'mlh-vg-price';
        head.appendChild(gPrice);
        groupPriceNodes[index] = gPrice;
      } else {
        groupPriceNodes[index] = null;
      }
      block.appendChild(head);

      if (pg.hasSplitKinds) {
        var kinds = [
          { rank: 1, title: 'Quần âu' },
          { rank: 2, title: 'Chân váy' }
        ];
        var defaultAssigned = false;
        kinds.forEach(function(kd) {
          var subItems = pg.items.filter(function(it) { return it.subRank === kd.rank; });
          if (subItems.length === 0) return;
          var splitRow = document.createElement('div');
          splitRow.className = 'mlh-vg-split';
          var kindEl = document.createElement('span');
          kindEl.className = 'mlh-vg-kind';
          kindEl.textContent = kd.title;
          var optsWrap = document.createElement('div');
          optsWrap.className = 'mlh-vg-options';
          subItems.forEach(function(item) {
            var isDef = !defaultAssigned;
            if (isDef) defaultAssigned = true;
            optsWrap.appendChild(createVariantButton(item, isDef, index, block, true));
          });
          splitRow.appendChild(kindEl);
          splitRow.appendChild(optsWrap);
          block.appendChild(splitRow);
        });
      } else {
        var buttons = document.createElement('div');
        buttons.className = 'mlh-vg-options';
        pg.items.forEach(function(item, itemIdx) {
          buttons.appendChild(createVariantButton(item, itemIdx === 0, index, block, false));
        });
        block.appendChild(buttons);
      }

      box.appendChild(block);
    });

    updateSelection();
  }

  // Card HTML template
  function createProductCardHTML(p) {
    const primaryImg = p.img || (p.images && p.images[0]) || '';
    const imgSrc = getProductImageUrl(primaryImg);
    const detailUrl = `/ko/san-pham/${encodeURIComponent(p.id)}.html`;
    const galleryCount = (p.images && p.images.length) ? p.images.length : (primaryImg ? 1 : 0);

    const badgeText = p.badge || (p.tags && p.tags[0]) || 'BỘ SƯU TẬP';
    const priceText = productPrice(p);
    const oldPriceText = p.oldPrice ? formatMoney(p.oldPrice) : '';

    return `
      <div class="vn-card group cursor-pointer" onclick="location.href='${detailUrl}'">
        <div class="vn-thumb" style="position: relative;">
          ${badgeText ? `<span class="vn-badge">${escapeHtml(badgeText)}</span>` : ''}
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" decoding="async" loading="lazy" onerror="this.onerror=null; this.src='/images/logo.webp';">
          ${galleryCount > 1 ? `<span style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.6); color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; z-index:5;">📷 ${galleryCount}</span>` : ''}
        </div>
        <div class="vn-info">
          <div class="vn-sku-row" style="margin-bottom: 4px;">
            <span class="vn-sku-badge" style="font-size:10px; font-weight:700; color:#fff; background:#9d0208; padding:2px 6px; border-radius:4px;">MÃ: ${escapeHtml(p.sku || p.id)}</span>
          </div>
          <h3 class="vn-card-name" style="font-weight:700; font-size:14px; margin-bottom:6px; color:#111; line-height:1.35;"><a href="${detailUrl}" style="color:inherit;text-decoration:none;">${escapeHtml(p.name)}</a></h3>
          <div class="vn-price-row" style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <span class="vn-price" style="color:#9d0208; font-weight:800; font-size:15px;">${priceText}</span>
            ${oldPriceText ? `<span class="vn-old-price" style="color:#a8a29e; font-size:12px; text-decoration:line-through;">${oldPriceText}</span>` : ''}
          </div>
          <a href="${detailUrl}" class="vn-cta" onclick="event.stopPropagation();" style="width:100%; border:1px solid #9d0208; background:#fff; color:#9d0208; font-weight:700; font-size:11px; text-transform:uppercase; padding:8px 0; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; transition:all .2s; text-decoration:none;" onmouseover="this.style.background='#9d0208'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#9d0208';">
            <span class="material-symbols-outlined text-sm">visibility</span> Xem Chi Tiết
          </a>
        </div>
      </div>
    `;
  }

  // Export to window
  window.escapeHtml = escapeHtml;
  window.formatMoney = formatMoney;
  window.getProductImageUrl = getProductImageUrl;

  window.MLH_API = {
    ADMIN_API_BASE,
    formatMoney,
    productPrice,
    renderStockDetail,
    getProductImageUrl,
    dedupeProductImages,
    resolveLegacyProductId,
    escapeHtml,
    fetchProducts: fetchProductsFromAPI,
    fetchProductDetail: fetchProductDetailFromAPI,
    renderSkeletonGrid,
    renderEmptyState,
    renderErrorState,
    createProductCardHTML
  };

})(window);
