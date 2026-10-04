export type LabProjectKind = "website" | "public-package" | "public-plugin" | "workbench";

export interface LabProjectLinks {
    /** The Lab Project's documentation page on the Labs Hub. */
    docs: string;
    showcase?: string;
    visit?: string;
    npm?: string;
    source: string;
}

export interface LabProject {
    id: string;
    name: string;
    kind: LabProjectKind;
    /** The label shown on its card: what sort of thing it is, independent of its kind. */
    type: string;
    /** The repository folder the Lab Project lives in; its Brand Kit is the `brand/` folder inside it. */
    sourcePath: string;
    description: string;
    links: LabProjectLinks;
    /** A path inside the Lab Project's Brand Kit. Absent: the card renders without an image. */
    cardImage?: string;
}

export interface StandaloneProjectLinks {
    github: string;
    docs?: string;
    thesis?: string;
    download?: string;
}

export interface StandaloneProject {
    id: string;
    name: string;
    type: string;
    /** The language or platform it targets. */
    meta: string;
    description: string;
    links: StandaloneProjectLinks;
    /** A path inside `packages/labs-catalog/media/standalone/`. */
    cardImage: string;
}

export interface Catalog {
    labProjects: readonly LabProject[];
    standaloneProjects: readonly StandaloneProject[];
}
