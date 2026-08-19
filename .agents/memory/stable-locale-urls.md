---
name: Stable locale URL architecture
description: How locale-prefixed URLs work across edge, React SPA, standalone HTML pages, and selectors
---

## Rule
Every public language variant lives at a stable URL prefix (e.g. `/pt-pt/`, `/de/`, `/zh-hans/`). English UK stays at the root. Language selection triggers a full navigation to the new locale URL — never just a localStorage write — so URL, edge metadata, initial HTML, and hydrated UI change together. Currency is completely separate and is never touched by language selection.

**Why:** Google requires distinct URLs per hreflang variant to index translations independently. Same-page client-only switching only delivers the translated experience to JS-enabled crawlers (which Google does run, but at a delay). Stable URLs allow edge rendering of correct canonical, Open Graph, and hreflang metadata before JS loads.

## Key files
- `src/i18n/localeCatalog.js` — single source of truth: LOCALES array, PATH_PREFIXES, `localizedPath()`, `stripLocalePrefix()`, `localeFromPath()`, `allHreflangPaths()`
- `functions/_middleware.js` — edge: detects locale prefix, serves static unit pages at locale paths, injects `window.__DEVOCEAN_LOCALE__` and `html lang`, rewrites canonical/OG URL/hreflang
- `src/i18n/useLocale.js` → `setLang()` calls `localizedUrl()` and does `window.location.assign()`
- `src/components/Header.jsx` — flat `LOCALES.map` selector, no region step
- `public/js/shared-nav.js` — same flat selector for standalone HTML pages; `setLang()` calls `localePath()` and sets `window.location.href`
- `public/translations/accommodation-detail-i18n.js` + `translations/accommodation-detail-i18n.js` — reads `window.__DEVOCEAN_LOCALE__` first, before localStorage or URL param
- `scripts/generate-locale-sitemap.mjs` — runs in `prebuild`; generates 445 canonical locale URLs into `public/sitemap.xml`
- `src/i18n/__tests__/localeCatalog.test.js` — contract tests for localizedPath, stripLocalePrefix, normalizeLocale, allHreflangPaths

## Default locale
English UK (`en-GB`) uses root paths (no prefix). All other locales use lowercase path segments, e.g. `pt-pt`, `zh-hans` (not `zh-CN`).

## How to apply
- Any new public route must be added to `LOCALIZED_ROUTES` in `generate-locale-sitemap.mjs`
- Accommodation static unit routes additionally need an entry in `STATIC_UNIT_ROUTES` in `_middleware.js`
- SPA routes are matched after `stripLocalePrefix()` strips the prefix; no additional registration needed
- Legacy `?lang=` links are redirected to the stable locale path by the middleware
- The `html lang` attribute is set by the middleware on every response, not by React

## Lazy-route placeholders
Any static placeholder or head script that exists to cover a lazy SPA route must match both the root pathname and every stable locale-prefixed pathname. React's `stripLocalePrefix()` only runs after the initial HTML and head scripts have already executed.

**Why:** A localized full navigation such as `/fr/book-direct` otherwise bypasses the root-only placeholder and briefly exposes the Suspense/background fallback before the lazy route mounts.

**How to apply:** Keep root and locale-prefixed route matching together in the inline route guard, and make the mounted component remove the placeholder with `useLayoutEffect`.
