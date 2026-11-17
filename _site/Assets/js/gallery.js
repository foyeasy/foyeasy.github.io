/* ═══════════════════════════════════════════════════════════════
   gallery.js: image pop-up (lightbox) for the Research and Work pages
   Works with _includes/gallery-modal.html and any markup like:
     <div class="thumb-grid" data-gallery data-gallery-title="Project name">
       <button class="thumb"><img src="…" alt="…"></button> …
     </div>
   Features: arrows, dots, swipe, keyboard (Esc, ←, →), focus trap,
   focus returns to the thumbnail you clicked, page scroll locked while open.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var overlay = document.getElementById('galleryModal');
  if (!overlay) return;

  var titleEl = document.getElementById('galleryModalTitle');
  var slidesEl = document.getElementById('galleryModalSlides');
  var dotsEl = document.getElementById('galleryModalDots');
  var statusEl = document.getElementById('galleryStatus');
  var closeBtn = document.getElementById('galleryClose');
  var prevBtn = document.getElementById('galleryPrev');
  var nextBtn = document.getElementById('galleryNext');
  var carouselEl = overlay.querySelector('.modal-carousel');

  var slides = [];      // slide elements
  var dots = [];        // dot buttons
  var items = [];       // [{src, alt}]
  var current = 0;
  var lastFocus = null; // element to return focus to on close

  /* ───────── hide thumbnails whose image is missing ───────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery] .thumb img'), function (img) {
    img.addEventListener('error', function () {
      var btn = img.closest('.thumb');
      if (btn) btn.hidden = true;
    });
  });

  /* ───────── build + show ───────── */
  function visibleThumbs(group) {
    return Array.prototype.filter.call(group.querySelectorAll('.thumb'), function (t) { return !t.hidden; });
  }

  function render(group, startIndex) {
    var thumbs = visibleThumbs(group);
    items = thumbs.map(function (t) {
      var img = t.querySelector('img');
      return { src: img.currentSrc || img.src, alt: img.alt || '' };
    });

    titleEl.textContent = group.getAttribute('data-gallery-title') || 'Images';
    slidesEl.innerHTML = '';
    dotsEl.innerHTML = '';
    slides = [];
    dots = [];

    items.forEach(function (it, i) {
      var slide = document.createElement('div');
      slide.className = 'modal-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', (i + 1) + ' of ' + items.length);
      var img = document.createElement('img');
      img.src = it.src;
      img.alt = it.alt;
      slide.appendChild(img);
      slidesEl.appendChild(slide);
      slides.push(slide);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'modal-dot';
      dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
      dot.addEventListener('click', function () { show(i); });
      dotsEl.appendChild(dot);
      dots.push(dot);
    });

    // one image only: no need for arrows or dots
    var single = items.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    dotsEl.hidden = single;

    show(startIndex, true);
    return thumbs;
  }

  function show(n, silent) {
    if (!slides.length) return;
    current = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === current);
      if (i === current) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === current);
      if (i === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    if (!silent && statusEl) {
      statusEl.textContent = 'Image ' + (current + 1) + ' of ' + items.length + (items[current].alt ? ': ' + items[current].alt : '');
    }
  }

  function open(group, index, trigger) {
    var thumbs = render(group, index);
    if (!thumbs.length) return;
    lastFocus = trigger || document.activeElement;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    if (!overlay.classList.contains('active')) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    slidesEl.innerHTML = '';
    dotsEl.innerHTML = '';
    if (statusEl) statusEl.textContent = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  /* ───────── open from any thumbnail ───────── */
  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('[data-gallery] .thumb');
    if (!thumb) return;
    var group = thumb.closest('[data-gallery]');
    var index = visibleThumbs(group).indexOf(thumb);
    open(group, Math.max(index, 0), thumb);
  });

  /* ───────── controls ───────── */
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });

  // click on the dark backdrop closes
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

  // swipe on touch screens (left swipe = next image)
  if (window.SiteUI && window.SiteUI.onSwipe) {
    window.SiteUI.onSwipe(carouselEl, {
      left: function () { show(current + 1); },
      right: function () { show(current - 1); }
    });
  }

  /* ───────── keyboard: Esc, arrows, and a focus trap ───────── */
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;

    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); return; }

    if (e.key === 'Tab') {
      var focusable = Array.prototype.filter.call(
        overlay.querySelectorAll('button'),
        function (b) { return !b.hidden && !b.disabled && b.offsetParent !== null; }
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!overlay.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });
})();
