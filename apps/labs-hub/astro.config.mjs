// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Deployed at the root of the Chicio Labs GitHub Pages site, beside the two Showcases:
// https://labs.fabrizioduroni.it/
// https://astro.build/config
export default defineConfig({
    site: "https://labs.fabrizioduroni.it",
    base: "/",
    // `astro dev` applies "always" to the /docs-media/ endpoint too, and answers 404 to every image a rendered README
    // embeds: Astro exempts only routes whose file name carries a literal extension. The build is the same either way.
    trailingSlash: process.argv.includes("dev") ? "ignore" : "always",
    // Its own port, so it never races the Matrix Rain Showcase (also an Astro app) for 4321 under `npm run dev`.
    server: { port: 4321 },
    integrations: [react()],
    // The design system declares `--font-sans: "Open Sans"` and `--font-mono: "Courier Prime"` and ships
    // no font files, so these family names must stay exactly these for its components to pick them up.
    fonts: [
        {
            name: "Open Sans",
            cssVariable: "--font-open-sans",
            provider: fontProviders.google(),
            subsets: ["latin"],
            weights: ["300 800"],
            styles: ["normal"],
            display: "swap",
        },
        {
            name: "Courier Prime",
            cssVariable: "--font-courier-prime",
            provider: fontProviders.google(),
            subsets: ["latin"],
            weights: [400, 700],
            styles: ["normal"],
            display: "swap",
        },
    ],
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            // The design system and the rain it embeds are separate workspaces: a second copy of React breaks
            // the hooks dispatcher, a second TypeGPU breaks its 'use gpu' registry. One copy of each.
            dedupe: ["react", "react-dom", "framer-motion", "typegpu", "@typegpu/noise", "@typegpu/react"],
        },
        server: {
            // A taken port fails the dev server instead of silently moving it to the next free one.
            strictPort: true,
            fs: { allow: ["../.."] },
        },
    },
});
