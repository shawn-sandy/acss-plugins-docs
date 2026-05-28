---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `9a1da00`
- **verified-at:** `2026-05-28T00:00:00Z`

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

- `acss-utilities` plugin was fully removed from upstream in acss-kit v1.1.0 (2026-05-21). The `plugins/acss-utilities/` directory no longer exists upstream. The docs section at `src/content/docs/acss-utilities/` is preserved as a historical reference.
- `style-agent` is present upstream and has a corresponding docs section in this repo at `src/content/docs/style-agent/`.
