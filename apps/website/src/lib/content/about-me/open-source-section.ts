import { cardImagePath, labProjects, standaloneProjects } from "labs-catalog";
import type { LabProject, StandaloneProject } from "labs-catalog";
import { labs } from "@/types/configuration/labs";

export interface OpenSourceCardLink {
    label: string;
    href: string;
}

export interface OpenSourceCard {
    id: string;
    name: string;
    description: string;
    links: OpenSourceCardLink[];
    /** Where the card image is served from. */
    image: string;
}

export const labsCatalogMediaUrl = "/media/labs-catalog";

const imageUrl = (project: LabProject | StandaloneProject): string | undefined => {
    const path = cardImagePath(project);

    return path === undefined ? undefined : `${labsCatalogMediaUrl}/${path.slice(path.lastIndexOf("/") + 1)}`;
};

const present = (link: OpenSourceCardLink | undefined): link is OpenSourceCardLink => link !== undefined;

const optionalLink = (label: string, href: string | undefined): OpenSourceCardLink | undefined =>
    href === undefined ? undefined : { label, href };

const fromLabProject = (project: LabProject, image: string): OpenSourceCard => ({
    id: project.id,
    name: project.name,
    description: project.description,
    links: [
        optionalLink("Docs", project.links.docs),
        optionalLink("Showcase", project.links.showcase),
        optionalLink("Visit", project.links.visit),
        optionalLink("npm", project.links.npm),
        optionalLink("Source", project.links.source),
    ].filter(present),
    image,
});

const fromStandaloneProject = (project: StandaloneProject, image: string): OpenSourceCard => ({
    id: project.id,
    name: project.name,
    description: project.description,
    links: [
        optionalLink("GitHub", project.links.github),
        optionalLink("Docs", project.links.docs),
        optionalLink("Thesis", project.links.thesis),
        optionalLink("Download", project.links.download),
    ].filter(present),
    image,
});

/**
 * What the About me "Open Source" section lists: the published Lab Projects that have a card image (a card shows
 * one, so the Matrix Component Store, which has none, is not listed), then every Standalone Project that has one.
 * The Workbench is not published and is left out, whether or not it has a card image.
 */
export const selectOpenSourceCards = (
    labProjectList: readonly LabProject[],
    standaloneProjectList: readonly StandaloneProject[],
): OpenSourceCard[] => [
    ...labProjectList.flatMap((project) => {
        const image = imageUrl(project);

        return project.kind === "workbench" || image === undefined ? [] : [fromLabProject(project, image)];
    }),
    ...standaloneProjectList.flatMap((project) => {
        const image = imageUrl(project);

        return image === undefined ? [] : [fromStandaloneProject(project, image)];
    }),
];

export const openSourceSection = (): OpenSourceCard[] => selectOpenSourceCards(labProjects, standaloneProjects);

export const everyLabProjectLink: OpenSourceCardLink = {
    label: "Every Lab Project → Chicio Labs",
    href: labs.url,
};

/** The Open Source section as the `/markdown` representation lists it: one bullet per project, then the Labs link. */
export const openSourceSectionMarkdown = (): string => {
    const projects = openSourceSection().map((project) => {
        const links = project.links.map((link) => `[${link.label}](${link.href})`).join(", ");

        return `- **${project.name}**: ${project.description} ${links}`;
    });

    return [...projects, "", `[${everyLabProjectLink.label}](${everyLabProjectLink.href})`].join("\n");
};
