import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { labProjects as catalogLabProjects, type LabProject as CatalogLabProject } from "labs-catalog";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadHubContent, loadHubContentFrom, type HubContent } from "./content";
import { findRepoRoot, readRepoJson } from "./repo";
import { labProjects, type LabProjectDefinition } from "./registry";

describe("content", () => {
    describe("a registry that does not match the repository or the catalog", () => {
        let root: string;

        const definition = (overrides: Partial<LabProjectDefinition>): LabProjectDefinition => ({
            id: "fixture",
            sourcePath: "packages/fixture",
            manifest: { type: "package" },
            ...overrides,
        });

        const entry = (overrides: Partial<CatalogLabProject> = {}): CatalogLabProject => ({
            id: "fixture",
            name: "Fixture",
            kind: "workbench",
            type: "Developer tool",
            sourcePath: "packages/fixture",
            description: "A fixture",
            links: { docs: "https://x/lab/fixture/", source: "https://x/tree/main/packages/fixture" },
            ...overrides,
        });

        const writeFixture = (files: Record<string, string>): void => {
            for (const [file, contents] of Object.entries(files)) {
                mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
                writeFileSync(path.join(root, file), contents);
            }
        };

        beforeEach(() => {
            root = mkdtempSync(path.join(tmpdir(), "labs-hub-"));
            writeFixture({
                "package.json": JSON.stringify({ workspaces: ["packages/*"] }),
                "packages/fixture/package.json": JSON.stringify({ name: "fixture", version: "1.2.3" }),
            });
        });

        afterEach(() => {
            rmSync(root, { recursive: true, force: true });
        });

        it("fails the build when a Lab Project is in the registry but not in the catalog", async () => {
            await expect(loadHubContentFrom(root, [definition({})], [])).rejects.toThrow(
                "fixture is in the Labs Hub registry but not in labs-catalog",
            );
        });

        it("fails the build when a Lab Project is in the catalog but not in the registry", async () => {
            await expect(loadHubContentFrom(root, [definition({})], [entry(), entry({ id: "other" })])).rejects.toThrow(
                "other is in labs-catalog but not in the Labs Hub registry",
            );
        });

        it("fails the build when a Lab Project names a glossary context that is not registered", async () => {
            await expect(
                loadHubContentFrom(root, [definition({ glossaryContext: "nowhere" })], [entry()]),
            ).rejects.toThrow("fixture names the unknown glossary context nowhere");
        });

        it("fails the build when a registered document does not exist", async () => {
            await expect(
                loadHubContentFrom(root, [definition({ readme: "packages/fixture/README.md" })], [entry()]),
            ).rejects.toThrow("names packages/fixture/README.md, which does not exist");
        });
    });

    describe("the real repository", () => {
        let content: HubContent;

        beforeAll(async () => {
            content = await loadHubContentFrom(findRepoRoot());
        });

        it("presents every registered Lab Project, in the catalog's order", () => {
            expect(content.projects.map((project) => project.id)).toEqual(
                catalogLabProjects.map((project) => project.id),
            );
            expect(content.projects.map((project) => project.id).sort()).toEqual(
                labProjects.map((project) => project.id).sort(),
            );
        });

        it("reads the version from the manifests and the public facts from the catalog", () => {
            const designSystem = content.projects.find((project) => project.id === "matrix-design-system");

            expect(designSystem?.version).toMatch(/^\d+\.\d+\.\d+/);
            expect(designSystem?.name).toBe("Matrix Design System");
            expect(designSystem?.type).toBe("npm package");
            expect(designSystem?.links.npm).toBe("https://www.npmjs.com/package/matrix-design-system");
        });

        it("gives every Project Card a description", () => {
            expect(content.projects.every((project) => project.description !== "")).toBe(true);
        });

        it("versions the Website from the root manifest, where its releases are cut", () => {
            const rootVersion = readRepoJson<{ version: string }>(findRepoRoot(), "package.json").version;

            expect(content.projects.find((project) => project.id === "website")?.version).toBe(rootVersion);
        });

        it("renders a README as HTML with its source path, and falls back to the description without one", () => {
            const designSystem = content.projects.find((project) => project.id === "matrix-design-system");
            const eslintPlugin = content.projects.find((project) => project.id === "eslint-plugin-chicio");

            expect(designSystem?.readme?.html).toContain("<h1");
            expect(designSystem?.readme?.sourcePath).toBe("packages/matrix-design-system/README.md");
            expect(eslintPlugin?.readme).toBeUndefined();
            expect(eslintPlugin?.description).not.toBe("");
        });

        it("only gives a changelog page to the Lab Projects that have a CHANGELOG", () => {
            expect(content.projects.filter((project) => project.changelog).map((project) => project.id)).toEqual([
                "website",
                "matrix-design-system",
                "matrix-rain-webgpu",
                "glossary-browser",
                "image-peek",
            ]);
        });

        it("gives each Lab Project that has a card image the path the catalog serves it from", () => {
            const images = Object.fromEntries(content.projects.map((project) => [project.id, project.cardImage]));

            expect(images["website"]).toBe("media/website.jpg");
            expect(images["matrix-design-system"]).toBe("media/matrix-design-system.png");
            expect(images["matrix-component-store"]).toBe("media/matrix-component-store.jpg");
            expect(images["chicio-labs-sdlc"]).toBeUndefined();
        });

        it("parses the CHANGELOG of every Lab Project that has one into releases", () => {
            for (const project of content.projects.filter((candidate) => candidate.changelog)) {
                expect(project.changelog?.releases.length, project.id).toBeGreaterThan(0);
                expect(project.changelog?.fileUrl).toContain("/blob/main/");
            }
        });

        it("resolves the compare links of the oldest Website releases to the repository", () => {
            const releases = content.projects.find((project) => project.id === "website")?.changelog?.releases ?? [];

            expect(releases.every((release) => !release.compareUrl?.startsWith("///"))).toBe(true);
        });

        it("reaches the hub's card images through the catalog package, not through per-image inputs", () => {
            const root = findRepoRoot();
            const hub = readRepoJson<{ dependencies: Record<string, string> }>(root, "apps/labs-hub/package.json");
            const pages = readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8");
            const turbo = readFileSync(path.join(root, "apps/labs-hub/turbo.json"), "utf8");

            expect(hub.dependencies["labs-catalog"]).toBeDefined();
            expect(pages).toContain('- "packages/labs-catalog/**"');
            expect(pages).toContain('- "**/brand/**"');
            expect(turbo).not.toMatch(/\.(jpg|png)"/);
        });

        it("attaches the Showcases to their Lab Projects", () => {
            const showcases = Object.fromEntries(
                content.projects.map((project) => [project.id, project.showcase?.url]),
            );

            expect(showcases["matrix-design-system"]).toBe("https://labs.fabrizioduroni.it/design-system/");
            expect(showcases["matrix-rain-webgpu"]).toBe("https://labs.fabrizioduroni.it/matrix-rain/");
        });

        it("renders each glossary context once, with its ADRs and the Lab Projects it covers", () => {
            const designSystem = content.contexts.find((context) => context.id === "matrix-design-system");

            expect(content.contexts.map((context) => context.id)).toEqual([
                "website",
                "matrix-design-system",
                "matrix-rain",
                "agentic-delivery",
            ]);
            expect(designSystem?.adrs.map((adr) => adr.number)).toEqual(["0001", "0002", "0003"]);
            expect(designSystem?.adrs[0]?.url).toBe("/glossary/matrix-design-system/adr/0001/");
            expect(designSystem?.projects.map((project) => project.id)).toEqual([
                "matrix-design-system",
                "matrix-component-store",
                "eslint-plugin-chicio",
            ]);
        });

        it("renders the system documents and their ADRs as the Chicio Labs glossary", () => {
            expect(content.system.glossaryMap.html).toContain("Glossary Map");
            expect(content.system.adrs.length).toBeGreaterThanOrEqual(7);
            expect(content.system.adrs[0]?.url).toBe("/glossary/chicio-labs/adr/0001/");
        });

        it("rewrites links to rendered documents to their hub pages", () => {
            expect(content.system.glossaryMap.html).toContain('href="/glossary/website/"');
        });

        it("never emits a link to a path the hub does not serve", () => {
            const html = [
                content.system.glossaryMap.html,
                ...content.projects.map((project) => project.readme?.html ?? ""),
            ].join("");

            expect(html).not.toMatch(/href="(\.\.?\/|[A-Za-z0-9_-]+\.md)/);
        });
    });

    describe("loadHubContent", () => {
        it("reads the repository once and hands the same content to every page", async () => {
            expect(await loadHubContent()).toBe(await loadHubContent());
        });
    });
});
