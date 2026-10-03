import { HUB_URL } from "./repo";

export type LabProjectKind = "website" | "public-package" | "public-plugin" | "workbench";

/** Where a Lab Project's version, npm name and description are read from. `none` carries its own description. */
export type ManifestSource = { type: "package" } | { type: "plugin" } | { type: "none"; description: string };

export interface Showcase {
    label: string;
    url: string;
    /** The workspace that builds the Showcase, covered by this Lab Project in the completeness check. */
    sourcePath: string;
}

export interface LabProjectDefinition {
    id: string;
    name: string;
    kind: LabProjectKind;
    /** The repository path of the folder the Lab Project lives in. */
    sourcePath: string;
    manifest: ManifestSource;
    /** Absent: the page falls back to the manifest description. Present: the file must exist. */
    readme?: string;
    changelog?: string;
    glossaryContext?: string;
    showcase?: Showcase;
}

export interface GlossaryContextDefinition {
    id: string;
    name: string;
    glossary: string;
    adrDirectory?: string;
}

export const designSystemShowcase: Showcase = {
    label: "Design System Showcase",
    url: `${HUB_URL}/design-system/`,
    sourcePath: "apps/matrix-design-system-showcase",
};

export const matrixRainShowcase: Showcase = {
    label: "Matrix Rain Showcase",
    url: `${HUB_URL}/matrix-rain/`,
    sourcePath: "apps/matrix-rain-showcase",
};

export const labProjects: readonly LabProjectDefinition[] = [
    {
        id: "website",
        name: "Website",
        kind: "website",
        sourcePath: "apps/website",
        manifest: { type: "package" },
        readme: "apps/website/README.md",
        changelog: "CHANGELOG.md",
        glossaryContext: "website",
    },
    {
        id: "matrix-design-system",
        name: "Matrix Design System",
        kind: "public-package",
        sourcePath: "packages/matrix-design-system",
        manifest: { type: "package" },
        readme: "packages/matrix-design-system/README.md",
        changelog: "packages/matrix-design-system/CHANGELOG.md",
        glossaryContext: "matrix-design-system",
        showcase: designSystemShowcase,
    },
    {
        id: "matrix-component-store",
        name: "Matrix Component Store",
        kind: "public-package",
        sourcePath: "packages/matrix-component-store",
        manifest: { type: "package" },
        readme: "packages/matrix-component-store/README.md",
        glossaryContext: "matrix-design-system",
    },
    {
        id: "matrix-rain-webgpu",
        name: "Matrix Rain",
        kind: "public-package",
        sourcePath: "packages/matrix-rain-webgpu",
        manifest: { type: "package" },
        readme: "packages/matrix-rain-webgpu/README.md",
        changelog: "packages/matrix-rain-webgpu/CHANGELOG.md",
        glossaryContext: "matrix-rain",
        showcase: matrixRainShowcase,
    },
    {
        id: "glossary-browser",
        name: "Glossary Browser",
        kind: "public-plugin",
        sourcePath: "claude-plugins/glossary-browser",
        manifest: { type: "plugin" },
        readme: "claude-plugins/glossary-browser/README.md",
        changelog: "claude-plugins/glossary-browser/CHANGELOG.md",
    },
    {
        id: "chicio-labs-sdlc",
        name: "Chicio Labs SDLC",
        kind: "workbench",
        sourcePath: "claude-plugins/chicio-labs-sdlc",
        manifest: { type: "plugin" },
        readme: "claude-plugins/chicio-labs-sdlc/README.md",
        glossaryContext: "agentic-delivery",
    },
    {
        id: "website-content",
        name: "Website Content",
        kind: "workbench",
        sourcePath: "claude-plugins/website-content",
        manifest: { type: "plugin" },
        readme: "claude-plugins/website-content/README.md",
    },
    {
        id: "eslint-plugin-chicio",
        name: "ESLint Plugin Chicio",
        kind: "workbench",
        sourcePath: "packages/eslint-plugin-chicio",
        manifest: { type: "package" },
        glossaryContext: "matrix-design-system",
    },
    {
        id: "labs-hub",
        name: "Labs Hub",
        kind: "workbench",
        sourcePath: "apps/labs-hub",
        manifest: { type: "package" },
    },
    {
        id: "design-converter",
        name: "Claude Design converter",
        kind: "workbench",
        sourcePath: "packages/matrix-design-system/.design-sync",
        manifest: {
            type: "none",
            description:
                "Converts the design system's stories into a Claude Design project, so claude.ai/design works on the real components.",
        },
        readme: "packages/matrix-design-system/.design-sync/NOTES.md",
        glossaryContext: "matrix-design-system",
    },
];

export const glossaryContexts: readonly GlossaryContextDefinition[] = [
    {
        id: "website",
        name: "Website",
        glossary: "apps/website/GLOSSARY.md",
        adrDirectory: "apps/website/docs/adr",
    },
    {
        id: "matrix-design-system",
        name: "Matrix Design System",
        glossary: "packages/matrix-design-system/GLOSSARY.md",
        adrDirectory: "packages/matrix-design-system/docs/adr",
    },
    {
        id: "matrix-rain",
        name: "Matrix Rain",
        glossary: "packages/matrix-rain-webgpu/GLOSSARY.md",
    },
    {
        id: "agentic-delivery",
        name: "Agentic Delivery",
        glossary: "claude-plugins/GLOSSARY.md",
        adrDirectory: "claude-plugins/docs/adr",
    },
];

export const systemDocuments = {
    readme: "README.md",
    glossaryMap: "GLOSSARY-MAP.md",
    adrDirectory: "docs/adr",
} as const;
