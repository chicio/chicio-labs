import { cardImagePath, labProjects, standaloneProjects } from "labs-catalog";
import type { LabProject, StandaloneProject } from "labs-catalog";
import { labs } from "@/types/configuration/labs";

export interface OpenSourceProjectLink {
    label: string;
    href: string;
}

export interface OpenSourceProject {
    id: string;
    name: string;
    description: string;
    links: OpenSourceProjectLink[];
    /** Where the card image is served from. */
    image: string;
}

export const labsCatalogMediaUrl = "/media/labs-catalog";

const imageUrl = (project: LabProject | StandaloneProject): string | undefined => {
    const path = cardImagePath(project);

    return path === undefined ? undefined : `${labsCatalogMediaUrl}/${path.slice(path.lastIndexOf("/") + 1)}`;
};

const present = (link: OpenSourceProjectLink | undefined): link is OpenSourceProjectLink => link !== undefined;

const optionalLink = (label: string, href: string | undefined): OpenSourceProjectLink | undefined =>
    href === undefined ? undefined : { label, href };

const fromLabProject = (project: LabProject, image: string): OpenSourceProject => ({
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

const fromStandaloneProject = (project: StandaloneProject, image: string): OpenSourceProject => ({
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
 * one, so the Matrix Component Store, which has none, is not listed), then every Standalone Project. The
 * Workbench is not published and is left out.
 */
export const openSourceProjects = (): OpenSourceProject[] => [
    ...labProjects.flatMap((project) => {
        const image = imageUrl(project);

        return project.kind === "workbench" || image === undefined ? [] : [fromLabProject(project, image)];
    }),
    ...standaloneProjects.flatMap((project) => {
        const image = imageUrl(project);

        return image === undefined ? [] : [fromStandaloneProject(project, image)];
    }),
];

export const everyLabProjectLink: OpenSourceProjectLink = {
    label: "Every Lab Project → Chicio Labs",
    href: labs.url,
};

/** The Open Source section as the `/markdown` representation lists it: one bullet per project, then the Labs link. */
export const openSourceProjectsMarkdown = (): string => {
    const projects = openSourceProjects().map((project) => {
        const links = project.links.map((link) => `[${link.label}](${link.href})`).join(", ");

        return `- **${project.name}**: ${project.description} ${links}`;
    });

    return [...projects, "", `[${everyLabProjectLink.label}](${everyLabProjectLink.href})`].join("\n");
};
