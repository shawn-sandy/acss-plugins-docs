# Add `memory: project` to docs-sync-reviewer for layout caching

## Context

The companion optimization plan (`docs/plans/optimize-docs-sync-reviewer-subagent.md`, included in this PR) listed three out-of-scope follow-ups. The user has now selected the first one:

> Add `memory: project` to the agent to cache discovered upstream plugin layout across runs.

Today the agent runs two `find` commands against the freshly cloned upstream on **every** invocation to determine whether plugin sources live under `plugins/<plugin>/...` or `<plugin>/...` at the root. The layout is stable across runs — it only changes when the upstream maintainer reorganizes the plugins repo. Re-running discovery every time burns latency and tokens for a result that almost never differs.

`memory: project` is the native sub-agent mechanism for this. The cache file lives at `.claude/agent-memory/docs-sync-reviewer/MEMORY.md`, is committed to version control (so every collaborator and CI run shares the same cached layout), and the first 200 lines / 25 KB are auto-injected into the agent's prompt at spawn — making the read free.

Intended outcome: the agent skips the `find` discovery on subsequent runs when the cached paths still resolve, and falls back to full discovery when they don't. No behavior change in the failure or drift paths — only a faster happy path.

## Recommended approach

Add `memory: project` to the agent's frontmatter, define a small MEMORY.md schema, seed it from a one-time discovery against current upstream HEAD, and add a short "Use cache before re-discovering" preamble to the existing **Doc-to-source mapping** section. The existing total-failure / partial-failure handling already covers the "cache points at paths that no longer exist" case — we just route through it on cache miss.

### Critical files

- `.claude/agents/docs-sync-reviewer.md` — **edited**: add `memory: project` to frontmatter; replace the discovery paragraph with a cache-first flow that falls through to the existing `find` block on miss.
- `.claude/agent-memory/docs-sync-reviewer/MEMORY.md` — **new**: seeded cache file, committed.
- `.gitignore` — **read-only check**: confirm no rule excludes `.claude/agent-memory/` (project-scoped memory must be committed). If a rule exists, narrow it.
- `MAINTAINING.md` — **edited**: add a `### Upstream layout cache` subsection under the existing docs-sync section explaining where the cache lives, when it gets updated, and how to invalidate it manually.

## Steps

1. **Run a one-time upstream discovery to capture seed values.**
   - Clone the upstream repo to a tempdir and run the two `find` commands from the agent's existing discovery block.
   - Record: each plugin root path (relative to the clone root, e.g. `plugins/acss-kit`), and the upstream HEAD short SHA.
   - Why: seeding from a real discovery guarantees the initial cache matches reality. The user explicitly chose seed-now over let-agent-populate.

2. **Confirm `.claude/agent-memory/` is not gitignored.**
   - `git check-ignore .claude/agent-memory/docs-sync-reviewer/MEMORY.md` should print nothing.
   - If it is ignored, add a narrower negation rule (`!.claude/agent-memory/`) — do not broaden by removing existing ignore patterns.
   - Why: project-scoped memory is committed by design; an inherited ignore would silently turn it into local-only memory and defeat the cross-collaborator sharing benefit.

3. **Create `.claude/agent-memory/docs-sync-reviewer/MEMORY.md` with this schema.**

   ```markdown
   ---
   name: docs-sync-reviewer cache
   description: Cached upstream agentic-acss-plugins layout. Agent uses this to skip the find-based discovery pass when cached paths still resolve in a fresh clone.
   ---

   # Upstream layout cache

   - **verified-at-sha:** `<short-sha>`
   - **verified-at:** `<ISO-8601 UTC>`

   ## Plugin roots

   | Plugin         | Path under upstream clone root |
   | -------------- | ------------------------------ |
   | acss-kit       | `plugins/acss-kit`             |
   | acss-utilities | `plugins/acss-utilities`       |

   ## Invalidation

   - The agent overwrites this file after a successful full-discovery run whose result differs from the cache.
   - To force a re-discovery, delete this file and commit.
   - This file is data, not prose — keep it short. Sub-agent runtime injects only the first 200 lines / 25 KB.
   ```

   - Why: a table is easy for both humans and the agent to parse. The invalidation block tells future maintainers how to flush the cache without reading the agent prompt.

4. **Add `memory: project` to the agent frontmatter.**
   - Insert between `model:` and `skills:` so it groups with other runtime configuration.
   - Resulting frontmatter:
     ```yaml
     ---
     name: docs-sync-reviewer
     description: When the user asks to sync, audit, or check for drift between this docs site and the upstream `agentic-acss-plugins` plugin source.
     tools: Bash, Read, Edit, Write, Glob, Grep, mcp__github__create_pull_request, mcp__github__list_pull_requests, mcp__github__update_pull_request, mcp__github__add_issue_comment, mcp__github__get_file_contents, mcp__github__list_commits
     model: sonnet
     memory: project
     skills: [build-check]
     ---
     ```
   - Why: this is the single config flag that wires up auto-injection, the per-agent memory directory, and Read/Write/Edit auto-permission for that directory.

5. **Replace the discovery paragraph in `.claude/agents/docs-sync-reviewer.md` (currently lines 23–28) with a cache-first flow.**
   - Replace the bold sentence and `find` block with the following (the existing `find` block stays — it's reused on cache miss):

     ````markdown
     **Discover the upstream layout — cache first, then fall back to find.** The plugins repo may organize sources under `plugins/<plugin>/...` or `<plugin>/...` at the root. Your auto-injected `MEMORY.md` lists the last verified plugin roots. On each run:

     1. For every plugin root recorded in `MEMORY.md`, test that `"$tmpdir/upstream/<path>"` exists. If all paths resolve, use the cached layout and skip the `find` pass.
     2. If any cached path is missing — or `MEMORY.md` is empty/unseeded — run the full discovery against the cloned upstream:

        ```bash
        find "$tmpdir/upstream" -maxdepth 4 -type d \( -name commands -o -name skills -o -name scripts \) | sort
        find "$tmpdir/upstream" -maxdepth 3 -type f \( -name 'plugin.json' -o -name 'plugin.yml' -o -name 'README.md' \) | sort
        ```
     ````

     3. After a successful discovery whose result differs from the cache (or whose cache was empty), overwrite `.claude/agent-memory/docs-sync-reviewer/MEMORY.md` with the new plugin-root table and the upstream HEAD short SHA. Stage this file alongside any drift-PR commit; if no drift PR is opened on this run, the no-drift state-only commit will pick it up via the worktree's `git add -A` (see Step 6).

   - Why: keeps the existing failure semantics (cache miss → full discovery → existing total/partial-failure handling already covers the "still nothing" case). The "stage alongside drift-PR commit" rule keeps cache updates atomic with the runs that observed them; the no-drift fallback explicitly copies `MEMORY.md` into the orphan-branch worktree before committing so updates are never silently dropped.

6. **Update the Hard rules to mention the cache file alongside the sync state file.**
   - Add a bullet near the existing "no-drift run persists state" rule:
     > - The upstream layout cache at `.claude/agent-memory/docs-sync-reviewer/MEMORY.md` is updated only when discovery results actually change. On no-drift runs that also re-verified the cache, include the cache update in the same state-only commit pushed to `docs-sync-state` (it gets included via `git add -A` on that branch worktree's working tree).
   - Why: keeps the cache-update path consistent with the sync-state-update path and avoids leaving uncommitted cache changes in the working tree.

7. **Add an `### Upstream layout cache` subsection to `MAINTAINING.md`.**
   - Place under the existing docs-sync section, after `### Sync state files`.
   - Content: location of the cache file, what triggers an update (cache miss + successful discovery), how to manually invalidate (delete the file), and a note that the cache is a property of the upstream repo layout, not the local machine — which is why it's committed.
   - Why: one of the lessons from the prior plan-interview was that operational guidance lives in `MAINTAINING.md`, not the agent prompt. New users finding `.claude/agent-memory/` should be able to learn what it is from the maintainer doc, not from reading the agent's runtime prompt.

8. **Walk through every operational scenario end-to-end and confirm semantics are unchanged.**
   - First run on a fresh clone with seeded cache → cache hit, skip find, proceed normally.
   - First run after a fresh checkout with no `.claude/agent-memory/` → cache empty, full discovery, write cache, proceed normally.
   - Run after upstream maintainer renames `plugins/acss-kit` → `acss-kit` → cache miss on path verify, full discovery rewrites cache, proceed normally.
   - Run after upstream maintainer deletes a plugin entirely → cache partial-miss, full discovery returns reduced set, falls through to existing **partial failure** branch (Discovery Issues section in PR).
   - Run after upstream maintainer deletes both plugins → cache total-miss, full discovery returns nothing, falls through to existing **total failure** branch (notification PR via `claude/docs-sync-discovery-*` prefix).
   - Why: this is a refactor, not a new feature — the only observable change should be "the find commands didn't run" on the happy path.

## Verification

- **Static checks:**
  - `npm run build` — markdown changes don't get validated by the build, but confirms unrelated edits weren't introduced.
  - Read `.claude/agents/docs-sync-reviewer.md` and confirm: `memory: project` in frontmatter; the discovery section now opens with a cache-first flow; the `find` block is preserved as the fallback.
  - Read `.claude/agent-memory/docs-sync-reviewer/MEMORY.md` and confirm it parses as valid YAML frontmatter + Markdown body, with seeded plugin roots matching what `find` actually returns against current upstream HEAD.
  - Confirm `git status` shows `.claude/agent-memory/docs-sync-reviewer/MEMORY.md` as a tracked new file (not ignored).

- **Behavioral check (dry-run):**
  - Invoke the agent in plan mode: `claude` → "Use the docs-sync-reviewer subagent to audit drift since the last sync, but do not push or open a PR."
  - Confirm the agent's plan reports "cache hit — skipping discovery" or equivalent and does not narrate the `find` commands.
  - Then manually `mv .claude/agent-memory/docs-sync-reviewer/MEMORY.md /tmp/cache-backup.md`, re-invoke the agent in plan mode, and confirm the agent now plans to run the full discovery and write a fresh cache. Restore the file when done: `mv /tmp/cache-backup.md .claude/agent-memory/docs-sync-reviewer/MEMORY.md`.

- **Diff review:**
  - `git diff main -- .claude/agents/docs-sync-reviewer.md .claude/agent-memory/docs-sync-reviewer/MEMORY.md MAINTAINING.md` and confirm: agent edits are scoped to frontmatter + the discovery paragraph + one Hard-rules bullet; MEMORY.md is a clean new file; MAINTAINING.md adds only the `### Upstream layout cache` subsection.

- **Rollback:** if the dry-run reveals broken cache logic, revert with `git checkout -- .claude/agents/docs-sync-reviewer.md MAINTAINING.md && rm -rf .claude/agent-memory/` and re-examine before re-attempting.

## Next Steps

Out of scope for this plan, but listed for continuity with the prior plan's Recommended next steps:

- Wire a scheduled invocation (GitHub Actions cron + headless SDK) once the agent is leaner — the cache makes scheduled runs cheaper, which strengthens the case for cron.
- Consider a `--from-upstream` mode for `docs-add` that copies upstream front-matter automatically.

## Unresolved Questions

None — the two open decisions (memory scope, seed-vs-populate) were resolved during planning:

| Decision      | Choice                               |
| ------------- | ------------------------------------ |
| Memory scope  | `project` (committed, shared)        |
| Cache seeding | Seed now from one-time discovery run |
