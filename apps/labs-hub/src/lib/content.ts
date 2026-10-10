import {
    cardImagePath,
    labProjects as catalogLabProjects,
    type LabProject as CatalogLabProject,
    type LabProjectKind,
    type LabProjectLinks,
} from "labs-catalog";
import { parseChangelog, type ChangelogRelease } from "./changelog";
import {
    assertCatalogAligned,
    assertComplete,
    checkCatalogAlignment,
    checkCompleteness,
    discoverLabProjectSources,
} from "./completeness";
import { rewriteLink, type LinkContext } from "./links";
import { extractTitle, renderMarkdown } from "./markdown";
import {
    glossaryContexts,
    labProjects,
    systemDocuments,
    type GlossaryContextDefinition,
    type LabProjectDefinition,
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

export interface AdrDocument extends HubDocument {
    number: string;
    url: string;
}

export interface ChangelogDocument extends HubDocument {
    /** Empty when the CHANGELOG is not in conventional-changelog format: the page then renders `html`. */
    releases: ChangelogRelease[];
    /** The CHANGELOG file on GitHub. */
    fileUrl: string;
}

export interface LabProject {
    id: string;
    name: string;
    kind: LabProjectKind;
    /** What sort of thing it is, as its card says. */
    type: string;
    url: string;
    changelogUrl?: string;
    version?: string;
    description: string;
    sourcePath: string;
    sourceUrl: string;
    /** The outward links the catalog knows: the live site, its Showcase, npm and the source. Docs are the hub itself. */
    links: Omit<LabProjectLinks, "docs">;
    readme?: HubDocument;
    changelog?: ChangelogDocument;
    glossaryContext?: { id: string; name: string; url: string };
    showcase?: Showcase;
    /** Where `labs-catalog` serves the card image from, relative to the package; absent: no image. */
    cardImage?: string;
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
}

const adrFilePattern = /^(\d{4})-.+\.md$/;

export const labUrl = (id: string): string => `/lab/${id}/`;
export const changelogUrl = (id: string): string => `/lab/${id}/changelog/`;
export const glossaryUrl = (contextId: string): string => `/glossary/${contextId}/`;
export const glossaryAdrUrl = (contextId: string, number: string): string => `/glossary/${contextId}/adr/${number}/`;
export const systemUrl = "/glossary/chicio-labs/";
export const systemAdrUrl = (number: string): string => `/glossary/chicio-labs/adr/${number}/`;

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
    }
};

const readManifest = (root: string, project: LabProjectDefinition): Manifest => {
    const manifestFile = manifestPath(project);

    return manifestFile === undefined ? {} : readRepoJson<Manifest>(root, manifestFile);
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

    pages.set(systemDocuments.readme, "/");
    pages.set(systemDocuments.glossaryMap, systemUrl);

    for (const adr of adrPaths(root, systemDocuments.adrDirectory)) {
        pages.set(adr.path, systemAdrUrl(adr.number));
    }

    return pages;
};

const buildContent = async (
    root: string,
    registry: readonly LabProjectDefinition[] = labProjects,
    catalog: readonly CatalogLabProject[] = catalogLabProjects,
): Promise<HubContent> => {
    assertComplete(checkCompleteness(registry, discoverLabProjectSources(root)));
    assertCatalogAligned(checkCatalogAlignment(registry, catalog));

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

    const changelogDocument = async (sourcePath: string): Promise<ChangelogDocument> => ({
        ...(await document(sourcePath)),
        releases: parseChangelog(readRepoFile(root, sourcePath), {
            resolveUrl: (href) => rewriteLink(sourcePath, href, context).href,
        }),
        fileUrl: `${REPOSITORY_URL}/blob/main/${sourcePath}`,
    });

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
    const definitions = new Map(registry.map((definition) => [definition.id, definition]));

    const projects: LabProject[] = [];

    for (const entry of catalog) {
        const definition = definitions.get(entry.id) as LabProjectDefinition;
        const manifest = readManifest(root, definition);
        const glossaryContext = definition.glossaryContext ? contextNames.get(definition.glossaryContext) : undefined;

        if (definition.glossaryContext && !glossaryContext) {
            throw new Error(`${definition.id} names the unknown glossary context ${definition.glossaryContext}`);
        }

        projects.push({
            id: entry.id,
            name: entry.name,
            kind: entry.kind,
            type: entry.type,
            url: labUrl(entry.id),
            changelogUrl: definition.changelog ? changelogUrl(entry.id) : undefined,
            version: definition.versionManifest
                ? readRepoJson<Manifest>(root, definition.versionManifest).version
                : manifest.version,
            description: entry.description,
            sourcePath: entry.sourcePath,
            sourceUrl: entry.links.source,
            links: entry.links,
            readme: definition.readme ? await document(definition.readme) : undefined,
            changelog: definition.changelog ? await changelogDocument(definition.changelog) : undefined,
            glossaryContext: glossaryContext && {
                id: glossaryContext.id,
                name: glossaryContext.name,
                url: glossaryUrl(glossaryContext.id),
            },
            showcase: definition.showcase,
            cardImage: cardImagePath(entry),
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
    catalog: readonly CatalogLabProject[] = catalogLabProjects,
): Promise<HubContent> => buildContent(root, registry, catalog);
