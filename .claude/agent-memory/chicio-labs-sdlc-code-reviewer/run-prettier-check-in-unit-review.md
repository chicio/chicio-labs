---
name: run-prettier-check-in-unit-review
description: Unit Checks skip CI's `format` job (`prettier --check .`, which gates build), so hand-typed `const f =(x)` or over-long test strings ship format-red; run `npx prettier --check <diff files>` yourself
metadata:
  type: feedback
---

Rule: in every Unit Review, run `npx prettier --check` over the files the diff touches (read-only, no port, safe while
other Unit Reviews run). A `[warn]` on a file the unit owns is a blocking finding: CI's `format` job runs
`npm run format:check` and `build` lists it under `needs`, so the whole pipeline stops there.

**Why:** the implementer's Unit Checks are lint, validate-architecture, typecheck and test:run. None of them is
Prettier. Workspaces with no ESLint config (the Labs Hub) catch nothing at all, so typos like `const cleanMessage =(text)`
and 130-column string literals in tests land unformatted.

**How to apply:** compare against the base with
`git show <base>:<file> | npx prettier --stdin-filepath <file> --check` so you only blame the diff for regressions it
made. Prettier gives `.astro` files "No parser could be inferred" (the root `.prettierrc` has no astro plugin), and
`prettier --check .` skips them silently. A long line in an `.astro` file is therefore only a code-style nit, never a
red gate. Pass directories (`npx prettier --check apps/labs-hub README.md`), not a `git diff --name-only | xargs`
list: an explicit `.astro` argument errors instead of being skipped, and the worktree sandbox refuses a git command
inside a pipeline anyway. Related: [[run-knip-in-unit-review]].
