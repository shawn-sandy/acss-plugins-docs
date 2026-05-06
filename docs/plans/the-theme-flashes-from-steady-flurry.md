# Make light the default theme

## Context

The site flashes from dark to light on first paint. Cause: `src/styles/custom.css` ships dark values on `:root`, while `src/components/ThemeProvider.astro` sets `data-theme="light"` for any visitor whose stored preference (or default) is light. CSS parses before the inline script's `data-theme` write triggers a repaint, so the first paint is dark and then snaps to light — a FOUC.

Fix: invert the dark-first setup so the most-common state (light) is the default. This also brings the docs site into alignment with the theming contract it teaches in its own content (every acss-kit page documents `:root` = light, `[data-theme="dark"]` = dark — see `reference/semantic-color-roles.mdx:6`).

## Objective

Make light mode the default such that:

- Visitors with no stored preference land on light mode.
- Visitors with a stored preference get their stored mode with no inter-theme flash.
- The dark theme is preserved and toggleable via the existing Starlight theme picker.

## Steps

1. **Flip the JS default in `src/components/ThemeProvider.astro:10`** — change `const theme = storedTheme || 'dark';` to `const theme = storedTheme || 'light';`. Update the inline comment on line 5 from "Defaults to dark…" to "Defaults to light…". _Why:_ aligns the no-stored-preference branch with the new default so no `data-theme` attribute is needed on the root for the most common case.

2. **Invert `src/styles/custom.css` so `:root` holds light values and `:root[data-theme='dark']` holds dark overrides.**
   - Move the current dark accent / gray ramp / white / black values from `:root` (lines 8–29) into a new `:root[data-theme='dark'], [data-theme='dark'] ::backdrop` block.
   - Move the current light values from `:root[data-theme='light']` (lines 32–48) up to `:root`.
   - Delete the now-empty `:root[data-theme='light']` block (light is the unmodified base).
   - Keep the `--sl-font-system-mono` declaration on `:root` (mode-agnostic).
   - Preserve the existing OKLCH values verbatim — only the selectors change.
     _Why:_ this matches Starlight's upstream `props.css` contract (light-first, dark as override) and ensures the first paint matches the new default.

3. **Update `CLAUDE.md` "Gotchas" section** — replace the "Dark-first theme" bullet with a "Light-first theme" bullet describing the new contract: `:root` carries light values, `:root[data-theme='dark']` overrides for dark, defaults to light for new visitors. _Why:_ the existing note explicitly says "Do not invert this" — leaving it would mislead future contributors.

## Critical files

- `src/components/ThemeProvider.astro` — JS default (line 10) and header comment (line 5).
- `src/styles/custom.css` — invert `:root` and `[data-theme='…']` blocks (lines 7–48).
- `CLAUDE.md` — update the "Dark-first theme" gotcha to "Light-first theme".

## Out of scope (Next Steps)

- Logo asset behavior is already handled by Starlight's `logo.light` / `logo.dark` config in `astro.config.mjs:13–15` and needs no change.
- The "Dark-first theme" gotcha was the only doc-internal claim about the inversion; no MDX content pages reference the old default.
- Persisted user preferences (`localStorage['starlight-theme']`) are unaffected — anyone who previously chose dark stays on dark.

## Verification

1. `npm run dev`, open `http://localhost:4321/acss-plugins-docs/` in an Incognito window (no stored preference). Confirm the page loads in light mode with no visible flash.
2. Toggle to dark via the Starlight theme picker; reload. Confirm dark persists with no light flash on reload.
3. Toggle back to light; reload. Confirm light persists with no dark flash.
4. `npm run build && npm run preview` and repeat step 1 against the production build, since FOUC behavior can differ between dev HMR and the static build.
5. Visually spot-check at least one accent-colored element (e.g. a sidebar link or hero CTA on `/`) in both modes to confirm the OKLCH values land on the correct mode after the swap.
