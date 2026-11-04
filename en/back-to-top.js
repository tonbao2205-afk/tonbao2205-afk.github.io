/* back-to-top.js — floating scroll-to-top button, all pages */
(function () {
  // Build button
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.title = 'V\u1EC1 \u0111\u1EA7u trang';
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 14V4M4 9l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var _mob = window.innerWidth < 768;
  var _sz  = _mob ? '42px' : '44px';
  var _bot = _mob ? '20px' : '20px';
  var _right = _mob ? '14px' : '28px';
  btn.style.cssText = [
    'position:fixed',
    'bottom:' + _bot,
    'right:' + _right,
    'width:' + _sz,
    'height:' + _sz,
    'background:rgba(22,19,16,0.92)',
    'border:1px solid rgba(230,195,100,0.45)',
    'color:#e6c364',
    'cursor:pointer',
    'z-index:9990',
    'opacity:0',
    'pointer-events:none',
    'transition:opacity .3s,background .2s,border-color .2s',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'border-radius:10px',
    'box-shadow:0 4px 16px rgba(0,0,0,0.55)',
    'backdrop-filter:blur(6px)'
  ].join(';');

  /* Responsive: size and position alignment */
  window.addEventListener('resize', function () {
    var isMob = window.innerWidth < 768;
    btn.style.width  = isMob ? '42px' : '44px';
    btn.style.height = isMob ? '42px' : '44px';
    btn.style.right  = isMob ? '14px' : '28px';
    btn.style.bottom = '20px';
  }, { passive: true });

  document.body.appendChild(btn);

  // Show / hide on scroll
  window.addEventListener('scroll', function () {
    var visible = window.scrollY > 380;
    btn.style.opacity = visible ? '1' : '0';
    btn.style.pointerEvents = visible ? 'auto' : 'none';
  }, { passive: true });

  // Click → scroll to top
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Hover styles
  btn.addEventListener('mouseenter', function () {
    btn.style.background = '#9d0208';
    btn.style.borderColor = '#9d0208';
    btn.style.color = '#fff';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.background = 'rgba(22,19,16,0.92)';
    btn.style.borderColor = 'rgba(230,195,100,0.45)';
    btn.style.color = '#e6c364';
  });
})();
