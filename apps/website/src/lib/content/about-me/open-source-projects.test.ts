import { describe, it, expect } from "vitest";
import { labProjects, standaloneProjects } from "labs-catalog";
import { everyLabProjectLink, openSourceProjects, openSourceProjectsMarkdown } from "./open-source-projects";

describe("openSourceProjects", () => {
    it("lists the published Lab Projects that have a card image, before the Standalone Projects", () => {
        const names = openSourceProjects().map((project) => project.name);
        const published = labProjects
            .filter((project) => project.kind !== "workbench" && project.cardImage !== undefined)
            .map((project) => project.name);

        expect(names).toEqual([...published, ...standaloneProjects.map((project) => project.name)]);
    });

    it("leaves out the Workbench and the Lab Projects without a card image", () => {
        const names = openSourceProjects().map((project) => project.name);

        expect(names).not.toContain("Chicio Labs SDLC");
        expect(names).not.toContain("Matrix Component Store");
    });

    it("lists Matrix Rain once, as a Lab Project", () => {
        const rain = openSourceProjects().filter((project) => project.id === "matrix-rain-webgpu");

        expect(rain).toHaveLength(1);
        expect(rain[0].name).toBe("Matrix Rain");
    });

    it("serves every card image from the copy of the catalog's media", () => {
        openSourceProjects().forEach((project) => {
            expect(project.image).toMatch(/^\/media\/labs-catalog\/[\w-]+\.(jpg|png)$/);
        });
    });

    it("gives a Lab Project its docs, showcase, visit, npm and source links where it has them", () => {
        const design = openSourceProjects().find((project) => project.id === "matrix-design-system");

        expect(design?.links.map((link) => link.label)).toEqual(["Docs", "Showcase", "npm", "Source"]);
    });

    it("gives a Standalone Project its GitHub link first, then its docs, thesis or download", () => {
        const projects = openSourceProjects();
        const tracer = projects.find((project) => project.id === "spectral-clara-lux-tracer");
        const tagger = projects.find((project) => project.id === "mp3id3tagger");

        expect(tracer?.links.map((link) => link.label)).toEqual(["GitHub", "Thesis"]);
        expect(tagger?.links.map((link) => link.label)).toEqual(["GitHub", "Download"]);
    });

    it("only links to absolute https URLs", () => {
        openSourceProjects()
            .flatMap((project) => project.links)
            .forEach((link) => {
                expect(link.href).toMatch(/^https:\/\//);
            });
    });
});

describe("openSourceProjectsMarkdown", () => {
    it("renders one bullet per project with its links", () => {
        const markdown = openSourceProjectsMarkdown();

        expect(markdown.split("\n").filter((line) => line.startsWith("- **"))).toHaveLength(
            openSourceProjects().length,
        );
        expect(markdown).toContain("- **ID3TagEditor**: A Swift library to edit ID3 Tag of any mp3 file.");
        expect(markdown).toContain("[GitHub](https://github.com/chicio/ID3TagEditor)");
    });

    it("ends with the link to every Lab Project on Chicio Labs", () => {
        const closing = `[${everyLabProjectLink.label}](${everyLabProjectLink.href})`;

        expect(openSourceProjectsMarkdown().endsWith(closing)).toBe(true);
    });
});
