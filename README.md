# acss-plugins-docs

Developer documentation for [acss-kit](https://github.com/shawn-sandy/agentic-acss-plugins) and [acss-utilities](https://github.com/shawn-sandy/agentic-acss-plugins) — Claude Code plugins for building accessible React components, CSS themes, and atomic utility classes.

Built with [Astro Starlight](https://starlight.astro.build). Deployed to GitHub Pages.

## What's documented

| Section | Contents |
|---|---|
| Getting Started | Prerequisites, install, first component, first theme, first utilities |
| acss-kit | Overview, all 6 commands, all 4 skills, component catalogue, OKLCH theming |
| acss-utilities | Overview, all 4 commands, utilities skill, token bridge, responsive variants |
| Recipes | Accessible form, brand dark theme, adding utilities, Figma extraction, style tuning |
| Reference | Python scripts API, WCAG contrast pairs, semantic color roles, troubleshooting |
| Contributing | Plugin architecture, authoring commands, authoring skills, script contracts |

## Local development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:4321/acss-plugins-docs/

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Deployed automatically via GitHub Actions on push to `main`. The workflow file is at `.github/workflows/deploy.yml`.

To deploy manually: push to `main`. GitHub Actions runs `astro build` and deploys the `dist/` output to GitHub Pages.

**First-time setup:**
1. Go to your repo Settings → Pages
2. Set Source to **GitHub Actions**
3. Push to `main` to trigger the first deploy

## Content structure

```
src/content/docs/
├── getting-started/          # Prerequisites → install → tutorials
├── acss-kit/
│   ├── commands/             # /kit-add /kit-list /theme-create ...
│   └── skills/               # components, styles, component-form, style-tune
├── acss-utilities/
│   ├── commands/             # /utility-add /utility-list /utility-tune /utility-bridge
│   └── skills/               # utilities skill
├── recipes/                  # Task-focused walkthroughs
├── reference/                # Python scripts, WCAG pairs, troubleshooting
└── contributing/             # Architecture, command/skill authoring
```

All content is MDX. Add new pages by creating a `.mdx` file with `title:` and `description:` front-matter, then add a `slug:` entry to the sidebar in `astro.config.mjs`.

## Theming

The site uses a custom OKLCH-based color palette defined in `src/styles/custom.css`, mirroring the same color system that acss-kit generates for user projects.

## For maintainers

If you're editing the docs, adding pages, updating the theme, or troubleshooting the build/deploy pipeline, see **[MAINTAINING.md](./MAINTAINING.md)**. It covers:

- Repository layout and architecture
- Authoring conventions and the canonical page templates
- Adding pages, sections, and sidebar entries
- The OKLCH theme system in `src/styles/custom.css`
- The GitHub Actions deploy pipeline
- The `docs-sync-reviewer` agent that keeps these docs in sync with upstream
- Common maintenance tasks, troubleshooting, and dependency upgrades

## Related

- [Plugin repo](https://github.com/shawn-sandy/agentic-acss-plugins) — source for both plugins
- [fpkit/acss](https://github.com/shawn-sandy/acss) — upstream component library
