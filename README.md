# Nabla website

De website van Nabla: natuurkundevideo's in het Nederlands. Gewone HTML, CSS en JavaScript, zonder build-stap.
De vormgeving komt uit [Design-Language](https://github.com/nablanatuurkunde/Design-Language).

## Video's toevoegen of aanpassen

1. Pas `js/videos.js` aan: titels, YouTube-id's, hoofdstukken met tijdcodes en formules.
2. Maak daarna de pagina per video opnieuw (nodig voor de linkvoorbeelden in WhatsApp en dergelijke):

   ```bash
   node tools/video-pages.js
   ```

## Lokaal bekijken

```bash
python -m http.server 8123
```

en open <http://localhost:8123>.

## Wat waar staat

| Bestand | Wat |
|---|---|
| `index.html` | homepage met de intro-animatie en alle video's |
| `video-<naam>.html` | de pagina van één video (gemaakt door `tools/video-pages.js`, niet zelf aanpassen) |
| `formules.html`, `docenten.html`, `steun.html`, `over.html`, `404.html` | de overige pagina's |
| `css/nabla.css` | alle opmaak |
| `js/field.js`, `js/intro.js` | de stippenachtergrond en de intro |
| `js/pages.js` | vult de pagina's met de video's uit `js/videos.js` |
| `assets/` | logo, lettertypen, KaTeX (formules) en afbeeldingen |
