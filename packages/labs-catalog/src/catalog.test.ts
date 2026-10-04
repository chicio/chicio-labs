import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import path from "node:path";
import { labProjects, standaloneProjects } from "./catalog";
import { mediaCopies } from "./images";
import { validateCatalog } from "./validate";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

describe("catalog", () => {
    it("is sound against the real repository: every source path and card image exists", () => {
        const errors = validateCatalog({ labProjects, standaloneProjects }, (repoPath) =>
            existsSync(path.join(repositoryRoot, repoPath)),
        );

        expect(errors).toEqual([]);
    });

    it("keeps every Lab Project's card image inside its own Brand Kit", () => {
        const copies = mediaCopies({ labProjects, standaloneProjects: [] });

        for (const project of labProjects.filter((candidate) => candidate.cardImage !== undefined)) {
            expect(copies.map((copy) => copy.from)).toContain(`${project.sourcePath}/brand/${project.cardImage}`);
        }
    });

    it("lists the Lab Projects the hub documents, with a card image on every published one", () => {
        expect(labProjects.map((project) => project.id)).toEqual([
            "website",
            "matrix-design-system",
            "matrix-component-store",
            "matrix-rain-webgpu",
            "glossary-browser",
            "image-peek",
            "chicio-labs-sdlc",
            "website-content",
            "eslint-plugin-chicio",
            "labs-hub",
            "labs-catalog",
        ]);

        const withoutImage = labProjects.filter((project) => project.cardImage === undefined).map(({ id }) => id);

        expect(withoutImage).toEqual([
            "chicio-labs-sdlc",
            "website-content",
            "eslint-plugin-chicio",
            "labs-hub",
            "labs-catalog",
        ]);
    });

    it("keeps Matrix Rain a Lab Project only, never a Standalone Project", () => {
        expect(standaloneProjects.map((project) => project.id)).not.toContain("matrix-rain-webgpu");
        expect(standaloneProjects).toHaveLength(7);
    });

    it("always links a Standalone Project's GitHub repository", () => {
        for (const project of standaloneProjects) {
            expect(project.links.github).toMatch(/^https:\/\/github\.com\/chicio\//);
        }
    });
});
