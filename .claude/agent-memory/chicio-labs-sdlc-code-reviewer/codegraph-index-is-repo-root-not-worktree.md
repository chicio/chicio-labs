---
name: codegraph-index-is-repo-root-not-worktree
description: When reviewing inside .claude/worktrees/*, codegraph_explore returns the MAIN checkout's source (the .codegraph index lives at the repo root) — it will silently show pre-change code for diffed files
metadata:
  type: feedback
---

Rule: while reviewing an SDLC pipeline branch from an isolated worktree under
`.claude/worktrees/<name>/`, do **not** trust `codegraph_explore` for any file the diff touches.
Use `git diff origin/main...HEAD` plus `Read` on the worktree's absolute paths instead.

**Why:** the `.codegraph/` index sits at the repo root (`/Users/fduroni/Code/Fabrizio/chicio-labs/`),
so explore resolves against the main working copy even when the tool is invoked with the worktree as
cwd. It presents that output as "the verbatim, current on-disk source", which reads as authoritative.
Observed: explore returned the pre-change `dropdown-menu.tsx` (still containing `DropdownMenuEntry`
and `role="menu"`) while the worktree file had already deleted them — enough to produce a completely
wrong review.

**How to apply:** codegraph is still fine for **blast radius** on files the diff does *not* modify
(who calls this, what depends on it — that graph is branch-independent for untouched code). For the
diffed files themselves, always Read the worktree path. Cross-check with `git diff --stat` first so
you know which files are in the "don't trust explore" set.
