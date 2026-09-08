/* Zerqo — nav, tabs, accordion, scroll progress, boot.
   Classic script so the page also works straight from file://. */

(function () {

  function initNav() {
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('.burger');
    var over = document.querySelector('.navover');
    if (!nav) return;

    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!burger || !over) return;
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      over.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    over.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setOpen(false); });
  }

  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var tabs = group.querySelectorAll('.tab');
      var panels = group.querySelectorAll('.tab-panel');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
          panels.forEach(function (p) { p.classList.remove('is-active'); });
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          var target = group.querySelector('[data-panel="' + tab.dataset.tab + '"]');
          if (target) target.classList.add('is-active');
        });
      });
    });
  }

  function initAccordion() {
    document.querySelectorAll('.acc__b').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc__i');
        var open = item.classList.contains('is-open');
        item.parentElement.querySelectorAll('.acc__i').forEach(function (o) {
          o.classList.remove('is-open');
          o.querySelector('.acc__b').setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initProgress() {
    var bar = document.querySelector('.prog i');
    if (!bar) return;
    var raf;
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(2) + '%';
    };
    update();
    window.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
  }


  /* highlight the nav link for the section you are in */
  function initSpy() {
    var links = [].slice.call(document.querySelectorAll('.nav__links a'));
    if (!links.length) return;
    var map = links.map(function (a) {
      return { link: a, el: document.querySelector(a.getAttribute('href')) };
    }).filter(function (m) { return m.el; });
    if (!map.length) return;

    var raf;
    function update() {
      var line = window.scrollY + window.innerHeight * 0.35;
      var current = null;
      map.forEach(function (m) {
        if (m.el.offsetTop <= line) current = m.link;
      });
      links.forEach(function (a) { a.classList.toggle('is-current', a === current); });
    }
    update();
    window.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
  }



  /* the showcase view tabs swap the mock dashboard panel */
  function initViews() {
    var tabs = [].slice.call(document.querySelectorAll('.stab[data-view]'));
    var panels = [].slice.call(document.querySelectorAll('[data-view-panel]'));
    var navItems = [].slice.call(document.querySelectorAll('.appnav li'));
    if (!tabs.length || !panels.length) return;

    function show(view) {
      tabs.forEach(function (t) {
        var on = t.dataset.view === view;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-on', p.dataset.viewPanel === view);
      });
      /* keep the mock sidebar in step with the chosen view */
      navItems.forEach(function (li) {
        var label = (li.textContent || '').trim().toLowerCase();
        li.classList.toggle('on', label.indexOf(view) === 0);
      });
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.dataset.view); });
    });
  }


  /* the sign-up sheet */
  function initSheet() {
    var ov = document.getElementById('signupOv');
    if (!ov) return;
    var form = document.getElementById('joinForm');
    var last = null;

    var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    var PHONE = /^[6-9]\d{9}$/;

    function step(name) {
      ov.querySelectorAll('.sheet__step').forEach(function (s) {
        s.classList.toggle('is-on', s.dataset.sheet === name);
      });
    }
    function open(e) {
      if (e) e.preventDefault();
      last = document.activeElement;
      ov.hidden = false;
      document.body.classList.add('is-sheet');
      step('form');
      setTimeout(function () {
        var f = ov.querySelector('input[name="name"]');
        if (f) f.focus();
      }, 80);
    }
    function close() {
      ov.hidden = true;
      document.body.classList.remove('is-sheet');
      if (last) last.focus();
    }

    document.querySelectorAll('[data-join]').forEach(function (b) {
      b.addEventListener('click', open);
    });
    ov.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !ov.hidden) close();
    });

    /* keep tabbing inside the sheet while it is open */
    ov.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = ov.querySelectorAll('button, input, select, a[href]');
      if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { lastEl.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { first.focus(); e.preventDefault(); }
    });

    function err(key, on) {
      var el = ov.querySelector('[data-err="' + key + '"]');
      if (el) el.classList.toggle('on', !!on);
    }
    function mark(el, bad) { if (el) el.setAttribute('aria-invalid', bad ? 'true' : 'false'); }

    form.addEventListener('input', function (e) {
      var n = e.target.name;
      if (n === 'name') { err('name', false); mark(e.target, false); }
      if (n === 'contact') { err('contact', false); mark(e.target, false); }
      if (n === 'klass' || n === 'board') { err('pick', false); mark(e.target, false); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = form.first.value.trim();
      var lastN = form.last.value.trim();
      var contact = form.contact.value.trim();
      var klass = form.klass.value;
      var board = form.board.value;
      var bad = false;

      var noName = !first || !lastN;
      err('name', noName); mark(form.first, !first); mark(form.last, !lastN);
      bad = bad || noName;

      var digits = contact.replace(/\D/g, '');
      var okContact = EMAIL.test(contact) || PHONE.test(digits);
      err('contact', !okContact); mark(form.contact, !okContact);
      bad = bad || !okContact;

      var noPick = !klass || !board;
      err('pick', noPick); mark(form.klass, !klass); mark(form.board, !board);
      bad = bad || noPick;

      if (bad) {
        var b = form.querySelector('[aria-invalid="true"]');
        if (b) b.focus();
        return;
      }

      /* pretend the server replied */
      var msg = document.getElementById('joinMsg');
      if (msg) {
        msg.textContent = 'Class ' + klass + ' · ' + board + '. We’ve sent your sign-in code to ' +
          contact + '.';
      }
      step('done');
      ov.querySelector('.sheet').scrollTop = 0;
    });
  }


  /* the sign-in sheet */
  function initSignIn() {
    var ov = document.getElementById('loginOv');
    var join = document.getElementById('signupOv');
    if (!ov) return;

    var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    var mode = 'email', last = null, timer = null;
    var fEmail = ov.querySelector('[data-lfield="email"]');
    var fPhone = ov.querySelector('[data-lfield="phone"]');
    var phone = fPhone.querySelector('input');

    function bar(p) { var b = document.getElementById('liBar'); if (b) b.style.width = p + '%'; }
    function step(n) {
      ov.querySelectorAll('.sheet__step').forEach(function (s) {
        s.classList.toggle('is-on', s.dataset.sheet === n);
      });
      ov.querySelector('.sheet').scrollTop = 0;
    }
    function err(k, on, m) {
      var el = ov.querySelector('[data-err="' + k + '"]');
      if (!el) return;
      if (m) el.textContent = m;
      el.classList.toggle('on', !!on);
    }
    function open(e) {
      if (e) e.preventDefault();
      last = document.activeElement;
      if (join) join.hidden = true;
      ov.hidden = false;
      document.body.classList.add('is-sheet');
      bar(34); step('ask');
      setTimeout(function () { fEmail.querySelector('input').focus(); }, 80);
    }
    function close() {
      ov.hidden = true;
      document.body.classList.remove('is-sheet');
      stop();
      if (last) last.focus();
    }

    document.querySelectorAll('[data-signin]').forEach(function (b) {
      b.addEventListener('click', open);
    });
    ov.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !ov.hidden) close();
    });

    /* swap between the two sheets */
    var toJoin = document.getElementById('toJoin');
    if (toJoin) toJoin.addEventListener('click', function () {
      close();
      var b = document.querySelector('[data-join]');
      if (b) b.click();
    });

    ov.querySelector('.lseg').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]');
      if (!b) return;
      mode = b.dataset.mode;
      ov.querySelectorAll('.lseg button').forEach(function (x) {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-selected', String(x === b));
      });
      fEmail.hidden = mode !== 'email';
      fPhone.hidden = mode !== 'phone';
      err('liAsk', false);
      (mode === 'email' ? fEmail : fPhone).querySelector('input').focus();
    });

    phone.addEventListener('input', function () {
      phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
      err('liAsk', false);
    });
    fEmail.querySelector('input').addEventListener('input', function () { err('liAsk', false); });

    document.getElementById('liAsk').addEventListener('submit', function (e) {
      e.preventDefault();
      var to, bad;
      if (mode === 'email') {
        to = fEmail.querySelector('input').value.trim();
        bad = !EMAIL.test(to);
        err('liAsk', bad, 'Enter a valid email address.');
      } else {
        bad = phone.value.length !== 10;
        to = '+91 ' + phone.value.replace(/(\d{5})(\d{5})/, '$1 $2');
        err('liAsk', bad, 'Enter a 10-digit mobile number.');
      }
      if (bad) return;

      /* pretend the server sent a code */
      document.getElementById('liSentTo').textContent = to;
      bar(70); step('otp'); start();
      setTimeout(function () { ov.querySelector('#liOtp input').focus(); }, 200);
    });

    document.getElementById('liChange').addEventListener('click', function () {
      stop(); bar(34); step('ask');
    });

    /* otp boxes */
    var boxes = [].slice.call(ov.querySelectorAll('#liOtp input'));
    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () {
        b.value = b.value.replace(/\D/g, '').slice(0, 1);
        b.classList.toggle('filled', !!b.value);
        err('liOtp', false);
        if (b.value && boxes[i + 1]) boxes[i + 1].focus();
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !b.value && boxes[i - 1]) {
          boxes[i - 1].focus(); boxes[i - 1].value = '';
          boxes[i - 1].classList.remove('filled'); e.preventDefault();
        }
      });
      b.addEventListener('paste', function (e) {
        var t = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (!t) return;
        e.preventDefault();
        boxes.forEach(function (x, n) {
          x.value = t[n] || '';
          x.classList.toggle('filled', !!x.value);
        });
        (boxes[Math.min(t.length, 5)] || boxes[5]).focus();
      });
    });

    document.getElementById('liVerify').addEventListener('submit', function (e) {
      e.preventDefault();
      var code = boxes.map(function (b) { return b.value; }).join('');
      if (code.length !== 6) { err('liOtp', true); return; }
      stop(); bar(100); step('done');
    });

    /* resend countdown */
    function start() {
      var btn = document.getElementById('liResend');
      var left = 30;
      stop();
      btn.disabled = true;
      btn.innerHTML = 'Resend in <span id="liTick">' + left + '</span>s';
      timer = setInterval(function () {
        left -= 1;
        var t = document.getElementById('liTick');
        if (t) t.textContent = left;
        if (left <= 0) { stop(); btn.disabled = false; btn.textContent = 'Resend code'; }
      }, 1000);
      btn.onclick = function () { if (!btn.disabled) start(); };
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
  }

  function boot() {
    try { initNav(); } catch (e) { console.error(e); }
    try { initTabs(); } catch (e) { console.error(e); }
    try { initAccordion(); } catch (e) { console.error(e); }
    try { initProgress(); } catch (e) { console.error(e); }
    try { initSpy(); } catch (e) { console.error(e); }
    try { initViews(); } catch (e) { console.error(e); }
    try { initSheet(); } catch (e) { console.error(e); }
    try { initSignIn(); } catch (e) { console.error(e); }
    try { applyStagger(); initReveal(); } catch (e) {
      console.error(e);
      document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    }
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
