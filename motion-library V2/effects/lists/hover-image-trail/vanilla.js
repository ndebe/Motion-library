/* Hover image-trail list — vanilla JS (no dependencies). */
(() => {
  const fine = matchMedia('(pointer:fine)').matches;
  const img = document.querySelector('.hit__img');
  const list = document.querySelector('.hit');
  if (!fine || !img || !list) return;

  const lerp = (a, b, n) => a + (b - a) * n;
  let ix = innerWidth / 2, iy = innerHeight / 2, tx = ix, ty = iy;

  list.querySelectorAll('a').forEach((a) => {
    a.addEventListener('mouseenter', () => { img.src = a.dataset.img; img.classList.add('is-visible'); });
    a.addEventListener('mouseleave', () => img.classList.remove('is-visible'));
  });
  addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });

  (function loop(){
    ix = lerp(ix, tx, 0.12); iy = lerp(iy, ty, 0.12);   // heavier lag = trailing
    img.style.left = ix + 'px'; img.style.top = iy + 'px';
    requestAnimationFrame(loop);
  })();
})();
