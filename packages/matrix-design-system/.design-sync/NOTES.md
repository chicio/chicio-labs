# design-sync notes — matrix-design-system

Repo-specific gotchas for future syncs. Read this before re-running the converter.

## Shape: storybook, not package

The design system is a published npm package (`matrix-design-system`) with real `exports`, a real
`dist/`, and declarations emitted by tsdown. Everything the previous setup worked around is gone:

- **No synth-entry mode.** `--entry` points at the actual built entry. The old trick of passing a
  deliberately non-existent path to force `PKG_DIR` up to the repo root is no longer needed.
- **No Next shims.** The package imports nothing from `next` — a dependency-cruiser rule fails the
  build if that changes — so `tsconfig.sync.json` and its `paths` mapping are deleted.
- **No generated `.d.ts` tree.** tsdown ships `.d.mts` beside every module, so `tsconfig.dts.json`
  is deleted. Prop coverage went from 66/93 components to **37/37**.
- **No hand-authored previews.** `.design-sync/previews/` is deleted. Previews are generated from
  the Storybook stories in `packages/matrix-design-system/src/**/*.stories.tsx`, which is the single
  source of truth — the same files Storybook renders. Authored previews would win over generated
  ones, so do not reintroduce them: fix the story instead.
- **No Tailwind CLI compile.** The converter takes the compiled stylesheet out of the storybook
  reference, so `cssEntry` and `tailwind-entry.css` are gone.

## Where this lives, and where to run it from

`.design-sync/` and `.ds-sync/` both live in `packages/matrix-design-system/`, and **every path is
resolved from the cwd the converter runs in** — it does no upward search for `.design-sync/`, so
running from the repo root fails with `[CONFIG] … ENOENT`.

**Run the design-sync session rooted at this package**, not at the repo root. That is what keeps the
skill consistent with itself: it stages `.ds-sync/` relative to the session root, so a package-rooted
session stages it here rather than recreating a second copy at the repo root.

The two folders **must stay siblings**: the fork in `.design-sync/overrides/source-kit.mjs` imports
`../.ds-sync/lib/common.mjs`, and `.design-sync/node_modules` is a symlink to `../.ds-sync/node_modules`
(that is how the fork reaches ts-morph). Moving one without the other breaks both, with a plain
`ERR_MODULE_NOT_FOUND`.

## Running it

```sh
# from packages/matrix-design-system
npx turbo run build --filter=matrix-design-system

# The reference the compare loop diffs against. NOT the SKILL's documented
# `-o "$(git rev-parse --show-toplevel)/…"` — the git toplevel is still the repo root, which would
# put the reference where cfg.storybookStatic (cwd-relative) will not find it.
cd ../../apps/matrix-design-system-showcase
npx storybook build -c .storybook -o ../../packages/matrix-design-system/.design-sync/sb-reference --quiet
cd -

node .ds-sync/package-build.mjs --config .design-sync/config.json \
  --node-modules ../../node_modules \
  --entry ./dist/index.mjs \
  --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
```

## `extraEntries` must list the subpath entries, package-relative

The root barrel deliberately does not export charts, markdown or the command palette — they live
behind `matrix-design-system/chart`, `/markdown` and `/command-palette` so the root resolves with no
optional peers installed. A bundle built from `dist/index.mjs` alone therefore misses them, and their
stories report `[TITLE_UNMAPPED]`.

`extraEntries` paths are **package-relative, not repo-relative**: `./dist/markdown.mjs`, not
`./packages/matrix-design-system/dist/markdown.mjs`. The repo-relative form silently logs
`not found — skipped` and the components stay missing.

## `titleMap` exists because story titles come from folders

Story titles are derived from the component's directory, which is not always an export name — a
folder can hold several components (`terminal-blocks`) or name them differently
(`reading-content-progress-bar` exports `ContentProgressBar`). Each mismatch is one `titleMap` entry.
`[TITLE_UNMAPPED]` names them explicitly; there is no silent failure here.

## Fonts ride in through the storybook reference

The package's `theme.css` declares Open Sans and Courier Prime but ships no `@font-face` — a consumer
supplies them. `apps/matrix-design-system-showcase/.storybook/preview-head.html` inlines the latin and
latin-ext subsets as base64 data URIs, which does two jobs: Storybook renders in the right typeface,
and the converter harvests those rules out of the built `iframe.html`
(`[FONTS_FROM_PREVIEW_HEAD] harvested 6`). It skips file URLs, so the data-URI form is required.

`cfg.extraFonts` is gone — it is bounded to `PKG_DIR`, and `PKG_DIR` is now the package rather than
the repo root, so a `.design-sync/fonts/` path is out of bounds and reports as "not found".
`.design-sync/fonts/` is kept only as the source for regenerating that inline block.

## `overrides`: fixed and portal components need single cards

Components that position content outside their grid cell (`fixed`/portal) cannot be shown as a grid
of variants — the validator flags `[GRID_OVERFLOW]` and names the fix. Nine components carry
`cardMode: "single"` or `"column"` for that reason. Pick a `primaryStory` that actually renders
something: an "open dropdown" or "mid-progress" variant can capture at 0px height, where the default
variant shows the component.

## Re-sync risks — check these first

- **`cfg.overrides.<X>.primaryStory` goes stale silently** when a story is renamed. The
  `CommandPalette` override pointed at `QuickActions` for a while after the stories were rewritten.
- **`libOverrides` must declare `.design-sync/overrides/source-kit.mjs`.** The fork is still loaded
  under the storybook shape (`resolvePackage`), and dropping the declaration logs
  `[OVERRIDE_UNDECLARED]`.
- **The root `.gitignore` needs `**/` on the `.design-sync/*` patterns.** A pattern with a middle
  slash is anchored to the file's directory, so `.design-sync/.cache/` stopped matching when this
  folder left the repo root — staging 99 build artifacts before it was caught.
- **`ContentProgressBar` reports `[RENDER_BLANK]`** (PNG ~4.5 KB against a 5 KB heuristic). It is a
  hairline fixed strip; the card is genuinely mostly empty. Non-blocking, and not worth an authored
  preview — that would reintroduce a second source of truth.

## Story wrappers collapse to height 0 — the `sb-error` cluster (2026-08-30)

Nine stories report `sb-error` with `no storybook root content`. They are NOT broken stories: the
component renders and its text is in the DOM. The capture harness calls `waitForSelector` on the
storybook root's first element child, and Playwright's default `state: "visible"` never resolves for
a **zero-area** element — so a wrapper with `height: 0` reads as "no content".

Two distinct causes, and they need different handling:

**1. Story-only Tailwind utilities never compile (6 stories).** The package stylesheet opts its
components into Tailwind's scan with `@source "../../dist/**/*.mjs"` (`src/styles/index.css`), which
is correct for consumers — but **stories are not published to dist**, so a utility used only in a
story's wrapper resolves to nothing. `h-32`, `h-64`, `min-h-96` and `min-h-40` are all absent from
the compiled stylesheet; those wrappers collapse and their `overflow-hidden` clips the component out
of the frame entirely. Affected: `ContentProgressBar` (all 3 stories, `h-32`), `CommandPalette/Open`

- `CustomPlaceholder` (`min-h-96`), `ImageGlow/FillCover` (`h-64`).

This reproduces in the **deployed showcase**, not just in the converter — the reference and the
published site are the same build. Adding
`@source "../../../packages/matrix-design-system/src/**/*.stories.tsx"` to
`apps/matrix-design-system-showcase/src/styles.css` fixes all six (verified: CSS 58245 → 60727 bytes,
the four utilities present, all six stories render). **Fabrizio declined that change — the showcase
CSS stays as it is** (see the memory note "design-sync: no source edits"). So the six are `skip`ped
instead, and they will keep rendering blank on the published showcase until he decides otherwise.
Do not re-apply the CSS fix; re-propose it as a finding if it matters.

**2. `position: fixed` component, no CSS fix possible (3 stories).** `Menu`'s three dropdown-open
stories click a trigger on mount; `Menu` itself renders `position: fixed`, so the story wrapper is
out of flow and measures 0 regardless of what compiles. `skip`ped. `cardMode: "single"` +
`primaryStory: "Default"` already keep its card correct.

**Stale-pointer trap this created:** `cfg.overrides.CommandPalette.primaryStory` was `"Open"` — the
story that is now skipped. Changed to `"Closed"`. `ContentProgressBar.primaryStory` is `"Default"`,
also now skipped; it is inert because **every** one of that component's stories is skipped, which
makes `generatePreviewSource` return null and the component ship a **floor card**. It keeps its
`.d.ts` and `.prompt.md`, so the design agent still gets the API contract — only the visual is bare.
That supersedes the older `[RENDER_BLANK]` note for this component: it no longer renders at all.

## The remote project was a generation behind (2026-08-30)

The uploaded `_ds_sync.json` was still `shape: "package"` with **93 components** — the storybook
migration (5c22ebe8) was committed but never uploaded. `remote-diff` reports `shape_changed`, drops
the anchor (`anchorReason: "shape_changed"`, `deletePaths: []`) and forces full re-verification, so
a re-sync from that state has **no delete list of its own** — §6's "no anchor" branch applies and the
deletes must be reviewed out of `list_files` by hand before `finalize_plan`.

Derived and verified for that upload: 274 deletes — 240 component files (56 components that no longer
have stories, plus 4 that only changed group: `MatrixRain` effects→matrix-rain, `BluePillLink`
general→links, `ContentProgressBar` general→organism, `TerminalLine` general→typography), 20 orphaned
`_preview/*.js`, and 14 `fonts/*.woff2` left over from the package shape (the storybook shape inlines
fonts as data URIs, so only `fonts.css` ships now).

**Never delete `templates/` or `uploads/`** — those are Fabrizio's own design-canvas content in the
project (`templates/article-table-of-contents/`, `uploads/*.png`), not sync output. `_ds_manifest.json`
and `_adherence.oxlintrc.json` are app-managed; leave them too.

## Conventions header: the shipped CSS is a closed, content-scanned build

`_ds_bundle.css` is byte-identical to the storybook's compiled stylesheet, which means it contains
**only the utilities this repo actually uses**. A design agent writing its own layout has no Tailwind
to run, so any utility the DS source doesn't itself use simply does not exist in a design.

Verified against the build: composed classes 16/16 present, theme tokens 28/28 present, and the
overridden breakpoint scale is real (Tailwind v4 emits `@media (width >= 992px)` for `md:` — check
for `width >=`, NOT for `--breakpoint-*` custom properties, which v4 does not emit).

But `conventions.md`'s worked example uses **`py-8`, `grid-cols-1` and `md:grid-cols-3`, none of
which are in the shipped CSS**, and it names `SectionHeading`, `StatCard` and `Accordion` — all three
lose their card/`.d.ts`/`.prompt.md` under the storybook shape (they remain in `_ds_bundle.js`, so
they still render, but the agent gets no contract for them). Fix the example before the next upload.

## Cards render on a WHITE page — app contract, not a bug to fix

Every `<Name>.html` card sets, after the two stylesheet links:

```css
body {
    margin: 0;
    padding: 24px;
    background: #fff;
}
```

That rule is **unlayered**, while the design system's own `body` rule lives in `@layer base`
(`src/styles/base.css`), so the card's white always wins regardless of order or specificity. The
result: components that rely on the dark page surface (Button, Chip, Label, MenuItem, Tag …) render
as pale outlines with near-invisible text in the picker, while components that paint their own
background (Footer, InternalLink's post card, FormSuccessMessage, Lightbox) look correct.

**Do not fork `emit.mjs` to change this.** The skill's escape-hatch table is explicit: `emit.mjs` and
`bundle.mjs` are app-contract surface, never fork them. The previously-uploaded card was fetched and
is byte-identical, so this is long-standing, not a regression. It affects only the card previews —
a real design loads `styles.css`, whose `@layer base` body rule applies when nothing unlayered
overrides it — so designs the agent builds are dark as intended.

Grading consequence: judge the component, never the page surface (the rubric says to ignore framing).
All 36 gradeable components were graded that way.

## Grading outcome, 2026-08-30 — 36/36 match

116 stories across 36 components, every one `match`, judged from the compare sheets (raw PNGs opened
where the sheet was too small). Notes worth carrying:

- **Overlay** — the PREVIEW is the faithful side. Storybook clips the `position:fixed` dialog outside
  `#storybook-root`, so `With Dialog` / `With Terminal` show only the blurred backdrop there while the
  card renders the real dialog. Per the rubric, a preview that renders MORE than a gated reference is
  not a defect.
- **MatrixRain/Default** — neither panel shows glyphs: the full-window WebGPU canvas paints outside the
  story container. Matches the reference, but the card reads empty. `Behind Content` and
  `Terminal Backdrop` show the rain correctly, so the component is fine.
- **CommandPalette** — its card is now only the line "Press ⌘K — the palette is closed until it is
  opened", because `Open` is skipped. Weak card; the fix is the `@source` change Fabrizio declined.
- **TerminalLine** — `[STORY_CAP]`: 6 of 18 stories captured. Raise with `--max-stories 18` if the tail
  variants ever need individual verification.

## conventions.md was corrected (2026-08-30)

The validation pass found the header naming things that do not exist. Composed classes (16/16), theme
tokens (28/28) and the breakpoint scale all verified — **check breakpoints with `width >=` in the
compiled CSS, NOT `--breakpoint-*`, which Tailwind v4 does not emit**. But the worked example used
`py-8`, `grid-cols-1` and `md:grid-cols-3` (absent from the shipped CSS) and `SectionHeading`,
`StatCard`, `Accordion` (no longer synced), with `Button` props that never existed (`label`/`onClick`;
it takes `children`). Fixed with Fabrizio's approval: added the "prebuilt and closed" warning listing
the verified-present utilities, and replaced the example with one whose every class and prop is checked
against the build.

**Still inaccurate, left alone:** the "No provider required" section claims `styles.css` sets
`html body { ... }`. It is a plain `body` rule inside `@layer base`. Harmless for the agent, but it is
why the card template's white background wins — worth fixing next time.

## Re-sync risks — 2026-08-30 refresh

- The 9 `skip`ped stories are **workarounds for the declined `@source` fix**, not permanent truths. If
  the showcase ever scans story files, drop the CommandPalette / ContentProgressBar / ImageGlow skips
  (6 stories) and re-grade; Menu's 3 stay skipped regardless (fixed-position, harness cannot see them).
- `cfg.overrides.CommandPalette.primaryStory` is `"Closed"` **because `"Open"` is skipped**. Changing
  the skips means revisiting this pointer — it silently breaks the card if it names a skipped story.
- `ContentProgressBar` has ALL stories skipped, so it ships a **floor card** and has no `_preview/` file.
  That is intended; it still carries `.d.ts` and `.prompt.md`.
- The uploaded anchor is now `shape: "storybook"`, so the next re-sync gets a real diff and carried
  grades — this run's full re-verification was a one-off caused by the package→storybook shape change.

## React Compiler runtime: the bundle needs a prelude (2026-10-04) [GENERAL]

Since the package compiles its `"use client"` modules with the React Compiler (ADR-0002), ~70 dist
modules call `c()` from `react/compiler-runtime`. The converter's React shim (`lib/bundle.mjs`) maps
that import to `window.React`, and React 19 keeps `c` under `React.__COMPILER_RUNTIME`, not on the
top-level object. Result: every compiled component (Menu, Footer, MotionDiv, FormField, ExternalLink,
CommandPaletteTrigger, ...) threw `(0, import_compiler_runtimeN.c) is not a function` when rendered
straight from `_ds_bundle.js`, which is exactly what a design does.

**The previews hid it.** They render through the preview shim, which proxies every `window.React`
property, so cards and compare sheets looked perfect. The only signal was ContentProgressBar's floor
card in the render check (`errs: 1`). To catch it, render a component directly from
`window.ChicioDS` on a card page (`ReactDOM.createRoot(d).render(React.createElement(ChicioDS.MotionDiv, ...))`).

**Fix, config-only:** `.design-sync/compiler-runtime-prelude.mjs` sets
`window.React.c = window.React.__COMPILER_RUNTIME.c`, and it is the FIRST `cfg.extraEntries` item.
Order matters: the generated entry evaluates extra entries before the main entry, and each module
copies the shim's properties at init, so `c` must exist before the first component module runs. The
prelude exports `__dsCompilerRuntimePrelude` only so the package's `"sideEffects": ["*.css"]` does
not tree-shake it away. `bundle.mjs` is app-contract surface and is not forked. Report the shim gap
upstream; drop the prelude once the converter exports `c`.

## Re-sync risks — 2026-10-04 refresh

- **Keep the prelude first in `extraEntries`.** Moving it after `./dist/chart.mjs` brings the crash
  back for the chart components, and previews will still look fine.
- **`SelfHostedVideo` captures blank on both sides** (spinner, no poster): headless Chromium does not
  play the video. Graded on frame, controls and caption. Not a defect.
- **The previous upload predates 3.0.0** (Host Identity: `BrandHeader` needs `title`, `tagline`,
  `logoAlt`; `Footer` needs `signature`). Contract changes clear every grade, so a major release means a
  full re-grade even when nothing looks different.
- **`conventions.md` drift found, not yet fixed:** it lists `mt-4` and `md:flex` as absent, but both
  are now in the shipped CSS; the `xl` 1600 and `2xl` 2000 breakpoints are not emitted (no utility uses
  them; only 576/768/992/1200 appear); the `html body` claim is still inaccurate; and it says nothing
  about Host Identity. Propose the edits to Fabrizio rather than rewriting the file.
