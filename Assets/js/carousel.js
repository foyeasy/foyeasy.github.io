/* ═══════════════════════════════════════════════════════════════
   carousel.js: home-page "Featured Work" carousel
   Markup comes from index.html (reads slides from _data/projects.yml).
   Features: arrows, dots, swipe on phones, keyboard arrows, pause button,
   pause on hover/focus/hidden tab/off-screen, and NO autoplay for visitors
   who prefer reduced motion.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.getElementById('featuredCarousel');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.featured-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.featured-dot'));
  var prevBtn = root.querySelector('.featured-arrow.prev');
  var nextBtn = root.querySelector('.featured-arrow.next');
  var total = slides.length;
  if (total < 2) {
    // nothing to rotate: hide the controls
    [prevBtn, nextBtn, root.querySelector('.featured-dots')].forEach(function (el) { if (el) el.hidden = true; });
    return;
  }

  var INTERVAL = 6000;
  var ui = window.SiteUI || {};
  var reduceMotion = ui.reduceMotion || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var current = 0;
  var timer = null;
  var userPaused = !!reduceMotion;   // reduced motion = starts paused, user can press play
  var hoverPaused = false;
  var hiddenPaused = false;          // tab hidden or carousel off-screen

  /* ───────── show a slide ───────── */
  function show(n) {
    current = (n + total) % total;
    slides.forEach(function (s, i) {
      var active = i === current;
      s.classList.toggle('active', active);
      if (active) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
    });
    dots.forEach(function (d, i) {
      var active = i === current;
      d.classList.toggle('active', active);
      if (active) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }

  /* ───────── autoplay ───────── */
  function shouldPlay() { return !userPaused && !hoverPaused && !hiddenPaused; }

  function stop() { clearInterval(timer); timer = null; }

  function start() {
    stop();
    if (!shouldPlay()) return;
    timer = setInterval(function () { show(current + 1); }, INTERVAL);
    // live region: don't announce every auto-rotation to screen readers
    root.setAttribute('aria-live', 'off');
  }

  function go(n) {
    show(n);
    start();                       // restart the countdown after any manual move
    root.setAttribute('aria-live', 'polite');   // announce when the user changed the slide
  }

  /* ───────── controls ───────── */
  if (prevBtn) prevBtn.addEventListener('click', function () { go(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(current + 1); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });

  // keyboard: left/right arrows while focus is anywhere inside the carousel
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
  });

  // swipe on touch screens (left swipe = next)
  if (ui.onSwipe) {
    ui.onSwipe(root.querySelector('.featured-slides'), {
      left: function () { go(current + 1); },
      right: function () { go(current - 1); }
    });
  }

  /* ───────── pause / play button (created here, so it never exists without JS) ───────── */
  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'featured-arrow';
  // reuse the arrow look, but pin it to the top-right corner
  toggle.style.cssText = 'top:12px;right:12px;transform:none;width:36px;height:36px;font-size:13px;';
  function renderToggle() {
    toggle.innerHTML = userPaused ? '&#9654;' : '&#10074;&#10074;';
    toggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  }
  toggle.addEventListener('click', function () {
    userPaused = !userPaused;
    renderToggle();
    start();
  });
  renderToggle();
  root.appendChild(toggle);

  /* ───────── automatic pausing ───────── */
  // hover or keyboard focus inside the carousel
  root.addEventListener('mouseenter', function () { hoverPaused = true; start(); });
  root.addEventListener('mouseleave', function () { hoverPaused = false; start(); });
  root.addEventListener('focusin', function () { hoverPaused = true; start(); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) { hoverPaused = false; start(); }
  });

  // background tab
  var tabHidden = false, offScreen = false;
  function updateHidden() { hiddenPaused = tabHidden || offScreen; start(); }

  document.addEventListener('visibilitychange', function () {
    tabHidden = document.hidden;
    updateHidden();
  });

  // scrolled out of view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      offScreen = !entries[0].isIntersecting;
      updateHidden();
    }, { threshold: 0.2 }).observe(root);
  }

  /* ───────── go ───────── */
  show(0);
  start();
})();
