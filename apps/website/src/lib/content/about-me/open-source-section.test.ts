import { describe, it, expect } from "vitest";
import { labProjects, standaloneProjects } from "labs-catalog";
import type { LabProject, StandaloneProject } from "labs-catalog";
import {
    everyLabProjectLink,
    openSourceSection,
    openSourceSectionMarkdown,
    selectOpenSourceCards,
} from "./open-source-section";

const labProject = (overrides: Partial<LabProject>): LabProject => ({
    id: "a-lab-project",
    name: "A Lab Project",
    kind: "public-package",
    type: "Package",
    sourcePath: "packages/a-lab-project",
    description: "Does something.",
    links: { docs: "https://labs.example.com/docs", source: "https://github.com/chicio/a-lab-project" },
    cardImage: "card.png",
    ...overrides,
});

const standaloneProject = (overrides: Partial<StandaloneProject>): StandaloneProject => ({
    id: "a-standalone-project",
    name: "A Standalone Project",
    type: "Library",
    meta: "Swift",
    description: "Does something else.",
    links: { github: "https://github.com/chicio/a-standalone-project" },
    cardImage: "card.png",
    ...overrides,
});

describe("Open Source section", () => {
    describe("selectOpenSourceCards", () => {
        it("leaves out a Workbench Lab Project even when it has a card image", () => {
            const cards = selectOpenSourceCards(
                [
                    labProject({ id: "published", name: "Published", kind: "public-package" }),
                    labProject({ id: "workbench", name: "Workbench", kind: "workbench" }),
                ],
                [],
            );

            expect(cards.map((card) => card.name)).toEqual(["Published"]);
        });

        it("leaves out a Lab Project and a Standalone Project that have no card image", () => {
            const cards = selectOpenSourceCards(
                [labProject({ id: "no-image", cardImage: undefined })],
                [standaloneProject({ id: "also-no-image", cardImage: undefined })],
            );

            expect(cards).toEqual([]);
        });

        it("lists the Lab Projects before the Standalone Projects", () => {
            const cards = selectOpenSourceCards([labProject({ id: "lab" })], [standaloneProject({ id: "standalone" })]);

            expect(cards.map((card) => card.id)).toEqual(["lab", "standalone"]);
        });
    });

    describe("openSourceSection", () => {
        it("lists the published Lab Projects that have a card image, before the Standalone Projects", () => {
            const names = openSourceSection().map((project) => project.name);
            const published = labProjects
                .filter((project) => project.kind !== "workbench" && project.cardImage !== undefined)
                .map((project) => project.name);

            expect(names).toEqual([...published, ...standaloneProjects.map((project) => project.name)]);
        });

        it("leaves out the Workbench and the Lab Projects without a card image", () => {
            const names = openSourceSection().map((project) => project.name);

            expect(names).not.toContain("Chicio Labs SDLC");
            expect(names).not.toContain("Matrix Component Store");
        });

        it("lists Matrix Rain once, as a Lab Project", () => {
            const rain = openSourceSection().filter((project) => project.id === "matrix-rain-webgpu");

            expect(rain).toHaveLength(1);
            expect(rain[0].name).toBe("Matrix Rain");
        });

        it("serves every card image from the copy of the catalog's media", () => {
            openSourceSection().forEach((project) => {
                expect(project.image).toMatch(/^\/media\/labs-catalog\/[\w-]+\.(jpg|png)$/);
            });
        });

        it("gives a Lab Project its docs, showcase, visit, npm and source links where it has them", () => {
            const design = openSourceSection().find((project) => project.id === "matrix-design-system");

            expect(design?.links.map((link) => link.label)).toEqual(["Docs", "Showcase", "npm", "Source"]);
        });

        it("gives a Standalone Project its GitHub link first, then its docs, thesis or download", () => {
            const projects = openSourceSection();
            const tracer = projects.find((project) => project.id === "spectral-clara-lux-tracer");
            const tagger = projects.find((project) => project.id === "mp3id3tagger");

            expect(tracer?.links.map((link) => link.label)).toEqual(["GitHub", "Thesis"]);
            expect(tagger?.links.map((link) => link.label)).toEqual(["GitHub", "Download"]);
        });

        it("only links to absolute https URLs", () => {
            openSourceSection()
                .flatMap((project) => project.links)
                .forEach((link) => {
                    expect(link.href).toMatch(/^https:\/\//);
                });
        });
    });

    describe("openSourceSectionMarkdown", () => {
        it("renders one bullet per project with its links", () => {
            const markdown = openSourceSectionMarkdown();

            expect(markdown.split("\n").filter((line) => line.startsWith("- **"))).toHaveLength(
                openSourceSection().length,
            );
            expect(markdown).toContain("- **ID3TagEditor**: A Swift library to edit ID3 Tag of any mp3 file.");
            expect(markdown).toContain("[GitHub](https://github.com/chicio/ID3TagEditor)");
        });

        it("ends with the link to every Lab Project on Chicio Labs", () => {
            const closing = `[${everyLabProjectLink.label}](${everyLabProjectLink.href})`;

            expect(openSourceSectionMarkdown().endsWith(closing)).toBe(true);
        });
    });
});
