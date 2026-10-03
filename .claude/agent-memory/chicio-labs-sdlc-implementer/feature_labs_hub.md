---
name: feature-labs-hub
description: apps/labs-hub (Astro 7 Labs Hub) build gotchas, registry/docs pipeline shape, deploy and turbo-inputs wiring (2026-10-03)
metadata:
  type: project
---

The Labs Hub is `apps/labs-hub`: Astro 7 static, Menu/BrandHeader as `client:load` islands, everything else static SSR of
`matrix-design-system` components. Pages are generated from repo documents by `src/lib/` (registry -> completeness ->
content loader -> unified markdown pipeline -> link rewriting).

**Gotchas (each one cost a build):**
- Astro 7 needs `"cookie": "2.0.1"` as a direct dependency, exactly as the rain showcase pins it. Without it the build dies with
  `Named export 'parseCookie' not found` because the hoisted `cookie` is a CJS 0.x.
- The Fonts API hashes the family name (`"Open Sans-7ddc..."`), so the design system's `--font-sans: "Open Sans"` matches
  nothing. `global.css` re-points `--font-sans`/`--font-mono` at the generated `--font-open-sans`/`--font-courier-prime`.
  The plan's "family names must be exactly these" is not enough on its own.
- Never locate the repo with `import.meta.url` in `src/lib`: Astro bundles it. `findRepoRoot()` walks up from `process.cwd()`
  to the package.json with `workspaces`.
- `trailingSlash: "always"`; an endpoint `docs-media/[...path].ts` serves the images the docs embed (no copying into public/).
- Old changelog entries carry `///compare/...` links; `rewriteLink` maps `///x` to the GitHub repo.
- Hub tasks read files outside the workspace, so `apps/labs-hub/turbo.json` lists them as `$TURBO_ROOT$` inputs for build AND
  test:run/test:coverage (the integration tests would otherwise be cache hits after a new workspace or plugin appears).
- The Website's version is read from the root package.json (`versionManifest`), not apps/website/package.json (stale 4.0.0).
- A worktree-isolated session's Bash refuses compound `git ...` commands and heredoc redirections chained with `&&`; use
  Write/Edit for files and one plain git command per call.

**Why:** all of this is invisible from the code once written; a future change to the hub or to Astro will hit them again.
**How to apply:** when adding a Lab Project, add it to `src/lib/registry.ts` (the build throws on gaps); when adding a
document source outside the workspace, add it to the turbo inputs and to `pages.yml` `paths:`.
