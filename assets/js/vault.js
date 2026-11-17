/* SyberVault · terminal behaviour
   - archive: the boot lines type out once per visit (sessionStorage), then the grep box filters the entries
   - notes: reading time, [copy] on code blocks, flashcard answers "decrypt" when opened
   Everything is already in the HTML; this only animates and filters. Reduced motion: no typing, no scramble. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* theme: [auto] → [light] → [dark] → [auto]. auto follows the device; a choice is kept in localStorage */
  var themeBtn = document.querySelector('.theme');
  if (themeBtn) {
    var root = document.documentElement, ORDER = ['auto', 'light', 'dark'];
    var current = function () { return root.getAttribute('data-theme') || 'auto'; };
    var show = function () {
      var t = current();
      themeBtn.textContent = '[' + t + ']';
      themeBtn.setAttribute('aria-label', 'Theme: ' + t + (t === 'auto' ? ' (follows your device)' : '') + '. Change theme');
    };
    themeBtn.addEventListener('click', function () {
      var t = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length];
      if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
      try { if (t === 'auto') localStorage.removeItem('sv-theme'); else localStorage.setItem('sv-theme', t); } catch (e) {}
      show();
    });
    show();
  }

  /* boot sequence */
  var boot = document.querySelector('.boot');
  if (boot && !reduced && !store.get('sv-boot')) {
    var lines = Array.prototype.slice.call(boot.querySelectorAll('.ln[data-type]'));
    boot.classList.add('typing');
    var i = 0;
    var next = function () {
      if (i >= lines.length) { boot.classList.remove('typing'); store.set('sv-boot', '1'); return; }
      var ln = lines[i++], full = ln.innerHTML, isCmd = ln.getAttribute('data-type') === 'cmd';
      ln.classList.add('now');
      if (!isCmd) { setTimeout(function () { ln.classList.add('done'); next(); }, 160); return; }
      // type the command text after the prompt, character by character
      var ps = ln.querySelector('.ps'), text = ln.textContent.slice(ps ? ps.textContent.length : 0), n = 0;
      ln.innerHTML = (ps ? ps.outerHTML : '') + '<span class="typed"></span><span class="cur">█</span>';
      var out = ln.querySelector('.typed');
      var tick = function () {
        out.textContent = text.slice(0, ++n);
        if (n < text.length) setTimeout(tick, 28);
        else setTimeout(function () { ln.innerHTML = full; ln.classList.add('done'); next(); }, 220);
      };
      setTimeout(tick, 120);
    };
    next();
  }

  /* grep filter on the archive */
  var input = document.getElementById('grep');
  if (input) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.ls li[data-q]'));
    var hits = document.querySelector('.hits'), none = document.querySelector('.none');
    var run = function () {
      var q = input.value.trim().toLowerCase(), n = 0;
      rows.forEach(function (li) { var on = !q || li.getAttribute('data-q').indexOf(q) > -1; li.hidden = !on; if (on) n++; });
      hits.textContent = q ? n + (n === 1 ? ' match' : ' matches') : rows.length + ' entries';
      none.hidden = n > 0;
    };
    input.addEventListener('input', run);
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); }
      if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; run(); }
    });
    run();
  }

  /* reading time */
  var prose = document.querySelector('.prose'), rt = document.getElementById('readTime');
  if (prose && rt) {
    var words = (prose.textContent.match(/\S+/g) || []).length;
    rt.textContent = '~' + Math.max(1, Math.round(words / 200)) + ' min read';
  }

  /* [copy] on code blocks */
  Array.prototype.forEach.call(document.querySelectorAll('.prose pre'), function (pre) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy'; b.textContent = '[copy]';
    b.addEventListener('click', function () {
      var t = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent;
      var done = function () { b.textContent = '[copied]'; setTimeout(function () { b.textContent = '[copy]'; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {}); else done();
    });
    pre.appendChild(b);
  });

  /* flashcards: the answer scrambles into place when opened */
  var GLYPHS = '01#$%&*+<>/\\|{}[]=~';
  Array.prototype.forEach.call(document.querySelectorAll('.review details'), function (d) {
    var p = d.querySelector('p'); if (!p) return;
    var html = p.innerHTML, text = p.textContent;
    d.addEventListener('toggle', function () {
      if (!d.open || reduced) return;
      var f = 0, frames = 14;
      var step = function () {
        f++;
        var k = Math.floor(text.length * f / frames);
        p.textContent = text.slice(0, k) + text.slice(k).replace(/\S/g, function () { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; });
        if (f < frames) requestAnimationFrame(step); else p.innerHTML = html;
      };
      step();
    });
  });
})();
