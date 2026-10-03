---
name: gate-typecheck-red-quoting-absent-type
description: a gate-runner website#typecheck red whose error text quotes a type that git grep cannot find at HEAD is stale incremental state, not a defect; prove it with tsc --noEmit --incremental false
metadata:
  type: feedback
---

Before restating a gate-runner typecheck red as a code defect, check that the **type text the error quotes** still
exists at HEAD (`git grep` the `Omit<...>` / prop list it prints). If it does not, the gate checked stale state.

**Why:** in the Labs Hub Integration Review the gate reported three TS2739/TS2741 errors quoting
`Omit<MenuProps, "currentPath" | "linkComponent" | "pinnedOnPaths">`, the pre-merge Binding type. HEAD had been at the
final merge for 24s when the gate started; the gate's own test run a minute later executed the merged tests. Yet
`tsc --noEmit --incremental false` in apps/website exited 0 at HEAD, and re-running the gate's exact
`turbo run typecheck` was green. apps/website/tsconfig.json sets `incremental: true`, and the gate removes `.next` and
`next-env.d.ts` but keeps `tsconfig.tsbuildinfo`. The erroring files were exactly the unchanged consumers that reach a
changed Binding through an unchanged barrel `index.ts`; the one consumer the diff edited was not reported. Two minimal
TS 7.0.2 reproductions (direct import, barrel import) did NOT reproduce, so the root cause is unconfirmed: don't
claim "TS 7 incremental bug" as fact.

**How to apply:** run `npx tsc --noEmit --incremental false` (plus `-p tsconfig.sw.json`) in apps/website. It is
read-only and ignores the build info. If that is green, still restate the red as blocking (the contract requires it),
but make the direction "no source change; re-run from clean incremental state", so the fix round does not "fix" correct
Bindings. Outcome on the Labs Hub: the fix round deleted `apps/website/tsconfig*.tsbuildinfo`, committed nothing,
and the round-2 gate came back GREEN at the same HEAD, so withdraw once the gate is green and your own
`--incremental false` run agrees. The gate's green alone is not a from-scratch proof: its turbo typecheck can be a
cache replay. A different turbo hash between the gate's run and yours can come from untracked
`apps/website/AGENTS.md`/`CLAUDE.md` that a later `next dev`/`build` wrote, so it says nothing by itself. Related:
[[breaking-ds-unit-typecheck-red-downstream]], [[tsc-file-arg-tsconfig-ts5112-false-green]].
