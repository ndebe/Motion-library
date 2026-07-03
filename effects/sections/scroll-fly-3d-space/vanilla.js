/* Scroll-to-fly 3D project space — vanilla JS (zero dependencies).
   Recreated from tolanidaniel.me "SPACE" view; values read from the live
   site's minified source, so the numbers below are the real ones.

   How it works
   - Virtual scroll: wheel/touch is hijacked into a target value that a
     lerp (0.08) chases, giving the camera weight. camZ = current * 2.4.
   - Cards sit at z = -i * 800 and are scattered on a 3-turn spiral:
     angle = i/count * PI*6 → x = cos*26vw, y = sin*24vh, rotZ = ±7°.
   - Depth wraps modulo (count * 800) so the field loops forever.
   - Fades: in across z -3000→-2000, out across z 100→500 (past the lens).
   - Starfield: 110 dots, random xy over ~2.2 viewports, random depth;
     scale3d(1,1, 1 + |vel|*0.12) stretches them into warp streaks.
   - Feel: world tilts rotateX/rotateY with the mouse (±5°) plus a small
     velocity pitch; viewport perspective narrows 1000→400 with speed.
   - Hover: cursor rect hit-test (+22px margin) picks the nearest card,
     which lerps 50px toward the camera.
   Honors prefers-reduced-motion (static grid, native scroll). */
(() => {
  const viewport = document.querySelector('.fly-viewport');
  const world = document.querySelector('.fly-world');
  if (!viewport || !world) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // CSS fallback lays cards out as a static grid

  const CFG = {
    zGap: 800,          // z distance between cards
    camSpeed: 2.4,      // scroll px -> camera z
    lerp: 0.08,         // camera smoothing
    touchMult: 2.2,     // touch drag multiplier
    starCount: 110,
    starColors: ['#f72f2f', '#e5eaf4', '#5a5b5e'],
    fadeInStart: -3000, // deep-space fade in…
    fadeInEnd: -2000,   // …fully visible here
    fadeOutStart: 100,  // passing the lens…
    fadeOutEnd: 500,    // …gone here (also the wrap threshold)
    tiltDeg: 5,         // mouse tilt
    hoverPad: 22,       // hover hit-test margin (px)
    hoverLift: 50       // hover pull toward camera (px)
  };

  const cards = [...world.querySelectorAll('.fly-card')];
  const count = cards.length;
  if (!count) return;
  const loopLen = count * CFG.zGap;

  // --- build items -------------------------------------------------------
  const items = cards.map((el, i) => ({
    el, type: 'card',
    x: 0, y: 0,
    rot: (Math.random() - 0.5) * 14,
    baseZ: -i * CFG.zGap,
    hoverT: 0, hoverAmt: 0
  }));

  for (let i = 0; i < CFG.starCount; i++) {
    const el = document.createElement('div');
    el.className = 'fly-star';
    el.style.background = CFG.starColors[i % CFG.starColors.length];
    world.appendChild(el);
    items.push({
      el, type: 'star',
      x: (Math.random() - 0.5) * innerWidth * 2.2,
      y: (Math.random() - 0.5) * innerHeight * 2.2,
      baseZ: -Math.random() * loopLen
    });
  }

  // scatter cards on a 3-turn spiral (re-run on resize)
  function layout() {
    items.forEach(n => {
      if (n.type !== 'card') return;
      const i = items.indexOf(n);
      const a = (i / count) * Math.PI * 6;
      n.x = Math.cos(a) * innerWidth * 0.26;
      n.y = Math.sin(a) * innerHeight * 0.24;
    });
  }
  layout();
  addEventListener('resize', layout);

  // --- input: virtual scroll + mouse -------------------------------------
  const st = { target: 0, current: 0, prev: 0, mouseX: 0, mouseY: 0, mx: -9999, my: -9999 };

  addEventListener('wheel', e => {
    e.preventDefault();
    st.target += e.deltaY;
  }, { passive: false });

  let touchY = null;
  addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', e => {
    if (touchY == null) return;
    const y = e.touches[0].clientY;
    st.target += (touchY - y) * CFG.touchMult;
    touchY = y;
  }, { passive: true });

  addEventListener('mousemove', e => {
    st.mouseX = (e.clientX / innerWidth) * 2 - 1;   // -1..1
    st.mouseY = (e.clientY / innerHeight) * 2 - 1;
    st.mx = e.clientX; st.my = e.clientY;
  });

  const hudVel = document.querySelector('.fly-vel');
  const hudZ = document.querySelector('.fly-z');
  const lerp = (a, b, t) => a + (b - a) * t;

  // --- frame loop ---------------------------------------------------------
  let frame = 0;
  function tick() {
    if (!world.isConnected) return;
    st.current += (st.target - st.current) * CFG.lerp;
    const vel = st.current - st.prev;
    st.prev = st.current;

    // world tilt + velocity pitch; perspective narrows with speed
    const rx = st.mouseY * CFG.tiltDeg - Math.max(-30, Math.min(30, vel)) * 0.2;
    const ry = st.mouseX * CFG.tiltDeg;
    world.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    viewport.style.perspective = `${1000 - Math.min(Math.abs(vel) * 6, 600)}px`;

    const camZ = st.current * CFG.camSpeed;
    let hovered = null, hoveredZ = -Infinity;

    for (const n of items) {
      // wrapped depth relative to camera
      let z = ((n.baseZ + camZ) % loopLen + loopLen) % loopLen;
      if (z > CFG.fadeOutEnd) z -= loopLen;

      // distance fades
      let o = 1;
      if (z < CFG.fadeInStart) o = 0;
      else if (z < CFG.fadeInEnd) o = (z - CFG.fadeInStart) / (CFG.fadeInEnd - CFG.fadeInStart);
      if (z > CFG.fadeOutStart && n.type !== 'star')
        o = 1 - (z - CFG.fadeOutStart) / (CFG.fadeOutEnd - CFG.fadeOutStart);

      if (n.type === 'star') {
        if (o <= 0) { n.el.style.opacity = '0'; continue; }
        const stretch = Math.max(1, Math.min(1 + Math.abs(vel) * 0.12, 10));
        n.el.style.opacity = o.toFixed(3);
        n.el.style.transform =
          `translate(-50%,-50%) translate3d(${n.x}px, ${n.y}px, ${z}px) scale3d(1,1,${stretch})`;
        continue;
      }

      if (o <= 0) { n.el.style.opacity = '0'; continue; }

      // hover hit-test: nearest visible card under the cursor
      if (o > 0.15) {
        const r = n.el.getBoundingClientRect();
        const p = CFG.hoverPad;
        if (st.mx > r.left - p && st.mx < r.right + p &&
            st.my > r.top - p && st.my < r.bottom + p && z > hoveredZ) {
          hoveredZ = z; hovered = n;
        }
      }

      n.hoverAmt += (n.hoverT - n.hoverAmt) * 0.12;
      const zLift = CFG.hoverLift * n.hoverAmt;
      n.el.style.opacity = o.toFixed(3);
      n.el.style.transform =
        `translate(-50%,-50%) translate3d(${n.x}px, ${n.y}px, ${z + zLift}px) rotateZ(${n.rot}deg)`;
    }

    for (const n of items) if (n.type === 'card') n.hoverT = n === hovered ? 1 : 0;

    if (++frame % 5 === 0) {
      if (hudVel) hudVel.textContent = Math.abs(vel).toFixed(2);
      if (hudZ) hudZ.textContent = `${Math.round(camZ)}`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
