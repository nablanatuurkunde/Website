// All videos of the site, in order. PLACEHOLDERS: replace them with your real videos.
// After every change here, run `node tools/video-pages.js`: it writes the page of each video (video-<slug>.html).
// youtube: the video's id (the part after watch?v=), or "" while it is not online yet.
// thumbnail (optional): your thumbnail image for the home page, e.g. 'assets/thumbs/elektriciteit.jpg' (16:9).
//   Without one the home page shows a black frame with the ∇. (A file of your own, not YouTube's: that would
//   make every visitor's browser contact Google.)
// chapters: the chapters of the video. start: where it starts in the video ("m:ss" or "h:mm:ss"), as in the
// YouTube description. formulas: the formula cards of that chapter; tex is KaTeX, U, I, R, P, E and Q get their
// colour by themselves and a comma between two digits becomes a decimal comma. legend: [symbol, meaning, unit].
window.NABLA_VIDEOS = [
  {
    slug: 'elektriciteit',
    title: 'Elektriciteit',
    youtube: '',
    summary: 'Van lading tot stopcontact: wat stroom, spanning en weerstand zijn, en hoe je ermee rekent.',
    chapters: [
      {
        title: 'Lading en stroom', start: '0:00',
        summary: 'Stroom is lading die beweegt: hoeveel coulomb er per seconde langs komt.',
        formulas: [{ name: 'Stroomsterkte', tex: 'I = \\frac{Q}{t}', legend: [['I', 'stroomsterkte', 'A'], ['Q', 'lading', 'C'], ['t', 'tijd', 's']] }],
      },
      {
        title: 'Spanning', start: '6:40',
        summary: 'Spanning is energie per lading: hoeveel joule elke coulomb meekrijgt van de bron.',
        formulas: [{ name: 'Spanning', tex: 'U = \\frac{E}{Q}', legend: [['U', 'spanning', 'V'], ['E', 'energie', 'J'], ['Q', 'lading', 'C']] }],
      },
      {
        title: 'De wet van Ohm', start: '12:15',
        summary: 'Dubbele spanning, dubbele stroom: hoe weerstand de stroom door een draad bepaalt.',
        formulas: [{ name: 'Wet van Ohm', tex: 'U = I \\cdot R', legend: [['U', 'spanning', 'V'], ['I', 'stroomsterkte', 'A'], ['R', 'weerstand', 'Ω']] }],
      },
      {
        title: 'Vermogen en energie', start: '18:30',
        summary: 'Waarom een waterkoker meer kost dan een ledlamp: vermogen, energie en de kilowattuur.',
        formulas: [
          { name: 'Vermogen', tex: 'P = U \\cdot I', legend: [['P', 'vermogen', 'W'], ['U', 'spanning', 'V'], ['I', 'stroomsterkte', 'A']] },
          { name: 'Energie', tex: 'E = P \\cdot t', legend: [['E', 'energie', 'J'], ['P', 'vermogen', 'W'], ['t', 'tijd', 's']] },
        ],
      },
      {
        title: 'Serie en parallel', start: '25:05',
        summary: 'Eén weg of meer wegen voor de stroom, en wat dat doet met spanning en stroom.',
        formulas: [
          { name: 'Serie', tex: 'R_{\\mathrm{v}} = R_1 + R_2', legend: [['R_{\\mathrm{v}}', 'vervangings­weerstand', 'Ω']] },
          { name: 'Parallel', tex: '\\frac{1}{R_{\\mathrm{v}}} = \\frac{1}{R_1} + \\frac{1}{R_2}', legend: [['R_{\\mathrm{v}}', 'vervangings­weerstand', 'Ω']] },
        ],
      },
      {
        title: 'Weerstand van een draad', start: '32:50',
        summary: 'Langer is meer weerstand, dikker is minder: de soortelijke weerstand van koper en constantaan.',
        formulas: [{ name: 'Weerstand van een draad', tex: 'R = \\rho \\cdot \\frac{\\ell}{A}', legend: [['R', 'weerstand', 'Ω'], ['\\rho', 'soortelijke weerstand', 'Ω·m'], ['\\ell', 'lengte', 'm'], ['A', 'doorsnede', 'm²']] }],
      },
    ],
  },
  {
    slug: 'magnetisme', title: 'Magnetisme', youtube: '',
    summary: 'Veldlijnen, spoelen en elektromotoren.', chapters: [],
  },
  {
    slug: 'krachten-en-beweging', title: 'Krachten en beweging', youtube: '',
    summary: 'Snelheid, versnelling en de wetten van Newton.', chapters: [],
  },
];
