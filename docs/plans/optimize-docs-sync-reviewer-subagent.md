# Optimize the `docs-sync-reviewer` subagent

## Context

`.claude/agents/docs-sync-reviewer.md` is the only project subagent in this repo. It is 240 lines — roughly 4–6× longer than the example subagents in the official Claude Code documentation (typically 30–60 lines). Every spawn re-loads the full system prompt into the agent's context, so length has direct cost in latency, tokens, and reasoning load.

A review against [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) and a survey of the surrounding repo found four concrete opportunities:

1. The agent inlines logic that already exists as project skills (`build-check`, `docs-add`).
2. It narrates pre-approved git commands instead of trusting the permission allowlist already in `.claude/settings.local.json`.
3. Long failure-handling and state-update procedures duplicate the same dedup-by-branch-prefix and update-state-file pattern in three places.
4. The frontmatter does not use `skills:`, the newer field that preloads skills into a subagent — the right native mechanism for delegating to `build-check`. (`docs-add` carries `disable-model-invocation: true` and cannot be preloaded; it must be invoked via the Skill tool at runtime.)

The intended outcome is a tighter, more idiomatic agent file (~120–140 lines, roughly half the current length) that delegates implementation detail to skills, keeps only the agent-specific orchestration logic, and matches the structural conventions in the official docs' example subagents.

This is a documentation/configuration change. No runtime behavior of the doc-sync workflow itself should change — same inputs, same PR output, same sync-state files.

## Recommended approach

Edit `.claude/agents/docs-sync-reviewer.md` in place. Restructure to mirror the doc's recommended subagent shape (focused description → tight workflow → hard rules), and lean on the two existing skills via the `skills:` frontmatter field.

### Critical files

- `.claude/agents/docs-sync-reviewer.md` — **edited**: frontmatter, description, workflow, hard rules.
- `MAINTAINING.md` — **edited**: receives `### Invocation cadence` subsection (step 7) and sync-state schema JSON example + rationale (step 5).
- `.claude/skills/build-check/SKILL.md` — referenced via `skills:`; no edits.
- `.claude/skills/docs-add/SKILL.md` — invoked via Skill tool at runtime; no edits.
- `.claude/settings.local.json` — already grants the git/gh permissions the agent needs; no edits.

## Steps

1. **Add `skills:` frontmatter and keep the existing tools list.**
   - Add `skills: [build-check]` only. `docs-add` has `disable-model-invocation: true` and per the official sub-agents docs cannot be preloaded — Claude Code skips it with a debug-log warning. The agent will instead invoke `docs-add` explicitly via the Skill tool when it needs to create a new MDX page.
   - Keep the existing `tools:` allowlist; it is already correctly scoped, and it already permits `Skill` (inherited) so the runtime invocation works.
   - Why: preloading gives the agent build-verify domain knowledge on startup; `docs-add` is invoked only on the "new page" code path, so a runtime call has no real cost and avoids the silent-skip pitfall.

2. **Replace the inline build-verify procedure (current step 7, lines 157–175) with a Skill call.**
   - The current 19-line procedure (run build → parse log → classify error → one-pass auto-fix → re-run → notification PR on second failure) duplicates `build-check/SKILL.md`.
   - Replace with: "Invoke the `build-check` skill. If it reports a failure that survives one fix pass, abort and open a notification PR (see Hard rules)."
   - Keep the agent-specific bits that `build-check` doesn't cover: the dedup-by-branch-prefix rule for `claude/docs-sync-build-failure-*` PRs, and the "never push a failing build" hard rule.

3. **Replace the inline new-page creation guidance (in the Doc-to-source mapping section) with a Skill tool call.**
   - Where the agent currently says "create one and add a sidebar entry in `astro.config.mjs`," replace with: "Invoke the `docs-add` skill with the appropriate `<section>` and `<slug>` derived from the upstream source path."
   - `docs-add` has `disable-model-invocation: true` so it cannot be preloaded — but it can be invoked explicitly at runtime via the Skill tool, which is the right call since new-page creation is a conditional code path, not a startup need.
   - This removes the need for the agent's prompt to remember Starlight front-matter, sidebar group placement, and base-path rules — `docs-add` already encodes them.

4. **Factor the duplicated "dedup notification PRs by branch prefix" rule into one named rule.**
   - The pattern appears in: discovery-failure handling (line 46), build-failure handling (line 174), and is implicitly the inverse of the drift-PR check (line 180). Replace with a single subsection ("**Notification-PR dedup rule**") and reference it by name from each failure path.
   - Why: three duplicated paragraphs are a maintenance hazard — a fix to the regex in one location can drift from the others.

5. **Split the sync-state schema section: keep decision rules in the prompt, move JSON example and rationale to `MAINTAINING.md`.**
   - Keep in the agent prompt (~10 lines): the 5 decision rules (which SHA to use per plugin, when to update top-level vs per-plugin, the "never lead reality" rule, and the ISO-8601 UTC format requirement). These are consulted at every run.
   - Move to `MAINTAINING.md` (~14 lines): the JSON example block and the prose rationale explaining why the dual-location scheme exists. Link from the agent prompt: "See `MAINTAINING.md § Sync state schema` for the JSON structure."
   - Why: the decision rules change the agent's behavior if omitted; the JSON example and rationale do not. Moving only the non-decision reference material avoids any risk of behavior drift.

6. **Remove the duplicated `REPO_DIR` resolution prose; leave the bash blocks in place.**
   - The agent repeats the `REPO_DIR` explanation and the `git fetch origin main docs-sync-state` setup pattern in three separate steps. Remove the repeated prose and comments; keep each bash block where it lives so control flow is unchanged.
   - Do NOT restructure the three blocks into a single "Setup" preamble — this reorders the agent's conceptual workflow and risks behavior drift with no additional token savings over targeted prose removal.
   - Why: the goal is eliminating duplicated _explanation_, not restructuring control flow. The official example agents are short because they describe decisions concisely, not because they collapse their setup logic.

7. **Tighten the `description` frontmatter field and preserve cadence guidance in `MAINTAINING.md`.**
   - The "invoke daily, on merges to main of the plugins repo, or on demand" text in the current description is the only written record of the invocation cadence — it must not be silently dropped.
   - Before editing the agent file: add a `### Invocation cadence` subsection to `MAINTAINING.md` that preserves this guidance. Then update the agent's `description` to: "When the user asks to sync, audit, or check for drift between this docs site and the upstream `agentic-acss-plugins` plugin source."
   - Why: the docs say "Claude uses the description to decide when to delegate." Scheduling/cadence intent belongs in `MAINTAINING.md`. Moving it there (not deleting it) is the no-information-loss approach.

8. **Verify no behavior changes by reading through the rewritten file end-to-end.**
   - Walk through the same scenarios the original agent handles: first run (no state), partial discovery, total discovery failure, drift run, no-drift run, build-failure run.
   - For each scenario, confirm the rewritten agent still reaches the same final state (correct PR or notification PR, correct sync-state branch update, correct dedup behavior).
   - Why: this is a refactor — same observable behavior, smaller prompt.

## Verification

- **Static checks**:
  - `npm run build` (the agent file is markdown; the build won't validate it, but confirms unrelated edits weren't introduced).
  - Open `.claude/agents/docs-sync-reviewer.md` and confirm: it has `skills: [build-check]` in the frontmatter; the body is under ~140 lines; every reference to "run npm run build" delegates to `build-check`; every reference to "create a new MDX page" invokes `docs-add` via the Skill tool.
- **Behavioral check (dry-run, read-only)**:
  - Invoke the agent in plan mode against the current upstream HEAD: `claude` → "Use the docs-sync-reviewer subagent to audit drift since the last sync, but do not push or open a PR."
  - Confirm the agent still: (a) discovers plugin roots, (b) merges state from both refs, (c) classifies changes, (d) proposes the same MDX edits the previous version would have, (e) plans to invoke `build-check` and `docs-add` rather than narrating their steps.
- **Spot-check failure paths**:
  - Manually break an MDX file (e.g. add an unclosed JSX tag), run the agent, and confirm it routes to `build-check` and proposes a fix pass before falling back to a notification PR. Revert the MDX file when done.
- **Diff review**: `git diff main -- .claude/agents/docs-sync-reviewer.md MAINTAINING.md` and confirm: agent changes are purely structural; `MAINTAINING.md` additions are limited to the invocation-cadence subsection and the schema JSON block.
- **Rollback**: if the dry-run audit diverges from expected output, revert with `git checkout -- .claude/agents/docs-sync-reviewer.md MAINTAINING.md` and re-examine step by step before re-attempting.

## Next Steps

Out of scope for this plan, but worth noting:

- Adding `memory: project` to the agent so it can cache the discovered upstream plugin layout across runs (avoiding a `find` pass on every invocation).
- Wiring a scheduled invocation (GitHub Actions cron + the headless SDK) once the agent is leaner — currently it is invoked manually only.
- Auditing whether `docs-add` should grow a `--from-upstream` mode that copies upstream front-matter and body, which would let the agent delegate even more of the new-page creation flow.

## Decisions Recorded

The following questions were resolved during the stress-test interview:

| Decision                          | Choice                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| Skill preload                     | Preload `build-check` only; invoke `docs-add` via Skill tool at runtime                      |
| Sync-state schema split           | Keep decision rules in prompt (~10 lines); move JSON example + rationale to `MAINTAINING.md` |
| Cadence guidance in `description` | Move to `MAINTAINING.md § Invocation cadence` before removing from `description`             |
| Step 6 scope                      | Narrow to prose-only deduplication — do not restructure bash blocks                          |

## Interview Summary

> Recorded from `/plan-interview` stress-test — 2026-05-10.

### Key Decisions Confirmed

| Decision         | Choice                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| Skill preload    | `build-check` only — `docs-add` has `disable-model-invocation: true`; invoke via Skill tool at runtime            |
| Schema split     | Keep ~10-line decision rules in agent prompt; move JSON example + rationale to `MAINTAINING.md`                   |
| Cadence guidance | Move "invoke daily / on merges" to `MAINTAINING.md § Invocation cadence` before removing from agent `description` |
| Plan filename    | Renamed from auto-generated name to `optimize-docs-sync-reviewer-subagent.md`                                     |

### Open Risks Surfaced

1. `MAINTAINING.md` is edited by steps 5 and 7 — was missing from Critical files (now fixed).
2. Critical files had absolute paths — corrected to project-relative.
3. Dry-run verification assumes network access to clone upstream; failure mode is silent "no drift" rather than an error.
4. No rollback instruction existed — added to Verification.
5. Step 6 "Setup preamble" restructure was higher risk than framed — narrowed to prose-only deduplication.

### Simplification Opportunity Applied

Step 6 scope reduced: remove repeated `REPO_DIR` prose only; leave bash blocks in their original positions to avoid control-flow restructuring risk.

### Recommended Next Steps (out of scope)

- Add `memory: project` to the agent to cache discovered upstream plugin layout across runs.
- Wire a scheduled invocation (GitHub Actions cron + headless SDK) once the agent is leaner.
- Consider a `--from-upstream` mode for `docs-add` to copy upstream front-matter automatically.
