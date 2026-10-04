# Memory Index

## Site
- [Site Info](project_site_info.md) — Production domain is fabrizioduroni.it (not chicio.dev)

## Architecture
- [Content System](arch_content_system.md) — Filesystem-as-database with slug patterns, createSection ingestion of Collections/Standalone Pages, Content Registry, search indexing
- [Content Section Factory](arch_content_section_factory.md) — createSection() generic ingestion factory; gray-matter metadataAdapter passthrough gotcha (2026-07-24)
- [Design System & Matrix Theme](arch_design_system.md) — packages/matrix-design-system; Matrix Theme values, glassmorphism, Motion Preference Shared Store, hooks
- [Routes & Sections](arch_routes_sections.md) — Route map, page-scoped components under components/content/, legacy URL redirects
- [Next.js Config](arch_next_config.md) — apps/website/next.config.ts: MDX plugins, React Compiler, image optimization, redirects, release pipeline
- [Media Co-location & Public Static Media](arch_image_colocation.md) — all media under apps/website/public/media/ (content/ gitignored; video/, authors/, clowns/, PNGs flat at top level); copy-content-media.ts; 3 redirects; SelfHostedVideo molecule

## Integrations
- [Chat Feature](integration_chat.md) — Groq LLM + Knowledge Base (Upstash Vector) retrieval, streaming, knowledge upload; gpt-oss-120b migration 2026-08-15
- [Chat Guardrails](feature_chat_guardrails.md) — 3-layer Guardrail pipeline; gpt-oss-20b relevance check empty-completion fail-open fix (2026-08-15)
- [Contact & Rate Limiting](integration_contact_ratelimit.md) — Resend emails (CONTACT_EMAIL recipient), honeypot, Upstash Redis rate limiting

## Features
- [DSA Section](feature_dsa_section.md) — Routes, visualizers, topics/exercises createSection loading, navigation; content authoring owned by DSA agent
- [Chrome AI](feature_chrome_ai.md) — Chrome built-in Summarizer API on Post pages (chrome-ai-features-toolbar)
- [Easter Eggs](feature_easter_eggs.md) — six Easter Eggs, one shared video overlay, triggerEasterEgg() = Found; the Hunt page patterns
- [Videogames](feature_videogames.md) — Console and Game Collections with rich metadata and view switching
- [Copy Code Button](feature_copy_code_button.md) — Copy-to-clipboard on all MDX code blocks (features/mdx/code-block), key pitfalls (hydration, DOM vs React tree)
- [PWA](feature_pwa.md) — Serwist configurator mode, offline caching, install prompt, background sync; critical SW gotchas documented

## Features (continued)
- [Command Palette](feature_command_palette.md) — ⌘K palette (design-system organism + site-command-palette), MotionDiv blink suppression, stable close/ESC, search pill design

## Features (continued 2)
- [MCP Portfolio Server](feature_mcp_server.md) — Public MCP server at /api/mcp, 10 tools backed by createSection objects, stateless, OAuth discovery endpoint, /mcp page with 5 client cards
- [Mermaid Diagrams](feature_mermaid_diagrams.md) — MDX diagrams via ```mermaid blocks (features/mdx/mermaid-diagram), lazy singleton loader, Matrix Theme, no next/dynamic

## Features (continued 3)
- [Markdown Negotiation](feature_markdown_negotiation.md) — Accept: text/markdown → Markdown Representation via proxy.ts rewrite to app/markdown/[[...path]]/route.ts, driven by the Content Registry
- [Matrix Rain Control Panel](feature_matrix_rain_panel.md) — Command-palette drawer for live WebGPU rain tweaks; settings Shared Store, webGpuFailed as local useState (no Shared Store), fontSize commits on release only, 3 presets

## Infrastructure
- [CI Pipeline](project_ci_pipeline.md) — Nine jobs: 7 parallel gates (lint, format, knip, validate-architecture, typecheck, test, verify-packages) → build → e2e; ubuntu-latest; npm ci; turbo remote cache; concurrency cancel

## Architecture (continued)
- [Design System Purity](arch_design_system_purity.md) — history of the prop inversion (slugs/siteMetadata/tracking injected as props); now structural, the extracted package cannot import the Website at all

## Features (continued 4)
- [Testing Pyramid](feature_testing_pyramid.md) — Vitest+RTL+Playwright introduced PR #395; vi.hoisted() gotcha, react-dom pin, reactCompilerPreset v6 API, node/jsdom split, mock-per-test discipline

## Features (continued 5)
- [Chart Theme](feature_chart_theme.md) — shared chartTheme module in apps/website types/configuration; fixed-slot palette; recharts Legend labelStyle vs wrapperStyle gotcha

## Features (continued 6)
- [Blog Comments](feature_blog_comments.md) — giscus live widget (custom-element, lazy, full-replacement theme CSS) + static legacy Disqus archive; worktree .env gotcha

## Features (continued 7)
- [Terminal List Item](feature_terminal_list_item.md) — shared Presentational Component molecule (Terminal Chrome "> title" + dim description), used by SearchResultItem and Read Next
- [Blog Comments update](feature_blog_comments.md) — BlogComments now legitimately owns a store (simulated TerminalProgressBar until giscus postMessage), mount-start chosen over useInView
- [Terminal Button](design-system_terminal_button.md) — polymorphic link/action molecule (replaced the deleted TerminalLink 2026-07-18), used via its design-system-next Binding; post-card/console-card/egg-solution callers
- [Read Next Terminal Window](feature_read_next_terminal_window.md) — private client shell wraps Read Next in a command-palette-style Terminal Window; h2 base-layer override gotcha; e2e locator `../..`

## Features (continued 8)
- [Terminal Navigation](feature_terminal_navigation.md) — the Terminal: global full-screen overlay (evolved from windowed /terminal, 2026-07-23); open/cat in-shell render+popstate mirroring; AppRootBoundary inert; set-state-in-effect/KeyboardEvent-collision gotchas
- [mdxToMarkdown Sanitizer](feature_mdx_to_markdown_sanitizer.md) — pure lib/ MDX→markdown AST sanitizer behind the Markdown Representation (via contentBodyMarkdown); remark-math-before-remark-mdx ordering gotcha; flow-vs-text JSX classification rules

## Features (continued 9)
- [Markdown Generalization](feature_markdown_generalization.md) — markdownDocument/mdxPageMarkdown/contactMarkdown (2026-07-23); rehype-figure wraps images in figure not p; leading-H1 dedup for mcp/cookie-policy; art/cookie-policy MDX migrations (art gallery overrides since replaced by LightboxImage)
- [Terminal Navigation Part 2](feature_terminal_navigation.md) — sticky/shareable /terminal boot URL (REVERSED in Part 3); full markdown content coverage wiring
- [Konami/Spoon Easter Eggs](arch_easter_eggs_konami_spoon.md) — history of the Kung Fu/Spoon eggs (per-egg components since folded into the shared overlay + easter-egg-triggers); pure lib matchers still current; react-hooks/immutability needs useRef not useState for mutated DOM node props; set-state-in-effect fix; vi.hoisted/framer-motion mock gotchas; nested-worktree knip false positives; spoon moved to chat-input trigger + pending-activation drain fixes the dynamic-import mount race

## Features (continued 10)
- [Terminal Navigation Part 3](feature_terminal_navigation.md) — REVERSED Part 2: /terminal boot link/sticky URL removed entirely, palette-only in-place open, no URL change ever (2026-07-24)

## Features (continued 11)
- [DropdownMenu A11y & Grouping](arch_dropdown_menu_a11y.md) — groups-only nested-list, role=menu/aria-haspopup removed, Escape-to-refocus in store; the design system's base.css re-adds bulleted ul/li styling AFTER preflight (always check it), needs explicit list-none/role=list resets; panel height regressions masquerade as e2e cookie-banner flakiness; panel width unified to fixed xs:w-60/240px, real Playwright boundingBox assertions added (2026-07-31)

## Features (continued 12)
- [Console Startup](feature_console_startup_section.md) — the Startup on Console pages (10/11 Consoles) via existing Youtube molecule; fixed hardcoded iframe title bug; mdx-to-markdown already handled Youtube+ParagraphTitleWithIcon; search index never sees body text

## Bug Fixes
- [MCP GET SSE timeout fix](feature_mcp_get_sse_timeout_fix.md) — GET /api/mcp now 405s (stateless, no session for SSE notifications); fixed Vercel 300s hang loop (2026-08-15)

## Architecture (continued 2)
- [TypeScript 7 split](arch_typescript_7_split.md) — root TS6 / workspaces TS7 (rationale in AGENTS.md); tsc-file-arg+tsconfig TS5112 false-green gotcha in verify-packages.mjs (2026-09-08)

## Feedback
- [Review-fix workflow](feedback_review_fix_disk_and_reset_soft.md) — git reset --soft path-restaging to reshape commits; disk-full is often transient (retry, don't clean system caches); e2e hangs on a long-lived ad hoc port are stale-server artifacts, not regressions — verify with a fresh port + origin/main control
- [PWA & State Patterns](feedback_pwa_patterns.md) — useSyncExternalStore for localStorage-backed Shared Stores, consent-gated UI, banner/error page alignment rules
- [Worktree git stash hazard](feedback_worktree_git_stash_hazard.md) — never `git stash` inside a pipeline worktree, refs/stash is shared across all worktrees
- [Prettier CLI 2-space regression](feature_markdown_generalization.md) — RESOLVED: .prettierrc now sets tabWidth 4/printWidth 120, `npm run format`/`format:check` exist and CI gates on them; the old "never run prettier" advice is obsolete
- [Registry dep breaks cmdk mocks](feedback_registry_dep_vitest_mock_externalization.md) — website on registry matrix-design-system: 28 palette tests fail unless vitest inlines it
- [Videogames content in MDX](feature_videogames_content_in_mdx.md) — ADR-0002 on Games/Consoles: body carousel + info slots, no gallery; conversion gotchas (2026-09-29)

## Features (continued 13)
- [Labs Hub](feature_labs_hub.md) — apps/labs-hub Astro 7 build gotchas (cookie pin, hashed font names, turbo inputs), registry/docs pipeline, deploy wiring (2026-10-03)
- [Labs Catalog](feature_labs_catalog.md) — packages/labs-catalog, Brand Kits, hub completeness forces a registry entry, Storybook favicon recipe (2026-10-04)
