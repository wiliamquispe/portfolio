/* mascot.js — la mascota (plan 12): reposa, mira y salta entre perchas al hacer scroll.
   Sin dependencias. Con prefers-reduced-motion se queda quieta; sin JS no existe. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var SVG = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g class="bot" fill="none"><g class="bot__plume" fill="var(--accent, #ff8a1f)"><path d="M28 20C29 12 32 6 37 3.5 43 0.6 50 3 54 8 49 7.5 44 9.5 40 13 36 16.5 32 19 28 20Z"/></g><g class="bot__head"><rect class="bot__head-box" x="11" y="16" width="42" height="26" rx="8" fill="var(--bot-body, #1b2550)"/><rect class="bot__screen" x="16" y="25.5" width="32" height="10" rx="5" fill="var(--bot-screen, #fffaf2)"/><rect class="bot__nasal" x="30.5" y="23" width="3" height="15" rx="1.5" fill="var(--bot-body, #1b2550)"/></g><g class="bot__eyes" fill="var(--bot-ink, #1b2550)"><circle cx="23.5" cy="30.5" r="2.4"/><circle cx="40.5" cy="30.5" r="2.4"/></g><g class="bot__body"><rect x="19" y="42" width="26" height="13" rx="6" fill="var(--bot-body, #1b2550)"/></g><g class="bot__arms" fill="var(--bot-body, #1b2550)"><rect x="12.5" y="44" width="5" height="9" rx="2.5"/><rect x="46.5" y="44" width="5" height="9" rx="2.5"/></g><g class="bot__legs" fill="var(--bot-body, #1b2550)"><rect x="23" y="55" width="6" height="9" rx="3"/><rect x="35" y="55" width="6" height="9" rx="3"/></g><g class="bot__shield"><path class="bot__shield-rim" d="M6 41h17v12c0 4.6-5 7.4-8.5 9.4-3.5-2-8.5-4.8-8.5-9.4z" fill="var(--bot-body, #1b2550)"/><path class="bot__shield-field" d="M9.2 44.2h10.6v8.8c0 3-3 5-5.3 6.5-2.3-1.5-5.3-3.5-5.3-6.5z" fill="var(--bot-screen, #fffaf2)"/><circle class="bot__boss" cx="14.5" cy="48.5" r="2.8" fill="var(--bot-ink, #1b2550)"/></g></g></svg>';

  var bot = document.createElement('div');
  bot.className = 'bot';
  bot.setAttribute('aria-hidden', 'true');
  bot.innerHTML = SVG;
  document.body.appendChild(bot);
  var eyes = bot.querySelector('.bot__eyes');

  var dust = document.createElement('div');
  dust.className = 'bot-dust';
  dust.setAttribute('aria-hidden', 'true');
  for (var d = 0; d < 4; d++) dust.appendChild(document.createElement('i'));
  document.body.appendChild(dust);

  var size = function () { return bot.offsetWidth || 44; };

  var SELS = '.hero__id, h2, .area, .ledger__row, .study, .group-title, #skills-list dt, .letter > p:first-of-type, .contact__lede, .contact__title, .foot__name';
  var P = [], cur = null, boxes = [];

  function collect() {
    boxes = [];
    var all = document.body.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el === bot || el === dust || bot.contains(el)) continue;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
      if (el.closest('details:not([open])')) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      boxes.push({ el: el, l: r.left, r: r.right, b: r.bottom + scrollY });
    }
  }

  function gap(el, top, right, s) {
    var x0 = right - s - 12, x1 = right - 12, low = 0;
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      if (b.el === el || el.contains(b.el) || b.el.contains(el)) continue;
      if (b.b > top + 1 || b.r <= x0 || b.l >= x1) continue;
      if (b.b > low) low = b.b;
    }
    return top - low;
  }

  function scan() {
    collect();
    var s = size(), list = [], els = document.querySelectorAll(SELS);
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || el.closest('.sr-only')) continue;
      if (!el.matches('h2, .group-title, .contact__title, .hero__id, .foot__name, .letter > p:first-of-type, #skills-list dt') && gap(el, r.top + scrollY, r.right, s) < s - 8) continue;
      list.push(el);
    }
    list.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.top - rb.top) || (rb.right - ra.right);
    });
    P = list;
  }

  function at(el) {
    var s = size(), r = el.getBoundingClientRect();
    if (el.classList.contains('foot__name')) {
      /* sobre la primera letra del nombre gigante: pies a la altura de las mayúsculas */
      var rg = document.createRange(); rg.selectNodeContents(el);
      var l1 = rg.getClientRects()[0] || r, fs = parseFloat(getComputedStyle(el).fontSize);
      return { x: Math.round(l1.left + fs * 0.06), y: Math.round(l1.top + scrollY + fs * 0.275 - s) };
    }
    return { x: Math.round(r.right - s - 12), y: Math.round(r.top + scrollY - s) };
  }

  function put(el) {
    if (!el) return;
    var q = at(el);
    bot.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px)';
    bot.classList.toggle('is-dark', !!el.closest('.field--navy, .foot'));
    cur = el;
  }

  function enter() {
    var p = P[0];
    if (!p) return;
    put(p);
    if (reduce || !bot.animate) return;
    var q = at(p);
    bot.animate([
      { transform: 'translate(' + q.x + 'px,' + (q.y - 120) + 'px) scaleY(1.05)', offset: 0, easing: 'cubic-bezier(.5,0,.9,.45)' },
      { transform: 'translate(' + q.x + 'px,' + q.y + 'px) scaleY(.88)', offset: .72, easing: 'cubic-bezier(.2,.9,.3,1)' },
      { transform: 'translate(' + q.x + 'px,' + (q.y - 6) + 'px) scaleY(1.02)', offset: .87, easing: 'cubic-bezier(.4,0,.6,1)' },
      { transform: 'translate(' + q.x + 'px,' + q.y + 'px) scaleY(1)', offset: 1 }
    ], { duration: 500 });
  }

  var flying = false, pending = null, landAt = 0, target = null, targetAt = 0, jumps = 0, timer = 0, settle = 0, raf = 0;

  function puff(el) {
    var q = at(el), s = size();
    dust.style.transform = 'translate(' + (q.x + s / 2) + 'px,' + (q.y + s) + 'px)';
    dust.style.color = el.closest('.field--navy, .foot') ? 'var(--field-dark-ink)' : 'var(--muted)';
    for (var i = 0; i < 4; i++) dust.children[i].animate([
      { opacity: .6, transform: 'translate(0,0) scale(1)' },
      { opacity: 0, transform: 'translate(' + (i < 2 ? -10 : 10) + 'px,' + (i % 2 ? 4 : -2) + 'px) scale(.6)' }
    ], { duration: 300, easing: 'cubic-bezier(.2,.7,.4,1)' });
  }

  function hop(to) {
    if (!cur || !to || to === cur) return;
    var a = at(cur), b = at(to), dx = b.x - a.x, dy = b.y - a.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var fly = Math.round(Math.max(420, Math.min(800, 280 + dist * .35)));
    var arc = Math.round(Math.max(60, Math.min(160, dist * .25)));
    var tilt = Math.max(-8, Math.min(8, dx / 60));
    var total = 110 + fly + 140 + 160, f = [], n = 12, i, t, off;
    var ease = function (v) { return v < .5 ? 2 * v * v : 1 - Math.pow(2 - 2 * v, 2) / 2; };

    f.push({ transform: 'translate(' + a.x + 'px,' + a.y + 'px) scale(1)', offset: 0, easing: 'cubic-bezier(.3,0,.7,1)' });
    f.push({ transform: 'translate(' + a.x + 'px,' + a.y + 'px) scaleY(.85) scaleX(1.08)', offset: 110 / total, easing: 'linear' });
    for (i = 0; i <= n; i++) {
      t = i / n; off = (110 + fly * t) / total;
      f.push({
        transform: 'translate(' + (a.x + dx * ease(t)).toFixed(1) + 'px,' + (a.y + dy * t - arc * Math.sin(Math.PI * t)).toFixed(1) + 'px) rotate(' + (tilt * Math.sin(Math.PI * t)).toFixed(2) + 'deg) scaleY(1.1)',
        offset: off, easing: 'linear'
      });
    }
    f.push({ transform: 'translate(' + b.x + 'px,' + b.y + 'px) scaleY(.88) scaleX(1.1)', offset: (110 + fly) / total, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    f.push({ transform: 'translate(' + b.x + 'px,' + b.y + 'px) scale(1)', offset: 1 });

    flying = true; pending = null; jumps++;
    bot.classList.add('is-flying');
    var anim = bot.animate(f, { duration: total });
    setTimeout(function () { puff(to); }, 110 + fly);
    put(to);
    anim.onfinish = function () {
      bot.classList.remove('is-flying');
      flying = false; landAt = performance.now();
      put(cur);
      if (pending && pending !== cur) { var p = pending; pending = null; hop(p); }
    };
  }

  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.top >= 80 && r.top <= innerHeight;
  }

  function aim() {
    if (!P.length) return null;
    var i, t = null;
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) t = P[P.length - 1];
    else {
      var line = scrollY + innerHeight * .4;
      for (i = 0; i < P.length; i++) {
        if (P[i].getBoundingClientRect().top + scrollY <= line) t = P[i]; else break;
      }
    }
    if (t && !visible(t)) {
      var v = null;
      for (i = 0; i < P.length; i++) if (visible(P[i])) v = P[i];
      if (v) t = v;
    }
    return t || P[0];
  }

  function tick() {
    timer = 0;
    if (reduce) return;
    var t = aim();
    if (!t) return;
    var now = performance.now();
    if (t !== target) { target = t; targetAt = now; }
    if (flying) { pending = t; return; }
    if (t === cur) { pending = null; return; }
    var wait = Math.max(0, 120 - (now - targetAt), 600 - (now - landAt));
    if (wait > 0) { timer = setTimeout(tick, wait + 10); return; }
    hop(t);
  }

  function reflow() {
    var was = cur;
    scan();
    if (!was) { if (!cur) enter(); return; }
    var same = null, near = null, wasTop = was.getBoundingClientRect().top + scrollY;
    for (var i = 0; i < P.length; i++) {
      if (P[i] === was) same = P[i];
      if (!near && P[i].getBoundingClientRect().top + scrollY <= wasTop + 4) near = P[i];
    }
    var p = same || near || P[0];
    if (p) put(p);
  }

  var lookRaf = 0, lx = 0, ly = 0;
  function look(ev) {
    var r = bot.getBoundingClientRect();
    if (!r.width) return;
    lx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 160)) * 2;
    ly = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 160)) * 2;
    if (!lookRaf) lookRaf = requestAnimationFrame(function () {
      lookRaf = 0;
      eyes.style.transform = 'translate(' + lx.toFixed(2) + 'px,' + ly.toFixed(2) + 'px)';
    });
  }

  function blink() {
    eyes.classList.add('is-blinking');
    setTimeout(function () { eyes.classList.remove('is-blinking'); }, 160);
    setTimeout(blink, 3500 + Math.random() * 3500);
  }

  scan();
  enter();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reflow);
  addEventListener('scroll', function () {
    if (reduce) return;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; tick(); });
    clearTimeout(settle);
    settle = setTimeout(tick, 700);   // el layout se asienta (entradas .reveal) y se reevalúa la percha
  }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(reflow).observe(document.querySelector('main'));
  document.addEventListener('toggle', reflow, true);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-toggle], summary')) setTimeout(reflow, 60); });
  document.addEventListener('visibilitychange', function () {
    bot.classList.toggle('is-paused', document.hidden);
    if (!document.hidden) tick();
  });
  var rz = 0;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(reflow, 150); });
  if (!reduce) {
    setTimeout(blink, 2000 + Math.random() * 2000);
    if (fine) document.addEventListener('pointermove', look, { passive: true });
  }
  window.__botState = function () {
    var r = cur && cur.getBoundingClientRect();
    return {
      cur: cur ? (cur.className || '') + (cur.id ? '#' + cur.id : '') : '',
      rect: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] : null,
      pos: cur ? at(cur) : null,
      at: P.indexOf(cur), perches: P.length, jumps: jumps, flying: flying
    };
  };
})();
