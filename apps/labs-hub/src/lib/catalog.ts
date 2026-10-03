import type { LabProject } from "./content";
import { WEBSITE_URL } from "./repo";

export interface CardCallToAction {
    label: string;
    link: string;
    sameTab?: boolean;
}

export const isPublishedProject = (project: LabProject): boolean => project.kind !== "workbench";

export const splitCatalog = (
    projects: readonly LabProject[],
): { published: LabProject[]; workbench: LabProject[] } => ({
    published: projects.filter(isPublishedProject),
    workbench: projects.filter((project) => !isPublishedProject(project)),
});

export const kindLabel: Record<LabProject["kind"], string> = {
    website: "The Website",
    "public-package": "npm package",
    "public-plugin": "Public Claude Code plugin",
    workbench: "Workbench",
};

/** The bullet points of a Project Card: what kind of thing it is, which version, and its Showcase. */
export const cardFeatures = (project: LabProject): string[] => {
    const features = [
        project.version ? `${kindLabel[project.kind]}, version ${project.version}` : kindLabel[project.kind],
    ];

    if (project.showcase) {
        features.push(`Showcase: ${project.showcase.label}`);
    }

    return features;
};

/** The links of a Project Card: its docs in the hub first, then the outward links, which open in a new tab. */
export const cardCallToActions = (project: LabProject): CardCallToAction[] => {
    const actions: CardCallToAction[] = [{ label: "Docs", link: project.url, sameTab: true }];

    if (project.showcase) {
        actions.push({ label: "Showcase", link: project.showcase.url });
    }

    if (project.kind === "website") {
        actions.push({ label: "Visit", link: WEBSITE_URL });
    }

    if (project.kind === "public-package" && project.packageName) {
        actions.push({ label: "npm", link: `https://www.npmjs.com/package/${project.packageName}` });
    }

    actions.push({ label: "Source", link: project.sourceUrl });

    return actions;
};
