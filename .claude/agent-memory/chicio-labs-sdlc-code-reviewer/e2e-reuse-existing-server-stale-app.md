---
name: e2e-reuse-existing-server-stale-app
description: npm run test:e2e silently tests whatever is already on :3000 (often the user's own next dev) instead of building the branch — always prove the served app is the diff before trusting or reporting e2e failures
metadata:
  type: feedback
---

`apps/website/playwright.config.ts` sets `webServer: { command: "npm run build && npm run start", url: "http://localhost:3000",
reuseExistingServer: !process.env.CI }`. **Locally `reuseExistingServer` is `true`**, so if anything is already
listening on :3000, Playwright skips the build entirely and runs all 80 specs against that other app. The run looks
completely normal.

**Why:** the user frequently has `next dev` running on :3000 from the *main repo root* (`/Users/fduroni/Code/Fabrizio/chicio-labs`),
which is a different branch than the worktree under review. In one review this made the two assertions the diff had
just added fail with "element(s) not found", and I nearly reported both as blocking regressions. The a11y snapshot in
`error-context.md` gave it away: it showed output of a component the diff had **deleted** (`heading [level=3]` from a
removed `GenericHeader`).

**How to apply:**

1. Before `npm run test:e2e`, check the port: `lsof -nP -iTCP:3000 -sTCP:LISTEN`. If occupied, identify it
   (`ps -o pid,ppid,lstart,command -p <pid>` + `lsof -p <pid> | awk '$4=="cwd"'`). **Never kill it** if it is the
   user's own dev server / its cwd is the repo root.
2. Confirm the e2e log actually contains build output. No `Creating an optimized production build` lines in
   `test:e2e` output = the server was reused = the result is meaningless.
3. Sanity-check the served markup before believing any failure, e.g.
   `curl -s http://localhost:3000/<route> | grep -oE "<h[1-6][^>]*>"` — if it shows pre-diff markup, stop.
4. Recovery that does not touch the codebase (reviewer is read-only) and does not disturb the user's server:
   - build the branch, then `npx next start -p 3100`;
   - write a throwaway config in the scratchpad as a **plain CJS object with no imports** (`module.exports = {...}`)
     so no module resolution is needed for the config itself: absolute `testDir`, `use.baseURL:
     "http://localhost:3100"`, `outputDir` in the scratchpad, `reporter: [["list"]]`, and **no `webServer`** key;
   - `npx playwright test --config <scratchpad>/pw.config.js`.
   - If a scratchpad *spec* file needs `@playwright/test`, symlink the worktree's node_modules next to it
     (`ln -sfn <worktree>/node_modules <scratchpad>/node_modules`) — otherwise "Cannot find module".
5. `use.baseURL` cannot be overridden by env: the `baseURL` fixture only *defaults* to
   `process.env.PLAYWRIGHT_TEST_BASE_URL`, and an explicit `use.baseURL` in the config wins. A throwaway config is
   the only clean route.

Bonus: a failing assertion that passes against the *new* build but fails against the *old* one is proof the test is
meaningful — the accidental stale run is a free "would this test have caught the regression?" check.

Related: [[e2e-in-worktree-webserver]] (webServer *startup* failures), [[e2e-command-palette-flake]],
[[e2e-launch-timeout-flake]] (genuine flakes — rule those out only after confirming the right app was served).
