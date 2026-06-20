/* Scroll reveal — GSAP + ScrollTrigger port (production; matches the real site).
   Requires: gsap, ScrollTrigger.   <div class="sr-reveal" data-variant="tilt"> */
gsap.registerPlugin(ScrollTrigger);

const SR_VARIANTS = {
  default: { opacity: 0, y: 24, skewY: -4, rotateY: 10, filter: 'blur(6px)', duration: 3,   ease: 'power2.out' },
  rise:    { opacity: 0, y: 48,                                              duration: 2,   ease: 'power2.out' },
  tilt:    { opacity: 0, y: 16, rotateX: 4, rotateY: 14,                     duration: 2.6, ease: 'power1.inOut' },
  blur:    { opacity: 0, filter: 'blur(14px)',                              duration: 2.4, ease: 'power2.out' },
  skew:    { opacity: 0, y: 30, skewY: -6,                                  duration: 2.2, ease: 'power2.out' },
};

gsap.utils.toArray('.sr-reveal').forEach((el) => {
  const v = SR_VARIANTS[el.dataset.variant] || SR_VARIANTS.default;
  gsap.from(el, {
    ...v,
    overwrite: false,
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
  });
});
