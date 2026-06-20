/* Pinned scroll section — vanilla JS (zero dependencies).
   The CSS sticky stage does the pin. We read how far the .pin-track has
   scrolled through its own height (0..1) and map that to a horizontal
   translate of .pin-row so the panels scrub left as you scroll down.
   Honors prefers-reduced-motion (bails; CSS stacks the panels). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const tracks = [...document.querySelectorAll('.pin-track')];
  if (!tracks.length) return;

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const vh = () => window.innerHeight || document.documentElement.clientHeight;

  // Auto-size each track tall enough to scrub its row, if not styled inline.
  function size(track){
    const row = track.querySelector('.pin-row');
    if (!row) return 0;
    const travel = Math.max(0, row.scrollWidth - (window.innerWidth || row.clientWidth));
    // total scrollable distance = one viewport of pin + the horizontal travel
    track.style.height = (vh() + travel) + 'px';
    return travel;
  }
  const travels = new WeakMap();
  function sizeAll(){ tracks.forEach(t => travels.set(t, size(t))); update(); }

  let ticking = false;
  function update(){
    ticking = false;
    const h = vh();
    for (const track of tracks){
      const row = track.querySelector('.pin-row');
      const bar = track.querySelector('.pin-progress > i');
      if (!row) continue;
      const r = track.getBoundingClientRect();
      const total = r.height - h;                  // distance available to scrub
      const progress = clamp(-r.top / (total || 1), 0, 1);
      const travel = travels.get(track) || 0;
      row.style.transform = `translate3d(${(-progress * travel).toFixed(2)}px,0,0)`;
      if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
    }
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }

  addEventListener('scroll', onScroll, { passive:true });
  addEventListener('resize', sizeAll);
  sizeAll();

  window.pinScrollUpdate = update;
})();
