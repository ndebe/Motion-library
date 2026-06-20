/* Scroll parallax — vanilla JS (zero dependencies).
   For each .px-layer we compute the parent frame's progress through the
   viewport (0 when the frame enters at the bottom, 1 when it leaves the top)
   and translate the layer by (progress - 0.5) * speed * frameHeight.
   One shared rAF loop; only writes transforms when on-screen.
   Honors prefers-reduced-motion. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const layers = [...document.querySelectorAll('.px-layer')];
  if (!layers.length) return;

  // Use the closest .px-frame as the progress reference; fall back to the layer.
  const items = layers.map(el => ({
    el,
    frame: el.closest('.px-frame') || el,
    speed: parseFloat(el.dataset.speed) || 0.18,
  }));

  // Allow the demo (or a smooth-scroll wrapper) to report a custom scroll root.
  const vh = () => window.innerHeight || document.documentElement.clientHeight;

  let ticking = false;
  function update(){
    ticking = false;
    const h = vh();
    for (const it of items){
      const r = it.frame.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) continue;        // off-screen, skip
      // progress: 0 as frame enters bottom, 1 as it exits top
      const progress = (h - r.top) / (h + r.height);
      const shift = (progress - 0.5) * it.speed * r.height;
      it.el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    }
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }

  addEventListener('scroll', onScroll, { passive:true });
  addEventListener('resize', onScroll);
  update();

  window.pxParallaxUpdate = update; // for demos driving a custom scroller
})();
