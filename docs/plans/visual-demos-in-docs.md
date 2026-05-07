# Visual demos in docs — primitives, skill, and authoring rule

## Context

The docs site at `acss-plugins-docs` describes the `acss-kit` and `acss-utilities` plugins entirely through prose, markdown tables, and fenced code blocks. Pages like `reference/semantic-color-roles.mdx`, `acss-kit/oklch-theming.mdx`, `acss-utilities/utility-families.mdx`, and `acss-kit/component-catalogue.mdx` enumerate tokens, classes, and components by name only — readers never see the actual color, the actual font size, or the actual component rendered.

We want every docs page that names a token, utility class, or component to also show it. To do that we need three things in place: (1) the real plugin output present in this repo so visuals reflect what users will get, (2) reusable Astro primitives that render swatches/type/components/utilities consistently, and (3) a CLAUDE.md authoring rule so this becomes the default for every future docs change. A `/docs-visuals` skill is deferred — see Next Steps.

## Objective

Establish a permanent capability for visually demonstrating tokens, type, components, and utilities inside MDX pages, with an authoring rule that keeps new/edited docs visually rich by default. Defer the auto-scanning skill until the manual conversion proves the workflow.

## Steps

### Phase A — Bring real plugin output into the docs repo

1. **Run `/kit-sync` in the docs repo root.** Why: gives this site the actual generated `--color-*`, `--font-size-*`, and component HTML/CSS rather than abstract names. Creates `.acss-kit/manifest.json` and writes assets under known, predictable paths.
2. **Wire the synced stylesheet into Starlight** via `customCss` in `astro.config.mjs` — append the kit-sync output paths after `./src/styles/custom.css` so plugin tokens cascade in but Starlight overrides still win where intended.
3. **Add a path alias** `~/components/*` and `~/scripts/*` to `tsconfig.json` (and `astro.config.mjs` if Astro requires it) so primitive imports in MDX work from any depth without `../../../` fragility.
4. **Verify token availability** by running `npm run dev` and inspecting `:root` in DevTools — `--color-primary`, the type scale tokens, and the utility classes from `utility-families.mdx` must all be live before continuing. Document the list of `/kit-sync` output paths inline in this plan (or in a `kit-sync.md` next to it) so a future contributor can `git restore` those paths if a build break needs rolling back.

### Phase B — Author the visual primitives and shared runtime

Create primitives in `src/components/`. Each is imported into MDX via the path alias, e.g. `import ColorSwatch from '~/components/ColorSwatch.astro'`.

5. **`src/scripts/visuals.ts`** — single shared client module. Exports: a `populateValues(root)` helper that reads `getComputedStyle` on a root element and fills text nodes marked with `data-token-value`; a theme-change observer (`MutationObserver` on `<html data-theme>`) that re-runs population so OKLCH/rem values update on theme toggle; a `contrastRatio(fg, bg)` helper. Each primitive's `<script>` imports and calls into this module instead of duplicating logic.
6. **`src/components/ColorSwatch.astro`** — props: `role` (string) OR `roles` (array). When `roles` is passed, renders a responsive grid of swatches plus an optional `<table>` beneath (controlled by a `table` boolean prop, default `true`) for ctrl-F lookup and printability. Each swatch shows: the colored tile (`background: var(--color-{role})`), the role name, the resolved OKLCH value (with placeholder text "—" until the script populates), and a contrast badge against `--color-background`. **Missing-token guardrail**: in dev mode, if `getComputedStyle` returns empty for `--color-{role}`, render a visible warning tile so unresolved references fail loudly.
7. **`src/components/TypeScale.astro`** — no props (or optional `tokens` array). Iterates over the kit-sync'd font-size tokens. One row per token: token name on the left, `The quick brown fox` rendered at that size on the right (clamped visually to a readable range), and the actual computed `rem`/`px` always shown beneath the sample. Uses `~/scripts/visuals.ts` for value resolution.
8. **`src/components/ComponentPreview.astro`** — slot-based, default-render only. Wrap the slot in `<div role="region" aria-label="Component preview">` to isolate it semantically from the surrounding page outline. Render the slot inside a bordered preview frame followed by an always-visible code block beneath showing the slot's HTML (no toggle, no tabs). State toggles and variant grids are explicitly out of scope — see Next Steps.
9. **`src/components/UtilityExample.astro`** — props: `class` (the utility, e.g. `bg-primary`), optional `tag` (default `div`). Slot for example content. Renders the live element plus a code snippet showing `<div class="bg-primary">…</div>` and the resolved CSS value of the affected property. Uses `~/scripts/visuals.ts`.

### Phase C — Apply the primitives to anchor pages

10. **`reference/semantic-color-roles.mdx`** — replace the role table by passing `roles=[...]` to `<ColorSwatch>` with the table prop on so the table is preserved beneath the grid. Universal rule: visual + table, never visual alone.
11. **`acss-kit/oklch-theming.mdx`** — add `<ColorSwatch roles=[...]>` to demonstrate the hue-rotation examples currently described in prose.
12. **`acss-kit/component-catalogue.mdx`** — for each named component category, add one `<ComponentPreview>` with a representative example.
13. **`acss-utilities/utility-families.mdx`** — add a `<UtilityExample>` next to each family row.
14. **Add a "Type scale" section** with `<TypeScale />`. Extend the closest existing reference page if one fits; otherwise create `reference/type-scale.mdx` and update the sidebar in `astro.config.mjs`.

### Phase D — Lock it in as default behavior

15. **Add a "Visual demos" section to project `CLAUDE.md`** under "Content authoring": _When adding or editing an MDX page that names a color role, font size, component, or utility class, embed the corresponding visual primitive (`<ColorSwatch>`, `<TypeScale>`, `<ComponentPreview>`, `<UtilityExample>`). Pages without at least one visual primitive should be flagged in PR review (reviewer judgement; no automated lint)._
16. **Cross-link from `CLAUDE.md`** to the primitive components, the shared runtime module, and the `/kit-sync` drift-management instruction so future Claude sessions discover them without grepping.
17. **Document plugin-drift handling in `CONTRIBUTING.md`**: when the `acss-kit` or `acss-utilities` plugins ship a release, re-run `/kit-sync` in this repo and review the diff before merging.

## Critical files

- `astro.config.mjs` — `customCss` (Step 2), sidebar update if Step 14 adds a page, possibly path alias.
- `tsconfig.json` — path alias for `~/components/*`, `~/scripts/*` (Step 3).
- `src/scripts/visuals.ts` — shared runtime (Step 5).
- `src/components/ColorSwatch.astro`, `TypeScale.astro`, `ComponentPreview.astro`, `UtilityExample.astro` — four primitives.
- `src/content/docs/reference/semantic-color-roles.mdx` — first conversion target.
- `src/content/docs/acss-kit/component-catalogue.mdx` — first `<ComponentPreview>` consumer.
- `src/content/docs/acss-utilities/utility-families.mdx` — first `<UtilityExample>` consumer.
- `CLAUDE.md` — authoring rule (Step 15).
- `CONTRIBUTING.md` — drift instruction (Step 17).

## Reuse notes

- `ThemeProvider.astro` already proves `.astro` components compile and ship — primitives follow the same shape.
- `astro.config.mjs` already exposes `components: {}` and `customCss: []` as the existing extension points; no integration changes needed.
- Starlight built-ins (`Card`, `Tabs`, `Aside`) can wrap primitives in MDX where helpful — don't reimplement layouts.
- The `acss-kit:kit-sync` skill is the supported, idempotent way to install plugin assets — don't hand-copy.

## Verification

- `npm run dev` launches the dev server; visit `/acss-plugins-docs/reference/semantic-color-roles/` and confirm a swatch grid plus its table render with real OKLCH colors.
- Toggle dark mode via the theme switcher; swatches _and_ the resolved OKLCH text both update (validates the `MutationObserver` in `visuals.ts`).
- DevTools `:root` shows `--color-primary`, `--color-surface`, `--font-size-*` populated by the kit-sync stylesheet.
- Add a deliberately-bogus `<ColorSwatch role="nonsense" />` in a scratch MDX file in dev — the missing-token warning tile must render. Remove before commit.
- Visit `/acss-utilities/utility-families/` and confirm a `<UtilityExample>` shows live styling with its resolved CSS value.
- Run `npm run build` — must complete without unresolved-import errors.
- Open project `CLAUDE.md` and confirm the rule reads cleanly, references the correct primitive names, and notes the path alias.

## Next Steps (out of scope)

- **`/docs-visuals` skill** — regex-scanning skill that proposes primitive insertions in MDX. Build only after Phase C reveals repetitive pain. If one manual conversion pass covers the whole site and new docs are infrequent, the CLAUDE.md rule alone may suffice.
- **`<ComponentPreview>` state toggles and variant grid** — :hover/:focus/:disabled toggles and side-by-side variant rendering. Re-evaluate after the default-only preview ships and gets used.
- **Auto-generated token reference page** from `.acss-kit/manifest.json` — would replace several hand-maintained tables.
- **Contrast-pair matrix component** for `wcag-contrast-pairs.mdx`.
- **Ship primitives upstream** as part of `acss-kit` so other docs sites adopt them.
- **Print stylesheet** for visuals — interactive frames don't print well; address if any reader actually prints these docs.
- **CI-driven drift detection** — scheduled `/kit-update` PR.

## Unresolved Questions

- For `<ComponentPreview>`, do we want a copy-to-clipboard button on the source view, or is the existing Starlight `<Code>` block (when invoked manually) sufficient?
- Are there any docs pages where embedding visuals would meaningfully bloat page weight (e.g., a reference page that names 100+ tokens)? If so, we may want a `<details>` collapse pattern.

---

## Interview Summary

### Key Decisions Confirmed

- **Resolved values**: client-side script per primitive, consolidated into a shared `src/scripts/visuals.ts` module. Build-time tokens.json rejected.
- **MDX scanner** (when/if the skill is built): simple regex pass.
- **`/kit-sync` output paths**: known/predictable; no spike needed.
- **Swatch shape**: single `<ColorSwatch>` accepting `role` or `roles`. `<ColorSwatchGrid>` dropped.
- **Component preview states**: default-render only for Phase B; toggles + variant grid moved to Next Steps to avoid scope creep.
- **FOUC handling**: visible placeholder text ("—") until script runs.
- **Dark mode reactivity**: `MutationObserver` on `<html data-theme>` re-runs value population.
- **Source affordance**: always-visible code block beneath demos; no toggles, no tabs.
- **Swatch a11y**: text label + value paired with every tile — color is supplementary signal only.
- **Heading-hierarchy isolation**: `<ComponentPreview>` wraps slot in `<div role="region" aria-label="Component preview">`.
- **Type-scale extremes**: clamp visual size to a readable range; always show the real px/rem.
- **Author trust**: standard MDX trust; no slot validation.
- **Plugin drift**: manual `/kit-sync` on each upstream plugin release; documented in `CONTRIBUTING.md`.
- **Tables**: keep markdown table beneath every swatch grid — universal rule, not just one page. Promoted into `<ColorSwatch>` itself via a `table` prop.
- **Rule enforcement**: CLAUDE.md rule + reviewer judgement only; no lint, no hook.
- **Page-weight**: acceptable as-is.

### Open Risks & Concerns

- **Relative-path fragility** — addressed by adding the `~/components/*` path alias in Phase A.
- **Silent token misses** — addressed by the missing-token guardrail in `<ColorSwatch>`.
- **`/docs-visuals` skill ROI uncertain** — addressed by deferring to Next Steps.
- **`/kit-sync` rollback path** — addressed by documenting the kit-sync output paths in Step 4.
- **Print stylesheet** — listed as Next Steps; deferred until someone actually prints.

### Recommended Next Steps Already Folded Into the Plan

The following recommendations from the interview are now part of the Steps above:

1. Path alias for primitive imports (Phase A, Step 3).
2. Shared `src/scripts/visuals.ts` module (Phase B, Step 5).
3. Missing-token guardrail in `<ColorSwatch>` (Step 6).
4. `<ComponentPreview>` reduced to default-only (Step 8); state modes moved to Next Steps.
5. `/docs-visuals` skill deferred to Next Steps.
6. Universal "swatch + table" pattern via a `table` prop on `<ColorSwatch>` (Step 6).
7. Rollback note for `/kit-sync` output paths (Step 4).
8. Plugin drift documentation in `CONTRIBUTING.md` (Step 17).

### Simplification Opportunities Applied

- **Dropped `<ColorSwatchGrid>`** — merged into `<ColorSwatch>` with `roles` prop.
- **Deferred `<ComponentPreview>` toggle and variant modes** — ship default-only first.
- **Deferred the `/docs-visuals` skill** — CLAUDE.md rule + four primitives may carry the workflow.
- **Consolidated runtime JS** into one `src/scripts/visuals.ts` module instead of inline `<script>` per primitive.
