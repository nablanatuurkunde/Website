// The home page intro: play_intro of Design-Language/nabla/branding.py in the browser. The dots grow into little ∇s,
// the logo's ∇ grows out of one of them, slides right while "Nabla" slides out to the left from behind it, and a
// shock runs through the field. Unlike the video the logo stays: the ∇s round off into dots again and the page
// fades in. Frame numbers are frames of Intro.mov (60 fps); positions are pixels of the logo artboard.
(() => {
  const { field, smooth, clip01 } = window.Nabla;
  const F = 1 / 60, SPLIT = 52, LEAD = 40, GROW = 18, REVEAL = 110, CALM = 170, DONE = 230;
  const K = 1706 / 204;                 // artboard pixels per pixel of the video (the ∇ is 204 px tall there)
  const DX = 324 * K, WDX = -435 * K;   // how far the ∇ and the word slide
  const X0 = -1959, WIDTH = 7701.5;     // the box of .logo, as in nabla.css
  const NABLA_MID = 1950, WORD_LEFT = 1678.8;

  const easeOutBack = t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
  const easeInOutQuart = t => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
  const easeInOutCubic = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

  const body = document.body, logo = document.querySelector('.hero .logo');
  const nablaImg = logo.querySelector('.nabla');
  const reveal = () => body.classList.remove('intro');
  if (field.reduce) return reveal(); // the logo as it ends, no motion
  // once per visit: back on the home page from another page, the logo is simply there
  let seen = false;
  try { seen = sessionStorage.getItem('nabla-intro') === '1'; sessionStorage.setItem('nabla-intro', '1'); } catch (e) {}
  if (seen) return reveal();

  const place = (dx, wdx, s) => {
    logo.style.setProperty('--dx', dx); logo.style.setProperty('--wdx', wdx); logo.style.setProperty('--s', s);
  };
  place(0, 0, 0);
  nablaImg.style.visibility = 'hidden'; // a tiny ∇ would show as a speck while the dots still grow

  // where the ∇'s middle and the word's leading edge are, in field units
  const core = (dx, wdx) => {
    const r = logo.getBoundingClientRect(), k = r.width / WIDTH, y = r.top + r.height / 2;
    return [field.toUnits(r.left + (NABLA_MID + dx - X0) * k, y), field.toUnits(r.left + (WORD_LEFT + wdx - X0) * k, y)];
  };

  Promise.all([...logo.querySelectorAll('img')].map(img => img.decode().catch(() => {}))).then(() => {
    let t0 = field.t + 0.3 + LEAD * F; // time 0 of the timeline: the ∇ has grown
    let shocked = false, jumped = false, dx = 0, wdx = 0;
    const tiny = 0.075 * 1.5 * field.u / logo.getBoundingClientRect().height; // as tall as a ∇ of the field

    const movers = () => core(dx, wdx);
    field.beforeFrame = f => {
      f.movers = jumped ? null : movers; // a skip is no slide: it must not fling the field
      jumped = false;
      const fr = (f.t - t0) / F;
      f.disc = fr < 0 ? smooth(clip01(1 + fr / LEAD)) : 1 - smooth(clip01((fr - CALM) / (DONE - CALM)));
      const grow = clip01((fr + GROW) / GROW);
      nablaImg.style.visibility = grow > 0 ? '' : 'hidden';
      dx = DX * easeInOutQuart(clip01((fr - SPLIT) / 53) ** 0.5); // easings fitted to the frames of Intro.mov
      wdx = WDX * easeInOutCubic(clip01((fr - SPLIT - 6) / 39) ** 0.4);
      place(dx, wdx, tiny + (1 - tiny) * easeOutBack(grow));
      if (!shocked && fr >= SPLIT + 4) {
        shocked = true;
        const [x, y] = core(0, 0)[0];
        f.shocks.push({ x, y, t: f.t });
      }
      if (fr >= REVEAL) reveal();
      if (fr >= DONE) { f.beforeFrame = f.movers = null; f.disc = 0; }
    };
    // a click or a key skips to the end of the slide
    const skip = () => {
      if (field.t < t0 + REVEAL * F) { t0 = field.t - REVEAL * F; shocked = jumped = true; }
      removeEventListener('pointerdown', skip); removeEventListener('keydown', skip);
    };
    addEventListener('pointerdown', skip); addEventListener('keydown', skip);
  });
})();
