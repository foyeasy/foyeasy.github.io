/* ═══════════════════════════════════════════════════════════════
   contact.js: sends the contact form in the background (Web3Forms)
   - shows a success / error message under the form, with no page reload
   - if sending fails (or the access key was never set), offers a direct email link
   Without JavaScript the form still works: it posts to Web3Forms normally.
   Setup: put your free access key in _config.yml → web3forms_key
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('cf-submit');
  var endpoint = form.getAttribute('action');
  var key = form.getAttribute('data-key') || '';
  var fallbackEmail = form.getAttribute('data-fallback-email') || '';
  var idleLabel = submitBtn ? submitBtn.textContent : 'Send message';

  /* ───────── status line ───────── */
  function setStatus(kind, message, withEmailLink) {
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
    statusEl.textContent = message;
    if (withEmailLink && fallbackEmail) {
      statusEl.appendChild(document.createTextNode(' You can email me directly at '));
      var a = document.createElement('a');
      a.href = 'mailto:' + fallbackEmail;
      a.textContent = fallbackEmail;
      statusEl.appendChild(a);
      statusEl.appendChild(document.createTextNode('.'));
    }
  }

  function setSending(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Sending…' : idleLabel;
    form.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  /* ───────── submit ───────── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // the access key was never replaced in _config.yml
    if (!key || key.indexOf('YOUR_') === 0) {
      setStatus('error', 'The contact form is not set up yet.', true);
      return;
    }

    // browser's built-in checks (required fields, valid email)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // spam trap: a real visitor never ticks the hidden checkbox
    var trap = form.querySelector('input[name="botcheck"]');
    if (trap && trap.checked) {
      setStatus('ok', 'Thank you! Your message has been sent.');
      form.reset();
      return;
    }

    setSending(true);
    setStatus('', 'Sending your message…');

    var controller = window.AbortController ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 15000);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.success) {
          setStatus('ok', 'Thank you! Your message has been sent. I will reply by email soon.');
          form.reset();
          if (window.SiteUI && window.SiteUI.toast) window.SiteUI.toast('Message sent');
        } else {
          setStatus('error', 'Sorry, the message could not be sent.', true);
        }
      })
      .catch(function () {
        setStatus('error', 'Sorry, the message could not be sent (network problem).', true);
      })
      .then(function () {
        clearTimeout(timeout);
        setSending(false);
      });
  });
})();
