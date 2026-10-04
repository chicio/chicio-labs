import { listRepoDirectory, readRepoJson, repoFileExists } from "./repo";
import type { LabProjectDefinition } from "./registry";

export interface CompletenessReport {
    /** Workspaces and plugins that exist in the repository but no Lab Project covers. */
    missing: string[];
    /** Registered source paths that match no workspace or plugin. */
    extra: string[];
}

/**
 * A Lab Project covers its own source path and, when it has one, its Showcase's. Projects whose manifest is `none`
 * (the Claude Design converter) are not a workspace or a plugin, so they cannot be checked against the repository.
 */
export const checkCompleteness = (
    projects: readonly LabProjectDefinition[],
    discoveredPaths: readonly string[],
): CompletenessReport => {
    const covered = new Set<string>();

    for (const project of projects) {
        if (project.manifest.type !== "none") {
            covered.add(project.sourcePath);
        }

        if (project.showcase) {
            covered.add(project.showcase.sourcePath);
        }
    }

    const discovered = new Set(discoveredPaths);

    return {
        missing: discoveredPaths.filter((discoveredPath) => !covered.has(discoveredPath)).sort(),
        extra: [...covered].filter((coveredPath) => !discovered.has(coveredPath)).sort(),
    };
};

/** What the hub reads of a Lab Project in `labs-catalog`: its id, where it lives and its Showcase, if any. */
export interface CatalogLabProject {
    id: string;
    sourcePath: string;
    links: { showcase?: string };
}

/**
 * The registry holds the documentation wiring and `labs-catalog` the public facts of the same Lab Projects, so they
 * must name exactly the same ones, in the same place, and agree on the Showcase. Returns one sentence per mismatch.
 */
export const checkCatalogAlignment = (
    registry: readonly LabProjectDefinition[],
    catalog: readonly CatalogLabProject[],
): string[] => {
    const registered = new Map(registry.map((project) => [project.id, project]));
    const cataloged = new Map(catalog.map((project) => [project.id, project]));
    const problems: string[] = [];

    for (const project of registry) {
        const entry = cataloged.get(project.id);

        if (!entry) {
            problems.push(`${project.id} is in the Labs Hub registry but not in labs-catalog`);
            continue;
        }

        if (entry.sourcePath !== project.sourcePath) {
            problems.push(
                `${project.id} lives at ${project.sourcePath} in the Labs Hub registry but at ${entry.sourcePath} in labs-catalog`,
            );
        }

        if (entry.links.showcase !== project.showcase?.url) {
            problems.push(`${project.id} has a different Showcase in the Labs Hub registry and in labs-catalog`);
        }
    }

    for (const entry of catalog) {
        if (!registered.has(entry.id)) {
            problems.push(`${entry.id} is in labs-catalog but not in the Labs Hub registry`);
        }
    }

    return problems;
};

export const assertCatalogAligned = (problems: readonly string[]): void => {
    if (problems.length > 0) {
        throw new Error(
            `The Labs Hub registry is out of step with labs-catalog:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
        );
    }
};

const workspacePatterns = (root: string): string[] => {
    const manifest = readRepoJson<{ workspaces?: string[] }>(root, "package.json");

    return manifest.workspaces ?? [];
};

/** The workspace folders: every direct child holding a package.json of each `<dir>/*` pattern in the root manifest. */
export const discoverWorkspaces = (root: string): string[] =>
    workspacePatterns(root).flatMap((pattern) => {
        if (!pattern.endsWith("/*")) {
            return repoFileExists(root, `${pattern}/package.json`) ? [pattern] : [];
        }

        const parent = pattern.slice(0, -2);

        return listRepoDirectory(root, parent)
            .map((child) => `${parent}/${child}`)
            .filter((candidate) => repoFileExists(root, `${candidate}/package.json`));
    });

export const discoverPlugins = (root: string): string[] =>
    listRepoDirectory(root, "claude-plugins")
        .map((child) => `claude-plugins/${child}`)
        .filter((candidate) => repoFileExists(root, `${candidate}/.claude-plugin/plugin.json`));

export const discoverLabProjectSources = (root: string): string[] => [
    ...discoverWorkspaces(root),
    ...discoverPlugins(root),
];

export const assertComplete = (report: CompletenessReport): void => {
    if (report.missing.length === 0 && report.extra.length === 0) {
        return;
    }

    const lines = [
        ...report.missing.map((source) => `  - ${source} exists but no Lab Project covers it`),
        ...report.extra.map((source) => `  - ${source} is registered but is neither a workspace nor a plugin`),
    ];

    throw new Error(`The Labs Hub registry is out of step with the repository:\n${lines.join("\n")}`);
};
