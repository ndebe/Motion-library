/* <effect> — vanilla JS (Web Animations API, zero dependencies).
   Respect prefers-reduced-motion. Expose a window.<id>ReplayAll() if it helps the gallery. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ...select elements, animate with el.animate([...], {...})...
})();
