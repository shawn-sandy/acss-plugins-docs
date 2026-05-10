---
name: docs-sync-reviewer cache
description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
---

# Upstream layout cache

- **verified-at-sha:** `ead1d1b`
- **verified-at:** `2026-05-10T11:50:35Z`

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

- `style-agent` is present upstream but has no corresponding docs section in this repo. The agent's "new plugin" rule (in the Doc-to-source mapping table) flags this for human decision — caching its path here only avoids re-running `find`, it does not auto-create docs.
