// Writes one page per video (video-<slug>.html) from js/videos.js, with that video's title and summary in the
// page title and the share-preview tags: WhatsApp, Discord and search engines don't run JavaScript, so a shared
// link only shows what is in the HTML itself. Run it after every change to js/videos.js:
//     node tools/video-pages.js
const fs = require('fs'), path = require('path'), vm = require('vm');

const site = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(site, f), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(read('js/videos.js'), sandbox);
const videos = sandbox.window.NABLA_VIDEOS;
const template = read('video.html'); // the generic page (video.html?v=...), also kept for older links
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const written = new Set();
for (const v of videos) {
  const title = `${attr(v.title)} · Nabla`, desc = attr(v.summary);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`)
    .replace('<body data-page="video"', `<body data-page="video" data-video="${attr(v.slug)}"`);
  const file = `video-${v.slug}.html`;
  html = html.replace('<!doctype html>', '<!doctype html>\n<!-- made by tools/video-pages.js from js/videos.js and video.html: edit those, not this file -->');
  fs.writeFileSync(path.join(site, file), html);
  written.add(file);
  console.log('wrote', file);
}
// pages of videos that are no longer in videos.js
for (const f of fs.readdirSync(site)) {
  if (/^video-.+\.html$/.test(f) && !written.has(f)) { fs.unlinkSync(path.join(site, f)); console.log('removed', f); }
}
