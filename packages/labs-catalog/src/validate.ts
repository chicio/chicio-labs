import { cardImageSource } from "./images";
import type { Catalog, LabProject, StandaloneProject } from "./types";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imageExtensionPattern = /\.(?:jpe?g|png|webp|avif|svg)$/i;

const isHttpsUrl = (value: string): boolean => {
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

const isInsideItsFolder = (cardImage: string): boolean =>
    !cardImage.startsWith("/") && !cardImage.split("/").includes("..");

const validateProject = (project: LabProject | StandaloneProject, exists: (repoPath: string) => boolean): string[] => {
    const errors: string[] = [];
    const label = project.id;

    if (!idPattern.test(project.id)) {
        errors.push(`${label}: the id must be kebab-case`);
    }

    for (const field of ["name", "type", "description"] as const) {
        if (project[field].trim() === "") {
            errors.push(`${label}: ${field} is empty`);
        }
    }

    for (const [key, url] of Object.entries(project.links)) {
        if (!isHttpsUrl(url)) {
            errors.push(`${label}: the ${key} link is not an https URL (${url})`);
        }
    }

    if (project.cardImage !== undefined) {
        if (!isInsideItsFolder(project.cardImage)) {
            errors.push(`${label}: the card image ${project.cardImage} must stay inside its own folder`);
        } else if (!imageExtensionPattern.test(project.cardImage)) {
            errors.push(`${label}: the card image ${project.cardImage} is not an image file`);
        } else if (!exists(cardImageSource(project) ?? "")) {
            errors.push(`${label}: the card image ${cardImageSource(project)} does not exist`);
        }
    }

    return errors;
};

/**
 * Every problem in the catalog, empty when it is sound. `exists` answers whether a repository path is there, so the
 * check runs against the real repository in the build and against a fake in tests.
 */
export const validateCatalog = (catalog: Catalog, exists: (repoPath: string) => boolean): string[] => {
    const projects = [...catalog.labProjects, ...catalog.standaloneProjects];
    const errors = projects.flatMap((project) => validateProject(project, exists));

    const seen = new Set<string>();

    for (const { id } of projects) {
        if (seen.has(id)) {
            errors.push(`${id}: the id is used twice`);
        }

        seen.add(id);
    }

    for (const project of catalog.labProjects) {
        if (!exists(project.sourcePath)) {
            errors.push(`${project.id}: the source path ${project.sourcePath} does not exist`);
        }
    }

    return errors;
};
