# braces stack-exhaustion mitigation

GHSA-vfj7-8cjw-p6xm affects all published `braces` versions through 3.0.3.
On 2026-10-10, the npm latest release is still 3.0.3 and the advisory lists
no patched release. Upgrading micromatch does not remove this dependency.

We retain the true upstream version and apply a local depth guard:

- npm projects apply `WebsiteProject/scripts/patch-braces.cjs` on installation.
  Unexpected package versions or source changes fail installation.
  A root install also patches an existing independent website dependency tree,
  because the root preview runs that website rather than the root's dependencies.
- The reception pnpm workspace applies its committed native package patch.
- Brace and parenthesis parsing is limited to 127 nested blocks. Recursive
  AST walkers and array helpers stop above depth 128 with a controlled
  `SyntaxError`, before native call-stack exhaustion. This limit cannot be
  disabled through options.

Normal brace/range expansion is unchanged. Unusually deeply nested patterns
are intentionally rejected. Installs must not disable lifecycle scripts in
the npm projects; doing so skips the mitigation. The pnpm patch does not rely
on lifecycle scripts.

Run `npm run test:braces-security` after installs. Version-only dependency
scanners may still report 3.0.3: this is a local mitigation, not an upstream
upgrade. Replace both patch mechanisms with an official fixed release once
one is available, and keep the regression tests.
