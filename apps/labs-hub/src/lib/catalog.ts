import type { LabProject } from "./content";
import { WEBSITE_URL } from "./repo";

export interface CardCallToAction {
    label: string;
    link: string;
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

/** The bullet points of a Project Card: what kind of thing it is, which version, and what else it comes with. */
export const cardFeatures = (project: LabProject): string[] => {
    const features = [
        project.version ? `${kindLabel[project.kind]}, version ${project.version}` : kindLabel[project.kind],
    ];

    if (project.showcase) {
        features.push(`Showcase: ${project.showcase.label}`);
    }

    if (project.glossaryContext) {
        features.push(`Glossary: ${project.glossaryContext.name}`);
    }

    return features;
};

/** The outward links of a Project Card; the card opens them in a new tab, so none of them leads into the hub. */
export const cardCallToActions = (project: LabProject): CardCallToAction[] => {
    const actions: CardCallToAction[] = [];

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
