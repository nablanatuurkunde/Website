// Fills the pages from videos.js: the rows of videos on the home page, the formula overview and the page of one video.
(() => {
  const videos = window.NABLA_VIDEOS;
  const esc = s => String(s).replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
  const seconds = t => t.split(':').reduce((s, part) => s * 60 + Number(part), 0); // "12:15" -> 735

  // style.py's QUANTITY_COLORS and comma(): colour = meaning, decimal comma
  const COLORS = { U: '#FFB31F', E: '#FFB31F', I: '#008EFE', R: '#FF601C', P: '#15CD36', Q: '#FF0020' };
  const tex = s => s.replace(/(?<=\d),(?=\d)/g, '{,}')
    .replace(/(?<![\\A-Za-z])([UIRPEQ])(?![A-Za-z])/g, (_, q) => `\\textcolor{${COLORS[q]}}{${q}}`);
  const math = s => (window.katex ? katex.renderToString(tex(s), { throwOnError: false }) : esc(s));

  const svg = path => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const ICON_LINK = svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>');
  const ICON_CHECK = svg('<path d="M4 12.5l5 5L20 6.5"/>');
  // every video has its own page (made by tools/video-pages.js), so a shared link shows its title
  const href = (v, n) => `video-${encodeURIComponent(v.slug)}.html${n ? `?h=${n}` : ''}`;
  const board = (f, source = '') => `
    <div class="board">
      ${f.name ? `<div class="name">${esc(f.name)}</div>` : ''}
      <div class="key">${math(f.tex)}</div><hr>
      <table>${f.legend.map(([sym, meaning, unit]) =>
        `<tr><td>${math(sym)}</td><td>${esc(meaning)}</td><td>(${esc(unit)})</td></tr>`).join('')}</table>
      ${source}
    </div>`;

  const pages = {
    home(main) {
      main.querySelector('#videos').innerHTML = videos.map(v => {
        const ready = v.youtube || v.chapters.length, link = ready ? href(v) : '';
        // the preview: your own thumbnail if videos.js names one, otherwise a black frame with the ∇
        const frame = v.thumbnail
          ? `<img src="${esc(v.thumbnail)}" alt="" loading="lazy">`
          : `<img class="mark" src="assets/nabla.png" alt="">`;
        const preview = `${frame}${v.youtube ? '<span class="play" aria-hidden="true"></span>' : ''}${
          v.youtube ? '' : '<span class="badge">Binnenkort</span>'}`;
        const count = v.chapters.length ? `${v.chapters.length} hoofdstukken` : '';
        return `
          <section class="video-row wrap${ready ? '' : ' planned'}" aria-labelledby="v-${v.slug}">
            <div class="row-head">
              ${link ? `<a class="preview" href="${link}" tabindex="-1" aria-hidden="true">${preview}</a>`
                     : `<div class="preview">${preview}</div>`}
              <div class="about">
                <h2 id="v-${v.slug}">${link ? `<a href="${link}">${esc(v.title)}</a>` : esc(v.title)}</h2>
                <p>${esc(v.summary)}</p>
                ${count ? `<p class="meta">${count}</p>` : ''}
                ${link ? `<a class="button" href="${link}">${v.youtube ? 'Bekijk de video' : 'Bekijk de hoofdstukken'}</a>`
                       : '<p class="soon">Verschijnt binnenkort</p>'}
              </div>
            </div>
            ${v.chapters.length ? `<ul class="strip">${v.chapters.map((c, i) => `
              <li><a class="tile" href="${href(v, i + 1)}">
                <span class="top"><span class="number">${i + 1}</span><span class="time">${esc(c.start)}</span></span>
                <span class="formula" aria-hidden="true">${c.formulas[0] ? math(c.formulas[0].tex) : ''}</span>
                <h3>${esc(c.title)}</h3>
              </a></li>`).join('')}
            </ul>` : ''}
          </section>`;
      }).join('');
    },

    // every formula of every video, each with a link to the chapter that explains it
    formules(main) {
      main.querySelector('#formules').innerHTML = videos.filter(v => v.chapters.some(c => c.formulas.length)).map(v => `
        <section class="formula-group" aria-labelledby="f-${v.slug}">
          <h2 id="f-${v.slug}">${esc(v.title)}</h2>
          <div class="boards">${v.chapters.flatMap((c, i) => c.formulas.map(f => board(f,
            `<a class="source" href="${href(v, i + 1)}">Uitleg in hoofdstuk ${i + 1}, ${esc(c.title)} <span class="time">${esc(c.start)}</span></a>`))).join('')}
          </div>
        </section>`).join('');
    },

    video(main) {
      const params = new URLSearchParams(location.search);
      const v = videos.find(v => v.slug === (document.body.dataset.video || params.get('v')));
      if (!v) {
        main.innerHTML = `<div class="wrap video-page"><h1>Deze video bestaat niet</h1>
          <p>Kies een video op de <a href="index.html#videos">homepage</a>.</p></div>`;
        return;
      }
      document.title = `${v.title} · Nabla`;
      let current = Math.min(Math.max(Number(params.get('h')) || 1, 1), v.chapters.length || 1) - 1;
      const start = v.chapters[current] && params.has('h') ? seconds(v.chapters[current].start) : 0;
      // as on the home page: the title on black over the moving field, the rest on white
      main.innerHTML = `
        <div class="wrap video-page">
          <h1>${esc(v.title)}</h1>
          <p class="lead">${esc(v.summary)}</p>
        </div>
        <div class="paper"><div class="wrap video-page">
          <div class="watch">
            <div class="player">${v.youtube
              ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?enablejsapi=1&rel=0&start=${start}"
                   title="${esc(v.title)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
              : '<p>Deze video verschijnt binnenkort</p>'}</div>
            ${v.chapters.length ? `<ol class="chapters" aria-label="Hoofdstukken">${v.chapters.map((c, i) => `
              <li><button type="button" data-i="${i}"><span class="time">${esc(c.start)}</span><span>${esc(c.title)}</span></button></li>`).join('')}
            </ol>` : ''}
          </div>
          <section class="chapter-detail" aria-live="polite"></section>
        </div></div>`;

      const detail = main.querySelector('.chapter-detail'), frame = main.querySelector('iframe');
      const show = i => {
        current = i;
        main.querySelectorAll('.chapters button').forEach(b => b.setAttribute('aria-current', String(+b.dataset.i === i)));
        const c = v.chapters[i];
        const next = v.chapters[i + 1];
        detail.innerHTML = c ? `
          <div class="about-chapter">
            <h2>${esc(c.title)}<button type="button" class="icon-button" data-copy
                aria-label="Kopieer link naar dit hoofdstuk" title="Kopieer link naar dit hoofdstuk">${ICON_LINK}</button>
              <span class="copied" role="status"></span></h2>
            <p>${esc(c.summary)}</p>
          </div>
          <div>
            <div class="boards">${c.formulas.map(f => board(f)).join('')}</div>
            ${next ? `<button type="button" class="button next" data-go="${i + 1}">Volgende: ${esc(next.title)}</button>` : ''}
          </div>` : '';
      };
      detail.addEventListener('click', async e => {
        const go = e.target.closest('[data-go]'), copy = e.target.closest('[data-copy]');
        if (go) {
          main.querySelector(`.chapters button[data-i="${go.dataset.go}"]`).click();
          main.querySelector('.player').scrollIntoView({ block: 'nearest' }); // on a phone the player is above
        }
        if (copy) {
          const link = new URL(href(v, current + 1), location.href).href, status = copy.nextElementSibling;
          try {
            await navigator.clipboard.writeText(link);
            copy.innerHTML = ICON_CHECK; status.textContent = 'Link gekopieerd';
            setTimeout(() => { copy.innerHTML = ICON_LINK; status.textContent = ''; }, 2000);
          } catch { status.textContent = link; } // no clipboard access (e.g. not https): show it to copy by hand
        }
      });
      main.querySelectorAll('.chapters button').forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.i;
        show(i);
        history.replaceState(null, '', href(v, i + 1));
        // the YouTube player takes commands by postMessage when the embed has enablejsapi=1
        const command = (func, args = []) => frame?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
        command('seekTo', [seconds(v.chapters[i].start), true]);
        command('playVideo');
      }));
      show(current);
    },
  };

  const run = () => pages[document.body.dataset.page]?.(document.querySelector('main'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
