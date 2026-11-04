/* cta-widget.js — Unified Collapsible CTA Contact Widget for mayLEHUONG
 * - Closed state: Perfect circular button with white background, gold border, centered logo.
 * - Open state: Clear close icon (✕), darkened blur overlay, upward contact items.
 * - Robust state machine: Full cleanup of timers on rapid clicks, singleton guard,
 *   keyboard accessibility (Escape key), click-outside dismiss, mobile safe spacing.
 */
(function () {
  'use strict';

  // Singleton guard: Ensure only one instance exists per page
  if (document.getElementById('cta-widget')) {
    return;
  }

  /* ── Contact Links (Preserve exact original URLs) ── */
  var CONTACTS = [
    {
      label: 'Google Maps',
      href: 'https://maps.app.goo.gl/FeAS2gpS5ceTvait7',
      color: '#EA4335',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/LhVeston/',
      color: '#1877F2',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>'
    },
    {
      label: 'Zalo',
      href: 'https://zalo.me/0948954848',
      color: '#0068FF',
      svg: '<svg viewBox="0 0 48 48" fill="currentColor" width="24" height="24"><path d="M24 4C13 4 4 13 4 24c0 5.27 2.03 10.06 5.34 13.64L7 44l6.65-2.29A19.9 19.9 0 0 0 24 44c11 0 20-9 20-20S35 4 24 4zm9.5 26.5l-2.5-1.5c-.5-.3-.8-.4-1.1.1-.4.6-1.4 1.7-1.7 2-.3.3-.6.4-1.1.1-4.5-2.25-7.5-6-8-8.5-.1-.5 0-.8.4-1.1.4-.3 1-.9 1.4-1.4.3-.4.4-.7.1-1.2l-2-4.5c-.2-.5-.5-.5-1-.5-.4 0-1 0-1.5.5S14 16.5 14 19c0 2.4 1.5 5 2.5 6.5 2 3 5 7.5 11 9.5 2 .6 3.5.7 5 .4 1.6-.3 2.5-1.2 3.5-2.5.7-1 .5-1.9 0-2.4z"/></svg>'
    },
    {
      label: '0948 954 848',
      href: 'tel:0948954848',
      color: '#22c55e',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'
    }
  ];

  /* ── Hide legacy floating buttons ── */
  function hideOldButtons() {
    var selectors = [
      '.lux-zalo-btn',
      'a[href="tel:0948954848"][style*="position: fixed"]',
      'a[href="tel:0948954848"][style*="position:fixed"]',
      '.zalo-chat-widget',
      '#lhv-zalo-btn', '#lhv-phone-btn', '#lhv-mobile-btn'
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.display = 'none';
        el.setAttribute('data-cta-replaced', '1');
      });
    });
  }

  function initWidget() {
    hideOldButtons();

    // Check again to avoid race conditions during DOM construction
    if (document.getElementById('cta-widget')) return;

    /* ── 1. Create Overlay ── */
    var overlay = document.getElementById('cta-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cta-overlay';
      overlay.className = 'cta-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    /* ── 2. Create Widget Container ── */
    var wrap = document.createElement('div');
    wrap.id = 'cta-widget';
    wrap.className = 'cta-container';
    document.body.appendChild(wrap);

    /* ── 3. Menu Box (expands upward) ── */
    var menuBox = document.createElement('div');
    menuBox.className = 'cta-menu';
    menuBox.setAttribute('role', 'menu');
    menuBox.setAttribute('aria-label', 'Danh sách liên hệ mayLEHUONG');
    menuBox.setAttribute('inert', '');
    menuBox.setAttribute('aria-hidden', 'true');
    wrap.appendChild(menuBox);

    /* ── 4. Toggle Button & Pulse Wrapper ── */
    var toggleWrap = document.createElement('div');
    toggleWrap.className = 'cta-toggle-wrapper cta-pulse';

    var toggle = document.createElement('button');
    toggle.id = 'cta-toggle';
    toggle.className = 'cta-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Mở menu liên hệ mayLEHUONG');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');

    var logoImg = document.createElement('img');
    logoImg.src = '/images/Logo Lê Hương Web.png';
    logoImg.alt = 'Logo mayLEHUONG';
    logoImg.className = 'cta-logo-img';

    var closeIcon = document.createElement('span');
    closeIcon.className = 'cta-close-icon';
    closeIcon.innerHTML = '&times;';
    closeIcon.setAttribute('aria-hidden', 'true');

    toggle.appendChild(logoImg);
    toggle.appendChild(closeIcon);
    toggleWrap.appendChild(toggle);
    wrap.appendChild(toggleWrap);

    /* ── 5. Contact Rows ── */
    var iconRows = [];
    CONTACTS.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'cta-row';
      row.setAttribute('role', 'none');

      var lbl = document.createElement('span');
      lbl.className = 'cta-label';
      lbl.textContent = c.label;

      var btn = document.createElement('a');
      btn.className = 'cta-btn';
      btn.href = c.href;
      btn.target = c.href.startsWith('tel:') ? '_self' : '_blank';
      btn.rel = 'noopener noreferrer';
      btn.setAttribute('role', 'menuitem');
      btn.setAttribute('aria-label', c.label);
      btn.style.backgroundColor = c.color;
      btn.innerHTML = c.svg;

      row.appendChild(lbl);
      row.appendChild(btn);
      menuBox.appendChild(row);
      iconRows.push(row);
    });

    /* ── 6. State Management with Complete Timer Cleanup ── */
    var isOpen = false;
    var openTimers = [];

    function clearAllTimers() {
      if (openTimers.length > 0) {
        for (var i = 0; i < openTimers.length; i++) {
          clearTimeout(openTimers[i]);
        }
        openTimers = [];
      }
    }

    function openWidget() {
      clearAllTimers();
      isOpen = true;
      menuBox.removeAttribute('inert');
      menuBox.setAttribute('aria-hidden', 'false');

      // Overlay state
      overlay.classList.add('is-active');
      overlay.setAttribute('aria-hidden', 'false');

      // Toggle button state
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Đóng menu liên hệ');
      toggleWrap.classList.remove('cta-pulse');

      // Staggered reveal of contact rows
      iconRows.forEach(function (row, idx) {
        var timer = setTimeout(function () {
          if (isOpen) {
            row.classList.add('is-visible');
          }
        }, idx * 45);
        openTimers.push(timer);
      });

      // Hide back-to-top when CTA menu is open
      var btt = document.getElementById('back-to-top');
      if (btt) {
        btt.style.opacity = '0';
        btt.style.pointerEvents = 'none';
      }
      hideOldButtons();
    }

    function closeWidget() {
      clearAllTimers();
      isOpen = false;
      if (menuBox.contains(document.activeElement)) toggle.focus();
      menuBox.setAttribute('inert', '');
      menuBox.setAttribute('aria-hidden', 'true');

      // Overlay state
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');

      // Toggle button state: reverts 100% to clean initial round appearance
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Mở menu liên hệ mayLEHUONG');
      toggleWrap.classList.add('cta-pulse');

      // Immediately hide all rows
      iconRows.forEach(function (row) {
        row.classList.remove('is-visible');
      });

      // Restore back-to-top button if scrolled
      var btt = document.getElementById('back-to-top');
      if (btt && window.scrollY > 380) {
        btt.style.opacity = '1';
        btt.style.pointerEvents = 'auto';
      }
    }

    // Toggle button click
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isOpen) {
        closeWidget();
      } else {
        openWidget();
      }
    });

    // Dismiss on overlay click
    overlay.addEventListener('click', function () {
      if (isOpen) closeWidget();
    });

    // Dismiss on click outside widget
    document.addEventListener('click', function (e) {
      if (isOpen && !wrap.contains(e.target) && e.target !== overlay) {
        closeWidget();
      }
    });

    // Dismiss on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeWidget();
        toggle.focus();
      }
    });

    // Periodic safety check to hide late-rendered legacy buttons
    setTimeout(hideOldButtons, 600);
    setTimeout(hideOldButtons, 1800);
  }

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
