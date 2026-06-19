/* Smooth / inertia scroll — vanilla JS, transform-based.
   Wrap your page content:  <div id="smooth-content"> … </div>
   We translate the wrapper toward the native scroll position with easing, and
   set body height so the native scrollbar still works.
   Honors prefers-reduced-motion (falls back to native scroll). */
(() => {
  const content = document.getElementById('smooth-content');
  if (!content) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // native scroll

  const lerp = (a, b, n) => a + (b - a) * n;
  let current = 0;

  function setHeight(){ document.body.style.height = content.getBoundingClientRect().height + 'px'; }
  content.style.position = 'fixed';
  content.style.top = '0'; content.style.left = '0'; content.style.width = '100%';
  content.style.willChange = 'transform';
  setHeight();
  addEventListener('resize', setHeight);

  (function raf(){
    current = lerp(current, window.scrollY, 0.1);          // <- the "lerp" knob (Lenis default ~0.1)
    if (Math.abs(window.scrollY - current) < 0.05) current = window.scrollY;
    content.style.transform = `translate3d(0, ${-current}px, 0)`;
    requestAnimationFrame(raf);
  })();
})();

/* ---------------------------------------------------------------------------
   PRODUCTION: just use Lenis instead of the above.
     import Lenis from 'lenis'
     const lenis = new Lenis({ lerp: 0.1 })
     function raf(t){ lenis.raf(t); requestAnimationFrame(raf) }
     requestAnimationFrame(raf)
   (Pair with GSAP ScrollTrigger via lenis.on('scroll', ScrollTrigger.update).)
--------------------------------------------------------------------------- */
