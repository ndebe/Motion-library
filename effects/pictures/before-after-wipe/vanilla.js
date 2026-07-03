/* Before/after image-wipe reveal — drag (or hover) to wipe between two images.
 * Auto-inits every .ba-wipe on the page. Zero dependencies.
 */
(function () {
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function init(el) {
    if (!el || el.__baInit) return;
    el.__baInit = true;

    var dragging = false;

    function setFromClientX(clientX) {
      var r = el.getBoundingClientRect();
      var pct = clamp(((clientX - r.left) / r.width) * 100, 0, 100);
      el.style.setProperty('--pos', pct + '%');
    }

    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
    });
    el.addEventListener('pointermove', function (e) {
      // follow on hover too (feels alive on desktop); always follow while dragging
      if (dragging || e.pointerType === 'mouse') setFromClientX(e.clientX);
    });
    function stop() { dragging = false; }
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);

    // keyboard support: focusable, arrow keys nudge the divider
    el.tabIndex = 0;
    el.setAttribute('role', 'slider');
    el.setAttribute('aria-label', 'Reveal before/after');
    el.addEventListener('keydown', function (e) {
      var cur = parseFloat(getComputedStyle(el).getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft') { el.style.setProperty('--pos', clamp(cur - 4, 0, 100) + '%'); e.preventDefault(); }
      if (e.key === 'ArrowRight') { el.style.setProperty('--pos', clamp(cur + 4, 0, 100) + '%'); e.preventDefault(); }
    });

    // gentle one-time intro sweep so the effect announces itself (skipped if reduced motion)
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      var start = null, dur = 1100;
      function intro(t) {
        if (start === null) start = t;
        var k = clamp((t - start) / dur, 0, 1);
        // ease in-out, sweep 50 -> 80 -> 50
        var e2 = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var pos = 50 + Math.sin(e2 * Math.PI) * 30;
        el.style.setProperty('--pos', pos + '%');
        if (k < 1) requestAnimationFrame(intro);
        else el.style.setProperty('--pos', '50%');
      }
      requestAnimationFrame(intro);
    }
  }

  function boot() {
    var nodes = document.querySelectorAll('.ba-wipe');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
