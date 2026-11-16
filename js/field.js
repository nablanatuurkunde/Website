// The background of every page: the drifting dots of nabla/scene.py (dots_pattern), with the little ∇s of
// nabla/branding.py (intro_field): rigid bodies on springs that a shock knocks away and spinning, that what slides
// drags along and rolls (the ∇s only appear in the home page intro).
// Coordinates are frame units as in the videos (y up, the middle of the window is 0, 0); u = pixels per unit.
(() => {
  const STEP = 0.6, R_DOT = 0.03, R_TRI = 0.075, BANDS = 8, DRIFT = 0.12;
  const LIGHTS = [0.2, 0.32, 0.44, 0.56]; // steps of light above the grey bands
  const STYLES = [
    ...Array.from({ length: BANDS }, (_, b) => `rgba(128,128,128,${0.1 + 0.25 * (b + 0.5) / BANDS})`),
    ...LIGHTS.map(o => `rgba(255,255,255,${o})`),
  ];

  // Both outlines as four cubic curves (16 control points), so the ∇ can round off into the dot.
  const Q = [[1, 0], [1, 0.5523], [0.5523, 1], [0, 1]];
  const DOT = [[1, 0], [0, 1], [-1, 0], [0, -1]].flatMap(([c, s]) => Q.map(([x, y]) => [x * c - y * s, x * s + y * c]));
  const lin = (p, q) => [0, 1, 2, 3].map(i => [p[0] + (q[0] - p[0]) * i / 3, p[1] + (q[1] - p[1]) * i / 3]);
  const A = [0.866, 0.5], B = [-0.866, 0.5], C = [0, -1], AB = [0, 0.5]; // points down, radius 1
  const TRI = [...lin(A, AB), ...lin(AB, B), ...lin(B, C), ...lin(C, A)];

  const clip01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const sigmoid = x => 1 / (1 + Math.exp(-x));
  const smooth = t => clip01((sigmoid(10 * (t - 0.5)) - sigmoid(-5)) / (1 - 2 * sigmoid(-5))); // manim's smooth

  const canvas = document.querySelector('canvas.field');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const field = {
    t: 0,              // seconds of drift
    disc: 0,           // 1: every dot is a little ∇ (the intro), 0: plain dots
    shocks: [],        // {x, y, t}: from field time t a ring of light and a push run outward from (x, y)
    movers: null,      // () => [[x, y], ...]: things that slide; they drag the ∇s near them along and light them
    beforeFrame: null, // (field) => void, called every frame before the field moves
    reduce,
    u: 1, W: 0, H: 0,
    // a point on screen in field units; the field is fixed to the page, so it scrolls along with it
    toUnits: (px, py) => [(px - field.W / 2) / field.u, (field.H / 2 - py) / field.u - scrollY / field.u],
  };

  let n = 0, nx = 0, ny = 0, gx, gy, extra, ox, oy, vx, vy, turn, spin, wake, flip, layerOf, discOf;
  let rows = 0; // how many grid steps the grid is shifted down, to cover the part of the page in view

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 3); // phones are often 3x: less would draw blurry, swollen dots
    field.W = canvas.clientWidth || innerWidth; field.H = canvas.clientHeight || innerHeight; // its real size on screen
    field.u = Math.min(Math.max(Math.min(field.H / 8, field.W / 9), 48), 120); // the video frame is 8 units tall; denser on a phone
    canvas.width = Math.round(field.W * dpr); canvas.height = Math.round(field.H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the plain grid plus, between its dots, three times as many extra places (as in intro_field)
    nx = Math.ceil(field.W / field.u / STEP) + 4; ny = Math.ceil(field.H / field.u / STEP) + 4;
    const base = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) base.push([(i - nx / 2) * STEP, (j - ny / 2) * STEP]);
    const h = STEP / 2, all = [[0, 0], [h, 0], [0, h], [h, h]].flatMap(([a, b]) => base.map(([x, y]) => [x + a, y + b]));
    n = all.length;
    gx = Float32Array.from(all, p => p[0]); gy = Float32Array.from(all, p => p[1]);
    extra = Uint8Array.from(all, (_, i) => i >= base.length);
    [ox, oy, vx, vy, turn, spin, wake, discOf] = Array.from({ length: 8 }, () => new Float32Array(n));
    flip = Float32Array.from(all, () => (Math.random() < 0.5 ? -1 : 1)); // which way a shock spins each one
    layerOf = new Int8Array(n);
    rows = Math.floor(-scrollY / field.u / STEP);
  }

  // The view moved dk grid steps: every place takes over the state of the one dk rows further, so each little ∇
  // keeps its spin and light while the grid follows the page.
  function shift(dk) {
    for (const arr of [ox, oy, vx, vy, turn, spin, wake]) {
      for (let col = 0; col < 4 * nx; col++) { // 4 sub-grids of nx columns of ny places each
        const at = col * ny, old = arr.slice(at, at + ny);
        for (let j = 0; j < ny; j++) arr[at + j] = j + dk >= 0 && j + dk < ny ? old[j + dk] : 0;
      }
    }
  }

  let moversBefore = [];

  function step(dt) {
    const k = Math.floor(-scrollY / field.u / STEP);
    if (k !== rows) { shift(k - rows); rows = k; }
    const t = field.t, drift = (t * DRIFT) % STEP;
    const movers = field.movers ? field.movers() : [];
    const pairs = movers.map((a, k) => [a, moversBefore[k] || a]);
    moversBefore = movers;
    const shocks = field.shocks.filter(s => t > s.t);
    const fade = 0.5 ** (dt / 0.12);
    for (let i = 0; i < n; i++) {
      const px = gx[i] + drift, py = gy[i] + drift + rows * STEP;
      let ring = 0;
      for (const s of shocks) {
        const r = 9 * (t - s.t), dx = px - s.x, dy = py - s.y, d = Math.hypot(dx, dy) + 1e-9;
        const g = Math.exp(-(((d - r) / 0.6) ** 2));
        ring = Math.max(ring, g);
        const push = g * Math.exp(-r / 5); // weaker further out
        vx[i] += 40 * dt * push * dx / d; vy[i] += 40 * dt * push * dy / d;
        spin[i] += 60 * dt * push * flip[i];
      }
      wake[i] *= fade; // the light beside what moves is gone as soon as it stops
      for (const [a, b] of pairs) {
        const near = Math.exp(-((px + ox[i] - a[0]) ** 2 + (py + oy[i] - a[1]) ** 2) / 0.81);
        if (near < 1e-3) continue;
        const mx = a[0] - b[0], my = a[1] - b[1];
        vx[i] += 12 * dt * near * (mx / dt - vx[i]); vy[i] += 12 * dt * near * (my / dt - vy[i]);
        spin[i] -= 30 * near * (mx * (py - a[1]) - my * (px - a[0])); // rolled: above one way, below the other
        wake[i] = Math.max(wake[i], near * Math.min(Math.hypot(mx, my) / dt / 4, 1));
      }
      vx[i] += dt * (-40 * ox[i] - 5 * vx[i]); vy[i] += dt * (-40 * oy[i] - 5 * vy[i]); // a damped spring home
      spin[i] += dt * (-10 * Math.sin(3 * turn[i]) - 2.5 * spin[i]); // and back to point down
      ox[i] += dt * vx[i]; oy[i] += dt * vy[i]; turn[i] += dt * spin[i];
      const disc = field.disc;
      discOf[i] = disc;
      const light = Math.ceil(disc * clip01(Math.max(ring, wake[i])) * LIGHTS.length - 0.5);
      const wave = 0.5 + 0.5 * Math.sin(0.8 * (px + py) - 0.6 * t);
      layerOf[i] = light > 0 ? BANDS + light - 1 : Math.min(Math.floor(wave * BANDS), BANDS - 1);
    }
    field.shocks = field.shocks.filter(s => 9 * (t - s.t) < 30);
  }

  function draw() {
    const { W, H, u } = field, drift = (field.t * DRIFT) % STEP, top = rows * STEP + scrollY / u;
    ctx.clearRect(0, 0, W, H);
    const pts = new Float32Array(32);
    for (let layer = 0; layer < STYLES.length; layer++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (layerOf[i] !== layer) continue;
        const disc = discOf[i], size = extra[i] ? disc : 1;
        if (size < 0.02) continue; // the extra ones only exist as ∇s
        const cx = W / 2 + (gx[i] + drift + disc * ox[i]) * u, cy = H / 2 - (gy[i] + drift + top + disc * oy[i]) * u;
        if (cx < -10 || cx > W + 10 || cy < -10 || cy > H + 10) continue;
        if (disc < 0.01) { ctx.moveTo(cx + R_DOT * u, cy); ctx.arc(cx, cy, R_DOT * u, 0, 2 * Math.PI); continue; }
        const c = size * Math.cos(turn[i]) * u, s = size * Math.sin(turn[i]) * u;
        for (let k = 0; k < 16; k++) { // the triangle rounds off into the dot
          const x = disc * R_TRI * TRI[k][0] + (1 - disc) * R_DOT * DOT[k][0];
          const y = disc * R_TRI * TRI[k][1] + (1 - disc) * R_DOT * DOT[k][1];
          pts[2 * k] = cx + c * x - s * y; pts[2 * k + 1] = cy - (s * x + c * y);
        }
        ctx.moveTo(pts[0], pts[1]);
        for (let k = 0; k < 16; k += 4) ctx.bezierCurveTo(pts[2 * k + 2], pts[2 * k + 3], pts[2 * k + 4], pts[2 * k + 5], pts[2 * k + 6], pts[2 * k + 7]);
        ctx.closePath();
      }
      ctx.fillStyle = STYLES[layer];
      ctx.fill();
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); // after a hidden tab: no jump
    last = now;
    field.t += dt;
    if (field.beforeFrame) field.beforeFrame(field);
    if (dt > 0) step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  // its own size, not the window's: also catches size changes that fire no resize event
  new ResizeObserver(() => { resize(); if (reduce) { step(1 / 60); draw(); } }).observe(canvas);
  resize();
  if (reduce) { step(1 / 60); draw(); addEventListener('scroll', () => { step(1 / 60); draw(); }); }
  else requestAnimationFrame(frame);

  window.Nabla = { field, smooth, clip01 };
})();
