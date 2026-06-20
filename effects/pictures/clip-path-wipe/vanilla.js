/* Clip-path wipe — vanilla JS (Web Animations API, zero dependencies).
   Reveals each .cw-reveal once when it scrolls into view (one-shot, like the
   source site). Direction via data-dir = left | right | down | up. */

(() => {
  const OPEN = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  const FROM = {
    left:  'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
    right: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    down:  'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    up:    'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
  };
  const EASE = 'cubic-bezier(0.215,0.610,0.355,1)'; // ~ GSAP power2.out
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function play(el){
    if (reduce){ el.style.clipPath = OPEN; return; }
    const dir = el.dataset.dir || 'left';
    el.animate(
      [{ clipPath: FROM[dir] || FROM.left }, { clipPath: OPEN }],
      { duration: Number(el.dataset.duration) || 1600, easing: EASE, fill: 'both' }
    );
  }

  const els = [...document.querySelectorAll('.cw-reveal')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ play(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));

  // expose a manual replay (used by the gallery demo's button)
  window.cwReplayAll = () => els.forEach((el, i) => setTimeout(() => play(el), i * 120));
})();
