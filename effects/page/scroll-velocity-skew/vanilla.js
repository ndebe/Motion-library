/* Scroll velocity skew — vanilla JS (zero dependencies).
   Tracks scroll velocity (px/frame), smooths it with a lerp so it feels
   weighted, maps it to a clamped skewY plus a tiny scaleY, and springs
   back to flat when scrolling stops. Pairs naturally with a smooth-scroll
   wrapper but works on native scroll too.
   Honors prefers-reduced-motion. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const els = [...document.querySelectorAll('.vskew')];
  if (!els.length) return;

  const SKEW_MAX = 6;        // deg clamp
  const SMOOTH   = 0.1;      // velocity lerp (Lenis-like)
  const FACTOR   = 0.35;     // px/frame -> deg

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  let last = window.scrollY;
  let vel = 0, smooth = 0;

  function raf(){
    const y = window.scrollY;
    vel = y - last;
    last = y;
    smooth += (vel - smooth) * SMOOTH;
    if (Math.abs(smooth) < 0.01) smooth = 0;

    const sk = clamp(smooth * FACTOR, -SKEW_MAX, SKEW_MAX);
    const scl = 1 + Math.min(Math.abs(sk) / SKEW_MAX, 1) * 0.04;
    for (const el of els){
      el.style.setProperty('--sk', sk.toFixed(2) + 'deg');
      el.style.setProperty('--scl', scl.toFixed(3));
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
