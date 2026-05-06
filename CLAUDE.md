# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Astro 6 + Starlight 0.38.4 documentation site for the **acss-kit** and **acss-utilities** Claude Code plugins. Deployed to GitHub Pages at `https://shawn-sandy.github.io/acss-plugins-docs/`.

## Commands

```bash
npm run dev      # dev server → http://localhost:4321/acss-plugins-docs/
npm run build    # production build → dist/
npm run preview  # preview production build
```

Requires Node.js 22.

## Gotchas

- **Base path:** The site uses `base: '/acss-plugins-docs'` in `astro.config.mjs`. All internal links must include this prefix (e.g. `/acss-plugins-docs/getting-started/introduction/`).
- **Sidebar is hardcoded:** When adding or renaming a docs page, you must also update the `sidebar` array in `astro.config.mjs` — Starlight does not auto-discover pages.
- **Light-first theme:** `src/styles/custom.css` sets light values on `:root`. Dark mode is an override in `:root[data-theme='dark']`. This matches Starlight's upstream `props.css` contract (light = base, dark = override). Do not invert this.
- **ThemeProvider override:** `src/components/ThemeProvider.astro` replaces Starlight's default and defaults new visitors to light mode. Visitors with a stored `starlight-theme` preference get their stored mode. It is wired via `components:` in `astro.config.mjs`.
- **Astro 6 content schema:** Uses `docsLoader()` in `src/content.config.ts` — the old schema-only pattern will not work.

## Content authoring

MDX pages live in `src/content/docs/`. Standard front-matter:

```mdx
---
title: Page Title
description: One-sentence description shown in search and meta tags.
---
```

Landing pages (`template: splash`) additionally use `hero:` front-matter. Check `src/content/docs/index.mdx` for the pattern.

Content is organized into: `getting-started/`, `acss-kit/`, `acss-utilities/`, `recipes/`, `reference/`, `contributing/`.

## Git conventions

- Branch pattern: `type/kebab-description-YYYY-MM-DD` (e.g. `feat/new-component-docs-2026-05-04`)
- Commit style: Conventional Commits — `feat:`, `fix:`, `docs:`, `ci:`, `chore:`
- PRs deploy to `main`; `main` triggers the GitHub Pages deploy workflow automatically
