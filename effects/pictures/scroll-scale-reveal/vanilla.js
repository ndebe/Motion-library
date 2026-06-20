/* Scroll scale reveal — vanilla JS (zero dependencies).
   For each .ssr we compute raw progress as the block rises from
   "bottom edge at 90% of viewport" to "block centered", clamp 0..1,
   ease it (expo-out feel) and write it to the --p custom property.
   Scrubbed (tracks the scrollbar), not a one-shot.
   Honors prefers-reduced-motion. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = [...document.querySelectorAll('.ssr')];
  if (!els.length) return;

  if (reduce){ els.forEach(el => el.style.setProperty('--p', '1')); return; }

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const expoOut = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const vh = () => window.innerHeight || document.documentElement.clientHeight;

  let ticking = false;
  function update(){
    ticking = false;
    const h = vh();
    const start = h * 0.90;   // begins revealing when top crosses 90% of viewport
    const end   = h * 0.45;   // fully revealed near center
    for (const el of els){
      const top = el.getBoundingClientRect().top;
      const raw = clamp((start - top) / (start - end), 0, 1);
      el.style.setProperty('--p', expoOut(raw).toFixed(3));
    }
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }

  addEventListener('scroll', onScroll, { passive:true });
  addEventListener('resize', onScroll);
  update();

  window.ssrUpdate = update;
})();
