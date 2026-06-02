---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `9a1da00`
- **verified-at:** `2026-06-02T10:09:00Z`

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
- As of `9a1da00` (style-agent v0.4.0), `/inline-style-to-class` tokenizes all hard-coded values to CSS variables automatically.
- As of `9a1da00` (acss-kit v1.2.1), all 15 per-component skills set `disable-model-invocation: true` to stay out of auto-context.
