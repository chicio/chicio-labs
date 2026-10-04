import { cardImagePath, type StandaloneProject } from "labs-catalog";
import type { LabProject } from "./content";

export interface CardLink {
    label: string;
    href: string;
}

/** What one card of the home page says, whichever section it is in. */
export interface ProjectCardData {
    id: string;
    name: string;
    type: string;
    /** The version of a Lab Project, the language or platform of a Standalone Project. */
    meta?: string;
    description: string;
    /** Where `labs-catalog` serves the card image from, relative to the package; absent: the card has no image. */
    image?: string;
    primary: CardLink & { internal: boolean };
    /** The secondary links, all outward. */
    links: CardLink[];
}

export interface HomeSection {
    id: string;
    title: string;
    subtitle: string;
    cards: ProjectCardData[];
}

export const isPublishedProject = (project: LabProject): boolean => project.kind !== "workbench";

const labCard = (project: LabProject): ProjectCardData => {
    const published = isPublishedProject(project);
    const links: CardLink[] = [];

    if (project.links.visit) {
        links.push({ label: "Visit", href: project.links.visit });
    }

    if (project.links.showcase) {
        links.push({ label: "Showcase", href: project.links.showcase });
    }

    if (project.links.npm) {
        links.push({ label: "npm", href: project.links.npm });
    }

    links.push({ label: "Source", href: project.links.source });

    return {
        id: project.id,
        name: project.name,
        type: project.type,
        meta: published && project.version ? `v${project.version}` : undefined,
        description: project.description,
        image: published ? project.cardImage : undefined,
        primary: { label: "Docs", href: project.url, internal: true },
        links: published ? links : [],
    };
};

const standaloneCard = (project: StandaloneProject): ProjectCardData => {
    const links: CardLink[] = [];

    if (project.links.docs) {
        links.push({ label: "Docs", href: project.links.docs });
    }

    if (project.links.thesis) {
        links.push({ label: "Thesis", href: project.links.thesis });
    }

    if (project.links.download) {
        links.push({ label: "Download", href: project.links.download });
    }

    return {
        id: project.id,
        name: project.name,
        type: project.type,
        meta: project.meta,
        description: project.description,
        image: cardImagePath(project),
        primary: { label: "GitHub", href: project.links.github, internal: false },
        links,
    };
};

/**
 * The home page: every Lab Project but the Workbench, then the Workbench, then the Standalone Projects, each in the
 * catalog's order.
 */
export const homeSections = (
    projects: readonly LabProject[],
    standaloneProjects: readonly StandaloneProject[],
): HomeSection[] => [
    {
        id: "lab-projects",
        title: "Lab Projects",
        subtitle: "Everything Chicio Labs publishes, each with its docs generated from the repository.",
        cards: projects.filter(isPublishedProject).map(labCard),
    },
    {
        id: "workbench",
        title: "Workbench",
        subtitle: "The Lab Projects that only work inside Chicio Labs: the tools the published ones are built with.",
        cards: projects.filter((project) => !isPublishedProject(project)).map(labCard),
    },
    {
        id: "standalone-projects",
        title: "Standalone Projects",
        subtitle: "Earlier experiments from the same lab, each in its own repository.",
        cards: standaloneProjects.map(standaloneCard),
    },
];

export interface InfoPillData {
    icon: string;
    label: string;
    value: string;
}

export interface ProjectInfo {
    pills: InfoPillData[];
    primary: CardLink;
    /** The other outward links, then the changelog and the source, as text links. */
    links: (CardLink & { internal: boolean })[];
}

/** The "Project info" block at the bottom of a Lab Project page. */
export const projectInfo = (project: LabProject): ProjectInfo => {
    const pills: InfoPillData[] = [{ icon: ">_", label: "Type", value: project.type }];

    if (project.version && isPublishedProject(project)) {
        pills.push({ icon: "#", label: "Version", value: project.version });
    }

    pills.push({ icon: "/", label: "Workspace", value: project.sourcePath });

    const outward: CardLink[] = [];

    if (project.links.visit) {
        outward.push({ label: "Visit", href: project.links.visit });
    }

    if (project.links.showcase) {
        outward.push({ label: "Showcase", href: project.links.showcase });
    }

    if (project.links.npm) {
        outward.push({ label: "npm", href: project.links.npm });
    }

    const source: CardLink = { label: "Source", href: project.links.source };
    const [primary = source, ...rest] = [...outward, source];
    const links: ProjectInfo["links"] = [];

    if (project.changelogUrl) {
        links.push({ label: "Changelog", href: project.changelogUrl, internal: true });
    }

    links.push(...rest.map((link) => ({ ...link, internal: false })));

    return { pills, primary, links };
};
