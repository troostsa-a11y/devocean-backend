---
name: SPA experience headings
description: How experience pages retain meaningful headings for crawlers before the React application hydrates.
---

Experience pages must receive a route-specific `<h1>` in the HTML created by the Cloudflare Pages middleware, not only in the React component.

**Why:** The experience route component is client-rendered. The edge middleware previously removed the homepage static-content block for these URLs, leaving no H1 in the initial response for crawlers that do not execute JavaScript.

**How to apply:** When adding or changing an experience route, maintain its descriptive heading alongside its edge metadata and inject it through the static-content replacement. Keep the React mount cleanup so browser-rendered pages do not retain duplicate H1 elements after hydration.