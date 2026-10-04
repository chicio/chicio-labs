---
name: turbo-affected-head-flag-false-positive
description: probing the Vercel deploy-skip seam with `turbo query affected --head=<sha>` reports website affected for a claude-plugins-only commit; the probe is invalid, reason from the Package Graph instead
metadata:
  type: feedback
---

When a diff adds data the Website renders from outside its own workspace (e.g. Brand Kit images under
`claude-plugins/*/brand/`, which are not npm workspaces), the question is whether `apps/website/scripts/vercel-ignore-build.sh`
(`turbo query affected --base=<sha> --packages website --exit-code`) still redeploys the Website. **Do not test it with
`--head=<sha>`**: on 2026-10-04, `--base=7067e1a5~1 --head=7067e1a5` (a commit touching only
`claude-plugins/image-peek/CHANGELOG.md`) listed `website` as affected (`FileChanged`). That is the exact false positive
ADR-0004 warns about ("do not pass --head"), not evidence that the seam is covered.

**Why:** a reviewer can easily read that output as "the website redeploys on plugin changes" and wave a real gap through.

**How to apply:** reason from `node_modules/turbo/docs/reference/query.mdx`: with no `futureFlags.affectedUsingTaskInputs`
(check root `turbo.json`), affected follows the **Package Graph**, so task `inputs` globs (like labs-catalog's
`$TURBO_ROOT$/claude-plugins/*/brand/**`) do NOT make dependents affected. Per the docs, a change only outside `apps/*`
and `packages/*` maps to the root package `//` (inferred, not proven: a clean probe needs a checkout of that commit
with no `--head`, which a read-only reviewer cannot make). Then check whether the plan or ADR already accepts the
gap (ADR-0008 does: the weekly `scheduled-rebuild.yml` covers it). If it is accepted, it is not a finding.

Related: [[stale-local-main-diff-range]], [[verify-enforcement-claims-against-the-failing-ci-job]].
