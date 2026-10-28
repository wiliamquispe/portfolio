/* site.js — idioma, menú móvil, fundido del hero, entradas y filas del libro. Sin dependencias. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- idioma: por defecto el del navegador; se recuerda en localStorage (con try/catch) ----- */
  function stored() { try { return localStorage.getItem('lang'); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem('lang', v); } catch (e) {} }
  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    var b = document.querySelector('[data-lang-toggle]');
    if (b) b.textContent = l === 'es' ? 'EN' : 'ES';
    var t = document.querySelector('[data-lang-title]');
    if (t) document.title = t.getAttribute('data-' + l) || document.title;
  }
  var initial = stored() || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es');
  setLang(initial === 'en' ? 'en' : 'es');
  var lt = document.querySelector('[data-lang-toggle]');
  if (lt) lt.addEventListener('click', function () {
    var next = root.getAttribute('data-lang') === 'es' ? 'en' : 'es';
    store(next); setLang(next);
  });

  /* ----- menú móvil ----- */
  var mb = document.querySelector('[data-menu-btn]');
  var nav = document.querySelector('[data-nav]');
  if (mb && nav) mb.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ----- hero: fundido lento entre fotos (pausa con pestaña oculta y con reduce-motion) ----- */
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.hero__photos img'));
  if (imgs.length) {
    imgs[0].classList.add('is-on');
    if (imgs.length > 1 && !reduce) {
      var i = 0, timer = null;
      var tick = function () { imgs[i].classList.remove('is-on'); i = (i + 1) % imgs.length; imgs[i].classList.add('is-on'); };
      var start = function () { if (!timer) timer = setInterval(tick, 6200); };
      var stop = function () { clearInterval(timer); timer = null; };
      document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
      start();
    }
  }

  /* ----- entradas: una sola vez, escalonadas ----- */
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----- libro de registro: cada fila se abre con su texto ----- */
  Array.prototype.forEach.call(document.querySelectorAll('.ledger__row'), function (row, n) {
    var b = row.querySelector('[data-toggle]');
    if (!b) return;
    var more = row.querySelector('.ledger__more');
    if (more) { more.id = 'ledger-more-' + n; b.setAttribute('aria-controls', more.id); }
    b.addEventListener('click', function () {
      var open = !row.classList.contains('is-open');
      Array.prototype.forEach.call(document.querySelectorAll('.ledger__row'), function (r) {
        r.classList.remove('is-open');
        var rb = r.querySelector('[data-toggle]'); if (rb) rb.setAttribute('aria-expanded', 'false');
      });
      if (open) { row.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
})();
