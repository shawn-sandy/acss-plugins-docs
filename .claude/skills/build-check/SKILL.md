---
name: build-check
description: Run a production build and surface any Astro/Starlight errors. Use before pushing or opening a PR to catch MDX syntax errors, broken imports, and config issues early.
---

# Build check

Run `npm run build` and report the result.

## Steps

1. Run `npm run build`.
2. If the build succeeds: report "Build passed — dist/ is ready."
3. If the build fails:
   - Quote the first error message verbatim.
   - Identify the file and line number if Astro reported one.
   - Propose a fix for any MDX syntax errors, broken imports, or `astro.config.mjs` issues you can identify.
   - Re-run `npm run build` after applying the fix to confirm it resolves the error.

## Common failure modes in this repo

- **MDX syntax error** — unclosed JSX tag or missing import for a Starlight component (`Card`, `CardGrid`, `LinkCard`, `Tabs`, etc.)
- **Sidebar slug mismatch** — a `slug` in `astro.config.mjs` that doesn't match any file in `src/content/docs/`
- **Base path in a link** — a link missing the `/acss-plugins-docs/` prefix
- **content.config.ts schema** — a page with a front-matter field not allowed by `docsSchema`
