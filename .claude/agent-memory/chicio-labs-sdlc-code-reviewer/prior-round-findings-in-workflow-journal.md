---
name: prior-round-findings-in-workflow-journal
description: recover earlier verdicts from the workflow journal.jsonl — a re-review's missing blocking ids, and at Integration Review every Unit Review's "integration item" notes, which ship unapplied
metadata:
  type: reference
---

A Unit Review round-2 prompt can give only the implementer's one-line summary ("fix round 1") and Unit Checks, with no
list of the round-1 blocking ids. The loop rule is to judge each prior blocking finding first and keep its id, so
recover them before reviewing:

- Journal: `~/.claude/projects/<project-dir>/<session-id>/subagents/workflows/wf_*/journal.jsonl`. The project dir for a
  pipeline worktree is the worktree path with `/` and `.` turned into `-` (for example
  `-Users-fduroni-Code-Fabrizio-chicio-labs--claude-worktrees-<name>`). The session id is the scratchpad's parent dir.
- Each agent has an `agent-<id>.meta.json` whose `description` is the step label (`WU3:review-r1`, `WU3:fix-r1`).
- Journal lines `{"type":"result","agentId":…,"result":{…}}` carry the reviewer's `blocking` / `nonBlocking` and the
  implementer's `resolutions` (per id: outcome + note).
- The worktree sandbox refuses a shell `for` loop that feeds file names to `python3`. Two plain commands work:
  `grep -l 'WU3:review-r1' <wf-dir>/*.meta.json` gives the agent id, then
  `grep '<agentId>' <wf-dir>/journal.jsonl | grep '"type":"result"' | python3 -m json.tool --json-lines`.
- Several `review-r2` "started" lines with no result mean earlier attempts died. They are not prior verdicts.

**Integration Review use:** Unit Reviewers park cross-unit items as NON-blocking "[integration item]" / "[seam]" notes,
because the fix sits in a file the unit does not own. Nothing forces them to be applied, so they reach integration
untouched. Seen on the Manga PR (2026-09-29): all three plan amendments marked "Must hold at integration" (an MCP MDX
Prettier revert, a Death Note publisher string, and pure logic that belonged in `lib/`) were flagged in Unit Reviews
and none had been applied. At Integration round 1, dump every unit's `nonBlocking` list, and check each "Must hold"
line in the plan against the head.

**Gate-runner findings you never raised:** the workflow turns every red Full Check into its own blocking id,
`gate-runner:<check> <test title>`, even when your round-1 verdict was PASS and filed the red check as a non-blocking
flake. The implementer's fix step can only rebut it, so it comes back to you in the rebuttal list. Decide it against
the round-N gate verdict in the prompt: green on an unchanged tree (`commits: []` in the fix result) confirms the
flake, so withdraw it. Seen on the Labs Hub redesign Integration Review (2026-10-04).

**Why:** without this, a re-review either re-derives the old findings from commit messages (and guesses at the ids)
or misses one that was never fixed.

**How to apply:** at the start of any round >= 2 whose prompt lacks the old findings, and at every Integration Review.
Related: [[run-knip-in-unit-review]], [[e2e-chrome-assertion-on-a-404-url]], [[stale-local-main-diff-range]].
