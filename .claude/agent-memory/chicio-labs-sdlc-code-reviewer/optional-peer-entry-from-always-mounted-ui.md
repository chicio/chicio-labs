---
name: optional-peer-entry-from-always-mounted-ui
description: When always-mounted Website UI (a Binding, the menu, the layout) starts importing from matrix-design-system/command-palette, /chart or /markdown, check in .next/static/chunks that the optional peer (cmdk, recharts, unified) stayed out of the page's initial chunks
metadata:
  type: feedback
---

Rule: the Website lazy-loads the heavy halves of the design system on purpose (`SiteCommandPalette` is
`dynamic(...)` in `layout-additional-content.tsx` so `cmdk` never ships with the first paint). A diff that makes an
always-mounted component import anything from an optional-peer entry point can silently drag the peer into every page's
initial JS. dependency-cruiser's `root-barrel-no-optional-peers` only guards the package's root barrel, not the Website.

**Why:** `CommandPaletteTrigger` moved into `matrix-design-system/command-palette` and the Menu Binding imported it
(2026-10-04). It was fine: the package builds with `unbundle: true` and `sideEffects: ["*.css"]`, so Turbopack shook
`CommandPalette` and `cmdk` out. That only holds while both settings do; a bundled entry or a `sideEffects: true` would
break it without failing any gate.

**How to apply:** with a HEAD build in `.next`, list the scripts in `.next/server/app/index.html`
(`/_next/static/chunks/*.js`) and grep each for a peer fingerprint (`cmdk-` for cmdk, `recharts` for recharts). The peer
must appear only in chunks absent from that list. Blocking if it lands in an initial chunk and the plan did not accept it.

Related: [[slot-wrapper-layout-ab-probe]].
