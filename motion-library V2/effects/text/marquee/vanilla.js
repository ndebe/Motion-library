/* Marquee with scroll-velocity surge — vanilla JS (no dependencies).
   The .mq__inner must contain TWO copies of the item set for a seamless loop. */
(() => {
  const track = document.querySelector('.mq__inner');
  if (!track) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // hold still

  const BASE = 0.6;          // constant drift (px/frame)
  const VEL = 0.6;           // how much scroll speed adds
  let offset = 0, lastScroll = window.scrollY, velocity = 0;

  addEventListener('scroll', () => {
    velocity = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
  }, { passive: true });

  (function loop(){
    const half = track.scrollWidth / 2;             // one full set width
    offset -= BASE + Math.abs(velocity) * VEL;      // surge with scroll speed
    if (Math.abs(offset) >= half) offset += half;   // wrap seamlessly
    velocity *= 0.9;                                 // decay the surge
    track.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(loop);
  })();
})();
