/* Sticky nav tint — vanilla JS. Toggles .tinted past a scroll threshold. */
(() => {
  const nav = document.querySelector('.st-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('tinted', window.scrollY > window.innerHeight * 0.6);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
