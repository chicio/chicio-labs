---
name: next-build-injects-claude-md-block
description: next dev/build writes the nextjs-agent-rules block; today it leaves UNTRACKED apps/website/AGENTS.md + apps/website/CLAUDE.md (root has no AGENTS.md since ADR-0006) — a tool artifact, never the implementer's diff
metadata:
  type: project
---

`next dev` and `next build` upsert a `<!-- BEGIN:nextjs-agent-rules -->` / `<!-- END:nextjs-agent-rules -->` block,
written by `node_modules/next/dist/server/lib/generate-agent-files.js`. Where it lands has moved twice:

- Up to 2026-09: root `AGENTS.md` (CLAUDE.md was `@AGENTS.md`), so a build showed `M AGENTS.md`.
- Since the plugins PR (ADR-0006, CLAUDE.md is first-class, **no root AGENTS.md**): the block is committed at the end
  of root `CLAUDE.md`, and a dev server or build started from `apps/website` creates two **untracked** files:
  `apps/website/AGENTS.md` (just the block) and `apps/website/CLAUDE.md` (`@AGENTS.md`). Seen 2026-10-04 at Integration
  Review, created by the e2e-sentinel's `next dev` and the gate-runner's build; neither exists on origin/main and
  they are not gitignored.

**Why:** a reviewer, the gate-runner and the e2e-sentinel all run Next in the worktree. The untracked pair (or an
`M CLAUDE.md`) looks like the implementer smuggling doc edits into the branch; reporting it is a false finding. The
opposite trap: a `git add -A` before the PR sweeps them into the commit as real scope creep.

**How to apply:**
- Attribute by timing (`ls -la` mtimes vs the gate/sentinel run) and confirm `git diff origin/main...HEAD --stat --
  CLAUDE.md apps/website/AGENTS.md apps/website/CLAUDE.md` shows nothing from Next.
- Do not delete them yourself if you did not create them; mention them as non-blocking so the main thread leaves
  them out of the PR. If the *committed* diff contains them, that IS a scope finding.

Related: [[e2e-in-worktree-webserver]], [[e2e-reuse-existing-server-stale-app]].
