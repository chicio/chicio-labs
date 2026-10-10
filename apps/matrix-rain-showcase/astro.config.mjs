// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import typegpu from "unplugin-typegpu/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import mermaid from "astro-mermaid";

// Deployed to the monorepo's GitHub Pages site, beside the design-system showcase:
// https://labs.fabrizioduroni.it/matrix-rain/
// https://astro.build/config
export default defineConfig({
    site: "https://labs.fabrizioduroni.it",
    base: "/matrix-rain/",
    // Its own port, so it never races the Labs Hub (also an Astro app) for 4321 under `npm run dev`.
    server: { port: 4322 },
    markdown: {
        // Sätteri is Astro's default processor but parses math without rendering it and has no
        // external-link handling, so the docs' KaTeX and new-tab links need the unified processor.
        processor: unified({
            remarkPlugins: [remarkMath],
            // External (http) links open in a new tab — covers the GitHub source links
            // in the docs. Internal/relative links are untouched.
            rehypePlugins: [rehypeKatex, [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]],
        }),
    },
    integrations: [
        // Renders ```mermaid code blocks client-side (no build-time headless browser).
        // Must come before Starlight so it processes the markdown first.
        mermaid({ theme: "dark" }),
        starlight({
            title: "matrix-rain-webgpu",
            logo: { src: "./src/assets/logo.png", alt: "matrix-rain-webgpu" },
            favicon: "/favicon.ico",
            customCss: ["./src/styles/custom.css"],
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: "https://github.com/chicio/chicio-labs/tree/main/packages/matrix-rain-webgpu",
                },
                {
                    icon: "open-book",
                    label: "fabrizioduroni.it",
                    href: "https://www.fabrizioduroni.it",
                },
            ],
            sidebar: [
                // Persistent jump to the live demo — first thing in the sidebar on every page.
                // Navigates in the same tab so the playground's back button returns here.
                {
                    label: "Playground",
                    link: "/playground/",
                    badge: { text: "live", variant: "success" },
                },
                { label: "Overview", items: [{ autogenerate: { directory: "overview" } }] },
                { label: "Usage", items: [{ autogenerate: { directory: "usage" } }] },
                { label: "Architecture", items: [{ autogenerate: { directory: "architecture" } }] },
                { label: "How it works", items: [{ autogenerate: { directory: "how-it-works" } }] },
                { label: "Reference", items: [{ slug: "glossary" }] },
            ],
        }),
        react(),
    ],
    vite: {
        // unplugin-typegpu transforms the library's `'use gpu'` shader code (Babel).
        // Cast: root (Vite 8/rolldown) and docs (Vite 6/rollup) ship different Plugin
        // types; the plugin is duck-typed at runtime, so the cross-version cast is safe.
        plugins: [/** @type {any} */ (typegpu({}))],
        resolve: {
            // `@lib` → the library's source. It was `../src` when this app lived in the
            // library's own docs/ folder; the library is now a sibling workspace.
            alias: {
                "@lib": fileURLToPath(new URL("../../packages/matrix-rain-webgpu/src", import.meta.url)),
            },
            // The library source is compiled from another workspace, so its bare imports
            // could resolve to a different copy of typegpu/react than this app's island
            // uses. Two TypeGPU instances break the 'use gpu' registry; two Reacts break
            // the hooks dispatcher. Dedupe forces a single copy of each.
            dedupe: ["typegpu", "@typegpu/noise", "@typegpu/react", "react", "react-dom"],
        },
        server: {
            // A taken port fails the dev server instead of silently moving it to the next free one.
            strictPort: true,
            // The library source lives outside this app, in a sibling workspace.
            fs: { allow: ["../.."] },
        },
    },
});
