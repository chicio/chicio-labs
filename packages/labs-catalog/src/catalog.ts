import type { LabProject, StandaloneProject } from "./types";

const HUB_URL = "https://labs.fabrizioduroni.it";
const REPOSITORY_URL = "https://github.com/chicio/chicio-labs";

const docsUrl = (id: string): string => `${HUB_URL}/lab/${id}/`;
const sourceUrl = (sourcePath: string): string => `${REPOSITORY_URL}/tree/main/${sourcePath}`;
const npmUrl = (packageName: string): string => `https://www.npmjs.com/package/${packageName}`;

export const labProjects: readonly LabProject[] = [
    {
        id: "website",
        name: "Website",
        kind: "website",
        type: "Web app",
        sourcePath: "apps/website",
        description:
            "The Matrix-inspired Next.js site behind fabrizioduroni.it: Posts, a DSA course, an AI chat and a Terminal.",
        links: {
            docs: docsUrl("website"),
            visit: "https://www.fabrizioduroni.it",
            source: sourceUrl("apps/website"),
        },
        cardImage: "featured/featured-horizontal.jpg",
    },
    {
        id: "matrix-design-system",
        name: "Matrix Design System",
        kind: "public-package",
        type: "npm package",
        sourcePath: "packages/matrix-design-system",
        description:
            "A Matrix-inspired React design system: green on near-black, terminal-flavoured, framework-agnostic.",
        links: {
            docs: docsUrl("matrix-design-system"),
            showcase: `${HUB_URL}/design-system/`,
            npm: npmUrl("matrix-design-system"),
            source: sourceUrl("packages/matrix-design-system"),
        },
        cardImage: "logo.png",
    },
    {
        id: "matrix-component-store",
        name: "Matrix Component Store",
        kind: "public-package",
        type: "npm package",
        sourcePath: "packages/matrix-component-store",
        description:
            "The component-store contract: the return shape a React component's store hook exposes to its component.",
        links: {
            docs: docsUrl("matrix-component-store"),
            npm: npmUrl("matrix-component-store"),
            source: sourceUrl("packages/matrix-component-store"),
        },
        cardImage: "monorepo-npm-workspaces-turborepo.jpg",
    },
    {
        id: "matrix-rain-webgpu",
        name: "Matrix Rain",
        kind: "public-package",
        type: "npm package",
        sourcePath: "packages/matrix-rain-webgpu",
        description:
            "A GPU-accelerated Matrix digital rain effect for React, built with WebGPU and TypeGPU, with a 2D canvas fallback.",
        links: {
            docs: docsUrl("matrix-rain-webgpu"),
            showcase: `${HUB_URL}/matrix-rain/`,
            npm: npmUrl("matrix-rain-webgpu"),
            source: sourceUrl("packages/matrix-rain-webgpu"),
        },
        cardImage: "matrix-rain-webgpu.png",
    },
    {
        id: "glossary-browser",
        name: "Glossary Browser",
        kind: "public-plugin",
        type: "Claude Code plugin",
        sourcePath: "claude-plugins/glossary-browser",
        description:
            "Browse a repository's ubiquitous language in a band above the prompt, and steer you and the model away from its Avoid words.",
        links: {
            docs: docsUrl("glossary-browser"),
            source: sourceUrl("claude-plugins/glossary-browser"),
        },
        cardImage: "claude-code-mods-glossary-browser.jpg",
    },
    {
        id: "image-peek",
        name: "Image Peek",
        kind: "public-plugin",
        type: "Claude Code plugin",
        sourcePath: "claude-plugins/image-peek",
        description:
            "See the images you paste into Claude Code: a thumbnail above the prompt for each one, and a button to open it full size in Quick Look.",
        links: {
            docs: docsUrl("image-peek"),
            source: sourceUrl("claude-plugins/image-peek"),
        },
        cardImage: "image-peek.jpg",
    },
    {
        id: "chicio-labs-sdlc",
        name: "Chicio Labs SDLC",
        kind: "workbench",
        type: "Claude Code skills",
        sourcePath: "claude-plugins/chicio-labs-sdlc",
        description:
            "The agentic SDLC pipeline behind this repository: explore, Human Gate, parallel Work Units, reviews and a pull request.",
        links: {
            docs: docsUrl("chicio-labs-sdlc"),
            source: sourceUrl("claude-plugins/chicio-labs-sdlc"),
        },
    },
    {
        id: "website-content",
        name: "Website Content",
        kind: "workbench",
        type: "Claude Code skills",
        sourcePath: "claude-plugins/website-content",
        description: "Writes Posts in Fabrizio Duroni's voice and adds Manga and Games to the Website's collections.",
        links: {
            docs: docsUrl("website-content"),
            source: sourceUrl("claude-plugins/website-content"),
        },
    },
    {
        id: "eslint-plugin-chicio",
        name: "ESLint Plugin Chicio",
        kind: "workbench",
        type: "Developer tool",
        sourcePath: "packages/eslint-plugin-chicio",
        description: "The component-store architecture rules, shared by every workspace that holds components.",
        links: {
            docs: docsUrl("eslint-plugin-chicio"),
            source: sourceUrl("packages/eslint-plugin-chicio"),
        },
    },
    {
        id: "labs-hub",
        name: "Labs Hub",
        kind: "workbench",
        type: "Web app",
        sourcePath: "apps/labs-hub",
        description:
            "The site that presents every Lab Project, with docs generated at build time from files already in the repository.",
        links: {
            docs: docsUrl("labs-hub"),
            source: sourceUrl("apps/labs-hub"),
        },
    },
    {
        id: "labs-catalog",
        name: "Labs Catalog",
        kind: "workbench",
        type: "Developer tool",
        sourcePath: "packages/labs-catalog",
        description:
            "The public facts about every Lab Project and Standalone Project, shared by the Labs Hub and the Website.",
        links: {
            docs: docsUrl("labs-catalog"),
            source: sourceUrl("packages/labs-catalog"),
        },
    },
];

export const standaloneProjects: readonly StandaloneProject[] = [
    {
        id: "react-native-skia-skeleton",
        name: "React Native Skia Skeleton",
        type: "iOS / mobile",
        meta: "React Native",
        description:
            "A high-performance skeleton loader component for React Native, built with React Native Skia and React Native Reanimated.",
        links: { github: "https://github.com/chicio/react-native-skia-skeleton" },
        cardImage: "react-native-skia-skeleton.png",
    },
    {
        id: "spectral-clara-lux-tracer",
        name: "Spectral Clara Lux Tracer",
        type: "Computer graphics",
        meta: "C++",
        description:
            "Physically based ray tracer with multiple shading models support and Color Rendering Index (CRI) evaluation.",
        links: {
            github: "https://github.com/chicio/Spectral-Clara-Lux-Tracer",
            thesis: "https://www.fabrizioduroni.it/tesi-fabrizio-duroni-770157.pdf",
        },
        cardImage: "spectral-clara-lux-tracer.jpg",
    },
    {
        id: "spectral-brdf-explorer",
        name: "Spectral BRDF Explorer",
        type: "Computer graphics",
        meta: "OpenGL ES",
        description: "An iOS OpenGL ES app for exploring lighting models.",
        links: { github: "https://github.com/chicio/Spectral-BRDF-Explorer" },
        cardImage: "spectral-brdf-explorer.png",
    },
    {
        id: "id3tageditor",
        name: "ID3TagEditor",
        type: "iOS / mobile",
        meta: "Swift",
        description: "A Swift library to edit ID3 Tag of any mp3 file.",
        links: {
            github: "https://github.com/chicio/ID3TagEditor",
            docs: "https://chicio.github.io/ID3TagEditor/documentation/id3tageditor/",
        },
        cardImage: "id3tageditor.jpg",
    },
    {
        id: "range-ui-slider",
        name: "RangeUISlider",
        type: "iOS / mobile",
        meta: "Swift",
        description: "A RangeUISlider component for iOS and iPadOS.",
        links: {
            github: "https://github.com/chicio/RangeUISlider",
            docs: "https://chicio.github.io/RangeUISlider/",
        },
        cardImage: "range-ui-slider.png",
    },
    {
        id: "tabbaruiaction",
        name: "TabBarUIAction",
        type: "iOS / mobile",
        meta: "SwiftUI",
        description: "A SwiftUI custom TabBar for iOS and macOS.",
        links: {
            github: "https://github.com/chicio/TabBarUIAction",
            docs: "https://chicio.github.io/TabBarUIAction/",
        },
        cardImage: "tabbaruiaction.png",
    },
    {
        id: "mp3id3tagger",
        name: "Mp3ID3Tagger",
        type: "Native app",
        meta: "macOS",
        description: "A macOS application to edit the ID3 tag of your mp3 files.",
        links: {
            github: "https://github.com/chicio/Mp3ID3Tagger",
            download: "https://github.com/chicio/Mp3ID3Tagger/raw/master/Release/Mp3ID3Tagger.dmg",
        },
        cardImage: "mp3id3tagger.jpg",
    },
];
