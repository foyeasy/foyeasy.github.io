/* ═══════════════════════════════════════════════════════════════
   publications.js: search + year/type filters on the Publications page
   Reads the data-* attributes that _includes/pub-card.html puts on each card:
     data-search (lower-cased title, authors, venue, keywords, type, year)
     data-year, data-type
   Filters are also saved in the URL (e.g. /publications/?q=copper&year=2026&type=journal)
   so a filtered view can be shared or bookmarked.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var list = document.getElementById('pubList');
  if (!list) return;

  var cards = Array.prototype.slice.call(list.querySelectorAll('.pub-card'));
  var searchInput = document.getElementById('pubSearch');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var resetBtn = document.getElementById('pubReset');
  var countEl = document.getElementById('pubCount');
  var emptyEl = document.getElementById('pubEmpty');
  var total = cards.length;

  var state = { q: '', year: 'all', type: 'all' };

  /* ───────── apply the filters ───────── */
  function apply() {
    var tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;

    cards.forEach(function (card) {
      var hay = card.getAttribute('data-search') || '';
      var ok =
        (state.year === 'all' || card.getAttribute('data-year') === state.year) &&
        (state.type === 'all' || card.getAttribute('data-type') === state.type) &&
        tokens.every(function (t) { return hay.indexOf(t) !== -1; });   // every word must match

      card.hidden = !ok;
      if (ok) {
        shown++;
        card.classList.add('visible');   // don't leave newly shown cards waiting on the scroll animation
      }
    });

    // chip pressed states
    chips.forEach(function (chip) {
      var key = chip.getAttribute('data-filter');
      chip.setAttribute('aria-pressed', chip.getAttribute('data-value') === state[key] ? 'true' : 'false');
    });

    var active = state.q !== '' || state.year !== 'all' || state.type !== 'all';
    if (resetBtn) resetBtn.hidden = !active;
    if (emptyEl) emptyEl.hidden = shown !== 0;
    if (countEl) {
      countEl.textContent = active
        ? 'Showing ' + shown + ' of ' + total
        : 'Showing all ' + total;
    }

    syncUrl();
  }

  /* ───────── URL <-> state ───────── */
  function syncUrl() {
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.year !== 'all') params.set('year', state.year);
    if (state.type !== 'all') params.set('type', state.type);
    var qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }

  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    var y = params.get('year');
    var t = params.get('type');
    // only accept values that exist as a button, so a bad link can't hide everything
    var years = chips.filter(function (c) { return c.getAttribute('data-filter') === 'year'; })
                     .map(function (c) { return c.getAttribute('data-value'); });
    var types = chips.filter(function (c) { return c.getAttribute('data-filter') === 'type'; })
                     .map(function (c) { return c.getAttribute('data-value'); });
    state.year = y && years.indexOf(y) !== -1 ? y : 'all';
    state.type = t && types.indexOf(t) !== -1 ? t : 'all';
    if (searchInput) searchInput.value = state.q;
  }

  /* ───────── events ───────── */
  var debounce;
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        state.q = searchInput.value.trim();
        apply();
      }, 120);
    });
    // the native "x" in a search field fires "search"
    searchInput.addEventListener('search', function () {
      state.q = searchInput.value.trim();
      apply();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      state[chip.getAttribute('data-filter')] = chip.getAttribute('data-value');
      apply();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state = { q: '', year: 'all', type: 'all' };
      if (searchInput) searchInput.value = '';
      apply();
      if (searchInput) searchInput.focus();
    });
  }

  /* ───────── go ───────── */
  readUrl();
  apply();
})();
