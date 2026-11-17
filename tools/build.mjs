// SyberVault page generator: content/notes.json + content/<slug>.html → index.html and one page per note.
// Run from the repo root after any content change: node tools/build.mjs
// Page filenames stay the old ones (e.g. "CWE-89 - SQL Injection.html") so every existing link keeps working.
import { readFileSync, writeFileSync } from 'node:fs';

const V = '20261117';
const { meta, notes } = JSON.parse(readFileSync('content/notes.json', 'utf8'));
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
const href = (file) => encodeURIComponent(file).replace(/%2F/g, '/');
const pad = (n) => String(n).padStart(3, '0');
const total = pad(notes.length);
const tagClass = (t) => (/^cwe/i.test(t) ? 'cwe' : t === 'basics' ? 'basics' : 'other');

const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23050806'/%3E%3Cpath d='M8 10l6 6-6 6' fill='none' stroke='%2339ff88' stroke-width='2.6' stroke-linecap='square'/%3E%3Crect x='16' y='20' width='9' height='2.6' fill='%2339ff88'/%3E%3C/svg%3E";

const head = (title, desc) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}"/>
  <meta name="color-scheme" content="dark"/>
  <meta name="theme-color" content="#050806"/>
  <link rel="icon" href="${favicon}"/>
  <script>document.documentElement.classList.add('js');</script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"/>
  <link rel="stylesheet" href="assets/css/vault.css?v=${V}"/>
</head>
<body>
`;

const bar = (path) => `  <header class="bar">
    <a class="brand" href="index.html">sybervault<span class="cur" aria-hidden="true">_</span></a>
    <span class="path">${path}</span>
    <a class="bar-link" href="${meta.portfolio}">dvphnc ↗</a>
  </header>
`;

const foot = `      <footer class="foot">
        <span>© 2026 joana daphne sy · dvphnc</span>
        <nav aria-label="Elsewhere"><a href="${meta.tryhackme}" target="_blank" rel="noopener">tryhackme ↗</a><a href="${meta.portfolio}">portfolio ↗</a></nav>
      </footer>
`;

const tail = `  <script src="assets/js/vault.js?v=${V}"></script>
</body>
</html>
`;

/* ── archive ── */
const rows = notes.map((n) => {
  const q = [n.tag, strip(n.short), strip(n.title), strip(n.desc), n.category].join(' ').toLowerCase();
  return `          <li data-q="${esc(q)}"><a href="${href(n.file)}"><span class="id">${pad(n.n)}</span><span class="tag ${tagClass(n.tag)}">${esc(n.tag)}</span><span class="entry"><b>${n.short}</b><span>${n.desc}</span></span><span class="go" aria-hidden="true">→</span></a></li>`;
}).join('\n');

const index = head('SyberVault · security notes by dvphnc', `SyberVault: ${notes.length} security notes Joana Daphne Sy (dvphnc) wrote while studying cybersecurity: OWASP, CWE injection flaws, encryption, cloud, network and email security.`)
+ bar('~/vault')
+ `  <main class="term">
    <div class="boot" aria-label="Vault unlocked">
      <p class="ln" data-type="cmd"><span class="ps">$ </span>./sybervault --unlock</p>
      <p class="ln c" data-type="out">verifying key ......... <span class="ok">ok</span></p>
      <p class="ln c" data-type="out"><span class="ok">[ok]</span> access granted · ${notes.length} entries · read-only</p>
    </div>

    <h1 class="vault-title">sybervault</h1>
    <p class="lead">The security notes I wrote while studying cybersecurity: ISC2 CC training and <a href="${meta.tryhackme}" target="_blank" rel="noopener">CTF practice on TryHackMe ↗</a>. Injection flaws, the basics, network, email and tools.</p>

    <div class="grep" role="search">
      <label for="grep">$ grep -i</label>
      <input id="grep" type="search" placeholder="sql, xss, encryption..." autocomplete="off" spellcheck="false"/>
      <span class="hits" aria-live="polite">${notes.length} entries</span>
    </div>

    <div class="ls-head" aria-hidden="true"><span>id</span><span>tag</span><span>entry</span><span></span></div>
    <ol class="ls">
${rows}
    </ol>
    <p class="none" hidden>no matches. try another word, or press esc to clear.</p>

    <p class="ln prompt-end"><span class="ps">$ </span><span class="cur" aria-hidden="true">█</span></p>

${foot}  </main>

${tail}`;
writeFileSync('index.html', index);

/* ── notes ── */
notes.forEach((n, i) => {
  const prev = notes[i - 1], next = notes[i + 1];
  const prose = readFileSync(`content/${n.slug}.html`, 'utf8').trimEnd();
  const toc = n.toc.map((t) => `          <li><a href="#${t.id}">${t.text}</a></li>`).join('\n');
  const review = n.review.map((r) => `        <details><summary>${r.q}</summary><p>${r.a}</p></details>`).join('\n');
  const terms = n.terms.map((t) => `        <div><dt>${t.t}</dt><dd>${t.d}</dd></div>`).join('\n');
  const pager = `      <nav class="pager" aria-label="More entries">
${prev ? `        <a class="prev" href="${href(prev.file)}"><small>← ${pad(prev.n)}</small><b>${prev.short}</b></a>` : '        <span></span>'}
${next ? `        <a class="next" href="${href(next.file)}"><small>${pad(next.n)} →</small><b>${next.short}</b></a>` : ''}
      </nav>
`;
  const page = head(`${strip(n.title)} · SyberVault · dvphnc`, `${strip(n.sub)}. A SyberVault security note by Joana Daphne Sy (dvphnc).`)
  + bar(`<a href="index.html">~/vault</a>/${n.slug}.md`)
  + `  <main class="term">
    <article>
      <p class="ln"><span class="ps">$ </span>cat ${n.slug}.md</p>
      <h1 class="note-title">${n.title}</h1>
      <p class="note-sub">${n.sub}</p>
      <p class="meta"><span>entry ${pad(n.n)}/${total}</span><span>${esc(n.category.toLowerCase())}</span><span id="readTime">min read</span><span>joana daphne sy</span></p>

      <figure class="cover"><img src="${n.cover}" alt="${esc(strip(n.title))}" width="1200" height="525"/><figcaption>${n.cover.split('/').pop()}</figcaption></figure>

      <details class="toc" open>
        <summary>ls ./sections</summary>
        <ol>
${toc}
        </ol>
      </details>

      <div class="prose">
${prose}
      </div>

      <blockquote class="quote">${n.quote}</blockquote>

      <section class="block" aria-labelledby="h-review">
        <div class="block-head"><h2 id="h-review">quick review</h2><span>open to decrypt</span></div>
        <div class="review">
${review}
        </div>
      </section>

      <section class="block" aria-labelledby="h-terms">
        <div class="block-head"><h2 id="h-terms">key terms</h2></div>
        <dl class="terms">
${terms}
        </dl>
      </section>

${pager}
      <p class="ln prompt-end"><span class="ps">$ </span><a href="index.html" class="c">cd ..</a><span class="cur" aria-hidden="true">█</span></p>
    </article>

${foot}  </main>

${tail}`;
  writeFileSync(n.file, page);
});
console.log(`built index.html + ${notes.length} notes`);
