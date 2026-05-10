# Maintaining `acss-plugins-docs`

A practical guide for anyone who keeps this documentation site healthy: editing content, adding pages, updating the theme, troubleshooting builds, shipping releases, and understanding the automated sync pipeline that ties this repo to the upstream plugin source.

If you're a **consumer** of the docs (just reading or linking to them), see [`README.md`](./README.md) instead.

---

## Table of contents

1. [What this repo is](#what-this-repo-is)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [Local development](#local-development)
4. [Repository layout](#repository-layout)
5. [How content is authored](#how-content-is-authored)
6. [Adding or moving pages](#adding-or-moving-pages)
7. [The sidebar (`astro.config.mjs`)](#the-sidebar-astroconfigmjs)
8. [Theming and styles](#theming-and-styles)
9. [Build, deploy, and GitHub Pages](#build-deploy-and-github-pages)
10. [The `docs-sync-reviewer` agent](#the-docs-sync-reviewer-agent)
11. [Branching, commits, and PRs](#branching-commits-and-prs)
12. [Common maintenance tasks](#common-maintenance-tasks)
13. [Troubleshooting](#troubleshooting)
14. [Upgrading dependencies](#upgrading-dependencies)
15. [Conventions and style guide](#conventions-and-style-guide)

---

## What this repo is

`acss-plugins-docs` is the **public developer documentation** for two Claude Code plugins maintained in a separate repository:

| Plugin           | What it does                                                   |
| ---------------- | -------------------------------------------------------------- |
| `acss-kit`       | Generates accessible React components and OKLCH CSS themes.    |
| `acss-utilities` | Generates atomic CSS utility classes with responsive variants. |

- **Plugin source repo (upstream):** <https://github.com/shawn-sandy/agentic-acss-plugins>
- **Docs source (this repo):** <https://github.com/shawn-sandy/acss-plugins-docs>
- **Published site:** <https://shawn-sandy.github.io/acss-plugins-docs/>

The docs are versioned and edited independently of the plugins, but they must stay in sync with the upstream commands, skills, and scripts. A scheduled agent (see [`docs-sync-reviewer`](#the-docs-sync-reviewer-agent)) detects drift and proposes PRs to keep them aligned.

---

## Architecture at a glance

```text
┌────────────────────────────┐         clone + diff           ┌────────────────────────────┐
│ agentic-acss-plugins       │  ←──────────────────────────── │ docs-sync-reviewer agent   │
│  plugins/acss-kit/         │                                │ (.claude/agents/...)       │
│  plugins/acss-utilities/   │                                └────────────┬───────────────┘
└────────────────────────────┘                                             │ proposes PRs
                                                                           ▼
                              ┌────────────────────────────────────────────────────────────┐
                              │  acss-plugins-docs (this repo)                             │
                              │   src/content/docs/**/*.mdx     ← MDX content              │
                              │   src/components/*.astro        ← Starlight overrides      │
                              │   src/styles/custom.css         ← OKLCH theme              │
                              │   astro.config.mjs              ← sidebar, site, base path │
                              └──────────────────────┬─────────────────────────────────────┘
                                                     │ push to main → Actions
                                                     ▼
                                      ┌──────────────────────────────┐
                                      │ .github/workflows/deploy.yml │
                                      │   astro build → dist/        │
                                      │   actions/deploy-pages       │
                                      └──────────────┬───────────────┘
                                                     ▼
                                            GitHub Pages site
```

**Stack:**

- [Astro 6](https://astro.build/) — static site generator
- [Starlight 0.38](https://starlight.astro.build/) — docs theme on top of Astro
- [MDX](https://mdxjs.com/) — content with embedded JSX components
- [sharp](https://sharp.pixelplumbing.com/) — image pipeline (used by Astro at build time)
- Node 22, npm
- TypeScript (`strict`)

There is no backend, no database, and no client-side framework beyond Starlight's vanilla view-transition scripts.

---

## Local development

**Prerequisites:** Node 22+ and npm. (CI uses exactly Node 22 — match it locally to avoid lockfile drift.)

```bash
# 1. Install dependencies. Use `npm ci` for a clean, reproducible install.
npm ci

# 2. Start the dev server with hot reload.
npm run dev
# → open http://localhost:4321/acss-plugins-docs/
#   (note the /acss-plugins-docs/ base path — see below)

# 3. Build the production bundle (catches errors that don't appear in dev).
npm run build

# 4. Preview the production bundle locally.
npm run preview
```

> **Always run `npm run build` before pushing.** Dev mode is forgiving about MDX errors that fail the production build (e.g. malformed front-matter, unclosed JSX tags). CI will reject anything that doesn't build.

### Why the `/acss-plugins-docs/` URL prefix?

Because the site is served from `https://shawn-sandy.github.io/acss-plugins-docs/`, GitHub Pages requires the `base` path to be set. It's configured in `astro.config.mjs`:

```js
site: 'https://shawn-sandy.github.io',
base: '/acss-plugins-docs',
```

All internal links must include this prefix (or use Starlight's `<a href="/acss-plugins-docs/...">` form). Markdown links written as `[label](/getting-started/installation/)` will 404 in production — write them as `[label](/acss-plugins-docs/getting-started/installation/)` or as relative slugs in front-matter.

---

## Repository layout

```text
acss-plugins-docs/
├── .claude/
│   └── agents/
│       └── docs-sync-reviewer.md   # The drift-detection agent definition
├── .github/
│   └── workflows/
│       └── deploy.yml              # Build + deploy to GitHub Pages
├── src/
│   ├── assets/                     # Logos (light/dark SVG)
│   ├── components/
│   │   └── ThemeProvider.astro     # Override: defaults theme to dark
│   ├── content/
│   │   ├── config.ts               # Re-exports Starlight collection schema
│   │   └── docs/                   # All MDX content lives here
│   │       ├── index.mdx           # Splash hero page (template: splash)
│   │       ├── getting-started/
│   │       ├── acss-kit/
│   │       │   ├── overview.mdx
│   │       │   ├── commands/       # /setup, /kit-add, /kit-create, ...
│   │       │   ├── skills/         # setup, components, styles, ...
│   │       │   ├── component-catalogue.mdx
│   │       │   ├── css-variables.mdx
│   │       │   └── oklch-theming.mdx
│   │       ├── acss-utilities/
│   │       │   ├── overview.mdx
│   │       │   ├── commands/
│   │       │   ├── skills/
│   │       │   ├── utility-families.mdx
│   │       │   ├── token-bridge.mdx
│   │       │   └── responsive-variants.mdx
│   │       ├── recipes/            # Task-focused walkthroughs
│   │       ├── reference/          # Deep references (scripts, WCAG, ...)
│   │       └── contributing/       # Architecture + authoring guides
│   ├── content.config.ts           # Astro content collection definition
│   └── styles/
│       └── custom.css              # OKLCH theme (overrides Starlight tokens)
├── astro.config.mjs                # Starlight integration + sidebar
├── package.json                    # scripts: dev / build / preview
├── tsconfig.json                   # extends astro/tsconfigs/strict
├── README.md                       # Consumer-facing overview
└── MAINTAINING.md                  # ← this file
```

### What lives where, in plain terms

- **Content:** `src/content/docs/**/*.mdx`. One file per page. Folder structure mirrors URL paths.
- **Navigation (sidebar):** declared explicitly in `astro.config.mjs`. **Not** auto-generated from filenames.
- **Site identity (title, description, social links, edit link):** `astro.config.mjs`.
- **Theme colors and typography:** `src/styles/custom.css`.
- **Component overrides (e.g. dark-mode default):** `src/components/`.
- **Logos:** `src/assets/logo-light.svg`, `src/assets/logo-dark.svg`.
- **Deploy pipeline:** `.github/workflows/deploy.yml`.
- **Automation agent (drift detection):** `.claude/agents/docs-sync-reviewer.md`.

---

## How content is authored

Every page is an MDX file under `src/content/docs/`. The path determines the URL slug.

### Required front-matter

```mdx
---
title: Your First Component
description: Generate an accessible React button with /kit-add.
---
```

- `title` (required) — appears in the browser tab, page heading, and sidebar fallback
- `description` (required) — used for SEO and social cards

### Optional front-matter

```mdx
---
title: acss-plugins
template: splash # Only for landing pages with no sidebar / TOC
hero: # Only valid with template: splash
  tagline: Short pitch
  actions:
    - text: Get Started
      link: /acss-plugins-docs/getting-started/introduction/
      icon: right-arrow
      variant: primary
sidebar:
  order: 1 # Override sort order if not explicit in astro.config
  badge:
    text: New
    variant: tip
---
```

The full schema is documented at <https://starlight.astro.build/reference/frontmatter/>.

### Starlight components you'll see in MDX

```mdx
import {
  Aside,
  Steps,
  Tabs,
  TabItem,
  Card,
  CardGrid,
  Icon,
  FileTree,
  Code,
} from "@astrojs/starlight/components";

<Aside type="caution">
  Don't use raw HTML where a Starlight component fits.
</Aside>

<Steps>1. First step 2. Second step</Steps>

<Tabs>
  <TabItem label="npm">npm install foo</TabItem>
  <TabItem label="pnpm">pnpm add foo</TabItem>
</Tabs>
```

When in doubt, copy the structure of `src/content/docs/acss-kit/commands/kit-add.mdx` — it is the canonical command-page template.

---

## Adding or moving pages

Three things must change in lockstep:

1. **Create the MDX file** under `src/content/docs/<section>/<slug>.mdx` with valid front-matter.
2. **Add a sidebar entry** in `astro.config.mjs` (see [next section](#the-sidebar-astroconfigmjs)).
3. **Run `npm run build`** to verify the page renders, links resolve, and the sidebar entry's `slug:` matches the file path.

### Renaming a page

Renaming the MDX file changes its URL. To preserve external inbound links, leave a stub at the old path or do a rename only when no external sites link to the old URL. There is currently **no redirect layer** in this repo — broken external links stay broken.

### Deleting a page

1. Remove the MDX file.
2. Remove its `slug:` entry from `astro.config.mjs`.
3. Search the repo for inbound links: `grep -rn "<old-slug>" src/`.

---

## The sidebar (`astro.config.mjs`)

The sidebar is **manually curated**, not auto-generated. Top-level groups and items are declared in the `sidebar` array passed to `starlight()`:

```js
sidebar: [
  {
    label: "acss-kit",
    items: [
      { label: "Overview", slug: "acss-kit/overview" },
      {
        label: "Commands",
        items: [
          { label: "/kit-add", slug: "acss-kit/commands/kit-add" },
          // ...
        ],
      },
    ],
  },
  // ...
];
```

Rules:

- `slug:` is the path **inside** `src/content/docs/`, **without** the `.mdx` extension and **without** a leading slash.
- `label:` is what users see; it does not need to match the page's `title:`.
- Subgroups (`{ label, items: [...] }`) render as collapsible sections.
- Order in the array = order in the rendered sidebar.

Forgetting to add a sidebar entry produces an orphan page: it builds and is reachable by direct URL, but is invisible in the navigation. Always add the entry when creating a page.

---

## Theming and styles

### The custom palette

`src/styles/custom.css` overrides Starlight's color tokens with an OKLCH-based palette **mirroring the same algorithm `acss-kit` itself uses for user projects**. This is intentional: the docs site is a live demo of the theming system it documents.

Key tokens (override these, not the underlying Starlight defaults):

```css
:root {
  --sl-color-accent-low: oklch(...) --sl-color-accent: oklch(...)
    --sl-color-accent-high: oklch(...) --sl-color-gray-1..7: oklch(...)
    --sl-color-white / --sl-color-black;
}

:root[data-theme="light"] {
  /* light mode inversions */
}
```

When changing colors, change **both** the dark-mode `:root` block and the `:root[data-theme='light']` block — Starlight's contract requires both populated.

### Default theme

`src/components/ThemeProvider.astro` overrides Starlight's built-in theme provider so the site **defaults to dark** when no user preference is stored. If you want to revert to Starlight's default (auto / system), delete this file and remove the `components.ThemeProvider` line in `astro.config.mjs`.

### Typography

Headings use a slight negative letter-spacing (`-0.01em`) for a tighter feel; inline `code` is sized at `0.875em`. Both are tunable in `custom.css` under the `── Typography ──` and `── Command name styling ──` blocks.

---

## Build, deploy, and GitHub Pages

### CI workflow

`.github/workflows/deploy.yml` runs on every push to `main` and on manual `workflow_dispatch`. It:

1. Checks out the repo.
2. Sets up Node 22 with npm cache.
3. Configures GitHub Pages and computes `BASE_PATH`.
4. Runs `npm ci` and `npm run build`.
5. Uploads `dist/` as a Pages artifact.
6. Deploys via `actions/deploy-pages@v4`.

The workflow has these permissions: `contents: read`, `pages: write`, `id-token: write`. Concurrency is grouped by `pages` so back-to-back pushes don't interleave deploys.

### First-time GitHub Pages setup

If Pages has never been enabled on the repo:

1. Settings → Pages → **Source: GitHub Actions**.
2. Push to `main`.
3. The first run provisions the environment; subsequent pushes deploy in ~1 minute.

### Verifying a deploy

After the workflow finishes, the live site URL appears in the **Deploy** job summary. Hard-refresh in an incognito window — Pages serves with aggressive cache headers and stale assets are common during testing.

### Rolling back

There is no built-in rollback. To revert, push a `git revert` commit to `main`; the workflow redeploys the previous content.

---

## The `docs-sync-reviewer` agent

**The single most important automation in this repo.** Lives at `.claude/agents/docs-sync-reviewer.md`. Read that file in full before changing how syncing works — it's the source of truth.

### What it does

1. Clones the upstream plugin repo (`agentic-acss-plugins`) into a temp directory.
2. Reads the last-synced upstream SHA from `.claude/docs-sync-state.json` and/or the `docs-sync-state` orphan branch.
3. For every command, skill, and Python script that changed upstream, audits the corresponding MDX page against it.
4. Either:
   - **Drift found** → opens a PR on a `claude/docs-sync-<YYYYMMDD>` branch with proposed edits + an updated state file.
   - **No drift** → pushes a state-only commit to the `docs-sync-state` tracking branch.
   - **Build failure / discovery failure** → opens a notification PR (no doc edits) for human investigation.

### Sync state files

Two locations hold the same JSON shape (see the schema in the agent file):

- `.claude/docs-sync-state.json` on `main` (advances when a drift PR merges).
- `docs-sync-state.json` on the orphan `docs-sync-state` branch (advances on no-drift runs).

The agent merges both at the per-plugin level, taking the newer `lastSyncedAt` per plugin. **Never edit these files manually** unless you're recovering from a corrupted state — and if you do, follow the schema exactly:

```json
{
  "lastUpstreamSha": "<full-sha>",
  "lastSyncedAt": "<ISO-8601 UTC>",
  "plugins": {
    "acss-kit": { "lastUpstreamSha": "...", "lastSyncedAt": "..." },
    "acss-utilities": { "lastUpstreamSha": "...", "lastSyncedAt": "..." }
  }
}
```

### Upstream layout cache

The agent caches the discovered upstream plugin layout (which subdirectories actually hold `commands/`, `skills/`, `scripts/`) in a project-scoped memory file:

- **Location:** `.claude/agent-memory/docs-sync-reviewer/MEMORY.md`
- **Why committed:** the cache describes upstream-repo structure, not anything about your local machine — every collaborator and CI run benefits from the same cache. `memory: project` (set in the agent's frontmatter) is the mechanism that wires this up.

**When the cache updates.** The agent only overwrites this file when a fresh `find`-based discovery returns a result that differs from the cache. On every other run it's read-only — the runtime injects its first 200 lines / 25 KB into the agent's prompt automatically, so cache hits are free.

**How updates ride along with commits.** A cache update produced during a drift run is included in the drift PR's commit. A cache update during a no-drift run is included in the state-only commit pushed to the `docs-sync-state` branch (the worktree's `git add -A` picks it up).

**Manual invalidation.** Two options if you need to force a fresh discovery:

- Delete the file: `rm .claude/agent-memory/docs-sync-reviewer/MEMORY.md` and commit.
- Or blank out the `verified-at-sha` value to an empty string and commit.

The agent treats either signal as cache-empty and runs full discovery on the next invocation.

**Schema.** A short YAML frontmatter block plus a Markdown body. Open the file to see the canonical shape — it lists each plugin and its path under the upstream clone root, plus the SHA and timestamp at which the layout was last verified.

### When to invoke it

- **Daily** as a scheduled run (recommended).
- **On merges to `main`** of `agentic-acss-plugins` (via webhook → repository_dispatch).
- **On demand** when you suspect drift.

### Reviewing a sync PR

Sync PRs include:

- An upstream SHA range and a compare URL.
- A bulleted list of changes per MDX file (Updated / Added / Flagged).
- A "Needs human decision" section for removals, brand-new plugins, or anything ambiguous.

The agent **never** deletes pages or modifies `package.json`, lockfiles, CI workflows, or `src/styles/`. If a sync PR touches any of those, it's a bug — investigate before merging.

### Notification PRs (do not merge)

Two failure modes open PRs that exist solely as notifications:

- `claude/docs-sync-discovery-*` — agent could not find any plugin roots upstream (likely a layout change).
- `claude/docs-sync-build-failure-*` — proposed edits broke `npm run build`.

Both have a "do not merge — notification only" note in the body. Resolve the underlying issue, close the notification PR, and re-run the agent.

---

## Branching, commits, and PRs

- **`main`** — production. Every push deploys.
- **`docs-sync-state`** — orphan tracking branch used by the sync agent. Never merge into `main`. Never base feature branches on it.
- **`claude/docs-sync-<YYYYMMDD>`** — agent-generated drift PR branches.
- **`claude/docs-sync-discovery-*` / `-build-failure-*`** — agent-generated notification branches (never merge).
- **`claude/<task>-<short-id>`** — branches created by interactive Claude Code sessions.
- **Manual edits** — open a feature branch, PR into `main`. Branch protection on `main` is recommended (require PR + status checks).

### Commit style

Match the existing log: short imperative subject, optional body. Sync agent commits use the form `docs: sync with agentic-acss-plugins@<short-sha>`.

---

## Common maintenance tasks

### Add a new command page (e.g. for a brand-new upstream command)

1. Create `src/content/docs/<plugin>/commands/<cmd>.mdx`. Use `kit-add.mdx` as the template.
2. Add the entry to the `Commands` subgroup of the right plugin in `astro.config.mjs`.
3. `npm run build` to verify.
4. Commit, push, PR.

### Add a new top-level section

1. Create `src/content/docs/<section>/`.
2. Add at least one MDX page (typically `overview.mdx`).
3. Add a new top-level group to the `sidebar` array in `astro.config.mjs`.
4. Decide if it should appear above or below existing groups; reorder accordingly.

### Update the logo

Replace `src/assets/logo-light.svg` and/or `src/assets/logo-dark.svg`. SVG only. Keep both files even if they're identical — Starlight references both.

### Change the GitHub link in the header

Edit the `social:` array in `astro.config.mjs`.

### Change the "Edit this page" target

Edit `editLink.baseUrl` in `astro.config.mjs`. It currently points to this docs repo, **not** the upstream plugin repo, so editors land in MDX rather than `.md` plugin source.

### Add a sidebar badge

```js
{ label: '/new-cmd', slug: 'acss-kit/commands/new-cmd', badge: { text: 'New', variant: 'tip' } }
```

### Pin a page to the top of its group

Use `sidebar.order` in the page front-matter, **or** simply place it first in the `items:` array. Explicit array order is the more readable option.

---

## Troubleshooting

### `npm run dev` works but `npm run build` fails

The dev server is forgiving; the production build is strict. Common causes:

| Symptom                                               | Likely cause                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `Could not parse expression with acorn`               | Unescaped `{` or `}` in MDX prose. Wrap in backticks.         |
| `MDX file is missing required frontmatter property`   | Missing `title:` or `description:`.                           |
| `Unable to resolve link`                              | Internal link without `/acss-plugins-docs/` prefix.           |
| `slug "..." cannot be found`                          | Sidebar entry references a slug whose MDX file doesn't exist. |
| `Component is not exported by @astrojs/starlight/...` | Starlight upgraded; component path or name changed.           |
| `EACCES`/`EPERM` on `dist/`                           | Stale `dist/` from a previous root-owned run. `rm -rf dist/`. |

### Page renders blank

Check the browser console. Most often: a thrown error in a `<script is:inline>` block (e.g. in `ThemeProvider.astro`) — Starlight will continue rendering but the layout breaks visually.

### Sidebar entry doesn't appear

Restart `npm run dev`. Astro caches the config; sidebar changes require a server restart, not just hot reload.

### Site deploys but 404s on a page

Verify the page's URL includes the `/acss-plugins-docs/` base path. Direct hits to `https://shawn-sandy.github.io/getting-started/...` (without `/acss-plugins-docs/`) will 404 — that's correct behavior, not a bug.

### Pages workflow fails on `actions/configure-pages`

Pages source is set to "Deploy from a branch" instead of "GitHub Actions". Fix in Settings → Pages.

### A sync PR conflicts with manual edits

The sync agent operates on whole-file edits via `Edit`. If a manual PR landed on `main` first, rebase the sync branch and let the agent re-run, or resolve conflicts manually and push to the existing sync PR (the agent will reuse it on its next run).

---

## Upgrading dependencies

### Astro and Starlight

These two ship together and have a tight version contract. Upgrade them in one PR:

```bash
npm install astro@latest @astrojs/starlight@latest
npm run build
```

Read the [Starlight changelog](https://github.com/withastro/starlight/blob/main/packages/starlight/CHANGELOG.md) before upgrading — they occasionally rename component overrides or change the front-matter schema.

If an upgrade requires changes to `src/components/ThemeProvider.astro`, update it to match the new Starlight reference implementation in [`@astrojs/starlight/components/ThemeProvider.astro`](https://github.com/withastro/starlight/blob/main/packages/starlight/components/ThemeProvider.astro).

### Node version

CI pins Node 22 (`.github/workflows/deploy.yml`). When bumping Node:

1. Update `node-version` in the workflow.
2. Update the prerequisite line in `MAINTAINING.md` and `README.md`.
3. Run `npm ci && npm run build` locally on the new version.

### Lockfile

`package-lock.json` is committed. Always commit lockfile changes alongside dependency changes. Never run `npm install --no-save`.

---

## Conventions and style guide

These conventions match what the `docs-sync-reviewer` agent expects to find. Deviating breaks the agent's heuristics.

### Tone

Direct, second-person ("you"), present tense. No marketing language. Match the tone of `getting-started/installation.mdx`.

### Page shape (commands)

1. Front-matter: `title` is the user-facing command (e.g. `/kit-add`), `description` is a one-sentence summary.
2. Opening paragraph: what the command does and when to use it.
3. **Syntax** section with a fenced code block showing the invocation.
4. **Arguments** table.
5. **Workflow** as a numbered `<Steps>` list.
6. **Output** describing generated files.
7. **Examples** (one or more `<Tabs>`).
8. Cross-links at the bottom.

`src/content/docs/acss-kit/commands/kit-add.mdx` is the canonical reference. Don't invent new structures — extend the existing one.

### Page shape (skills)

1. Front-matter.
2. Opening paragraph: what the skill does and which command(s) trigger it.
3. **Inputs** / **Outputs**.
4. **Behavior** narrative.
5. **Cross-links** to commands that delegate to this skill.

### Cross-links

- Within the docs: use slug-relative links rendered through Starlight's `<a>` component or markdown `[label](/acss-plugins-docs/<slug>/)` form.
- To upstream plugin source: full GitHub URLs (`https://github.com/shawn-sandy/agentic-acss-plugins/...`).
- To Starlight or Astro docs: full `https://starlight.astro.build/...` URLs.

### Code blocks

- Always declare the language on fenced blocks: `bash`, `js`, `mdx`, `css`.
- Prefer **complete, runnable examples** over fragments.
- For shell, prefix interactive output with `# →` rather than a `$` prompt.

### MDX vs Markdown

All content files are `.mdx`. Use Starlight components (`<Aside>`, `<Steps>`, `<Tabs>`, `<FileTree>`) instead of raw HTML when one fits. Plain markdown still works inside MDX.

---

## Where to ask for help

- Astro / Starlight questions: their respective Discord servers and GitHub Discussions.
- Plugin-specific questions: the upstream [`agentic-acss-plugins`](https://github.com/shawn-sandy/agentic-acss-plugins) repo.
- Sync-agent or this repo's automation: open an issue here and tag the maintainer.
