import { describe, expect, it } from "vitest";
import type { Catalog, LabProject, StandaloneProject } from "./types";
import { validateCatalog } from "./validate";

const labProject: LabProject = {
    id: "website",
    name: "Website",
    kind: "website",
    type: "Web app",
    sourcePath: "apps/website",
    description: "The site.",
    links: { docs: "https://labs.example.com/lab/website/", source: "https://github.com/example/repo" },
    cardImage: "featured/featured-horizontal.jpg",
};

const standaloneProject: StandaloneProject = {
    id: "id3tageditor",
    name: "ID3TagEditor",
    type: "iOS / mobile",
    meta: "Swift",
    description: "A library.",
    links: { github: "https://github.com/example/id3" },
    cardImage: "id3tageditor.jpg",
};

const everythingExists = (): boolean => true;

const catalogWith = (overrides: {
    labProject?: Partial<LabProject>;
    standaloneProject?: Partial<StandaloneProject>;
}): Catalog => ({
    labProjects: [{ ...labProject, ...overrides.labProject }],
    standaloneProjects: [{ ...standaloneProject, ...overrides.standaloneProject }],
});

describe("validateCatalog", () => {
    it("accepts a sound catalog", () => {
        expect(validateCatalog(catalogWith({}), everythingExists)).toEqual([]);
    });

    it("accepts a Lab Project without a card image", () => {
        expect(validateCatalog(catalogWith({ labProject: { cardImage: undefined } }), everythingExists)).toEqual([]);
    });

    it("rejects an id that is not kebab-case", () => {
        expect(validateCatalog(catalogWith({ labProject: { id: "Website_One" } }), everythingExists)).toEqual([
            "Website_One: the id must be kebab-case",
        ]);
    });

    it("rejects an id used by two projects", () => {
        const catalog = catalogWith({ standaloneProject: { id: "website" } });

        expect(validateCatalog(catalog, everythingExists)).toEqual(["website: the id is used twice"]);
    });

    it("rejects an empty name, type or description", () => {
        const errors = validateCatalog(
            catalogWith({ labProject: { name: " ", type: "", description: "" } }),
            everythingExists,
        );

        expect(errors).toEqual(["website: name is empty", "website: type is empty", "website: description is empty"]);
    });

    it("rejects a link that is not an https URL", () => {
        const errors = validateCatalog(
            catalogWith({
                labProject: { links: { docs: "http://labs.example.com", source: "not a url" } },
            }),
            everythingExists,
        );

        expect(errors).toEqual([
            "website: the docs link is not an https URL (http://labs.example.com)",
            "website: the source link is not an https URL (not a url)",
        ]);
    });

    it("rejects a card image that escapes its own folder", () => {
        const errors = validateCatalog(
            catalogWith({
                labProject: { cardImage: "../../website/brand/logo/logo.png" },
                standaloneProject: { cardImage: "/etc/logo.png" },
            }),
            everythingExists,
        );

        expect(errors).toEqual([
            "website: the card image ../../website/brand/logo/logo.png must stay inside its own folder",
            "id3tageditor: the card image /etc/logo.png must stay inside its own folder",
        ]);
    });

    it("rejects a card image that is not an image file", () => {
        expect(validateCatalog(catalogWith({ labProject: { cardImage: "notes.pxd" } }), everythingExists)).toEqual([
            "website: the card image notes.pxd is not an image file",
        ]);
    });

    it("rejects a card image missing from its folder", () => {
        const exists = (repoPath: string): boolean =>
            repoPath !== "apps/website/brand/featured/featured-horizontal.jpg";

        expect(validateCatalog(catalogWith({}), exists)).toEqual([
            "website: the card image apps/website/brand/featured/featured-horizontal.jpg does not exist",
        ]);
    });

    it("rejects a Lab Project whose source path is missing", () => {
        const exists = (repoPath: string): boolean => repoPath !== "apps/website";

        expect(validateCatalog(catalogWith({ labProject: { cardImage: undefined } }), exists)).toEqual([
            "website: the source path apps/website does not exist",
        ]);
    });
});
