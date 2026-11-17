# SyberVault

Security notes Joana Daphne Sy (dvphnc) wrote while studying cybersecurity: ISC2 CC official training and CTF practice on TryHackMe.

Live at https://dvphnc.github.io/sybervault/ · portfolio at https://dvphnc.github.io/

## Design: terminal vault

Black screen, green phosphor, monospace everywhere (JetBrains Mono), faint scanlines. One dark theme on purpose.
The archive types a short unlock sequence once per visit, then lists the entries like `ls` with a working `grep` filter
(press `/` to focus it, `esc` to clear). Notes read like `cat file.md`: `#` / `##` headings, a phosphor-green cover that
gets its colour back on hover, `[copy]` on code blocks, and quick-review answers that "decrypt" when opened.
Reduced motion: no typing, no scramble.

## Structure

```
content/notes.json      every note: order, tag, titles, category, cover, sections, review cards, key terms
content/<slug>.html     each note's body (plain HTML)
tools/build.mjs         renders index.html and the note pages from content/ (node tools/build.mjs)
index.html, *.html      generated pages; filenames are the old ones so existing links keep working
covers/                 note cover images (webp, originals alongside)
assets/css/vault.css    all styles
assets/js/vault.js      boot sequence, grep, reading time, copy buttons, decrypt effect
```

## Adding a note

1. Write the body as `content/<slug>.html` (use `<h2 id="...">` for sections).
2. Add an entry to `content/notes.json` (copy one, set `n`, `file`, `slug`, `tag`, `short`, `desc`, `title`, `sub`,
   `category`, `cover`, `toc` matching the `<h2 id>`s, `quote`, `review`, `terms`) and add its cover to `covers/`.
3. Run `node tools/build.mjs`, check it locally, commit and push.

After changing `vault.css` or `vault.js`, bump `V` in `tools/build.mjs` and rebuild so visitors get the new files.

Moved out of the portfolio repo (`dvphnc/dvphnc.github.io`, formerly `notes/`) in November 2026; the old `notes/`
addresses there forward here.