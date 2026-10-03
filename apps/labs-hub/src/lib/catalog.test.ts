import { describe, expect, it } from "vitest";
import { cardCallToActions, cardFeatures, isPublishedProject, splitCatalog } from "./catalog";
import type { LabProject } from "./content";

const project = (overrides: Partial<LabProject>): LabProject => ({
    id: "id",
    name: "Name",
    kind: "public-package",
    url: "/lab/id/",
    description: "A description",
    sourceUrl: "https://github.com/chicio/chicio-labs/tree/main/packages/id",
    agents: [],
    skills: [],
    ...overrides,
});

describe("catalog", () => {
    describe("splitCatalog", () => {
        it("separates the published Lab Projects from the Workbench, keeping the order", () => {
            const { published, workbench } = splitCatalog([
                project({ id: "a", kind: "website" }),
                project({ id: "b", kind: "workbench" }),
                project({ id: "c", kind: "public-plugin" }),
            ]);

            expect(published.map((entry) => entry.id)).toEqual(["a", "c"]);
            expect(workbench.map((entry) => entry.id)).toEqual(["b"]);
        });

        it("counts everything but the Workbench as published", () => {
            expect(isPublishedProject(project({ kind: "workbench" }))).toBe(false);
            expect(isPublishedProject(project({ kind: "public-package" }))).toBe(true);
        });
    });

    describe("cardFeatures", () => {
        it("names the kind with its version, the Showcase and the glossary", () => {
            const features = cardFeatures(
                project({
                    version: "3.0.0",
                    showcase: { label: "Design System Showcase", url: "https://x/", sourcePath: "apps/s" },
                    glossaryContext: { id: "ds", name: "Matrix Design System", url: "/glossary/ds/" },
                }),
            );

            expect(features).toEqual([
                "npm package, version 3.0.0",
                "Showcase: Design System Showcase",
                "Glossary: Matrix Design System",
            ]);
        });

        it("omits the version when there is none", () => {
            expect(cardFeatures(project({ kind: "workbench" }))).toEqual(["Workbench"]);
        });
    });

    describe("cardCallToActions", () => {
        it("links a package to its Showcase, npm and source", () => {
            const actions = cardCallToActions(
                project({
                    packageName: "matrix-design-system",
                    showcase: { label: "Showcase", url: "https://x/design-system/", sourcePath: "apps/s" },
                }),
            );

            expect(actions).toEqual([
                { label: "Showcase", link: "https://x/design-system/" },
                { label: "npm", link: "https://www.npmjs.com/package/matrix-design-system" },
                { label: "Source", link: "https://github.com/chicio/chicio-labs/tree/main/packages/id" },
            ]);
        });

        it("links the Website to the live site", () => {
            const labels = cardCallToActions(project({ kind: "website" })).map((action) => action.label);

            expect(labels).toEqual(["Visit", "Source"]);
        });

        it("gives a plugin only its source", () => {
            expect(cardCallToActions(project({ kind: "public-plugin" })).map((action) => action.label)).toEqual([
                "Source",
            ]);
        });
    });
});
