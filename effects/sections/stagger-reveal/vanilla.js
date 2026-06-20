/* Stagger reveal — vanilla JS. One-shot IntersectionObserver toggling .in. */
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
})();
