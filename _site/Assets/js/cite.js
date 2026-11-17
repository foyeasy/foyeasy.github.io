/* ═══════════════════════════════════════════════════════════════
   cite.js: "Copy citation" and "BibTeX" buttons on publication cards
   Works on any .pub-card that has buttons like <button data-copy="citation">
   or <button data-copy="bibtex">. The text is built from the data-* attributes
   written by _includes/pub-card.html (which come from _data/publications.yml).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ───────── read one card ───────── */
  function readCard(card) {
    var d = function (name) { return (card.getAttribute('data-' + name) || '').trim(); };
    var date = d('date');   // YYYY-MM-DD
    return {
      id: d('id') || 'ref',
      title: d('title'),
      authors: d('authors') ? d('authors').split(' and ') : [],
      venue: d('venue'),
      publisher: d('publisher'),
      type: d('type'),
      year: date.slice(0, 4),
      month: date.slice(5, 7),
      doi: d('doi'),
      url: d('url')
    };
  }

  function linkOf(p) {
    if (p.doi) return 'https://doi.org/' + p.doi;
    return p.url;
  }

  /* ───────── plain-text citation (APA-style) ───────── */
  function formatCitation(p) {
    var names = p.authors.slice();
    var authorText;
    if (names.length === 0) authorText = '';
    else if (names.length === 1) authorText = names[0];
    else authorText = names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1];

    var title = p.title;
    if (!/[.?!]$/.test(title)) title += '.';

    var parts = [];
    if (authorText) parts.push(authorText + (p.year ? ' (' + p.year + ').' : '.'));
    parts.push(title);
    if (p.venue) parts.push(p.venue + '.');
    var link = linkOf(p);
    if (link) parts.push(link);
    return parts.join(' ');
  }

  /* ───────── BibTeX ───────── */
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // escape characters that have a special meaning in LaTeX
  function tex(s) {
    return String(s).replace(/([&%$#_])/g, '\\$1');
  }

  function formatBibtex(p) {
    var entryType, venueField;
    if (p.type === 'presentation') { entryType = 'inproceedings'; venueField = 'booktitle'; }
    else if (p.type === 'preprint') { entryType = 'article'; venueField = 'journal'; }
    else { entryType = 'article'; venueField = 'journal'; }

    var fields = [];
    fields.push(['title', '{' + tex(p.title) + '}']);                   // double braces keep capitalisation
    if (p.authors.length) fields.push(['author', tex(p.authors.join(' and '))]);
    if (p.venue) fields.push([venueField, tex(p.venue)]);
    if (p.year) fields.push(['year', p.year]);
    var m = parseInt(p.month, 10);
    if (m >= 1 && m <= 12) fields.push(['month', MONTHS[m - 1]]);        // bare macro, no braces
    if (p.publisher && p.type !== 'presentation') fields.push(['publisher', tex(p.publisher)]);
    if (p.doi) fields.push(['doi', p.doi]);
    var url = p.url || (p.doi ? 'https://doi.org/' + p.doi : '');
    if (url) fields.push(['url', url]);

    var body = fields.map(function (f) {
      var value = f[0] === 'month' ? f[1] : '{' + f[1] + '}';
      return '  ' + f[0] + ' = ' + value;
    }).join(',\n');

    return '@' + entryType + '{' + p.id + ',\n' + body + '\n}';
  }

  /* ───────── copy to clipboard (with fallback for older browsers) ───────── */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  function notify(message) {
    if (window.SiteUI && window.SiteUI.toast) window.SiteUI.toast(message);
  }

  /* ───────── handle clicks (works for cards added or hidden later too) ───────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-copy]');
    if (!btn) return;
    var card = btn.closest('.pub-card');
    if (!card) return;

    var kind = btn.getAttribute('data-copy');
    var p = readCard(card);
    var text = kind === 'bibtex' ? formatBibtex(p) : formatCitation(p);
    var label = kind === 'bibtex' ? 'BibTeX copied' : 'Citation copied';

    copyText(text).then(function () {
      notify(label);
      // brief visual confirmation on the button itself
      if (!btn.getAttribute('data-original')) btn.setAttribute('data-original', btn.textContent);
      btn.textContent = 'Copied ✓';
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.textContent = btn.getAttribute('data-original'); }, 1800);
    }).catch(function () {
      notify('Could not copy. Please select the text manually.');
    });
  });
})();
