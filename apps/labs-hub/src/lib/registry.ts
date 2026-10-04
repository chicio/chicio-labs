import { HUB_URL } from "./repo";

/** Where a Lab Project's version and npm name are read from. `none`: it is not a workspace or a plugin. */
export type ManifestSource = { type: "package" } | { type: "plugin" } | { type: "none" };

export interface Showcase {
    label: string;
    url: string;
    /** The workspace that builds the Showcase, covered by this Lab Project in the completeness check. */
    sourcePath: string;
}

/**
 * What the hub needs to render a Lab Project's documentation. The public facts (name, kind, type, description, links
 * and card image) live in `labs-catalog`, keyed by the same id.
 */
export interface LabProjectDefinition {
    id: string;
    /** The repository path of the folder the Lab Project lives in. */
    sourcePath: string;
    manifest: ManifestSource;
    /** Where the version lives when it is not in the manifest above: the Website is versioned from the root. */
    versionManifest?: string;
    /** Absent: the page shows the catalog description. Present: the file must exist. */
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
        sourcePath: "apps/website",
        manifest: { type: "package" },
        versionManifest: "package.json",
        readme: "apps/website/README.md",
        changelog: "CHANGELOG.md",
        glossaryContext: "website",
    },
    {
        id: "matrix-design-system",
        sourcePath: "packages/matrix-design-system",
        manifest: { type: "package" },
        readme: "packages/matrix-design-system/README.md",
        changelog: "packages/matrix-design-system/CHANGELOG.md",
        glossaryContext: "matrix-design-system",
        showcase: designSystemShowcase,
    },
    {
        id: "matrix-component-store",
        sourcePath: "packages/matrix-component-store",
        manifest: { type: "package" },
        readme: "packages/matrix-component-store/README.md",
        glossaryContext: "matrix-design-system",
    },
    {
        id: "matrix-rain-webgpu",
        sourcePath: "packages/matrix-rain-webgpu",
        manifest: { type: "package" },
        readme: "packages/matrix-rain-webgpu/README.md",
        changelog: "packages/matrix-rain-webgpu/CHANGELOG.md",
        glossaryContext: "matrix-rain",
        showcase: matrixRainShowcase,
    },
    {
        id: "glossary-browser",
        sourcePath: "claude-plugins/glossary-browser",
        manifest: { type: "plugin" },
        readme: "claude-plugins/glossary-browser/README.md",
        changelog: "claude-plugins/glossary-browser/CHANGELOG.md",
    },
    {
        id: "image-peek",
        sourcePath: "claude-plugins/image-peek",
        manifest: { type: "plugin" },
        readme: "claude-plugins/image-peek/README.md",
        changelog: "claude-plugins/image-peek/CHANGELOG.md",
    },
    {
        id: "chicio-labs-sdlc",
        sourcePath: "claude-plugins/chicio-labs-sdlc",
        manifest: { type: "plugin" },
        readme: "claude-plugins/chicio-labs-sdlc/README.md",
        glossaryContext: "agentic-delivery",
    },
    {
        id: "website-content",
        sourcePath: "claude-plugins/website-content",
        manifest: { type: "plugin" },
        readme: "claude-plugins/website-content/README.md",
    },
    {
        id: "eslint-plugin-chicio",
        sourcePath: "packages/eslint-plugin-chicio",
        manifest: { type: "package" },
        glossaryContext: "matrix-design-system",
    },
    {
        id: "labs-hub",
        sourcePath: "apps/labs-hub",
        manifest: { type: "package" },
    },
    {
        id: "labs-catalog",
        sourcePath: "packages/labs-catalog",
        manifest: { type: "package" },
        readme: "packages/labs-catalog/README.md",
    },
    {
        id: "design-converter",
        sourcePath: "packages/matrix-design-system/.design-sync",
        manifest: { type: "none" },
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
