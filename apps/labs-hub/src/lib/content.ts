import { assertComplete, checkCompleteness, discoverLabProjectSources } from "./completeness";
import { parseFrontmatterEntry } from "./frontmatter";
import type { LinkContext } from "./links";
import { extractLead, extractTitle, renderMarkdown } from "./markdown";
import {
    glossaryContexts,
    labProjects,
    systemDocuments,
    type GlossaryContextDefinition,
    type LabProjectDefinition,
    type LabProjectKind,
    type Showcase,
} from "./registry";
import {
    REPOSITORY_URL,
    findRepoRoot,
    isRepoDirectory,
    listRepoDirectory,
    readRepoFile,
    readRepoJson,
    repoFileExists,
} from "./repo";

export interface HubDocument {
    title: string;
    html: string;
    sourcePath: string;
}

export interface PluginPart {
    name: string;
    description: string;
}

export interface AdrDocument extends HubDocument {
    number: string;
    url: string;
}

export interface LabProject {
    id: string;
    name: string;
    kind: LabProjectKind;
    url: string;
    changelogUrl?: string;
    packageName?: string;
    version?: string;
    description: string;
    sourceUrl: string;
    readme?: HubDocument;
    changelog?: HubDocument;
    glossaryContext?: { id: string; name: string; url: string };
    showcase?: Showcase;
    agents: PluginPart[];
    skills: PluginPart[];
}

export interface GlossaryContext {
    id: string;
    name: string;
    url: string;
    glossary: HubDocument;
    adrs: AdrDocument[];
    projects: { id: string; name: string; url: string }[];
}

export interface SystemDocuments {
    readme: HubDocument;
    glossaryMap: HubDocument;
    adrs: AdrDocument[];
}

export interface HubContent {
    projects: LabProject[];
    contexts: GlossaryContext[];
    system: SystemDocuments;
    /** Repository paths of the images the documents embed: the hub serves them itself. */
    mediaPaths: string[];
}

interface Manifest {
    name?: string;
    version?: string;
    description?: string;
}

const adrFilePattern = /^(\d{4})-.+\.md$/;
const pluginPrefixPattern = /^(?:Public|Project) Plugin(?:, Chicio Labs only)?\.\s*/;

export const labUrl = (id: string): string => `/lab/${id}/`;
export const changelogUrl = (id: string): string => `/lab/${id}/changelog/`;
export const glossaryUrl = (contextId: string): string => `/glossary/${contextId}/`;
export const glossaryAdrUrl = (contextId: string, number: string): string => `/glossary/${contextId}/adr/${number}/`;
export const systemUrl = "/chicio-labs/";
export const systemAdrUrl = (number: string): string => `/chicio-labs/adr/${number}/`;

const adrPaths = (root: string, directory: string): { number: string; path: string }[] =>
    listRepoDirectory(root, directory).flatMap((file) => {
        const number = adrFilePattern.exec(file)?.[1];

        return number === undefined ? [] : [{ number, path: `${directory}/${file}` }];
    });

const manifestPath = (project: LabProjectDefinition): string | undefined => {
    switch (project.manifest.type) {
        case "package":
            return `${project.sourcePath}/package.json`;
        case "plugin":
            return `${project.sourcePath}/.claude-plugin/plugin.json`;
        case "none":
            return undefined;
    }
};

const readManifest = (root: string, project: LabProjectDefinition): Manifest => {
    const manifestFile = manifestPath(project);

    return manifestFile === undefined ? {} : readRepoJson<Manifest>(root, manifestFile);
};

/**
 * What a Project Card says about a Lab Project: the manifest description (or the one the registry carries when there
 * is no manifest), else the lead paragraph of its README, for a package that declares no description of its own.
 */
export const describeProject = (project: LabProjectDefinition, manifest: Manifest, readme?: string): string => {
    const declared =
        project.manifest.type === "none" ? project.manifest.description : (manifest.description ?? "").trim();
    const description = declared === "" && readme !== undefined ? extractLead(readme) : declared;

    return description.replace(pluginPrefixPattern, "");
};

const buildPageMap = (root: string, registry: readonly LabProjectDefinition[]): Map<string, string> => {
    const pages = new Map<string, string>();

    for (const project of registry) {
        if (project.readme) {
            pages.set(project.readme, labUrl(project.id));
        }

        if (project.changelog) {
            pages.set(project.changelog, changelogUrl(project.id));
        }
    }

    for (const context of glossaryContexts) {
        pages.set(context.glossary, glossaryUrl(context.id));

        if (context.adrDirectory) {
            for (const adr of adrPaths(root, context.adrDirectory)) {
                pages.set(adr.path, glossaryAdrUrl(context.id, adr.number));
            }
        }
    }

    pages.set(systemDocuments.readme, systemUrl);
    pages.set(systemDocuments.glossaryMap, `${systemUrl}#glossary-map`);

    for (const adr of adrPaths(root, systemDocuments.adrDirectory)) {
        pages.set(adr.path, systemAdrUrl(adr.number));
    }

    return pages;
};

const listParts = (
    root: string,
    pluginName: string,
    directory: string,
    fileFor: (entry: string) => string,
): PluginPart[] =>
    listRepoDirectory(root, directory).flatMap((entry) => {
        const file = fileFor(entry);

        if (!repoFileExists(root, file)) {
            return [];
        }

        const parsed = parseFrontmatterEntry(readRepoFile(root, file), entry.replace(/\.md$/, ""));

        return [{ name: `${pluginName}:${parsed.name}`, description: parsed.description }];
    });

const buildContent = async (
    root: string,
    registry: readonly LabProjectDefinition[] = labProjects,
): Promise<HubContent> => {
    assertComplete(checkCompleteness(registry, discoverLabProjectSources(root)));

    const media = new Set<string>();
    const context: LinkContext = {
        pages: buildPageMap(root, registry),
        isDirectory: (repoPath) => isRepoDirectory(root, repoPath),
    };

    const document = async (sourcePath: string): Promise<HubDocument> => {
        if (!repoFileExists(root, sourcePath)) {
            throw new Error(`The Labs Hub registry names ${sourcePath}, which does not exist`);
        }

        const markdown = readRepoFile(root, sourcePath);

        return {
            sourcePath,
            title: extractTitle(markdown, sourcePath),
            html: await renderMarkdown(markdown, {
                sourcePath,
                links: context,
                onLocalImage: (repoPath) => media.add(repoPath),
            }),
        };
    };

    const adrDocuments = async (
        directory: string | undefined,
        urlFor: (number: string) => string,
    ): Promise<AdrDocument[]> => {
        const adrs: AdrDocument[] = [];

        for (const adr of directory ? adrPaths(root, directory) : []) {
            adrs.push({ ...(await document(adr.path)), number: adr.number, url: urlFor(adr.number) });
        }

        return adrs;
    };

    const contextNames = new Map<string, GlossaryContextDefinition>(
        glossaryContexts.map((definition) => [definition.id, definition]),
    );

    const projects: LabProject[] = [];

    for (const definition of registry) {
        const manifest = readManifest(root, definition);
        const readme =
            definition.readme && repoFileExists(root, definition.readme)
                ? readRepoFile(root, definition.readme)
                : undefined;
        const description = describeProject(definition, manifest, readme);

        if (description === "") {
            throw new Error(
                `${definition.id} has no description to present: its manifest declares none and it has no README lead paragraph`,
            );
        }

        const glossaryContext = definition.glossaryContext ? contextNames.get(definition.glossaryContext) : undefined;

        if (definition.glossaryContext && !glossaryContext) {
            throw new Error(`${definition.id} names the unknown glossary context ${definition.glossaryContext}`);
        }

        const isPlugin = definition.manifest.type === "plugin";

        projects.push({
            id: definition.id,
            name: definition.name,
            kind: definition.kind,
            url: labUrl(definition.id),
            changelogUrl: definition.changelog ? changelogUrl(definition.id) : undefined,
            packageName: definition.manifest.type === "package" ? manifest.name : undefined,
            version: definition.versionManifest
                ? readRepoJson<Manifest>(root, definition.versionManifest).version
                : manifest.version,
            description,
            sourceUrl: `${REPOSITORY_URL}/tree/main/${definition.sourcePath}`,
            readme: definition.readme ? await document(definition.readme) : undefined,
            changelog: definition.changelog ? await document(definition.changelog) : undefined,
            glossaryContext: glossaryContext && {
                id: glossaryContext.id,
                name: glossaryContext.name,
                url: glossaryUrl(glossaryContext.id),
            },
            showcase: definition.showcase,
            agents: isPlugin
                ? listParts(
                      root,
                      manifest.name ?? definition.id,
                      `${definition.sourcePath}/agents`,
                      (entry) => `${definition.sourcePath}/agents/${entry}`,
                  )
                : [],
            skills: isPlugin
                ? listParts(
                      root,
                      manifest.name ?? definition.id,
                      `${definition.sourcePath}/skills`,
                      (entry) => `${definition.sourcePath}/skills/${entry}/SKILL.md`,
                  )
                : [],
        });
    }

    const contexts: GlossaryContext[] = [];

    for (const definition of glossaryContexts) {
        contexts.push({
            id: definition.id,
            name: definition.name,
            url: glossaryUrl(definition.id),
            glossary: await document(definition.glossary),
            adrs: await adrDocuments(definition.adrDirectory, (number) => glossaryAdrUrl(definition.id, number)),
            projects: projects
                .filter((project) => project.glossaryContext?.id === definition.id)
                .map(({ id, name, url }) => ({ id, name, url })),
        });
    }

    return {
        projects,
        contexts,
        system: {
            readme: await document(systemDocuments.readme),
            glossaryMap: await document(systemDocuments.glossaryMap),
            adrs: await adrDocuments(systemDocuments.adrDirectory, systemAdrUrl),
        },
        mediaPaths: [...media].sort(),
    };
};

let cached: Promise<HubContent> | undefined;

/** Reads and renders every document of the repository once per build. */
export const loadHubContent = (): Promise<HubContent> => {
    cached ??= buildContent(findRepoRoot());

    return cached;
};

export const loadHubContentFrom = (
    root: string,
    registry: readonly LabProjectDefinition[] = labProjects,
): Promise<HubContent> => buildContent(root, registry);
