/* Magnetic button — vanilla JS (no dependencies). */
(() => {
  const fine = matchMedia('(pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  const STRENGTH = 0.35, LABEL = 0.55;
  document.querySelectorAll('.mag').forEach((el) => {
    const label = el.querySelector('.mag__label');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transition = 'transform .15s ease-out';
      el.style.transform = `translate(${x * STRENGTH}px, ${y * STRENGTH}px)`;
      if (label) label.style.transform = `translate(${x * STRENGTH * LABEL}px, ${y * STRENGTH * LABEL}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.style.transform = 'translate(0,0)';
      if (label) label.style.transform = 'translate(0,0)';
    });
  });
})();
