# Contributing

## Development setup

```bash
npm install
npm run dev      # dev server → http://localhost:4321/acss-plugins-docs/
npm run build    # production build
npm run preview  # preview built output
```

Requires Node.js 22.

## Adding or editing docs pages

1. Create the MDX file under `src/content/docs/`.
2. Add it to the `sidebar` array in `astro.config.mjs` — Starlight does not auto-discover pages.
3. Follow the visual-demos authoring rule in `CLAUDE.md`: any page that names a color role, font size, component, or utility class must embed the corresponding visual primitive (`<ColorSwatch>`, `<TypeScale>`, `<ComponentPreview>`, `<UtilityExample>`).

## Keeping plugin tokens in sync

`src/styles/acss-tokens.css` mirrors the CSS custom properties that `acss-kit` and `acss-utilities` generate for an indigo (270°) seed theme. When either plugin ships a release that changes its color roles, type scale, or utility classes:

1. Review the plugin changelog for token additions, removals, or renamed roles.
2. Update `src/styles/acss-tokens.css` to match. Keep light values on `:root` and dark values on `[data-theme="dark"]`.
3. If the `TypeScale.astro` component hardcodes the token list, update `src/components/TypeScale.astro` as well.
4. Run `npm run build` and confirm no build errors before opening a PR.

## Commit conventions

Conventional Commits — `feat:`, `fix:`, `docs:`, `ci:`, `chore:`

Branch pattern: `type/kebab-description-YYYY-MM-DD`

PRs to `main` trigger the GitHub Pages deploy automatically.
