---
always: true
---

# Testing Conventions

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Unit | Vitest (node project) | Pure lib functions — business logic, security, utilities |
| Component | Vitest (jsdom project) + React Testing Library | Design system components — render, interaction, accessibility |
| E2E | Playwright | Full-page flows with real production build + mocked external APIs |
| Live QA | agent-browser (local only) | Agent-driven a11y tree + click-through smoke walks |

Coverage: v8 provider, text + json-summary reporters. **Threshold ratchet is active** — thresholds are set in `apps/website/vitest.config.ts` and the CI `test` job gates on them. The floor is the measured baseline over `apps/website/src/lib/**`, `packages/matrix-design-system/src/**` and the page-level
templates, site palette and shared site hooks that moved out of the design system (Matrix CG effects excluded —
they are canvas-only and cannot run in jsdom). See `coverage.include` in `apps/website/vitest.config.ts` for the exact scope. Each workspace has its own floor, measured after the design system was extracted:

| Workspace | statements | branches | functions | lines |
|---|---|---|---|---|
| `packages/matrix-design-system` | 94 | 83 | 91 | 95 |
| `apps/website` | 90 | 85 | 88 | 90 |
| `apps/labs-hub` | 95 | 90 | 95 | 95 |

The Labs Hub has a single node Vitest project over `apps/labs-hub/src/lib/**` (its own `vitest.config.ts`, `test:run` and
`test:coverage` scripts, so the CI `test` job and the pre-push hook cover it). Its tests include integration tests against
the real repository (the registry's completeness, every registered document rendering), which is why
`apps/labs-hub/turbo.json` hashes those documents into the test tasks' inputs. Its `.astro` templates have no component
tests and are not type-checked (`tsc --noEmit` covers the `.ts` only; `astro check` needs the TypeScript 6 API, see
ADR-0003): they are exercised by the Astro build in CI. It has no ESLint, knip or dependency-cruiser config.

The website's numbers dropped when the design system stopped carrying its average — the floors are
the measured baseline of each workspace, not the old combined figure. Raise the floor whenever tests improve coverage; never lower it.

## File Layout

Tests are co-located beside source files:

```
apps/website/src/lib/chat/
    guardrails.ts
    guardrails.test.ts        <- unit (node project)

packages/matrix-design-system/src/molecules/accordion/accordion/
    accordion.tsx
    accordion.test.tsx        <- component (jsdom project)
    use-accordion-store.ts

apps/website/e2e/
    fixtures.ts               <- the shared `test`/`expect` every spec imports
    homepage.spec.ts
    chat.spec.ts
    contact.spec.ts
```

## Vitest Projects

`apps/website/vitest.config.ts` defines two projects:

- **node** — `apps/website/src/lib/**/*.test.ts` — environment: node
- **jsdom** — `apps/website/src/components/**/*.test.tsx` and `apps/website/src/components/**/*.test.ts` — environment: jsdom, globals: true, setup: `apps/website/vitest.setup.ts`

The `@vitejs/plugin-react` v6 plugin is used via `react()` with no extra options. Note: v6 removed the `babel` and `presets` options from its `Options` interface; the `reactCompilerPreset` export is for use with `@rolldown/plugin-babel`, not for vitest.

**The React Compiler never runs in tests, in either workspace.** For the website it is a Next build-time optimization; for `packages/matrix-design-system` it runs in the package's own tsdown build (see its `tsdown.config.ts`), and vitest tests the package's `src/`, not `dist/`. Components that use hooks compile and render correctly in tests without it. The practical consequence: **the compiled output is only ever exercised by the website build and the Playwright suite** — a compiler-induced regression cannot be caught by a unit test, so run E2E when changing anything about the compiler configuration.

## Test Structure Conventions

- **One top-level `describe` per unit; nested `describe` per scenario.** Never leave multiple sibling top-level `describe` blocks in a file — wrap them in a single `describe` named for the unit under test (the module or primary function), with nested `describe` blocks per function or scenario. Name a `describe` for the thing it tests; no `atom`/`molecule`/`page` suffixes (e.g. `Button`, not `Button atom`).
- **Do not test a hook separately when its component is tested without mocking it.** A render test that does not mock the component's hooks already runs the store for real, so the store is covered through the UI. Add a direct `renderHook` test ONLY for store logic that no component can trigger through its rendered UI.

## What to Test at Each Layer

### Unit (lib/)

Security-sensitive and correctness-sensitive pure functions have the highest ROI:
- `apps/website/src/lib/chat/guardrails.ts` — injection pattern matching, LLM gate mocking, fail-open paths
- `apps/website/src/lib/rate-limit/rate-limit.ts` — throttle window, daily limit, counter increment, fail-open
- `apps/website/src/lib/consents/consents.ts` — read/write localStorage wrapper, event dispatch
- `apps/website/src/lib/seo/seo.ts` — metadata shape, structured data, date formatting, headline truncation
- `apps/website/src/lib/content/search-index-factory.ts` — index creation, search by field, ref correctness

### Component (RTL)

**Start in the design system** — it is self-contained and has no network or route dependencies. Seed atoms then molecules, then organisms only when cheap.

Each component gets a render + interaction test that drives it through the rendered UI **without mocking its hooks**. Because the component is thin and its store runs for real during the render, the store is covered through the component — do NOT add a separate `renderHook`/store test for it (see Test Structure Conventions). Reach for a direct `renderHook` test only for store logic unreachable through any component's UI.

Do NOT test `features/` or `content/` components without Next.js context — they require routing and server components. The design system is the correct starting point; climb outward only as context permits.

### E2E (Playwright)

Playwright runs against a **production build** (`next build && next start`). External APIs are ROUTE-MOCKED via `page.route()` — no real Groq, Upstash, or Resend calls, no secrets needed.

**Every spec imports `test` and `expect` from `apps/website/e2e/fixtures.ts`, never from `@playwright/test`.** The fixture overrides `context` — not `page` — to rewrite `/_next/image` requests to the source file they optimize. It must be the context: a page route leaves service-worker fetches alone, and `pwa.spec.ts` opts service workers back in. This is not cosmetic. `next start`'s image optimizer deadlocks a cache key for the rest of the process's life as soon as one client abandons a `/_next/image` request mid-flight: it reads the source through a mocked request that carries the real client socket, so `send`'s on-finished listener destroys the file stream when that socket closes, the mocked response never emits `finish`, and the response cache's pending promise for that key never settles — every later request for the same image joins it and hangs forever. Playwright abandons exactly those requests whenever a test ends while a page is still loading images. The next test to render them then has six hung requests in flight, which is Chrome's entire per-origin socket budget, so a clicked link's RSC payload is queued behind them and `toHaveURL` times out on a click that never navigated. That was the long-running "e2e fails randomly" flake, twice misdiagnosed; `fixtures.ts` carries the full write-up and the reproduction.

Committed specs:
1. `apps/website/e2e/homepage.spec.ts` — homepage loads, navigation exists, /blog and /about-me routes work
2. `apps/website/e2e/chat.spec.ts` — chat page loads, input visible, mocked stream response renders
3. `apps/website/e2e/contact.spec.ts` — form validation errors appear, mocked success shows confirmation

## Loop Discipline

- **Bug fix** — strict red-green: write a failing test that reproduces the bug FIRST, then fix the code. Do not merge a fix without a test that would have caught it.
- **Feature** — tests required in the Verify phase. TDD is encouraged: author tests before or alongside implementation, not after.

## Local Commands

```bash
npm run test             # vitest watch (development)
npm run test:run         # vitest run once (CI-friendly)
npm run test:coverage    # vitest run --coverage (v8, prints text summary)
npm run test:e2e         # playwright test (builds prod first)
npm run test:e2e:ui      # playwright test --ui (interactive mode)
npm run typecheck        # tsc --noEmit over the single apps/website/tsconfig.json (src + tests + e2e + config)
```

## Typecheck Coverage

There is a SINGLE `apps/website/tsconfig.json`, used by the editor, `next build`, and `npm run typecheck` alike. Its `types` include `vitest/globals` (so `describe`/`it`/`expect`/`vi` and the `@testing-library/jest-dom/vitest` matcher augmentation resolve in test files) and `next/image-types/global` (so `.png`/`.jpg` imports resolve in a clean CI checkout without a generated `next-env.d.ts`). The matcher augmentation is loaded at type level via `apps/website/vitest.setup.ts` (included in the program) and at runtime by the same file.

`npm run typecheck` (`tsc --noEmit`) is the authoritative type gate for the full repo, covering src + tests + e2e + config files. It exists because `next build` only type-checks files reachable from the build graph — orphan test files are never checked by it. Because the editor and the typecheck gate use the same config, what's green in CI is green in VS Code (no separate test-only tsconfig, no editor/CLI drift) — same *config*, but not the same *compiler*: the editor's `tsserver` resolves root TypeScript 6 (TS 7 ships none), while `apps/website/package.json` pins TS 7 for this gate. See the TypeScript paragraph in `CLAUDE.md` for why that split exists and is deliberate.

## CI Shape

```
lint           -+
knip           -+
validate-arch  -+- typecheck -+- test -> build -> e2e
                              -+
```

- **typecheck** job: `npm run typecheck` — covers `apps/website/src/**`, `**/*.test.*`, `apps/website/e2e/**`, and config files. Zero errors required.
- **test** job: `npm run test:coverage` — prints coverage summary and **gates on thresholds** (the per-workspace floors above). Coverage below the floor fails CI.
- **e2e** job: runs after build, Playwright browsers cached, report uploaded as artifact; no third-party secrets needed (externals are mocked)

## Pre-Push Hook (.husky/pre-push)

```
npm run validate-architecture
npm run typecheck
npm run test:run
```

E2E is NOT in pre-push — the production build takes too long. Run `npm run test:e2e` manually before opening a PR that touches routing or API routes.

## Tooling Exemptions

ESLint and dependency-cruiser ignore test files entirely. knip does not — read its bullet carefully:

- **ESLint** (`apps/website/eslint.config.mjs`) — `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`, `apps/website/e2e/**`, `apps/website/vitest.config.ts`, `apps/website/vitest.setup.ts`, `apps/website/playwright.config.ts` in `ignores`
- **knip** (`apps/website/knip.json`) — there is **no `ignore` key**. Test files fall under `project` (`apps/website/src/**/*.{ts,tsx,mdx}`); `apps/website/e2e/**/*.ts` is both `entry` and `project`; `apps/website/src/test-utils/index.ts` is an `entry`. `ignoreExportsUsedInFile: true` is set. **Consequence**: because test files count as usage, a green `npm run knip` does NOT prove a deletion is complete when a leftover test still imports the deleted symbol, that import keeps the export looking "used". Grep for the deleted symbol separately before trusting a green knip run.
- **dependency-cruiser** (`apps/website/.dependency-cruiser.js`) — `\.(test|spec)\.(ts|tsx)$` in `options.exclude.path`

## Verification Checklist

When completing any change, run:

1. `npm run lint` — zero errors (CI enforces `--max-warnings 0`)
2. `npm run validate-architecture` — zero dependency-cruiser violations. Run after any structural/component change.
3. `npm run knip` — zero unused exports/dependencies
4. `npm run typecheck` — zero TypeScript errors across src, tests, e2e, and config files
5. `npm run test:run` — all Vitest tests green
6. `npm run build` — success
7. `npm run test:e2e` — all Playwright specs green (run when touching routing or API routes)
8. Manual browser check for UI/content changes

## Agent-Browser Live QA (local only)

`agent-browser` is a native Rust CDP CLI from vercel-labs. It is a **local dev dependency** (`devDependencies`, and added to knip's `ignoreDependencies` since it is a CLI, never imported). It is NEVER invoked in CI — it exists only for the agent performing live smoke walks on a developer machine. Because it is local, invoke it with `npx agent-browser` (it is not installed globally).

### Install

```bash
# It is already declared as a devDependency, so a normal install pulls it in:
npm install

# One-time: download the Chrome-for-Testing browser binaries
npx agent-browser install
```

### Canonical smoke walkthrough

The following is the enforced QA pattern for agent-driven live checks. Run with the dev server (`npm run dev`) or a production build (`npm run build && npm start`) already running:

```bash
# 1. Open the homepage, then snapshot the interactive accessibility tree
npx agent-browser open http://localhost:3000
npx agent-browser snapshot -i

# 2. Navigate to the blog listing and verify it loads
npx agent-browser open http://localhost:3000/blog
npx agent-browser snapshot -i

# 3. Chat page
npx agent-browser open http://localhost:3000/chat
npx agent-browser snapshot -i

# 4. Contact page — verify form fields exist
npx agent-browser open http://localhost:3000/contact
npx agent-browser snapshot -i

# 5. About-me
npx agent-browser open http://localhost:3000/about-me
npx agent-browser snapshot -i

# When done, close the browser
npx agent-browser close
```

For each step: verify the a11y tree contains the expected landmark roles (`navigation`, `main`, `form` on contact). Flag any missing landmarks or broken aria attributes before claiming the page passes visual QA.
