#!/usr/bin/env node
/* Motion Library build script — zero dependencies (Node built-ins only).
   Scans effects/**, validates effect.json, detects which stacks each effect
   ships, then writes:
     - index.json   (searchable catalog)
     - gallery.html (browsable live gallery with code + copy buttons)
   Run:  node scripts/build.mjs
*/
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EFFECTS_DIR = join(ROOT, 'effects');

/* map a filename -> stack label */
const STACK_FILES = {
  'vanilla.js': 'vanilla',
  'vanilla.css': 'vanilla',
  'css-only.css': 'css',
  'gsap.js': 'gsap',
  'react.jsx': 'react',
  'lenis.js': 'lenis',
};
const REQUIRED = ['id', 'title', 'category'];

/* recursively find every directory containing an effect.json */
function findEffects(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, 'effect.json'))) out.push(p);
    else out.push(...findEffects(p));
  }
  return out;
}

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const effects = [];
const errors = [];

for (const dir of findEffects(EFFECTS_DIR)) {
  let meta;
  try { meta = JSON.parse(readFileSync(join(dir, 'effect.json'), 'utf8')); }
  catch (e) { errors.push(`Bad JSON in ${dir}: ${e.message}`); continue; }

  for (const k of REQUIRED) if (!meta[k]) errors.push(`${dir} missing "${k}"`);

  const files = readdirSync(dir);
  const stacks = [...new Set(files.map((f) => STACK_FILES[f]).filter(Boolean))];

  // collect code files (for the gallery code panel)
  const code = {};
  for (const f of files) {
    if (/\.(css|js|jsx)$/.test(f) && f !== 'demo.html') code[f] = readFileSync(join(dir, f), 'utf8');
  }

  const rel = relative(ROOT, dir).split('\\').join('/');
  effects.push({
    ...meta,
    path: rel,
    demo: existsSync(join(dir, 'demo.html')) ? `${rel}/demo.html` : null,
    stacks,
    files: files.filter((f) => f !== 'effect.json'),
    _code: code, // stripped from index.json, used only for gallery
  });
}

effects.sort((a, b) => (a.category + a.id).localeCompare(b.category + b.id));

/* ---- write index.json (without the heavy _code blobs) ---- */
const catalog = effects.map(({ _code, ...rest }) => rest);
writeFileSync(join(ROOT, 'index.json'), JSON.stringify(catalog, null, 2));

/* ---- collect filter facets ---- */
const facet = (key) => [...new Set(effects.flatMap((e) => [].concat(e[key] || [])))].sort();
const categories = facet('category');
const targets = facet('target');
const triggers = facet('trigger');
const types = facet('type');

/* ---- write gallery.html ---- */
const cards = effects.map((e, i) => {
  const tabs = Object.keys(e._code);
  const codePanels = tabs.map((f, j) => `
        <pre class="code ${j === 0 ? 'show' : ''}" data-code="${i}-${j}"><button class="copy" onclick="copyCode(this)">copy</button><code>${esc(e._code[f])}</code></pre>`).join('');
  const tabBtns = tabs.map((f, j) => `<button class="tab ${j === 0 ? 'on' : ''}" onclick="showCode(${i},${j},this)">${esc(f)}</button>`).join('');
  const chips = [].concat(e.target || []).concat(e.trigger || []).concat(e.type || [])
    .map((t) => `<span class="chip">${esc(t)}</span>`).join('');
  const verified = e.source && e.source.verified ? '<span class="badge">verified</span>' : '';
  return `
    <article class="card" data-cat="${esc(e.category)}" data-search="${esc([e.title, e.id, (e.tags||[]).join(' '), (e.target||[]).join(' '), (e.trigger||[]).join(' '), (e.type||[]).join(' ')].join(' ').toLowerCase())}">
      <header>
        <div><span class="cat">${esc(e.category)}</span> ${verified}</div>
        <h3>${esc(e.title)}</h3>
        <p class="desc">${esc(e.description || '')}</p>
        <div class="chips">${chips}</div>
      </header>
      ${e.demo ? `<iframe loading="lazy" src="${esc(e.demo)}"></iframe>` : '<div class="nodemo">no demo</div>'}
      <div class="tabs">${tabBtns}</div>
      ${codePanels}
    </article>`;
}).join('');

const catButtons = ['all', ...categories]
  .map((c) => `<button class="filter ${c === 'all' ? 'on' : ''}" onclick="filterCat('${c}',this)">${c}</button>`).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Motion Library</title>
<style>
  :root{ --bg:#0d0d0d; --fg:#f4f1ea; --muted:#8a8a82; --accent:#ff4d2e; --line:rgba(255,255,255,.1); }
  *{ box-sizing:border-box; } body{ margin:0; background:var(--bg); color:var(--fg);
    font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; }
  header.top{ padding:42px 32px 18px; }
  h1{ margin:0; font-size:34px; letter-spacing:-.02em; } .sub{ color:var(--muted); font-size:14px; margin-top:6px; }
  .controls{ position:sticky; top:0; z-index:20; background:rgba(13,13,13,.92); backdrop-filter:blur(8px);
    padding:14px 32px; border-bottom:1px solid var(--line); display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  input.search{ background:#1a1a1a; border:1px solid var(--line); color:var(--fg); border-radius:100px;
    padding:9px 16px; font:inherit; font-size:13px; min-width:220px; }
  .filter,.tab,.copy{ font:inherit; cursor:pointer; }
  .filter{ background:transparent; color:var(--muted); border:1px solid var(--line); border-radius:100px;
    padding:7px 14px; font-size:12px; letter-spacing:.04em; text-transform:capitalize; }
  .filter.on{ background:var(--fg); color:var(--bg); border-color:var(--fg); }
  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:20px; padding:24px 32px 80px; }
  .card{ border:1px solid var(--line); border-radius:12px; overflow:hidden; background:#101010; display:flex; flex-direction:column; }
  .card header{ padding:16px 16px 8px; } .cat{ font-family:ui-monospace,monospace; font-size:11px;
    letter-spacing:.12em; text-transform:uppercase; color:var(--accent); }
  .badge{ font-family:ui-monospace,monospace; font-size:10px; color:#0d0d0d; background:#7ee787;
    border-radius:100px; padding:1px 8px; margin-left:6px; }
  .card h3{ margin:8px 0 4px; font-size:18px; letter-spacing:-.01em; }
  .desc{ color:var(--muted); font-size:13px; margin:0 0 10px; line-height:1.45; }
  .chips{ display:flex; flex-wrap:wrap; gap:6px; }
  .chip{ font-family:ui-monospace,monospace; font-size:10.5px; color:var(--muted);
    border:1px solid var(--line); border-radius:100px; padding:2px 8px; }
  iframe{ width:100%; height:300px; border:0; background:#000; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .nodemo{ padding:40px; text-align:center; color:var(--muted); }
  .tabs{ display:flex; gap:4px; padding:10px 12px 0; flex-wrap:wrap; }
  .tab{ background:transparent; color:var(--muted); border:1px solid var(--line); border-bottom:0;
    border-radius:8px 8px 0 0; padding:6px 12px; font-family:ui-monospace,monospace; font-size:11px; }
  .tab.on{ color:var(--fg); background:#1a1a1a; }
  pre.code{ display:none; position:relative; margin:0; max-height:280px; overflow:auto; background:#1a1a1a;
    padding:14px; font-family:ui-monospace,monospace; font-size:11.5px; line-height:1.5; color:#d7d3c8; }
  pre.code.show{ display:block; } pre.code code{ white-space:pre; }
  .copy{ position:absolute; top:8px; right:8px; background:var(--fg); color:var(--bg); border:0;
    border-radius:6px; padding:4px 10px; font-family:ui-monospace,monospace; font-size:11px; }
  .copy:hover{ background:var(--accent); color:#fff; } .count{ color:var(--muted); font-size:12px; margin-left:auto; }
</style></head><body>
  <header class="top"><h1>Motion Library</h1>
    <div class="sub">${effects.length} effects · grouped by where they act · filter, preview, copy. Generated by scripts/build.mjs.</div>
  </header>
  <div class="controls">
    <input class="search" placeholder="search title, tag, target…" oninput="doSearch(this.value)" />
    ${catButtons}
    <span class="count" id="count"></span>
  </div>
  <main class="grid" id="grid">${cards}</main>
<script>
  let activeCat='all', query='';
  function apply(){
    let shown=0;
    document.querySelectorAll('.card').forEach(c=>{
      const okCat = activeCat==='all' || c.dataset.cat===activeCat;
      const okQ = !query || c.dataset.search.includes(query);
      const show = okCat && okQ; c.style.display = show?'flex':'none'; if(show) shown++;
    });
    document.getElementById('count').textContent = shown+' shown';
  }
  function filterCat(c,btn){ activeCat=c; document.querySelectorAll('.filter').forEach(b=>b.classList.remove('on')); btn.classList.add('on'); apply(); }
  function doSearch(v){ query=v.trim().toLowerCase(); apply(); }
  function showCode(i,j,btn){
    btn.parentElement.querySelectorAll('.tab').forEach(b=>b.classList.remove('on')); btn.classList.add('on');
    const card=btn.closest('.card'); card.querySelectorAll('pre.code').forEach(p=>p.classList.remove('show'));
    card.querySelector('[data-code="'+i+'-'+j+'"]').classList.add('show');
  }
  function copyCode(btn){ const code=btn.parentElement.querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(()=>{ const t=btn.textContent; btn.textContent='copied'; setTimeout(()=>btn.textContent=t,1200); }); }
  apply();
</script>
</body></html>`;

writeFileSync(join(ROOT, 'gallery.html'), html);

console.log(`✓ ${effects.length} effects → index.json + gallery.html`);
console.log(`  categories: ${categories.join(', ')}`);
if (errors.length) { console.error('\\n⚠ validation issues:'); errors.forEach((e) => console.error('  - ' + e)); process.exitCode = 1; }
