# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository. Claude Code is the first-class
agent here: the instructions, the skills and the plugins target it alone
([ADR-0006](docs/adr/0006-claude-code-is-the-first-class-agent.md)).

## Project Overview

This repository is **Chicio Labs** (`chicio/chicio-labs`): Fabrizio Duroni's lab, from which every Lab Project is
published ([ADR-0007](docs/adr/0007-chicio-labs.md)). The Lab Projects are the Website (fabrizioduroni.it), the npm
packages, their Showcases and the Claude Code plugins; the Labs Hub at `labs.fabrizioduroni.it` presents them. The
repository was called `chicio-blog` until October 2026, and older Posts still say so.

The Website is a Next.js 16 blog (App Router) with a Matrix-inspired UI theme. It features blog posts, DSA (Data Structures & Algorithms) content, an AI chat interface, and various interactive elements. The codebase follows atomic design principles and uses TypeScript with strict type safety.

## Ubiquitous Language and Decisions

The project's vocabulary is defined in a glossary: [`GLOSSARY-MAP.md`](GLOSSARY-MAP.md) lists the contexts (Website,
Matrix Design System, Matrix Rain, Agentic Delivery), each with its own `GLOSSARY.md`. Use its terms, in code, prose and prompts alike, and
avoid the synonyms it lists under _Avoid_. It is authoritative: when an agent memory or a doc contradicts it, the memory
or doc is wrong.

Hard-to-reverse decisions are recorded as ADRs: system-wide in [`docs/adr/`](docs/adr/), context-specific in each
context's own `docs/adr/`. Read the relevant one before changing what it decided.

## Repository Layout

An npm-workspaces monorepo orchestrated by Turborepo. **Every path in this file and in `.claude/rules/`
is written from the repository root**, so the website's sources are under `apps/website/`.

```
package.json                      workspace root: workspaces, turbo, husky, release-it, prettier
turbo.json                        the task graph (build, lint, typecheck, test, e2e)
apps/website/                     the Next.js site, with its own tsconfig, eslint, knip,
                                  vitest, playwright and dependency-cruiser configs
packages/matrix-design-system/    the published design system: framework-agnostic React
                                  components, its own stylesheet, built with tsdown. Stories live
                                  beside their components as *.stories.tsx
apps/matrix-design-system-showcase/  Storybook over those stories; deploys to GitHub Pages
                                  (packages/matrix-design-system/.design-sync/ + .ds-sync/
                                  are the Claude Design converter — see below)
apps/matrix-rain-showcase/        Astro docs and playground for the rain effect; deploys to GitHub Pages
apps/labs-hub/                    the Labs Hub: an Astro site (private) presenting every Lab Project, its
                                  docs generated at build time from READMEs, CHANGELOGs, glossaries and ADRs
                                  elsewhere in the repository; deploys to the root of GitHub Pages
packages/labs-catalog/            private: the public facts (name, type, description, links, card image) of every
                                  Lab Project and Standalone Project, read by the Labs Hub and the Website's
                                  About me (ADR-0008)
packages/matrix-component-store/  the published ComponentStore/StateStore/EffectsStore contract
packages/eslint-plugin-chicio/    the component-store lint rules, shared by both workspaces
.claude-plugin/marketplace.json   the chicio-labs Claude Code plugin marketplace (see Claude Code Plugins)
claude-plugins/                   the plugins it lists, plus the Agentic Delivery glossary and ADRs
.claude/                          Claude Code config: rules, settings, agent memory, third-party skills
```

**Every Lab Project keeps its Brand Kit in `brand/` at its own root** (`apps/website/brand/`,
`packages/matrix-design-system/brand/`, `claude-plugins/image-peek/brand/`, …): the images that carry its identity,
with their source files. A Lab Project's card image is one of them, registered in `packages/labs-catalog/src/catalog.ts`
as a path inside its Brand Kit; the catalog's build gathers every card image into its gitignored `dist/media/`, so
none is committed twice. A new Lab Project is also registered in the Labs Hub's `registry.ts`, which holds what is
about documentation. A Standalone Project has no folder here, so its card image lives in `packages/labs-catalog/media/standalone/`.
[ADR-0008](docs/adr/0008-labs-catalog-package.md) has the reasoning.

The website depends on the packages by version (`"matrix-design-system": "^1.0.0"`), and npm
resolves that to the workspace copy — so the site always builds against the local packages, while
they stay publishable for outside consumers. Why one monorepo, and why the built output rather than the source:
[ADR-0001](docs/adr/0001-monorepo.md).

It resolves them through their **built output** (`dist/`), not their source, so every task that runs
or builds the site depends on `^build` in `turbo.json`. `npm run dev` also starts each package's
`tsdown --watch`, so a change in `packages/` reaches the running dev server.

Run tasks from the root: `npm run <task>` delegates to `turbo run <task>` across the workspaces.
To run something in the website only, use `npm run <task> --workspace=website`.

**Turborepo is newer than your training data.** Resolve the installed package (`node -p
"require.resolve('turbo/package.json')"` from a workspace that depends on it) and read its `docs/README.md`, then the
relevant pages under its `docs/`, before changing `turbo.json` or a `turbo` command. Turborepo's own managed version of
this note is turned off (`"agentGuidance": false` in `turbo.json`): it can only write to a root `AGENTS.md`, which this
repository does not have ([ADR-0006](docs/adr/0006-claude-code-is-the-first-class-agent.md)).

**`allowScripts` and `overrides` belong in the ROOT package.json.** npm reads both only from the
project root; in a workspace it prints `allowScripts in workspace … is ignored` and carries on. The
npm version is declared as `devEngines.packageManager` with a same-major range (`^11.0.0`) — Turborepo
requires a package manager to be declared and rejects a range spanning majors.

**Environment variables must be declared in `turbo.json`.** The website's secrets live in `apps/website/turbo.json`, on the tasks that run the app (`build`, `dev`, `start`, `test:e2e`) — not in the root `globalEnv`, where every entry becomes a cache key for every task in every workspace and a changed `GROQ_API_KEY` needlessly rebuilds the design system. Only `CI` and `NODE_ENV` are global. Turborepo filters the
environment it passes to tasks, so an undeclared variable is silently stripped. The list cannot be
derived by grepping for `process.env.X`: `GROQ_API_KEY` is read implicitly by `@ai-sdk/groq` and
never appears in the source, and the `GOOGLE_ANALYTICS_*` keys are destructured from an injected
`env` object. Treat `apps/website/.env.production` and the Vercel project settings as the
authoritative list.

**TypeScript sits on two majors on purpose: root is 6, every workspace is 7.** Do not "align" them, and do not remove
or bump the root `typescript` past 6: `typescript-eslint` and the other root-hoisted tools import a compiler API that
TS 7 does not ship. The `matrix-rain-*` packages pin `typescript: "npm:tsover@6.0.2"` for an unrelated reason
(operator overloading). Check why a `typescript` version looks wrong before "fixing" it. Why, and when to revisit:
[ADR-0003](docs/adr/0003-typescript-6-7-split.md).

## Claude Design Sync

The [claude.ai/design](https://claude.ai/design) converter lives in
`packages/matrix-design-system/.design-sync/` (durable inputs) and `.ds-sync/` (staged scripts). It
runs in **storybook shape**: previews are generated from the `*.stories.tsx` beside each component,
so a story is the single source of truth and there are no hand-authored previews to drift.

**Invoke `/design-sync` from a session rooted at `packages/matrix-design-system`, not at the
repository root.** Every path is resolved from the converter's working directory and there is no
upward search — a root-level run fails with `[CONFIG] … ENOENT`. Rooting the session at the package
also keeps the skill's own staging consistent, since it creates `.ds-sync/` relative to the session
root.

Two traps, both silent:

- The two folders must stay **siblings** — the fork in `.design-sync/overrides/` imports
  `../.ds-sync/lib/`, and `.design-sync/node_modules` symlinks to `../.ds-sync/node_modules`.
- `.gitignore` patterns for them need a `**/` prefix. A pattern with a middle slash is anchored to
  the repository root, so a bare `.design-sync/.cache/` matches nothing here.

`packages/matrix-design-system/.design-sync/NOTES.md` carries the invocation and the re-sync
watch-list.

## Development Commands

```bash
npm install              # Install every workspace (run from the repository root)
npm run dev              # Every app + package watcher in Turborepo's TUI (website prebuild: search index + images)
npm run dev:website      # One app + its packages; also dev:hub, dev:design-system, dev:rain
# Fixed ports, never drifting: Website :3000, Labs Hub :4321, Matrix Rain Showcase :4322/matrix-rain/,
# Storybook :6006. Without a TTY (an agent's Bash tool) turbo falls back to streamed output on its own.
npm run build && npm start  # Production build
npm run lint             # Linting (--max-warnings 0 in CI)
npm run validate-architecture  # dependency-cruiser: import rules, layering, isolation (all at error)
npm run format           # Prettier over the repo (4 spaces / 120 cols; see .prettierrc)
# Search index generation and content-media copy have no standalone npm script:
# both run automatically via apps/website/src/lib/build/prebuild.ts before dev/build (see note below).
# The copy step mirrors <post-dir>/media/ into public/media/content/.
npm run chat-knowledge-upload  # Upload blog content to Upstash Vector for RAG
npm run release          # Release with conventional changelog
```

**Important**: Search index and content image copy both run automatically before `dev` and `build` via `apps/website/src/lib/build/prebuild.ts`. `validate-architecture` is NOT part of prebuild — it runs as its own CI job (and should be run during development; see below) and fails CI on violations.

## Architecture

### Key Patterns

- **Folder-Per-Component + Store Model**: every component lives in its own kebab-case folder with a `<name>.tsx`, a `use-<name>-store.ts` hook, and an `index.ts` barrel. Components call exactly one hook (`use<Name>Store()`). `useGlassmorphism` is permanently exempt. See `.claude/rules/component-architecture.md` for the full specification.
- **Atomic Design System**: atoms → molecules → organisms, published as `packages/matrix-design-system`. Layering enforced at error by its own dependency-cruiser config. Page-level templates live in `apps/website/src/components/features/content/`, not in the design system. The design system is framework-agnostic (it imports nothing from `next`); the site's Next bindings live in `apps/website/src/components/features/design-system-next/`. The package applies the React Compiler itself, in its tsdown build, to `"use client"` modules only: Next never compiles `node_modules`, and compiling a server component crashes the render ([ADR-0002](packages/matrix-design-system/docs/adr/0002-react-compiler-in-the-package-build.md)). Most components come from the root barrel, but the three groups needing optional peer dependencies have their own entry points — `matrix-design-system/chart`, `/markdown` and `/command-palette` — and a dependency-cruiser rule fails the build if the root barrel ever reaches one of those libraries again. See `.claude/rules/design-system.md`
- **Page-Content Isolation**: Each route's components live in `apps/website/src/components/content/<page>/` (no separate `components/` or `hooks/` subdirs — folder-per-component directly). Cross-cutting UI lives in `apps/website/src/components/features/<feature>/`. See `.claude/rules/content.md`
- **Business Logic in lib/**: Components are thin. Non-hook pure logic lives in `apps/website/src/lib/`, never in `design-system/utils/` (eliminated).
- **Type Safety**: Shared types in `apps/website/src/types/`, TypeScript strict mode
- **Store Return Types**: `StateStore<S>`, `EffectsStore<E>`, `ComponentStore<S,E>` from `@/types/component-store`. Never pad with `Record<string,never>` or `{}`.
- **No Functions in JSX**: `react/jsx-no-bind` enforced at error. Curry handlers in the store.
- **Content as MDX**: Filesystem-as-database. See `.claude/rules/mdx-content.md`
- **Co-located Images**: Blog post images live in `<post-dir>/media/`, other content images in `apps/website/src/content/<section>/media/` (the folder MUST be named `media` — the copy script keys off that path segment). A build-time script (`apps/website/src/lib/images/copy-content-media.ts`) mirrors them to `public/media/content/`. The `public/media/content/` directory is gitignored and regenerated on every build.
- **API Routes**: Chat (Groq + Upstash Vector RAG) and Contact (Resend). See `.claude/rules/api-routes.md`
- **Testing**: Automated suite — Vitest (node project for `lib/**`, jsdom + RTL for `components/**`), Playwright e2e, plus lint + typecheck + build; CI gates on coverage thresholds. agent-browser for local live-QA. See `.claude/rules/testing.md`

## Code Style

See `.claude/rules/code-style.md`. Key points: 4 spaces, 120 char lines, always braces on `if`, `@/` import alias, conventional commits with Gitmoji, one-hook-per-component, no functions in JSX.

## Environment Setup

- **Env files**: `.env.development`, `.env.production`
- **Required secrets**: `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`

## CI/CD

Six workflows:

- **`ci.yml`** — lint (ESLint `--max-warnings 0`), knip, validate-architecture (dependency-cruiser, all rules at error), typecheck, test (coverage-gated), verify-packages and plugins (`claude plugin validate` + `claude plugin test` + `tsc` over every plugin in `claude-plugins/`, with no Claude credentials), then build (Next.js) and e2e. Everything before `build` gates it. Upstash/Resend secrets injected for build.
- **`release-package.yml`** — manual `workflow_dispatch` to publish a package, authenticated by npm OIDC trusted publishing (no `NPM_TOKEN`). Pick the package and the increment; `initial` maps to `--no-increment` for a first release.
- **`release-plugin.yml`** — manual `workflow_dispatch` to release a Public Plugin: release-it bumps its `.claude-plugin/plugin.json`, writes its `CHANGELOG.md`, tags `<plugin>--v<version>` (the Claude Code convention, not the packages' `@`) and creates the GitHub release. Nothing is published anywhere: users receive a release when the new `version` reaches `main`.
- **`pages.yml`** — builds the Labs Hub and both Showcases and deploys them to GitHub Pages, at the custom domain `labs.fabrizioduroni.it` (a CNAME at register.it, which hosts the zone; the apex and `www` point at Vercel). The Labs Hub (`apps/labs-hub`, Astro, built entirely from `matrix-design-system`) owns the root; the Storybook sits under `/design-system/` and the rain showcase under `/matrix-rain/`, and the hub must never emit either path (the workflow fails if it does). The hub renders documents from all over the repository, so the workflow's `paths:` cover every README, CHANGELOG, glossary, ADR and plugin file, and `apps/labs-hub/turbo.json` lists the same files as the hub's turbo inputs (a cache hit must never serve a stale hub). `release-package.yml`, `release-plugin.yml` and `release-website.yml` dispatch `pages.yml` after a real release, because the pushes they make with `GITHUB_TOKEN` do not trigger it. Storybook emits relative asset paths, so nothing needs to know the subpath it is served from; the rain showcase's Astro `base` is `/matrix-rain/` and must follow the Pages path.
- **`release-website.yml`** — manual `workflow_dispatch` to cut the site's version bump, changelog, tag and GitHub release. It publishes nothing (the site deploys continuously from `main`) and refuses to run unless `E2E (Playwright)` is green on the exact commit and `main` has not moved since dispatch.
- **`scheduled-rebuild.yml`** — Monday 06:00 UTC, pings a Vercel deploy hook so time-dependent pages such as `/blog/stats` refresh even in a week with no site commits. Load-bearing now that unaffected commits skip their deploy: see **Vercel Deploys**.

There is deliberately **no Dependabot auto-merge and no ruleset on `main`**: a required check would block `release-website.yml` from pushing as `github-actions[bot]`. See [ADR-0005](docs/adr/0005-no-dependabot-auto-merge.md).

## Vercel Deploys

The site deploys continuously from `main`, through the Vercel project `fabrizioduroni.it` (named after the Lab Project it
deploys, not after the repository). Two things about that project are not visible from the repository:

- **The Root Directory is `apps/website`, not the repository root.** Vercel reads `vercel.json` from the Root Directory, so the file lives at `apps/website/vercel.json`; a repository-root `vercel.json` is silently ignored. (Tell: the build log's `npm install --prefix=../..`.) "Include files outside the Root Directory" is on, so the whole monorepo is cloned and the root `package-lock.json` resolves normally.
- **The `ignoreCommand` skips deploys for commits that cannot affect the site**, by asking `turbo query affected`; the logic lives in `apps/website/scripts/vercel-ignore-build.sh`. Why this and not the default ignore step or `turbo-ignore`: [ADR-0004](docs/adr/0004-vercel-deploy-skipping.md).

Four things in that command are easy to get wrong (the ADR explains each):

- **`--base` must tolerate an empty value**: `VERCEL_GIT_PREVIOUS_SHA` is empty on any branch with no previous deployment, and an empty `--base` exits 2. The script then compares against the branch's merge-base with `main` (`git fetch --depth=50` of `main` by URL, since Vercel's clone has no `origin` remote, then `git merge-base HEAD FETCH_HEAD`), never `HEAD^1`, which sees only the last commit of a multi-commit branch, and never `main`'s tip, which Vercel's shallow clone cannot relate to the branch. A failed fetch or a missing merge-base builds.
- **Do not pass `--head`**: it makes a rain-showcase-only commit report the website affected.
- **An unreachable base exits 1, so it builds rather than skips.** That is the desired direction; do not "fix" it.
- **`turbo` is pinned to a major (`turbo@^2`)**: the step runs before `npm install`, so `npx` fetches turbo fresh.

The **Build Command** override and the **Skip deployments when there are no changes** toggle both still live only in the Vercel dashboard. Keep that toggle off.

## Release

`release-it` with conventional changelog (`.release-it.json`). Generates CHANGELOG.md and GitHub releases. Run: `npm run release`

Each published package has its own `.release-it.json` and is released through `release-package.yml`, not Changesets:
[ADR-0002](docs/adr/0002-per-package-release-it-with-oidc.md).

## Code Navigation

The workspace is indexed by CodeGraph (`.codegraph/`, MCP server in `.mcp.json`). Navigation order:

1. **CodeGraph first** — `codegraph_explore` (MCP tool) or `codegraph explore "<question or symbols>"` (CLI). One call returns the verbatim line-numbered source of the relevant symbols grouped by file, the call paths between them (including dynamic-dispatch hops grep can't follow), and a blast-radius summary of what depends on them. Use it for every "where is X / how does X work / what depends on X" question, before Read/Grep/LSP.
2. **LSP for precise symbol-level follow-ups** — hover types, exact references, call hierarchy during refactoring. Semantically accurate, type-aware results that Grep/Glob cannot match.
3. **Grep/Glob only for text patterns** — string literals, comments, file-name patterns.

## Markdown Content Negotiation

AI agents and tools that send `Accept: text/markdown` receive a Markdown representation of the requested page instead of HTML.

**Architecture**:

- `apps/website/src/proxy.ts` — Next 16's proxy file convention (the successor of `middleware.ts`, which no longer exists here); a generic proxy: if `Accept: text/markdown`, prepends `/markdown` to the path and rewrites; never needs updating for new pages
- `apps/website/src/app/markdown/[[...path]]/route.ts` — single catch-all route handler; derives both its static params and its dispatch from the Content Registry, so it never needs editing either

**Adding markdown for a new page**: register it in the Content Registry (`apps/website/src/lib/content/registry.ts`). A Standalone Page backed by a standard `content.mdx` is one `mdxPage(slug)` call; a Collection needs an entry with `params` and a markdown generator built on the existing `apps/website/src/lib/content/` functions.

## Claude Code Plugins

The repository root is a Claude Code plugin marketplace, **`chicio-labs`** (`.claude-plugin/marketplace.json`), listing
the plugins in `claude-plugins/<name>/`. A **Public Plugin** (`glossary-browser`) works in any repository, carries a
semver `version` and is released by `release-plugin.yml`; a **Project Plugin** (`chicio-labs-sdlc`,
`website-content`) only works here and carries no version. Each description says which kind it is. Why plugins, and
what cannot move into one: [ADR-0002](claude-plugins/docs/adr/0002-claude-tooling-ships-as-plugins.md).

- **This repo loads them in place.** `.claude/settings.json` declares the marketplace with a `directory` source and
  enables all three at project scope, so an edit (or a `git pull`) takes effect after `/reload-plugins`, with no
  `claude plugin update`; the copies under `~/.claude/plugins/cache/` are install-time snapshots, never what runs.
  Anyone else adds `chicio/chicio-labs` from GitHub and gets a cached copy.
- **A fresh clone installs them on its first session.** Project settings only enable plugins, and Claude Code never
  installs them on a new machine, so a `SessionStart` hook (`.claude/hooks/install-project-plugins.mjs`) installs any
  enabled plugin missing for this checkout and asks for `/reload-plugins`; it is silent otherwise. One marketplace
  name is registered once per machine (`~/.claude/plugins/known_marketplaces.json`), so every checkout of this
  repository on a machine loads the plugins from the first one registered.
- **Everything is namespaced** `<plugin>:<name>`: `/chicio-labs-sdlc:sdlc`, `chicio-labs-sdlc:implementer`, the
  workflow `chicio-labs-sdlc:workflow`. Use the full name in `subagent_type`, `agentType` and `Workflow({ name })`.
- **A plugin agent's memory lives in `.claude/agent-memory/<plugin>-<agent>/`** (the colon becomes a dash), e.g.
  `chicio-labs-sdlc-implementer`; renaming a plugin or an agent means moving that folder.
- **Plugin agents ignore `permissionMode`, `mcpServers` and `hooks`.** MCP tools come from the project's `.mcp.json`
  and are granted by listing them under the agent's `tools`.
- **What stays in `.claude/`**: rules, settings, agent memory and the third-party skills, which `npx skills add <package>
--agent claude-code --copy` copies there (pinned by `skills-lock.json`). Plugins cannot carry rules, `CLAUDE.md` or
  permissions.

## Agentic SDLC Pipeline (code work)

Non-trivial **code** changes can be run through an orchestrated, multi-agent SDLC via the
`/chicio-labs-sdlc:sdlc` skill. The main thread explores and hosts the one Human Gate, where the plan is
approved together with its Work Unit Graph. Then the saved workflow `claude-plugins/chicio-labs-sdlc/workflows/workflow.js`
builds it Wave by Wave, parallel Work Units each in their own worktree, with bounded implement⇄review loops, the
Full Checks and an Integration Review. The main thread then opens the PR. The skill documents every stage, both modes
(feature and `--fix`), the agent roster and the checks; it loads on invocation, so that detail is not repeated here.
Its vocabulary is the Agentic Delivery context (`claude-plugins/GLOSSARY.md`), and why it is shaped this way is
`claude-plugins/docs/adr/0001-parallel-work-units-in-a-workflow.md`.

**When to use what**: full pipeline (`/chicio-labs-sdlc:sdlc`) for non-trivial code features/fixes; call
`chicio-labs-sdlc:implementer` **directly** as a quick-path escape hatch for trivial, well-specified code
changes; use `/website-content:write-post` for content (new Posts, translations, reviews, edits to the finished DSA course): it
interviews in the main thread and dispatches `website-content:writer` — the pipeline refuses content tasks.

## Commit Convention

- Scopes: `performance`, `ux`, `capabilities`, `content`, `ai`, `deps`
- Conventional commits with Gitmoji convention

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
