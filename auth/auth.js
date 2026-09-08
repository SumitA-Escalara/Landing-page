/* Zerqo auth — sign up and OTP sign in.
   Front-end only: validation, step flow and the OTP field behaviour.
   Swap the two "pretend the server replied" spots for real API calls. */
(function () {
  'use strict';

  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function show(step) {
    document.querySelectorAll('.step').forEach(function (s) {
      s.classList.toggle('on', s.dataset.step === step);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function err(key, on, msg) {
    var el = document.querySelector('[data-err="' + key + '"]');
    if (!el) return;
    if (msg) el.textContent = msg;
    el.classList.toggle('on', !!on);
  }
  function mark(input, bad) {
    if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  var PHONE = /^[6-9]\d{9}$/;

  function bar(pct) {
    var el = document.querySelector('.sheet__bar i');
    if (el) el.style.width = pct + '%';
  }

  /* ============================================================ sign up */
  function signup() {
    var form = document.getElementById('signup');
    if (!form) return;

    form.addEventListener('input', function (e) {
      var n = e.target.name;
      if (n === 'name') { err('name', false); mark(e.target, false); }
      if (n === 'contact') { err('contact', false); mark(e.target, false); }
      if (n === 'klass' || n === 'board') { err('pick', false); mark(e.target, false); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var klass = form.klass.value;
      var board = form.board.value;
      var bad = false;

      var noName = name.split(/\s+/).filter(Boolean).length < 2;
      err('name', noName); mark(form.name, noName);
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
      var msg = document.getElementById('doneMsg');
      if (msg) {
        msg.textContent = 'Class ' + klass + ' · ' + board +
          '. We’ve sent your sign-in code to ' + contact + '.';
      }
      bar(100);
      show('done');
    });
  }

  /* ============================================================ sign in */
  function login() {
    var ask = document.getElementById('ask');
    if (!ask) return;

    var mode = 'email';
    var seg = document.querySelector('.seg');
    var fEmail = document.querySelector('[data-field="email"]');
    var fPhone = document.querySelector('[data-field="phone"]');

    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]');
      if (!b) return;
      mode = b.dataset.mode;
      seg.querySelectorAll('button').forEach(function (x) {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-selected', String(x === b));
      });
      fEmail.hidden = mode !== 'email';
      fPhone.hidden = mode !== 'phone';
      err('ask', false);
      var field = (mode === 'email' ? fEmail : fPhone).querySelector('input');
      if (field) field.focus();
    });

    /* phone: digits only */
    var phoneInput = fPhone.querySelector('input');
    phoneInput.addEventListener('input', function () {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      err('ask', false);
    });
    fEmail.querySelector('input').addEventListener('input', function () { err('ask', false); });

    ask.addEventListener('submit', function (e) {
      e.preventDefault();
      var to, bad;

      if (mode === 'email') {
        to = ask.email.value.trim();
        bad = !EMAIL.test(to);
        err('ask', bad, 'Enter a valid email address.');
        mark(ask.email, bad);
      } else {
        var digits = phoneInput.value;
        bad = digits.length !== 10;
        to = '+91 ' + digits.replace(/(\d{5})(\d{5})/, '$1 $2');
        err('ask', bad, 'Enter a 10-digit mobile number.');
        mark(phoneInput, bad);
      }
      if (bad) return;

      /* pretend the server sent a code */
      document.getElementById('sentTo').textContent = to;
      bar(70);
      show('otp');
      startTimer();
      var first = document.querySelector('#otp input');
      if (first) setTimeout(function () { first.focus(); }, 260);
    });

    document.getElementById('change').addEventListener('click', function () {
      stopTimer();
      bar(34);
      show('ask');
    });

    otpField();
    verify();
  }

  /* ---------------------------------------------------------- otp boxes */
  function otpField() {
    var wrap = document.getElementById('otp');
    if (!wrap) return;
    var boxes = [].slice.call(wrap.querySelectorAll('input'));

    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () {
        b.value = b.value.replace(/\D/g, '').slice(0, 1);
        b.classList.toggle('filled', !!b.value);
        err('otp', false);
        if (b.value && boxes[i + 1]) boxes[i + 1].focus();
      });

      b.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !b.value && boxes[i - 1]) {
          boxes[i - 1].focus();
          boxes[i - 1].value = '';
          boxes[i - 1].classList.remove('filled');
          e.preventDefault();
        }
        if (e.key === 'ArrowLeft' && boxes[i - 1]) boxes[i - 1].focus();
        if (e.key === 'ArrowRight' && boxes[i + 1]) boxes[i + 1].focus();
      });

      /* paste the whole code into any box */
      b.addEventListener('paste', function (e) {
        var text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (!text) return;
        e.preventDefault();
        boxes.forEach(function (x, n) {
          x.value = text[n] || '';
          x.classList.toggle('filled', !!x.value);
        });
        var next = boxes[Math.min(text.length, boxes.length - 1)];
        if (next) next.focus();
      });
    });
  }

  function verify() {
    var form = document.getElementById('verify');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = [].slice.call(document.querySelectorAll('#otp input'))
        .map(function (i) { return i.value; }).join('');
      if (code.length !== 6) {
        err('otp', true, 'Enter all six digits.');
        return;
      }
      /* pretend the server accepted it */
      stopTimer();
      bar(100);
      show('done');
    });
  }

  /* ---------------------------------------------------------- resend timer */
  var timer = null;
  function startTimer() {
    var btn = document.getElementById('resend');
    var tick = document.getElementById('tick');
    if (!btn || !tick) return;
    var left = 30;

    stopTimer();
    btn.disabled = true;
    btn.innerHTML = 'Resend in <span id="tick">' + left + '</span>s';

    timer = setInterval(function () {
      left -= 1;
      var t = document.getElementById('tick');
      if (t) t.textContent = left;
      if (left <= 0) {
        stopTimer();
        btn.disabled = false;
        btn.textContent = 'Resend code';
      }
    }, 1000);

    btn.onclick = function () {
      if (btn.disabled) return;
      startTimer();
    };
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  /* ---------------------------------------------------------- boot */
  function boot() {
    try { signup(); } catch (e) { console.error(e); }
    try { login(); } catch (e) { console.error(e); }
    var y = document.getElementById('yr');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
