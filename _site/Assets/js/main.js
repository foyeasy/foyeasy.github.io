/* ═══════════════════════════════════════════════════════════════
   main.js: site-wide behavior (loaded on every page)
   Theme toggle · mobile menu · scroll effects · accordions · toast · swipe helper
   Page-specific scripts (carousel, gallery, publications) load separately
   and use the helpers exported at the bottom (window.SiteUI).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── helpers ───────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
  }
  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /* ───────── toast (small confirmation message) ───────── */
  var toastEl, toastTimer;
  function toast(message, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // force a reflow so the transition replays when called twice quickly
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2200);
  }

  /* ───────── swipe helper (used by the carousel + gallery) ─────────
     onSwipe(element, { left: fn, right: fn })
     "left" fires when the finger moves left (= go to NEXT slide). */
  function onSwipe(el, handlers) {
    if (!el) return;
    var startX = 0, startY = 0, tracking = false;
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      // must be a clear horizontal swipe, so vertical page scrolling is never hijacked
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0 && handlers.left) handlers.left();
      if (dx > 0 && handlers.right) handlers.right();
    }, { passive: true });
  }

  /* ───────── theme toggle (remembers the choice) ───────── */
  var themeBtn = $('#themeToggle');
  var themeMeta = $('meta[name="theme-color"]');

  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) store('theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#172A82' : '#1546D9');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  applyTheme(currentTheme(), false);   // sync button label + meta with what head.html already set

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  // If the visitor never chose, follow their system setting live.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (e) {
      if (!load('theme')) applyTheme(e.matches ? 'dark' : 'light', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  /* ───────── mobile menu ───────── */
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');

  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setMenu(!navLinks.classList.contains('open'));
    });
    // close after choosing a link
    $$('a', navLinks).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    // Escape closes and returns focus to the button
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
    // click outside closes
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('open') && !e.target.closest('#mainNav')) setMenu(false);
    });
    // resizing up to desktop resets the menu
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) setMenu(false);
    });
  }

  /* ───────── scroll effects: navbar shadow + back-to-top ───────── */
  var nav = $('#mainNav');
  var btt = $('#btt');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 15);
    if (btt) btt.classList.toggle('show', y > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (btt) {
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var skip = $('.skip-link');
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ───────── scroll-in animation ───────── */
  var animated = $$('.anim');
  if (animated.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
      animated.forEach(function (el, i) {
        el.style.transitionDelay = (i % 6) * 0.06 + 's';
        io.observe(el);
      });
    } else {
      animated.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ───────── accordions (research cards, education, projects) ─────────
     Markup: <button data-accordion aria-expanded="false"> inside an element
     with class .tl-item or .proj-item. Clicking toggles .open on that element. */
  $$('[data-accordion]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.tl-item, .proj-item');
      if (!item) return;
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ───────── "Show all / Show less" for the courses list ─────────
     Markup: <button data-courses-toggle data-target="courseList"
                     data-more="Show all" data-less="Show less"> */
  $$('[data-courses-toggle]').forEach(function (btn) {
    var list = document.getElementById(btn.getAttribute('data-target'));
    if (!list) return;
    var more = btn.getAttribute('data-more') || 'Show all';
    var less = btn.getAttribute('data-less') || 'Show less';
    btn.addEventListener('click', function () {
      var expanded = list.classList.toggle('expanded');
      btn.textContent = expanded ? less : more;
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });

  /* ───────── current year (optional: <span data-current-year></span>) ─────────
     NOTE: deliberately NOT "data-year", because publication cards use data-year
     for the year filter and must never be overwritten. */
  $$('[data-current-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ───────── share helpers with other scripts ───────── */
  window.SiteUI = {
    $: $,
    $$: $$,
    toast: toast,
    onSwipe: onSwipe,
    reduceMotion: reduceMotion,
    store: store,
    load: load
  };
})();
