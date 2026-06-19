/* Scroll reveal — vanilla JS (Web Animations API, zero dependencies).
   One-shot on scroll-in. Variant via data-variant. */

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = {
    power2out: 'cubic-bezier(0.215,0.610,0.355,1)',
    power1io:  'cubic-bezier(0.455,0.03,0.515,0.955)',
  };
  const NATURAL = { opacity: 1, transform: 'translateY(0) skewY(0) rotateX(0) rotateY(0)', filter: 'blur(0px)' };

  const VARIANTS = {
    default: { from: { opacity: 0, transform: 'translateY(24px) skewY(-4deg) rotateY(10deg)', filter: 'blur(6px)' }, duration: 3000, easing: EASE.power2out },
    rise:    { from: { opacity: 0, transform: 'translateY(48px)' },                                                  duration: 2000, easing: EASE.power2out },
    tilt:    { from: { opacity: 0, transform: 'translateY(16px) rotateX(4deg) rotateY(14deg)' },                     duration: 2600, easing: EASE.power1io },
    blur:    { from: { opacity: 0, filter: 'blur(14px)' },                                                           duration: 2400, easing: EASE.power2out },
    skew:    { from: { opacity: 0, transform: 'translateY(30px) skewY(-6deg)' },                                     duration: 2200, easing: EASE.power2out },
  };

  function play(el){
    const v = VARIANTS[el.dataset.variant] || VARIANTS.default;
    if (reduce){ el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'both' }); return; }
    el.animate(
      [Object.assign({ offset: 0 }, v.from), Object.assign({ offset: 1 }, NATURAL)],
      { duration: v.duration, easing: v.easing, fill: 'both' }
    );
  }

  const els = [...document.querySelectorAll('.sr-reveal')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ play(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));

  window.srReplayAll = () => els.forEach((el, i) => setTimeout(() => play(el), i * 90));
})();
