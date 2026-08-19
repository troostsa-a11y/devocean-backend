import { writeFile } from 'node:fs/promises';
import { LOCALES, localizedPath } from '../src/i18n/localeCatalog.js';

const BASE_URL = 'https://devoceanlodge.com';

// Public routes with complete language-aware UI. Booking confirmation, admin,
// payment callbacks, and legal documents deliberately stay out of the locale
// sitemap because they are not translation landing pages.
const LOCALIZED_ROUTES = [
  '/',
  '/story',
  '/safari',
  '/comfort',
  '/cottage',
  '/chalet',
  '/experiences/dolphins',
  '/experiences/diving',
  '/experiences/seafari',
  '/experiences/safari',
  '/experiences/fishing',
  '/experiences/surfing',
  '/why-ponta',
  '/ponta-do-ouro',
  '/ponta-do-ouro-accommodation',
  '/safari-tents-ponta-do-ouro',
  '/diving-dolphin-accommodation',
  '/getting-to-ponta-do-ouro',
  '/ponta-do-ouro-without-4x4',
  '/devocean-lodge-meals',
];

const xmlEscape = (value) => value.replace(/&/g, '&amp;');
const urls = [
  ...LOCALIZED_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => `${BASE_URL}${localizedPath(route, locale.code)}`),
  ),
  `${BASE_URL}/legal/privacy`,
  `${BASE_URL}/legal/cookies`,
  `${BASE_URL}/legal/terms`,
  `${BASE_URL}/legal/GDPR`,
  `${BASE_URL}/legal/CRIC`,
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n') +
  `\n</urlset>\n`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`Generated sitemap with ${urls.length} canonical URLs.`);