/* match.js — «Compara con tu oferta». Coincidencia de palabras clave en el navegador: no envía nada, no guarda nada.
   Las habilidades salen del propio HTML (#skills-list li[data-alias]); sin JS la lista se ve igual. */
(function () {
  var form = document.getElementById('match-form');
  if (!form) return;
  var input = form.querySelector('textarea');
  var out = document.getElementById('match-result');
  var termsBox = document.getElementById('match-terms');
  var items = Array.prototype.slice.call(document.querySelectorAll('#skills-list li[data-alias]'));
  var lang = function () { return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'es'; };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function norm(s) {
    return ' ' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9+#.]+/g, ' ').replace(/\.(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }
  var terms = items.map(function (li) {
    return { li: li, name: li.getAttribute('data-name') || li.textContent.trim(),
             aliases: li.getAttribute('data-alias').split('|').map(function (a) { return norm(a); }) };
  });

  function run() {
    var text = norm(input.value);
    var hits = [];
    var k = 0;                       /* escalonado del acierto: 30 ms, máx. 12 (bloque 6.4) */
    terms.forEach(function (t) {
      var ok = text.length > 2 && t.aliases.some(function (a) { return text.indexOf(a) !== -1; });
      t.li.classList.toggle('is-hit', ok);
      if (ok) {
        hits.push(t.name);
        if (!reduce && k < 12) { t.li.style.setProperty('--i', k); k++; }
        else { t.li.style.removeProperty('--i'); }
      } else { t.li.style.removeProperty('--i'); }
    });
    var l = lang();
    if (!input.value.trim()) {
      out.textContent = '';
      termsBox.textContent = '';
      return;
    }
    out.textContent = hits.length
      ? (l === 'en'
        ? hits.length + (hits.length === 1 ? ' match with your role' : ' matches with your role')
        : hits.length + (hits.length === 1 ? ' coincidencia con tu oferta' : ' coincidencias con tu oferta'))
      : (l === 'en' ? 'No direct match; write to me and we’ll talk.' : 'Ninguna coincidencia directa; escríbeme y lo vemos.');
    termsBox.textContent = '';
    hits.forEach(function (h, i) {
      var s = document.createElement('span');
      s.textContent = h;
      if (!reduce && i < 12) s.style.setProperty('--i', i);
      termsBox.appendChild(s);
    });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  var clear = document.getElementById('match-clear');
  if (clear) clear.addEventListener('click', function () { input.value = ''; run(); input.focus(); });
  var lt = document.querySelector('[data-lang-toggle]');
  if (lt) lt.addEventListener('click', function () { setTimeout(run, 0); });
})();
