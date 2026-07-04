---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `4dbad67`
- **verified-at:** `2026-07-04T00:00:00Z`

## Plugin roots

| Plugin      | Path under upstream clone root |
| ----------- | ------------------------------ |
| acss-kit    | `plugins/acss-kit`             |
| style-agent | `plugins/style-agent`          |

## Invalidation

- The agent overwrites this file after a successful full-discovery run whose result differs from the cache.
- To force a re-discovery, delete this file and commit.
- This file is data, not prose — keep it short. Sub-agent runtime injects only the first 200 lines / 25 KB into the agent's prompt.

## Notes

- `acss-utilities` was removed from upstream in commit `c6049e5` (chore: remove deprecated acss-utilities plugin). The `plugins/acss-utilities/` directory no longer exists. Docs in `src/content/docs/acss-utilities/` are preserved for reference and flagged with removal notices.
- `style-agent` is present upstream at `plugins/style-agent/` and has a corresponding docs section in this repo at `src/content/docs/style-agent/`.
- Full discovery run performed at `1e7b96e`: found `plugins/acss-kit` and `plugins/style-agent`; `plugins/acss-utilities` absent (removed upstream).
- Layout verified at `5ef5592`: same two plugin roots (`plugins/acss-kit`, `plugins/style-agent`); layout unchanged.
- New in `5ef5592` sync: `plugins/acss-kit/docs/prompt-book.md` refreshed for v1.10.2 (added §5a, §6a, §6b, §6c; kit-core replaces `components` skill references); `docs/framework-agnostic-design-systems-review.md` added upstream. `src/content/docs/acss-kit/overview.mdx` updated to list `/theme-from-figma`, `/theme-from-design`, `/design-export` in the Commands table.
- Layout verified at `4dbad67`: same two plugin roots (`plugins/acss-kit`, `plugins/style-agent`); layout unchanged.
- New in `4dbad67` sync: acss-kit v1.11.0 — component token vocabulary unified to DESIGN.md/M3 names (internal to component.md front-matter; generated CSS unchanged); 14 component skill docs updated to reflect COMPONENT.md-first workflow (prefer `<name>.component.md`, fall back to `reference.md`). style-agent v0.5.1 — getting-started tutorial added upstream; docs already had `tutorial.mdx`.
