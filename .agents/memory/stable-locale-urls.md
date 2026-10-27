---
name: Stable locale URL architecture
description: How locale-prefixed URLs work across edge, React SPA, standalone HTML pages, and selectors
---

## Rule
Indexable translated variants live at stable URL prefixes (e.g. `/pt-pt/`, `/de/`, `/zh-hans/`). English UK and US share root routes; US English is a display preference, not a separate indexable variant. Language selection triggers a full navigation to the locale URL — never just a localStorage write — so URL, edge metadata, initial HTML, and hydrated UI change together. Currency is completely separate and is never touched by language selection.

**Why:** Google requires distinct URLs per hreflang variant to index translations independently. Same-page client-only switching only delivers the translated experience to JS-enabled crawlers (which Google does run, but at a delay). Stable URLs allow edge rendering of correct canonical, Open Graph, and hreflang metadata before JS loads.

## Default locale
English UK (`en-GB`) is the default. Both English variants use root paths; historical `/en-us` links normalize to root while preserving the explicit US English preference. Translated variants use lowercase path segments, e.g. `pt-pt`, `zh-hans` (not `zh-CN`).

## How to apply
- Generate locale-path links; incoming old public `?lang=` links use a bounded server-side adapter, not per-page query fallbacks
- The `html lang` attribute is set by the middleware on every response, not by React

## Lazy-route placeholders
Any static placeholder or head script that exists to cover a lazy SPA route must match both the root pathname and every stable locale-prefixed pathname. React's `stripLocalePrefix()` only runs after the initial HTML and head scripts have already executed.

**Why:** A localized full navigation such as `/fr/book-direct` otherwise bypasses the root-only placeholder and briefly exposes the Suspense/background fallback before the lazy route mounts.

**How to apply:** Keep root and locale-prefixed route matching together in the inline route guard, and make the mounted component remove the placeholder with `useLayoutEffect`.
