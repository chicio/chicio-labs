import { cardImagePath, labProjects, standaloneProjects } from "labs-catalog";
import type { LabProject, StandaloneProject } from "labs-catalog";
import { labs } from "@/types/configuration/labs";

export interface OpenSourceCardLink {
    label: string;
    href: string;
}

/** What one card of the About me "Open Source" section says: the props of the design system's CatalogCard. */
export interface OpenSourceCard {
    id: string;
    name: string;
    type: string;
    /** Where the type Tag leads: the section of the Labs Hub the project is in. */
    typeHref: string;
    /** The language or platform of a Standalone Project. */
    meta?: string;
    description: string;
    primary: OpenSourceCardLink;
    /** The other links, all outward. */
    links: OpenSourceCardLink[];
    /** Where the card image is served from; absent: the card has no image. */
    image?: string;
}

export const labsCatalogMediaUrl = "/media/labs-catalog";

const imageUrl = (project: LabProject | StandaloneProject): string | undefined => {
    const path = cardImagePath(project);

    return path === undefined ? undefined : `${labsCatalogMediaUrl}/${path.slice(path.lastIndexOf("/") + 1)}`;
};

const present = (link: OpenSourceCardLink | undefined): link is OpenSourceCardLink => link !== undefined;

const optionalLink = (label: string, href: string | undefined): OpenSourceCardLink | undefined =>
    href === undefined ? undefined : { label, href };

const fromLabProject = (project: LabProject): OpenSourceCard => ({
    id: project.id,
    name: project.name,
    type: project.type,
    typeHref: `${labs.url}#lab-projects`,
    description: project.description,
    primary: { label: "Docs", href: project.links.docs },
    links: [
        optionalLink("Visit", project.links.visit),
        optionalLink("Showcase", project.links.showcase),
        optionalLink("npm", project.links.npm),
        optionalLink("Source", project.links.source),
    ].filter(present),
    image: imageUrl(project),
});

const fromStandaloneProject = (project: StandaloneProject): OpenSourceCard => ({
    id: project.id,
    name: project.name,
    type: project.type,
    typeHref: `${labs.url}#standalone-projects`,
    meta: project.meta,
    description: project.description,
    primary: { label: "GitHub", href: project.links.github },
    links: [
        optionalLink("Docs", project.links.docs),
        optionalLink("Thesis", project.links.thesis),
        optionalLink("Download", project.links.download),
    ].filter(present),
    image: imageUrl(project),
});

/**
 * What the About me "Open Source" section lists, as the Labs Hub's home does: the published Lab Projects, then the
 * Standalone Projects. The Workbench is not published and is left out. A project without a card image gets a card
 * without one.
 */
export const selectOpenSourceCards = (
    labProjectList: readonly LabProject[],
    standaloneProjectList: readonly StandaloneProject[],
): OpenSourceCard[] => [
    ...labProjectList.filter((project) => project.kind !== "workbench").map(fromLabProject),
    ...standaloneProjectList.map(fromStandaloneProject),
];

export const openSourceSection = (): OpenSourceCard[] => selectOpenSourceCards(labProjects, standaloneProjects);

export const everyLabProjectLink: OpenSourceCardLink = {
    label: "Every Lab Project → Chicio Labs",
    href: labs.url,
};

/** The Open Source section as the `/markdown` representation lists it: one bullet per project, then the Labs link. */
export const openSourceSectionMarkdown = (): string => {
    const projects = openSourceSection().map((project) => {
        const links = [project.primary, ...project.links].map((link) => `[${link.label}](${link.href})`).join(", ");

        return `- **${project.name}**: ${project.description} ${links}`;
    });

    return [...projects, "", `[${everyLabProjectLink.label}](${everyLabProjectLink.href})`].join("\n");
};
