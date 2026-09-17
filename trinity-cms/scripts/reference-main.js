/* Trinity Study Abroad — main.js
   Nav (sticky shrink + mobile menu) · scroll reveal · parallax · stacked cards · pinned horizontal scroller
   · counters · FAQ accordion · contact form · back-to-top                                              */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  var toTop = document.getElementById('toTop');
  var heroGlows = document.querySelector('[data-hero-parallax]');
  var pin = document.querySelector('[data-pin]');
  var pinTrack = document.querySelector('[data-pin-track]');
  var pinBar = document.querySelector('[data-pin-bar]');
  var pinGhost = document.querySelector('[data-pin-ghost]');
  var pinCount = document.querySelector('[data-pin-count]');
  var stackCards = document.querySelectorAll('[data-stack]');
  var plx = document.querySelectorAll('[data-plx]');

  /* ---- Mobile menu ---- */
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.hasAttribute('hidden');
      if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.firstElementChild.className = open ? 'fas fa-times' : 'fas fa-bars';
    });
  }

  /* ---- Scroll reveal ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  /* ---- Counters ---- */
  var stats = document.getElementById('stats');
  if (stats) {
    var counted = false;
    var sio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      var els = stats.querySelectorAll('.counter');
      var t0 = performance.now(), D = 2000;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 4);
        els.forEach(function (el) {
          var v = Math.round(parseInt(el.getAttribute('data-count'), 10) * e);
          el.textContent = v.toLocaleString('en-IN');
        });
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.3 });
    sio.observe(stats);
  }

  /* ---- FAQ ---- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement, wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq__item.is-open').forEach(function (o) {
        o.classList.remove('is-open'); o.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---- Contact form (front-end only; wire to your backend/action) ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.querySelectorAll('.form__field, .btn').forEach(function (el) { el.hidden = true; });
      document.getElementById('formOk').hidden = false;
    });
  }

  /* ---- Back to top ---- */
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---- Scroll-driven effects ---- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;

    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > 40);
    if (heroGlows) heroGlows.style.transform = 'translateY(' + (y * 0.3) + 'px)';

    plx.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-plx'));
      el.style.transform = 'translateY(' + off + 'px)';
    });

    stackCards.forEach(function (c, i) {
      var next = stackCards[i + 1];
      if (!next) { c.style.transform = 'none'; c.style.filter = 'none'; return; }
      var nr = next.getBoundingClientRect(), cr = c.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, 1 - (nr.top - cr.top) / cr.height));
      c.style.transform = 'scale(' + (1 - p * 0.06) + ') translateY(' + (-p * 18) + 'px)';
      c.style.filter = 'brightness(' + (1 - p * 0.35) + ')';
    });

    if (pin && pinTrack) {
      var r = pin.getBoundingClientRect(), dist = pin.offsetHeight - vh;
      var p = Math.min(1, Math.max(0, -r.top / dist));
      var max = pinTrack.scrollWidth - vw;
      pinTrack.style.transform = 'translateX(' + (-p * max) + 'px)';
      if (pinBar) pinBar.style.width = (p * 100) + '%';
      if (pinGhost) pinGhost.style.transform = 'translate(' + (-p * 40) + 'vw, -50%)';
      var cards = pinTrack.children, best = 0, bestD = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var cr = cards[i].getBoundingClientRect(), dn = (cr.left + cr.width / 2 - vw / 2) / vw;
        var ad = Math.min(1, Math.abs(dn) * 2.2);
        cards[i].style.transform = 'perspective(1200px) translateY(' + (ad * 26) + 'px) scale(' + (1 - ad * 0.1) + ') rotateY(' + (-dn * 14) + 'deg)';
        cards[i].style.opacity = String(1 - ad * 0.45);
        var img = cards[i].querySelector('.ucard__img');
        if (img) img.style.transform = 'translateX(' + (dn * 40) + 'px) scale(1.04)';
        if (Math.abs(dn) < bestD) { bestD = Math.abs(dn); best = i; }
      }
      if (pinCount) pinCount.firstChild.nodeValue = String(best + 1).padStart(2, '0') + ' ';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
