---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `0f4023a`
- **verified-at:** `2026-05-24T10:10:00Z`

## Plugin roots

| Plugin         | Path under upstream clone root |
| -------------- | ------------------------------ |
| acss-kit       | `plugins/acss-kit`             |
| acss-utilities | `plugins/acss-utilities`       |
| style-agent    | `plugins/style-agent`          |

## Invalidation

- The agent overwrites this file after a successful full-discovery run whose result differs from the cache.
- To force a re-discovery, delete this file and commit.
- This file is data, not prose — keep it short. Sub-agent runtime injects only the first 200 lines / 25 KB into the agent's prompt.

## Notes

- `acss-utilities` plugin directory was **deleted upstream** as of commit `c6049e5` (merged ~2026-05-24). The docs section at `src/content/docs/acss-utilities/` is preserved for reference; flagged for human review.
- `style-agent` is present upstream and has a corresponding docs section in this repo at `src/content/docs/style-agent/`.
