/* Clip-path wipe — GSAP + ScrollTrigger port (production version).
   Requires: gsap, ScrollTrigger.  This mirrors the real vanschneider.com setup.

   <img class="cw-reveal" data-dir="left">  (left | right | down | up)
*/
gsap.registerPlugin(ScrollTrigger);

const CW_FROM = {
  left:  'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
  right: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
  down:  'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
  up:    'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
};

gsap.utils.toArray('.cw-reveal').forEach((el) => {
  const dir = el.dataset.dir || 'left';
  gsap.from(el, {
    clipPath: CW_FROM[dir],
    duration: 1.6,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
  });
});
