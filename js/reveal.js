/* Scroll reveal — scroll-driven and bulletproof.
   Anything within 88% of the viewport bottom is shown. Runs on load,
   scroll and resize, so nothing can get stuck invisible. */

function initReveal() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = [].slice.call(document.querySelectorAll('[data-reveal], .chart, .stagewrap, [data-count]'));

  if (reduce) {
    nodes.forEach(function (el) {
      el.classList.add('is-in');
      if (el.dataset.count) el.textContent = format(el, +el.dataset.count);
    });
    return;
  }

  var pending = nodes.slice();

  function reveal(el) {
    var delay = +(el.dataset.revealDelay || 0);
    if (delay) {
      setTimeout(function () { el.classList.add('is-in'); }, delay);
    } else {
      el.classList.add('is-in');
    }
    if (el.dataset.count) countUp(el);
  }

  function check() {
    if (!pending.length) return;
    var line = window.innerHeight * 0.88;
    var still = [];
    for (var i = 0; i < pending.length; i++) {
      var el = pending[i];
      var r = el.getBoundingClientRect();
      if (r.bottom <= 0) {
        el.classList.add('is-in');
        if (el.dataset.count) el.textContent = format(el, +el.dataset.count);
      } else if (r.top < line) {
        reveal(el);
      } else {
        still.push(el);
      }
    }
    pending = still;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { check(); ticking = false; });
  }

  check();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', check);

  /* safety net: nothing stays hidden forever */
  setTimeout(function () {
    pending.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.5) reveal(el);
    });
  }, 1200);
}

/* stagger children of a [data-stagger] container */
function applyStagger() {
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var step = +(group.dataset.stagger || 70);
    [].slice.call(group.children).forEach(function (child, i) {
      if (child.hasAttribute('data-reveal')) child.dataset.revealDelay = i * step;
    });
  });
}

function format(el, value) {
  var decimals = +(el.dataset.decimals || 0);
  return (el.dataset.prefix || '') + value.toFixed(decimals) + (el.dataset.suffix || '');
}

function countUp(el) {
  var target = +el.dataset.count;
  var duration = 1400;
  var start = performance.now();
  function tick(now) {
    var p = Math.min((now - start) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(el, target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
