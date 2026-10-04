---
name: e2e-command-palette-flake
description: terminal.spec.ts openTerminalOverlay (and any openPalette-driven spec) flakes under machine load; the diagnostic is disjoint failing sets across runs — re-run before calling it a regression
metadata:
  type: feedback
---

Every e2e spec that reaches its subject through the command palette (`openPalette` /
`openTerminalOverlay` in `apps/website/e2e/terminal.spec.ts`, the listbox specs in `apps/website/e2e/search.spec.ts`) is
load-sensitive and flakes on a developer machine. Failures land on `expect(terminalOption).toBeVisible()`,
`terminalOption.click()` timing out *after* Playwright logs "element is visible, enabled and stable", or the
`getByRole("dialog", { name: "Terminal" })` assertion.

**Why:** the palette and the Terminal are both `dynamic(..., { ssr: false })` chunks mounted from
`LayoutAdditionalContent`, so opening them depends on post-hydration chunk load. `openPalette` already wraps
its click in `expect(...).toPass({ timeout: 20000 })` precisely because of this window; the steps *after* it
have no such retry.

**How to apply:** the decisive test for flake-vs-regression is whether the **failing set changes between
runs**. Observed in one review: the parallel run failed tests at lines 51/67/83 while a serial
(`--workers=1`) run of the same file failed only line 43 — disjoint sets, same shared helper. A real
regression in a helper used by 13 tests fails all 13 consistently.

Cheapest confirmation, using the already-built app:

```
npx playwright test apps/website/e2e/terminal.spec.ts --workers=1 -g "<the failing titles>" --retries=2
```

If they pass in ~3s each, it is load, not the diff. Do not pipe the run through `tail` — the pipe masks the
exit code and a "1 failed" summary can look like exit 0.

Second check, before any re-run: **does the diff touch the page the spec visits?** Every "Terminal overlay content
coverage" test does `goto("/")` and then the same palette steps; only the typed `open <x>` differs. Grep where the
changed components render (e.g. `<Projects />` is About me only). If `/` is untouched and the failure sits in
`openPalette`/the dialog assertion, the diff cannot be the cause. Seen at an Integration Review (2026-10-04): the
gate failed :162 (dialog), a serial re-run passed :162 and failed :166 and :188 (in `openPalette`), and an earlier
serial run passed all 15. Load average was ~5.5. Verdict: flake, recorded as non-blocking with that evidence.

Related: [[e2e-launch-timeout-flake]], [[e2e-search-listbox-flake]], [[e2e-in-worktree-webserver]].
