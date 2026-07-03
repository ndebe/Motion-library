/* WebGL liquid hero background — zero dependencies, WebGL2.
   Usage:
     <div class="liquid-hero">
       <canvas data-liquid-hero></canvas>
       ... your hero content ...
     </div>
   Animates domain-warped fractal noise into soft drifting blobs, with a gentle
   mouse parallax. Respects prefers-reduced-motion (renders one still frame).

   Optional data attributes on the canvas:
     data-speed="0.05"     drift speed
     data-parallax="0.4"   how much the mouse shifts the field (0 disables)
*/
(function () {
  const VERT = `#version 300 es
  in vec2 a_pos;
  void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const FRAG = `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;   // 0..1
  uniform float u_parallax;

  vec2 hash2(vec2 p){
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
                   dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
               mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
                   dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }
  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
    vec2 m  = (u_mouse - 0.5) * u_parallax;
    float t = u_time * 0.05;

    // domain warping for organic, liquid shapes
    vec2 q = vec2(fbm(uv + t + m), fbm(uv + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(uv + 1.7 * q + vec2(8.3, 2.8) + 0.5 * t),
                  fbm(uv + 1.7 * q + vec2(2.1, 9.2)));
    float f = fbm(uv + 2.0 * r);

    vec3 base = vec3(0.925, 0.913, 0.886); // #ece9e2 warm paper
    vec3 dark = vec3(0.835, 0.815, 0.760); // soft taupe
    vec3 col  = mix(base, dark, smoothstep(0.15, 0.85, f));
    // faint volt-green glow near the peaks (a nod to the source accent)
    col = mix(col, vec3(0.80, 0.92, 0.36), smoothstep(0.80, 0.97, f) * 0.10);

    outColor = vec4(col, 1.0);
  }`;

  function compile(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('liquid-hero shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function init(canvas){
    if (canvas.__liquidInit) return;
    canvas.__liquidInit = true;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return; // CSS gradient fallback stays visible

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'a_pos');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('liquid-hero link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uRes      = gl.getUniformLocation(prog, 'u_res');
    const uTime     = gl.getUniformLocation(prog, 'u_time');
    const uMouse    = gl.getUniformLocation(prog, 'u_mouse');
    const uParallax = gl.getUniformLocation(prog, 'u_parallax');

    const parallax = parseFloat(canvas.dataset.parallax ?? '0.4');
    const speedAttr = parseFloat(canvas.dataset.speed ?? '0.05');

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    gl.uniform1f(uParallax, parallax);

    function resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    if (parallax > 0){
      window.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width;
        target.y = 1.0 - (e.clientY - r.top) / r.height;
      }, { passive: true });
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();

    function frame(now){
      resize();
      // ease mouse toward target for a soft parallax
      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, ((now - start) / 1000) * (speedAttr / 0.05));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) requestAnimationFrame(frame);
    }

    if (reduce){
      // one still frame, frozen at a pleasant offset
      resize();
      gl.uniform2f(uMouse, 0.5, 0.5);
      gl.uniform1f(uTime, 12.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      requestAnimationFrame(frame);
    }
  }

  function boot(){
    document.querySelectorAll('canvas[data-liquid-hero]').forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
