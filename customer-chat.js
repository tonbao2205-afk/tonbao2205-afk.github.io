(function () {
  'use strict';

  const root = document.getElementById('customer-chat-app');
  if (!root) return;
  const token = root.dataset.token;
  if (!token || !/^[A-Za-z0-9_-]{32}$/.test(token)) return;

  // State held strictly in memory - NEVER written to localStorage/sessionStorage/IndexedDB/cookies
  const state = {
    conversationId: null,
    expiresAt: null,
    clockSkew: 0,
    messages: [],
    pollSeq: 0,
    inFlight: false,
    isExpired: false,
    isBackoff: false,
    backoffUntil: 0
  };

  const messagesList = document.getElementById('chat-messages-list');
  const messagesScrollWrap = document.getElementById('chat-messages-container');
  const expiryTimerText = document.getElementById('chat-expiry-timer-text');
  const emptyState = document.getElementById('chat-empty-state');
  const expiredNotice = document.getElementById('chat-expired-notice');
  const loadingSpinner = document.getElementById('chat-loading-spinner');
  const errorBar = document.getElementById('chat-error-bar');
  const inputText = document.getElementById('chat-input-text');
  const sendBtn = document.getElementById('chat-send-btn');
  const charCounter = document.getElementById('chat-char-counter');

  let pollTimer = null;
  let countdownTimer = null;

  function showError(msg) {
    if (errorBar) {
      errorBar.textContent = msg;
      errorBar.style.display = 'block';
    }
  }

  function hideError() {
    if (errorBar) {
      errorBar.textContent = '';
      errorBar.style.display = 'none';
    }
  }

  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (!Number.isFinite(d.getTime())) return '';
    return d.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function scrollToBottom() {
    if (messagesScrollWrap) {
      messagesScrollWrap.scrollTop = messagesScrollWrap.scrollHeight;
    }
  }

  function updateCharCount() {
    if (!inputText || !charCounter) return;
    const len = inputText.value.length;
    charCounter.textContent = `${len.toLocaleString('vi-VN')} / 2.000`;
    if (sendBtn) {
      sendBtn.disabled = len === 0 || len > 2000 || state.isBackoff || state.sending || state.dead;
    }
  }

  function renderMessages(messages) {
    if (!messagesList) return;

    // Synchronize DOM with current message list
    messagesList.textContent = '';

    if (!messages || messages.length === 0) {
      if (emptyState && !state.isExpired) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    messages.forEach(msg => {
      const row = document.createElement('div');
      row.className = 'chat-msg-row ' + (msg.sender === 'customer' ? 'msg-customer' : 'msg-shop');

      const label = document.createElement('div');
      label.className = 'msg-sender-label';
      label.textContent = msg.sender === 'customer' ? 'Quý khách' : 'mayLEHUONG';
      row.appendChild(label);

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = msg.text || ''; // Strict textContent protection against XSS
      row.appendChild(bubble);

      const meta = document.createElement('div');
      meta.className = 'msg-meta-row';
      const timeSpan = document.createElement('span');
      timeSpan.textContent = formatTime(msg.created_at);
      meta.appendChild(timeSpan);
      row.appendChild(meta);

      messagesList.appendChild(row);
    });

    scrollToBottom();
  }


  let controller = null, generation = 0;
  state.sending = false; state.dead = false; state.pending = null;
  function invalidate() { generation++; state.pollSeq++; if (controller) controller.abort(); controller = null; state.inFlight = false; }
  function wipeExpiredSession() {
    invalidate(); state.isExpired = true; state.conversationId = null; state.expiresAt = null;
    state.messages = []; state.pending = null;
    inputText.value = ''; renderMessages([]); updateCharCount();
    if (emptyState) emptyState.style.display = 'none';
    if (expiredNotice) expiredNotice.style.display = 'block';
    if (expiryTimerText) expiryTimerText.textContent = 'Cuộc trò chuyện đã hết hạn sau 2 giờ không có tin mới.';
  }
  function triggerBackoff(seconds) { state.isBackoff = true; state.backoffUntil = Date.now() + seconds * 1000; updateCharCount(); }
  function updateCountdown() {
    if (state.isBackoff && Date.now() >= state.backoffUntil) { state.isBackoff = false; hideError(); updateCharCount(); }
    if (!state.expiresAt) return;
    const seconds = Math.ceil((Date.parse(state.expiresAt) - Date.now() - state.clockSkew) / 1000);
    if (seconds <= 0) { wipeExpiredSession(); return; }
    expiryTimerText.textContent = `Thời gian duy trì còn: ${Math.floor(seconds / 3600)}h ${String(Math.floor(seconds % 3600 / 60)).padStart(2,'0')}p ${String(seconds % 60).padStart(2,'0')}s`;
  }
  function applyResponseData(data) {
    state.clockSkew = Date.parse(data.server_time) - Date.now();
    if (!data.conversation_id || Date.parse(data.expires_at) <= Date.now() + state.clockSkew) {
      if (state.conversationId || state.isExpired) wipeExpiredSession();
      return;
    }
    state.conversationId = data.conversation_id; state.expiresAt = data.expires_at; state.isExpired = false;
    if (expiredNotice) expiredNotice.style.display = 'none';
    state.messages = data.messages || []; renderMessages(state.messages); updateCountdown();
  }
  async function request(suffix, body, signal) {
    const res = await fetch(`/api/public/qr/${encodeURIComponent(token)}/chat${suffix}`, {
      method: body === undefined ? 'GET' : 'POST', cache: 'no-store', signal,
      headers: { Accept: 'application/json', ...(body === undefined ? {} : {'Content-Type':'application/json'}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const error = new Error(data.message || 'Không thể tải tin nhắn'); error.status = res.status; throw error; }
    return data;
  }
  async function pollMessages() {
    if (state.dead || state.inFlight || state.sending || state.isBackoff || document.hidden) return;
    state.inFlight = true; const seq = generation; const abort = new AbortController(); controller = abort;
    try {
      const data = await request('', undefined, abort.signal);
      if (seq !== generation || document.hidden || state.dead) return;
      hideError(); applyResponseData(data);
    } catch (error) {
      if (seq !== generation || error.name === 'AbortError') return;
      if (error.status === 429) triggerBackoff(60);
      if (error.status === 404) { wipeExpiredSession(); state.dead = true; updateCharCount(); }
      showError(error.message);
    } finally { if (controller === abort) { controller = null; state.inFlight = false; } }
  }
  async function sendMessage() {
    updateCountdown();
    const text = inputText.value.trim();
    if (!text || text.length > 2000 || state.sending || state.dead || state.isBackoff || document.hidden) return;
    state.sending = true; invalidate(); const seq = generation; updateCharCount(); hideError();
    try {
      if (!state.conversationId) {
        const data = await request('/session', {});
        if (seq !== generation || document.hidden || state.dead) return;
        applyResponseData(data);
      }
      if (!state.conversationId) return;
      if (!state.pending || state.pending.text !== text || state.pending.conversation_id !== state.conversationId) {
        state.pending = { conversation_id: state.conversationId, client_message_id: generateUUID(), text };
      }
      const result = await request('/messages', state.pending);
      if (seq !== generation || document.hidden || state.dead) return;
      state.pending = null; if (inputText.value.trim() === text) inputText.value = '';
      applyResponseData(result);
    } catch (error) {
      if (seq !== generation) return;
      if (error.status === 409) { wipeExpiredSession(); showError('Cuộc trò chuyện đã hết hạn hoặc thay đổi. Hãy nhập tin mới để bắt đầu lại.'); }
      else { if (error.status === 429) triggerBackoff(60); if (error.status === 404) { wipeExpiredSession(); state.dead = true; } showError(error.message); }
    } finally { state.sending = false; updateCharCount(); }
  }
  function stopPolling() { clearInterval(pollTimer); pollTimer = null; invalidate(); }
  function startPolling() { clearInterval(pollTimer); if (!state.dead && !document.hidden) pollTimer = setInterval(pollMessages, 5000); }
  inputText.addEventListener('input', updateCharCount);
  inputText.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  sendBtn.addEventListener('click', sendMessage);
  document.addEventListener('visibilitychange', () => {
    updateCountdown();
    if (document.hidden) { stopPolling(); state.messages = []; messagesList.textContent = ''; }
    else { pollMessages(); startPolling(); }
  });
  window.addEventListener('pagehide', () => { stopPolling(); clearInterval(countdownTimer); countdownTimer = null; state.messages = []; state.pending = null; inputText.value = ''; messagesList.textContent = ''; });
  window.addEventListener('pageshow', () => { if (!countdownTimer) countdownTimer = setInterval(updateCountdown, 1000); pollMessages(); startPolling(); });
  countdownTimer = setInterval(updateCountdown, 1000);
  pollMessages(); startPolling();
})();
