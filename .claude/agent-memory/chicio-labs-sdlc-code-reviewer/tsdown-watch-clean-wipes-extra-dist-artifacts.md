---
name: tsdown-watch-clean-wipes-extra-dist-artifacts
description: a package whose build is `tsdown && <script writing into dist/>` but whose dev is plain `tsdown --watch` loses the script's output on `npm run dev` — clean:true runs at watch start
metadata:
  type: feedback
---

When a workspace's `build` is `tsdown && <post-step>` and the post-step writes into tsdown's `outDir` (e.g. a media
gather into `dist/media/`), check its `dev` script. `tsdown --watch` with `clean: true` (the default, and every
tsdown.config.ts here sets it) calls `cleanOutDir` at watch start, which empties `dist/` (tinyglobby expands the dir
to `dist/**`) and the watch rebuild never re-runs the post-step. Root `npm run dev` is `turbo run dev` over every
workspace, so the package's `#dev` starts concurrently with (even before) its own `#build` and the consumers' dev
servers: the extra artifacts vanish nondeterministically.

**Why:** caught in the labs-catalog Unit Review (2026-10-04): `dist/media` card images exported as `./media/*`
disappeared under `npm run dev`. No gate catches it: build, tests and CI never run `dev`.

**How to apply:** prove it port-free in a scratchpad (package.json + src/index.ts + the package's tsdown.config.ts,
symlinked node_modules, pre-seed `dist/media/x`, run `./node_modules/.bin/tsdown --watch` until `dist/index.mjs`
appears, kill it, `ls dist`). Direction: drop the `dev` script, or move the post-step into a tsdown hook so build and
watch emit the same `dist/`. To verify a "dropped the dev script" fix port-free, run `npx turbo run dev --dry=json` and
check the package's `#dev` command is `<NONEXISTENT>` (matrix-rain-webgpu is the precedent), and that the root `build`
outputs include `dist/**` so a cache hit restores the post-step's files.
