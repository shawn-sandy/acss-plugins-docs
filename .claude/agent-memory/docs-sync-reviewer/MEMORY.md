---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `68faf6d`
- **verified-at:** `2026-05-14T10:13:59Z`

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

- `style-agent` is present upstream and has a corresponding docs section in this repo (`src/content/docs/style-agent/`). Per CLAUDE.md, all discovered plugins get docs.
