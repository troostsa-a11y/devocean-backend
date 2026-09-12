---
name: Transcript rendering and frontend tests
description: Preserve original messages while making guest and admin formatting consistent.
---
Apply formatting at display time, not by rewriting stored conversations.

**Why:** Old replies contain Markdown even after the prompt prohibits it, and admin
plain-text paragraphs collapse newlines. Prompt changes cannot repair history.

**How to apply:** Use the same safe rendering rules in chat, translated transcript
and original transcript. Keep guest text literal and never interpret raw HTML.

Frontend rendering tests must resolve React and react-dom from the receptionist
package together, not from the root or API package.

**Why:** Cross-package test resolution mixed React 18's server renderer with the
frontend's React 19 elements, causing misleading invalid-child errors.

**How to apply:** Keep cross-package frontend tests outside the API production
TypeScript compilation boundary; execute them with the frontend React runtime.