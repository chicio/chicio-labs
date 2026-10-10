---
name: feature_labs_catalog
description: packages/labs-catalog (private) holds public facts of Lab/Standalone Projects; Brand Kit convention; cross-WU gotchas (hub completeness, Storybook favicon, sandbox heredocs)
metadata:
  type: project
---

`packages/labs-catalog` (private, tsdown + `tsx scripts/build-media.ts`) exports `labProjects`, `standaloneProjects`, `cardImagePath`; build validates then copies card images to gitignored `dist/media/<id>.<ext>` (ADR-0008).

- Lab Project `cardImage` is relative to `<sourcePath>/brand/`; Standalone's to `packages/labs-catalog/media/standalone/`.
- **Why a 12th Lab Project "labs-catalog" was added**: the hub's `completeness.ts` fails (`content.test.ts` + `completeness.test.ts`) for any workspace without a Lab Project, so adding the package forces a registry entry in `apps/labs-hub` (WU2 owns it).
- Turbo has no named inputs: brand globs repeat per task in `packages/labs-catalog/turbo.json`; no way to dedupe the hub's triple list either.
- Storybook favicon: only `favicon.svg|ico` in a staticDir are auto-detected, so a png needs `staticDirs: [{from: brand, to: "/brand"}]` + `.storybook/manager-head.html` `<link rel="icon">`.
- Storybook build needs `npx turbo run build --filter=matrix-design-system-showcase` (deps like matrix-rain-webgpu must be built first).
- Sandbox in pipeline worktrees rejects heredocs and compound shell with git in them: use the Write tool and separate Bash calls.

**How to apply:** when touching catalog/hub/website wiring, remember the registry must stay in step with the catalog.
