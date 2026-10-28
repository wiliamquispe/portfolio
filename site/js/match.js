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
    terms.forEach(function (t) {
      var ok = text.length > 2 && t.aliases.some(function (a) { return text.indexOf(a) !== -1; });
      t.li.classList.toggle('is-hit', ok);
      if (ok) hits.push(t.name);
    });
    var l = lang();
    if (!input.value.trim()) {
      out.textContent = '';
      termsBox.textContent = '';
      return;
    }
    out.textContent = hits.length
      ? (l === 'en' ? hits.length + ' of ' + terms.length + ' terms match' : hits.length + ' de ' + terms.length + ' términos coinciden')
      : (l === 'en' ? 'No listed term appears in that text.' : 'Ningún término de la lista aparece en ese texto.');
    termsBox.textContent = '';
    hits.forEach(function (h) { var s = document.createElement('span'); s.textContent = h; termsBox.appendChild(s); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  var clear = document.getElementById('match-clear');
  if (clear) clear.addEventListener('click', function () { input.value = ''; run(); input.focus(); });
  var lt = document.querySelector('[data-lang-toggle]');
  if (lt) lt.addEventListener('click', function () { setTimeout(run, 0); });
})();
