/* 3D racing-helmet hero — original procedural model (no external 3D asset).
 * Requires THREE (r128+) on the page, e.g.
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 * Then drop:  <canvas data-helmet-hero data-parallax="0.35" data-spin="0.15"></canvas>
 *
 * Uses only generated geometry (spheres, tori, lathe, boxes). No CapsuleGeometry
 * (not available before r142). Falls back silently if WebGL/THREE is missing.
 */
(function () {
  function init(canvas) {
    var THREE = window.THREE;
    if (!THREE || !canvas) return;

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var spinSpeed = parseFloat(canvas.getAttribute('data-spin'));
    if (isNaN(spinSpeed)) spinSpeed = 0.15;
    var parallax = parseFloat(canvas.getAttribute('data-parallax'));
    if (isNaN(parallax)) parallax = 0.35;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: true
      });
    } catch (e) { return; } // no WebGL — leave the CSS gradient fallback

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6);

    // ---- lights ---------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xfff2e6, 1.6);
    key.position.set(3, 4, 5);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x9fd8ff, 1.1); // cool rim
    rim.position.set(-4, 1, -3);
    scene.add(rim);
    var fill = new THREE.PointLight(0xffd9a8, 0.7, 30);
    fill.position.set(-2, -2, 4);
    scene.add(fill);

    // ---- helmet group ---------------------------------------------------
    var helmet = new THREE.Group();
    scene.add(helmet);

    var shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xff6a13, metalness: 0.6, roughness: 0.35,
      clearcoat: 0.8, clearcoatRoughness: 0.25
    });
    var trimMat = new THREE.MeshStandardMaterial({
      color: 0x14151a, metalness: 0.8, roughness: 0.4
    });
    var visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0d12, metalness: 1.0, roughness: 0.08,
      clearcoat: 1.0, clearcoatRoughness: 0.05,
      emissive: 0x0a1622, emissiveIntensity: 0.35
    });
    var accentMat = new THREE.MeshStandardMaterial({
      color: 0xcfff5e, metalness: 0.3, roughness: 0.5
    });

    // Main shell: a sphere squashed slightly + pulled forward at the jaw.
    var shell = new THREE.Mesh(new THREE.SphereGeometry(1.25, 96, 96), shellMat);
    shell.scale.set(1.0, 1.02, 1.08);
    helmet.add(shell);

    // Chin bar: a half-torus wrapping the lower front (the jaw guard).
    var chin = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.34, 32, 64, Math.PI), trimMat
    );
    chin.rotation.x = Math.PI / 2;
    chin.rotation.z = Math.PI; // bring the arc to the front-bottom
    chin.position.set(0, -0.55, 0.35);
    chin.scale.set(1.0, 1.0, 0.75);
    helmet.add(chin);

    // Visor: a curved band carved from a larger sphere across the front.
    var visorGeo = new THREE.SphereGeometry(
      1.30, 96, 48,
      Math.PI * 0.62, Math.PI * 0.76, // phi: front-facing arc (horizontal)
      Math.PI * 0.34, Math.PI * 0.30  // theta: eye-level band (vertical)
    );
    var visor = new THREE.Mesh(visorGeo, visorMat);
    visor.scale.set(1.0, 1.02, 1.08);
    helmet.add(visor);

    // Brow trim: thin torus framing the top of the visor opening.
    var brow = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.05, 16, 80, Math.PI * 1.05), accentMat
    );
    brow.rotation.x = Math.PI / 2.35;
    brow.position.set(0, 0.18, 0.86);
    helmet.add(brow);

    // Top aero fin: a small box ridge along the crown.
    var fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.9), accentMat);
    fin.position.set(0, 1.18, -0.05);
    helmet.add(fin);

    // Side vents: two small cylinders near the temples.
    var ventGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 24);
    [-1, 1].forEach(function (s) {
      var v = new THREE.Mesh(ventGeo, trimMat);
      v.rotation.z = Math.PI / 2;
      v.position.set(s * 1.18, 0.25, 0.2);
      helmet.add(v);
    });

    helmet.rotation.y = -0.4; // open on a three-quarter view
    helmet.rotation.x = 0.05;

    // ---- interaction ----------------------------------------------------
    var target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    if (!reduce) window.addEventListener('pointermove', onMove);

    function resize() {
      var w = canvas.clientWidth || canvas.parentElement.clientWidth || 1;
      var h = canvas.clientHeight || canvas.parentElement.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // ---- render ---------------------------------------------------------
    function frame(t) {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      helmet.rotation.y = -0.4 + cur.x * parallax + (t * 0.001 * spinSpeed);
      helmet.rotation.x = 0.05 + cur.y * parallax * 0.6;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    var raf;
    if (reduce) {
      // single static three-quarter frame, no loop
      helmet.rotation.y = -0.55;
      helmet.rotation.x = 0.08;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  function boot() {
    var nodes = document.querySelectorAll('canvas[data-helmet-hero]');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
