/* Justice Energy Co. — site behaviour: navigation, reveal animations and the consultation form. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Services submenu ---------- */
  document.querySelectorAll('.sub-toggle').forEach(function (btn) {
    var item = btn.closest('.has-sub');
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!item.contains(e.target) && item.classList.contains('is-open') && window.innerWidth >= 1024) {
        item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveal.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Consultation form ---------- */
  var form = document.querySelector('[data-form]');
  if (!form) return;

  var startedAt = Date.now();
  var status = form.querySelector('.form-status');
  var submit = form.querySelector('[type="submit"]');
  var phone = form.getAttribute('data-phone') || '';
  var phoneHref = form.getAttribute('data-phone-href') || '';

  // Pre-select a service or program passed in the URL (?service=water-heating&program=socalren).
  var params = new URLSearchParams(window.location.search);
  var preService = params.get('service');
  if (preService) {
    var box = form.querySelector('input[name="service"][value="' + CSS.escape(preService) + '"]');
    if (box) box.checked = true;
  }
  var preProgram = params.get('program');
  if (preProgram) {
    var sel = form.querySelector('select[name="program"]');
    if (sel && sel.querySelector('option[value="' + CSS.escape(preProgram) + '"]')) sel.value = preProgram;
  }

  var messages = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address, like name@example.com.',
    phone: 'Please enter a phone number with at least 10 digits.',
    location: 'Please enter the property city or ZIP code.',
    consent: 'Please confirm we may contact you about your request.',
  };

  function errorEl(input) {
    var id = input.getAttribute('aria-describedby');
    return id ? document.getElementById(id.split(' ')[0]) : null;
  }
  function setError(input, msg) {
    var el = errorEl(input);
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    if (el) el.textContent = msg || '';
  }
  function validateField(input) {
    var v = (input.value || '').trim();
    var name = input.name;
    var msg = '';
    if (input.type === 'checkbox') {
      if (input.required && !input.checked) msg = messages[name];
    } else if (input.required && !v) {
      msg = messages[name] || 'This field is required.';
    } else if (name === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg = messages.email;
    } else if (name === 'phone' && v && v.replace(/\D/g, '').length < 10) {
      msg = messages.phone;
    }
    setError(input, msg);
    return !msg;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], input[name="phone"], input[name="email"]'));
  fields.forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value || input.type === 'checkbox') validateField(input); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) validateField(input); });
    input.addEventListener('change', function () { if (input.type === 'checkbox') validateField(input); });
  });

  function showStatus(kind, html) {
    status.innerHTML = '<div class="notice notice--' + kind + '" role="' + (kind === 'error' ? 'alert' : 'status') + '"><p>' + html + '</p></div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.innerHTML = '';

    var firstInvalid = null;
    fields.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      showStatus('error', 'Please check the highlighted fields and try again.');
      firstInvalid.focus();
      return;
    }

    // Collect the selected services into one readable field for the email notification.
    var chosen = Array.prototype.slice.call(form.querySelectorAll('input[name="service"]:checked')).map(function (b) { return b.getAttribute('data-label'); });
    form.querySelector('input[name="services_selected"]').value = chosen.join(', ') || 'Not specified';
    form.querySelector('input[name="page"]').value = document.referrer || window.location.href;

    var data = new FormData(form);
    var bot = form.querySelector('input[name="bot-field"]');
    // Spam traps: a filled honeypot or a submission faster than a person can type.
    if ((bot && bot.value) || Date.now() - startedAt < 3000) {
      window.location.href = form.getAttribute('data-success') || '/thank-you/';
      return;
    }

    // Demo previews never send data: go straight to the confirmation page.
    if (form.hasAttribute('data-demo')) {
      window.location.href = form.getAttribute('data-success') || '/thank-you/';
      return;
    }

    submit.setAttribute('aria-busy', 'true');
    var endpoint = form.getAttribute('data-endpoint');
    var request = endpoint
      ? fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      : fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() });

    request
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        window.location.href = form.getAttribute('data-success') || '/thank-you/';
      })
      .catch(function () {
        submit.removeAttribute('aria-busy');
        showStatus('error', 'Sorry, your request could not be sent. Please try again' + (phone ? ', or call us at <a href="tel:' + phoneHref + '">' + phone + '</a>.' : '.'));
      });
  });
})();
