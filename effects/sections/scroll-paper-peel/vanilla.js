/* Scroll paper peel — vanilla JS (zero dependencies).
   For each .peel we map how far the sticky stage has scrolled through its own
   height to a 0..1 progress, ease it, and write it to --p. Because it is scrubbed
   to scroll position (not a one-shot), scrolling down folds the corner and
   scrolling back up un-folds it — the fold follows the scroll direction.
   Honors prefers-reduced-motion. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = [...document.querySelectorAll('.peel')];
  if (!sections.length) return;

  if (reduce){ sections.forEach(s => s.style.setProperty('--p', '0')); return; }

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  // gentle ease-in-out so the corner starts and settles softly
  const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const vh = () => window.innerHeight || document.documentElement.clientHeight;

  let ticking = false;
  function update(){
    ticking = false;
    for (const sec of sections){
      const r = sec.getBoundingClientRect();
      // travel = distance the sticky stage is pinned for (section height - one viewport)
      const travel = sec.offsetHeight - vh();
      const raw = clamp(-r.top / (travel || 1), 0, 1);
      sec.style.setProperty('--p', easeInOut(raw).toFixed(4));
    }
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  window.peelUpdate = update;
})();
