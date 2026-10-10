import type { Catalog, LabProject, StandaloneProject } from "./types";

export const BRAND_KIT_DIRECTORY = "brand";
export const STANDALONE_MEDIA_DIRECTORY = "packages/labs-catalog/media/standalone";
export const MEDIA_DIRECTORY = "media";

export interface MediaCopy {
    /** The repository path of the image where it lives. */
    from: string;
    /** The path of its copy, relative to the package's `dist/`. */
    to: string;
}

const isLabProject = (project: LabProject | StandaloneProject): project is LabProject => "kind" in project;

/** The repository path of a project's card image where it lives, or undefined when the project has none. */
export const cardImageSource = (project: LabProject | StandaloneProject): string | undefined => {
    if (project.cardImage === undefined) {
        return undefined;
    }

    return isLabProject(project)
        ? `${project.sourcePath}/${BRAND_KIT_DIRECTORY}/${project.cardImage}`
        : `${STANDALONE_MEDIA_DIRECTORY}/${project.cardImage}`;
};

/**
 * Where a project's card image is served from, relative to the package: `media/<id><extension>`. Every image lands
 * in one flat folder, named by the project's id (unique across the catalog), so a consumer finds it without knowing
 * which Brand Kit it came from.
 */
export const cardImagePath = (project: LabProject | StandaloneProject): string | undefined => {
    if (project.cardImage === undefined) {
        return undefined;
    }

    const extension = project.cardImage.slice(project.cardImage.lastIndexOf("."));

    return `${MEDIA_DIRECTORY}/${project.id}${extension}`;
};

export const mediaCopies = (catalog: Catalog): MediaCopy[] =>
    [...catalog.labProjects, ...catalog.standaloneProjects].flatMap((project) => {
        const from = cardImageSource(project);
        const to = cardImagePath(project);

        return from === undefined || to === undefined ? [] : [{ from, to }];
    });
