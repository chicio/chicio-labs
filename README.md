# Chicio Labs

[![CI](https://github.com/chicio/chicio-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/chicio/chicio-labs/actions/workflows/ci.yml)
[![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/chicio/chicio-labs/blob/main/LICENSE.md)
[![Status](https://img.shields.io/badge/Status-Ok-green.svg)](https://stats.uptimerobot.com/H8Am1Ay0Vd)

[![Typecheck](https://img.shields.io/badge/Typecheck-tsc%20--noEmit-3178C6?logo=typescript&logoColor=white)](https://github.com/chicio/chicio-labs/actions/workflows/ci.yml)
[![Unit & Component](https://img.shields.io/badge/Unit%20%26%20Component-Vitest%20%2B%20RTL-6E9F18?logo=vitest&logoColor=white)](https://github.com/chicio/chicio-labs/actions/workflows/ci.yml)
[![E2E](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)](https://github.com/chicio/chicio-labs/actions/workflows/ci.yml)

Fabrizio Duroni's lab: the one repository where he experiments with code, AI and computer graphics, and from which
every Lab Project is published. Each one is presented on the **[Labs Hub](https://labs.fabrizioduroni.it/)**.

## Lab Projects

| Lab Project                                            | What it is                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [Website](apps/website)                                | [fabrizioduroni.it](https://www.fabrizioduroni.it): Posts, the DSA course, an AI chat, a terminal      |
| [Matrix Design System](packages/matrix-design-system)  | The framework-agnostic React design system → [Showcase](https://labs.fabrizioduroni.it/design-system/) |
| [Matrix Rain](packages/matrix-rain-webgpu)             | The WebGPU digital-rain effect → [Showcase](https://labs.fabrizioduroni.it/matrix-rain/)               |
| [Claude Code plugins](.claude-plugin/marketplace.json) | The `chicio-labs` marketplace: `/plugin marketplace add chicio/chicio-labs`                            |

![Chicio Labs](brand/readme-hero.jpg)

---

## Repository structure

npm workspaces, orchestrated by [Turborepo](https://turborepo.com).

| Workspace                                                                  | What it is                                                                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/website`](apps/website)                                             | The site: Next.js 16 App Router, MDX content, an AI chat, an in-page terminal and a few easter eggs                                               |
| [`packages/matrix-design-system`](packages/matrix-design-system)           | The design system, published to npm. Framework-agnostic React components plus their stylesheet                                                    |
| [`packages/matrix-component-store`](packages/matrix-component-store)       | The `ComponentStore` / `StateStore` / `EffectsStore` contract every component's store hook returns                                                |
| [`packages/eslint-plugin-chicio`](packages/eslint-plugin-chicio)           | The lint rules enforcing that contract, shared across the workspaces                                                                              |
| [`packages/matrix-rain-webgpu`](packages/matrix-rain-webgpu)               | The WebGPU/TypeGPU digital-rain effect, published to npm. Keeps its own toolchain (oxlint, Vite)                                                  |
| [`apps/matrix-design-system-showcase`](apps/matrix-design-system-showcase) | Storybook over the design system's stories → [`/design-system/`](https://labs.fabrizioduroni.it/design-system/)                                   |
| [`apps/matrix-rain-showcase`](apps/matrix-rain-showcase)                   | Astro docs and playground for the rain effect → [`/matrix-rain/`](https://labs.fabrizioduroni.it/matrix-rain/)                                    |
| [`apps/labs-hub`](apps/labs-hub)                                           | The Labs Hub: an Astro site presenting every Lab Project, with their docs generated from this repository → [`/`](https://labs.fabrizioduroni.it/) |

The website depends on the packages by version, and npm resolves that to the workspace copy — so the
site always builds against local source, while the packages stay publishable for anyone else.

### Published to npm

| Package                                                                          | Version                                                                                                             |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [`matrix-design-system`](https://www.npmjs.com/package/matrix-design-system)     | [![npm](https://img.shields.io/npm/v/matrix-design-system)](https://www.npmjs.com/package/matrix-design-system)     |
| [`matrix-rain-webgpu`](https://www.npmjs.com/package/matrix-rain-webgpu)         | [![npm](https://img.shields.io/npm/v/matrix-rain-webgpu)](https://www.npmjs.com/package/matrix-rain-webgpu)         |
| [`matrix-component-store`](https://www.npmjs.com/package/matrix-component-store) | [![npm](https://img.shields.io/npm/v/matrix-component-store)](https://www.npmjs.com/package/matrix-component-store) |

Each is released by hand from the [Release package](../../actions/workflows/release-package.yml)
workflow, authenticated by npm trusted publishing, so every version carries a provenance attestation.

## Development

Every command runs from the repository root and fans out across the workspaces through Turborepo.

```bash
npm install              # install every workspace
npm run dev              # dev server (also generates the search index and copies content images)
npm run build && npm start  # production build
npm run release          # release with conventional changelog
```

Quality gates, all of which run in CI:

```bash
npm run lint                   # ESLint (--max-warnings 0 in CI)
npm run knip                   # unused exports and dependencies
npm run typecheck              # tsc --noEmit across src, tests, e2e and config
npm run validate-architecture  # dependency-cruiser: layering, isolation, framework boundaries
npm run test:run               # Vitest: unit + component
npm run test:e2e               # Playwright, against a production build
npm run format                 # Prettier (4 spaces, 120 columns)
```

To run something in a single workspace:

```bash
npm run test:run --workspace=website
npm run build --workspace=matrix-design-system
```

## License

MIT © Fabrizio Duroni
