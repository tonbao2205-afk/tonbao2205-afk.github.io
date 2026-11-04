(function () {
  'use strict';

  const container = document.getElementById('vip-profile-container');
  if (!container) return;
  const lang = container.dataset.lang === 'en' ? 'en' : 'vi';
  const TEXT = {
    vi: {
      locale: 'vi-VN', refreshFailed: 'Chưa tải được cập nhật mới nhất.', progress: 'Lộ trình tiến độ đơn hàng', cancelled: 'ĐƠN HÀNG ĐÃ HỦY',
      recorded: 'Đã ghi nhận', inProgress: 'Đang thực hiện', pending: 'Chờ thực hiện', updating: 'Đang cập nhật',
      httpError: status => 'Chưa tải được cập nhật mới nhất (Mã ' + status + '). Vui lòng thử lại sau.',
      offline: 'Kết nối gián đoạn. Chưa tải được cập nhật mới nhất.',
      stages: { measurement_confirmed: 'Chốt số đo', sewing: 'Đang may', shipped: 'Đã gửi hàng', received: 'Đã nhận hàng', ready_delivery: 'Sẵn sàng giao', delivered: 'Đã giao', cancelled: 'Đã hủy' }
    },
    en: {
      locale: 'en-GB', refreshFailed: 'Could not load the latest update.', progress: 'Order progress', cancelled: 'ORDER CANCELLED',
      recorded: 'Recorded', inProgress: 'In progress', pending: 'Pending', updating: 'Updating',
      httpError: status => 'Could not load the latest update (code ' + status + '). Please try again later.',
      offline: 'Connection interrupted. Could not load the latest update.',
      stages: { measurement_confirmed: 'Measurements confirmed', sewing: 'Sewing', shipped: 'Shipped', received: 'Received', ready_delivery: 'Ready for handover', delivered: 'Delivered', cancelled: 'Cancelled' }
    }
  }[lang];

  // cm/inch switch: every length value keeps its original text in data-cm; numbers inside it are converted.
  const UNIT_KEY = 'mlh_vip_unit';
  function toInches(text) {
    return String(text).replace(/\d+(?:[.,]\d+)?/g, match => {
      const cm = Number(match.replace(',', '.'));
      if (!Number.isFinite(cm) || cm <= 0 || cm > 300) return match;
      return String(Math.round(cm / 2.54 * 10) / 10);
    });
  }
  function heightToInches(text) {
    const metres = String(text).trim().match(/^(\d)\s*m\s*(\d{1,2})$/i);
    if (metres) return toInches(String(Number(metres[1]) * 100 + Number(metres[2].padEnd(2, '0'))));
    return toInches(text);
  }
  function applyUnit(unit) {
    const inches = unit === 'in';
    document.querySelectorAll('[data-cm]').forEach(el => {
      const label = el.parentElement && el.parentElement.querySelector('.measure-label');
      const isHeight = label && (label.textContent === 'Chiều Cao' || label.textContent === 'Height');
      // Height sits in the General group, which has no unit heading, so it carries its own unit.
      el.textContent = inches ? (isHeight ? heightToInches(el.dataset.cm) + ' in' : toInches(el.dataset.cm)) : el.dataset.cm;
    });
    document.querySelectorAll('[data-unit-tag]').forEach(el => { el.textContent = inches ? 'inch' : 'cm'; });
    document.querySelectorAll('.unit-switch button[data-unit]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.unit === unit)));
  }
  let savedUnit = 'cm';
  try { if (localStorage.getItem(UNIT_KEY) === 'in') savedUnit = 'in'; } catch (_) {}
  applyUnit(savedUnit);
  document.querySelectorAll('.unit-switch button[data-unit]').forEach(btn => btn.addEventListener('click', () => {
    const unit = btn.dataset.unit === 'in' ? 'in' : 'cm';
    applyUnit(unit);
    try { localStorage.setItem(UNIT_KEY, unit); } catch (_) {}
  }));

  const token = container.dataset.token;
  if (!token || !/^[A-Za-z0-9_-]{32}$/.test(token)) return;

  let timer = null;
  let activeSeq = 0;
  let inFlight = false, controller = null, backoffUntil = 0;

  const alertBox = document.getElementById('vip-refresh-alert');
  const alertText = document.getElementById('vip-refresh-alert-text');
  const retryBtn = document.getElementById('vip-refresh-retry-btn');

  function showError(msg) {
    if (alertBox && alertText) {
      alertText.textContent = msg || TEXT.refreshFailed;
      alertBox.style.display = 'flex';
    }
  }

  function hideError() {
    if (alertBox) alertBox.style.display = 'none';
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => fetchUpdate());
  }

  const stageClassMap = {
    sewing: 'stage-sewing',
    measurement_confirmed: 'stage-measurement_confirmed',
    ready_delivery: 'stage-ready_delivery',
    shipped: 'stage-ready_delivery',
    received: 'stage-ready_delivery',
    delivered: 'stage-delivered',
    cancelled: 'stage-cancelled'
  };

  function sourceTime(value) {
    if (typeof value !== 'string' || !value) return NaN;
    return Date.parse(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value) ? value + '+07:00' : value);
  }

  function formatDateTime(v) {
    const d = new Date(sourceTime(v));
    if (!Number.isFinite(d.getTime())) return null;
    const time = d.toLocaleTimeString(TEXT.locale, { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });
    const date = d.toLocaleDateString(TEXT.locale, { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' });
    return date + ' · ' + time;
  }

  function updateOrderInDom(orderData) {
    const card = document.querySelector(`.order-card[data-order-code="${CSS.escape(orderData.code)}"]`);
    if (!card) return;

    // 1. Update Stage Badge
    const badge = card.querySelector('.stage-badge');
    const badgeText = card.querySelector('.stage-badge-text');
    if (badge && badgeText) {
      badgeText.textContent = TEXT.stages[orderData.stage_code] || (lang === 'vi' ? orderData.stage : TEXT.updating);
      badge.className = 'stage-badge ' + (stageClassMap[orderData.stage_code] || 'stage-default');
    }


    const wrap = card.querySelector('.order-timeline-wrap'); if (!wrap) return;
    wrap.textContent = '';
    const title = document.createElement('div'); title.className = 'section-label'; title.textContent = TEXT.progress; wrap.appendChild(title);
    if (orderData.stage_code === 'cancelled') {
      const notice = document.createElement('div'); notice.className = 'timeline-cancelled-notice'; notice.textContent = TEXT.cancelled; wrap.appendChild(notice); return;
    }
    const list = document.createElement('div'); list.className = 'timeline-stepper';
    const definitions = ['measurement_confirmed', 'sewing', 'shipped', 'received', 'ready_delivery', 'delivered'];
    definitions.forEach((code, index) => {
      const label = TEXT.stages[code];
      const event = (orderData.stage_history || []).filter(e => e.stage_code === code).at(-1);
      const current = orderData.stage_code === code;
      const step = document.createElement('div'); step.dataset.stepCode = code;
      step.className = 'timeline-step ' + (current ? 'step-current' : event ? 'step-completed' : 'step-pending');
      const header = document.createElement('div'); header.className = 'step-node-header';
      const icon = document.createElement('span'); icon.className = 'step-icon-badge'; icon.textContent = event ? '✓' : index + 1;
      const name = document.createElement('span'); name.className = 'step-label'; name.textContent = label;
      header.append(icon,name); step.appendChild(header);
      const time = document.createElement('div'); time.className = 'step-time'; time.textContent = event ? formatDateTime(event.changed_at) || TEXT.recorded : current ? TEXT.inProgress : TEXT.pending;
      step.appendChild(time); list.appendChild(step);
    });
    wrap.appendChild(list);
  }

  async function fetchUpdate() {
    if (inFlight || document.hidden || Date.now() < backoffUntil) return;
    inFlight = true;
    const seq = ++activeSeq; const abort = new AbortController(); controller = abort;

    try {
      const res = await fetch('/api/public/qr/' + encodeURIComponent(token), {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store', signal: abort.signal
      });

      if (seq !== activeSeq) return;

      if (res.status === 429) backoffUntil = Date.now() + 60000;
      if (!res.ok) {
        showError(TEXT.httpError(res.status));
        return;
      }

      const data = await res.json();
      if (seq !== activeSeq) return;

      hideError();

      if (Array.isArray(data.orders)) {
        const codes = new Set(data.orders.map(o => o.code));
        document.querySelectorAll('.order-card[data-order-code]').forEach(card => { if (!codes.has(card.dataset.orderCode)) card.remove(); });
        if (data.orders.some(o => !document.querySelector(`.order-card[data-order-code="${CSS.escape(o.code)}"]`))) { location.reload(); return; }
        data.orders.forEach(updateOrderInDom);
      }
    } catch (err) {
      if (seq === activeSeq && err.name !== 'AbortError') {
        showError(TEXT.offline);
      }
    } finally {
      if (controller === abort) { controller = null; inFlight = false; }
    }
  }

  function startPolling() {
    stopPolling();
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUpdate();
      }
    }, 15000);
  }

  function stopPolling() {
    activeSeq++; if (controller) controller.abort(); controller = null; inFlight = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchUpdate();
      startPolling();
    } else {
      stopPolling();
    }
  });

  window.addEventListener('pagehide', stopPolling);
  window.addEventListener('beforeunload', stopPolling);

  // Start polling
  startPolling();
})();
