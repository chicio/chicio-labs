import { describe, expect, it } from "vitest";
import { cardImagePath, cardImageSource, mediaCopies } from "./images";
import type { LabProject, StandaloneProject } from "./types";

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

describe("images", () => {
    describe("cardImageSource", () => {
        it("resolves a Lab Project's card image inside its own Brand Kit", () => {
            expect(cardImageSource(labProject)).toBe("apps/website/brand/featured/featured-horizontal.jpg");
        });

        it("resolves a Standalone Project's card image inside the package's media folder", () => {
            expect(cardImageSource(standaloneProject)).toBe("packages/labs-catalog/media/standalone/id3tageditor.jpg");
        });

        it("is undefined for a Lab Project without a card image", () => {
            expect(cardImageSource({ ...labProject, cardImage: undefined })).toBeUndefined();
        });
    });

    describe("cardImagePath", () => {
        it("names the served copy after the project id, keeping the extension", () => {
            expect(cardImagePath(labProject)).toBe("media/website.jpg");
            expect(cardImagePath({ ...standaloneProject, cardImage: "id3tageditor.png" })).toBe(
                "media/id3tageditor.png",
            );
        });

        it("is undefined for a Lab Project without a card image", () => {
            expect(cardImagePath({ ...labProject, cardImage: undefined })).toBeUndefined();
        });
    });

    describe("mediaCopies", () => {
        it("lists a copy per project with a card image and skips the others", () => {
            const withoutImage: LabProject = { ...labProject, id: "workbench", cardImage: undefined };

            expect(
                mediaCopies({ labProjects: [labProject, withoutImage], standaloneProjects: [standaloneProject] }),
            ).toEqual([
                { from: "apps/website/brand/featured/featured-horizontal.jpg", to: "media/website.jpg" },
                { from: "packages/labs-catalog/media/standalone/id3tageditor.jpg", to: "media/id3tageditor.jpg" },
            ]);
        });
    });
});
