---
name: docs-add
description: Add a new MDX documentation page to the correct content directory and update the sidebar in astro.config.mjs. Invoke with /docs-add <section> <slug> "<title>" "<description>".
disable-model-invocation: true
---

# Add a docs page

Called with: `/docs-add <section> <slug> "<title>" "<description>"`

- `section` — one of `getting-started`, `acss-kit`, `acss-utilities`, `recipes`, `reference`, `contributing`
- `slug` — kebab-case filename without extension (e.g. `my-new-page`)
- `title` — page title (quoted)
- `description` — one-sentence description for meta/search (quoted)

## Steps

1. Create `src/content/docs/<section>/<slug>.mdx` with this front-matter:

```mdx
---
title: <title>
description: <description>
---
```

2. Open `astro.config.mjs` and locate the `sidebar` array entry whose `label` matches the target section. Add a new item to that group's `items` array:

```js
{ label: '<title>', slug: '<section>/<slug>' },
```

   Place it in a logical position within the group (alphabetical, or after the last existing item if order is unclear).

3. Run `npm run build` to confirm the page compiles without errors.

4. Report the new file path and the exact sidebar entry added.

## Notes

- Landing pages (`template: splash`) require additional `hero:` front-matter — check `src/content/docs/index.mdx` for the pattern.
- All internal links in the new page must include the `/acss-plugins-docs/` base prefix.
- If adding a nested group (e.g. a Commands sub-section), match the nested `items` structure already in `astro.config.mjs`.
