---
name: Between-screens flash (SPA route transitions)
description: How the "black on white between screens" flash during lazy-route navigation was fixed — startTransition + Wouter custom location hook.
---

## The problem

Navigating between lazy-loaded routes shows a brief white/near-white screen with
a spinner and "Loading..." text (black text on white = jarring). This is the React
`<Suspense>` fallback firing while the new lazy chunk downloads.

Also: all inline `{loading || !ui ? <spinner> : <content>}` guards showed the same
spinner while translations loaded.

## The fix

**1. Custom Wouter location hook wrapping `navigate` in `startTransition`**

`App.jsx` imports `useBrowserLocation` from `wouter/use-browser-location` and defines:

```jsx
function useTransitionLocation() {
  const [location, navigate] = useBrowserLocation();
  const [, startTransition] = useTransition();
  const transitionNavigate = useCallback(
    (to, opts) => startTransition(() => navigate(to, opts)),
    [navigate]
  );
  return [location, transitionNavigate];
}
```

The app is then wrapped in `<Router hook={useTransitionLocation}>` instead of using
the implicit default router. This makes React keep the *old* route on screen while
the new lazy chunk downloads — the Suspense fallback never shows during in-app
navigation.

**2. Suspense fallbacks stripped of visible content**

The outer `<Suspense>` fallback (first-visit chunk load) and all inline
`loading || !ui` guards were changed from a spinner + "Loading..." text to:

```jsx
<div className="flex-1 min-h-[50vh] bg-slate-50" />
```

No black text, matches the page background — visually imperceptible.

## Why startTransition works here

`startTransition` marks the navigation update as non-urgent. React keeps rendering
the old route (the "current" committed tree) while the new lazy chunk is fetching.
Only once the new component is ready does React commit the transition. The
`<Suspense>` fallback is skipped entirely for in-app navigation.

First-load (direct URL visit) still shows the fallback normally — there is no
previous route to keep on screen.

## What NOT to do

- Do not re-add "Loading..." or spinner text to the Suspense fallback — even a
  branded spinner with no text is better than black text on white.
- Do not remove `<Router hook={useTransitionLocation}>` — reverting to the implicit
  default router restores the flash on every lazy-route navigation.
- Do not call `useLocation()` from wouter *outside* the `<Router>` — it won't have
  the custom hook context. Keep `useLocation()` calls inside child components.
