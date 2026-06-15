---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `1e7b96e`
- **verified-at:** `2026-06-15T10:12:00Z`

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
- New commands added in this sync: `/design-export`, `/theme-from-design`, `/theme-from-figma` (acss-kit Workstream A/C, v1.3.1).
