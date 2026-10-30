/* motion.js — A1 pausa, A2 descifrado, A3 chips, A4 inclinación. Sin dependencias;
   con prefers-reduced-motion no corre y sin JS todo se ve igual. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var each = function (l, f) { [].forEach.call(l, f); };

  /* A1 · pausa fuera de pantalla y con la pestaña oculta */
  var pipe = document.querySelector('.pipe');
  if (pipe) {
    var pause = function (p) { pipe.classList.toggle('is-paused', p); };
    if (window.IntersectionObserver) new IntersectionObserver(function (es) {
      es.forEach(function (e) { pause(!e.isIntersecting); });
    }, { threshold: 0 }).observe(pipe);
    document.addEventListener('visibilitychange', function () { pause(document.hidden); });
  }

  /* A2 · descifrado; cada carácter conserva su ancho */
  var fx = document.querySelector('.role__fx');
  if (fx && fx.textContent.trim()) (document.fonts && document.fonts.ready || Promise.resolve()).then(function () {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&';
    var chars = [], frag = new DocumentFragment(), words = fx.textContent.trim().split(' ');
    words.forEach(function (w, wi) {
      var word = document.createElement('span');
      word.className = 'role__w';
      each(w, function (ch) {
        var c = document.createElement('span');
        c.className = 'role__c';
        c.dataset.c = ch;
        c.textContent = ch;
        word.appendChild(c);
        chars.push(c);
      });
      frag.appendChild(word);
      if (wi < words.length - 1) frag.append(' ');
    });
    fx.textContent = '';
    fx.appendChild(frag);
    each(chars, function (c) { c.style.width = c.getBoundingClientRect().width + 'px'; });
    var t0 = 0, total = Math.min(700, chars.length * 30);
    var tick = function (ts) {
      if (!t0) t0 = ts;
      var t = ts - t0, n = (t / 30) | 0;
      each(chars, function (c, i) {
        c.textContent = i < n ? c.dataset.c : letters.charAt((Math.random() * letters.length) | 0);
      });
      if (t < total) return requestAnimationFrame(tick);
      each(chars, function (c) { c.textContent = c.dataset.c; c.removeAttribute('style'); });
    };
    requestAnimationFrame(tick);
  });

  /* A3 · cascada de chips, una vez */
  var list = document.getElementById('skills-list');
  if (list) {
    each(list.querySelectorAll('.chips li'), function (li, i) { li.style.setProperty('--k', Math.min(i, 40)); });
    var wake = function () {
      list.classList.add('chip-wake');
      requestAnimationFrame(function () { requestAnimationFrame(function () { list.classList.add('is-awake'); }); });
      setTimeout(function () { list.classList.remove('chip-wake', 'is-awake'); }, 1600);
    };
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { wake(); io.disconnect(); } });
      }, { threshold: 0.15 });
      io.observe(list);
    } else wake();
  }

  /* A4 · inclinación al puntero (≤ 3 px, ≤ 0,6°) */
  if (!fine) return;
  each(document.querySelectorAll('.area, .ledger__row, .study'), function (card) {
    var raf = 0, tx = 0, ty = 0, rot = 0;
    var draw = function () {
      raf = 0;
      card.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
    };
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var dx = ((e.clientX - r.left) / r.width) * 2 - 1, dy = ((e.clientY - r.top) / r.height) * 2 - 1;
      tx = Math.max(-3, Math.min(3, dx * 3));
      ty = Math.max(-3, Math.min(3, dy * 3));
      rot = Math.max(-.6, Math.min(.6, dx * .6));
      card.classList.add('is-tilting');
      if (!raf) raf = requestAnimationFrame(draw);
    });
    card.addEventListener('pointerleave', function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      card.classList.remove('is-tilting');
      card.style.transform = '';
    });
  });
})();
