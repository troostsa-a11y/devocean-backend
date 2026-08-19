import { localeFromPath, localizedUrl } from '../i18n/localeCatalog';

const NON_DOCUMENT_PREFIXES = [
  '/api/',
  '/assets/',
  '/css/',
  '/downloads/',
  '/fonts/',
  '/images/',
  '/js/',
  '/photos/',
  '/translations/',
];

export function localizeInternalHref(href, localeCode) {
  if (!href || !localeCode || !href.startsWith('/') || href.startsWith('//')) {
    return href;
  }

  const url = new URL(href, 'https://devoceanlodge.local');
  const path = url.pathname;
  const lastSegment = path.slice(path.lastIndexOf('/') + 1);

  // Leave assets, API calls, files, and links already carrying a locale alone.
  if (
    localeFromPath(path) ||
    NON_DOCUMENT_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    lastSegment.includes('.')
  ) {
    return href;
  }

  return localizedUrl(path, localeCode, url.search, url.hash);
}