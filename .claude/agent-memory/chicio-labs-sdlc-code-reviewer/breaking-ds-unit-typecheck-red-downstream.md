---
name: breaking-ds-unit-typecheck-red-downstream
description: a breaking design-system Work Unit reports "typecheck: fail" because website#typecheck breaks on the old API; if the plan scopes Unit Checks to the package, prove the package tsc is green yourself and treat the website red as expected, not blocking
metadata:
  type: feedback
---

When a Work Unit makes design-system props required (2.0.0 injected Menu/Footer, 3.0.0 Host Identity), the Website's
Bindings stop compiling until the downstream Website Work Unit lands. An implementer who runs the root `npm run
typecheck` then reports `typecheck: fail`, with TS2739/TS2741/TS2322 only in `apps/website` files the unit does not own.

The "any red check is blocking" rule does not apply blindly here: the Approved Plan usually says the unit's Unit Checks
are scoped to the package (`--workspace=matrix-design-system`) and that the Website breaking is expected.

**Why:** blocking on it would demand edits outside the unit's file ownership, which the next Wave already owns; the
loop could never converge.

**How to apply:** (1) confirm the plan scopes the checks and expects the downstream break; (2) run `npx tsc --noEmit`
in `packages/matrix-design-system` yourself (read-only, safe in parallel) and confirm exit 0; (3) check the reported
errors sit only in files a later Work Unit owns; (4) record it as a non-blocking note. At Integration Review the same
red is blocking: by then the Website unit must have migrated every call site.

It also hits a **sibling** unit in the same Wave as the Website fix (Labs Hub WU3 beside Website WU2, 2026-10-03): it
branches off the feature branch with the breaking unit merged but not the fixer, so its root `typecheck`/`test:run`
inherit the same red (TS2741 `showPaletteTrigger`, template tests). Same triage: prove the sibling's own workspace
(`tsc --noEmit`, `vitest run` in its folder) green, confirm its diff touches no `apps/website` file, note it
non-blocking. Related:
[[run-knip-in-unit-review]], [[prior-round-findings-in-workflow-journal]].
