import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { describeProject, loadHubContent, loadHubContentFrom, type HubContent } from "./content";
import { findRepoRoot, readRepoJson } from "./repo";
import { labProjects, type LabProjectDefinition } from "./registry";

describe("content", () => {
    describe("describeProject", () => {
        const [website] = labProjects;
        const converter = labProjects.find((project) => project.manifest.type === "none");

        it("trims the manifest description", () => {
            expect(website && describeProject(website, { description: "  A site  " })).toBe("A site");
        });

        it("drops the plugin kind prefix a plugin manifest carries", () => {
            expect(
                website &&
                    describeProject(website, {
                        description: "Project Plugin, Chicio Labs only. The agentic pipeline",
                    }),
            ).toBe("The agentic pipeline");
            expect(website && describeProject(website, { description: "Public Plugin. Browse a glossary" })).toBe(
                "Browse a glossary",
            );
        });

        it("uses the description the registry carries when there is no manifest", () => {
            expect(converter && describeProject(converter, {})).toBe(
                converter?.manifest.type === "none" ? converter.manifest.description : undefined,
            );
        });

        it("is empty when neither the manifest nor a README says anything", () => {
            expect(website && describeProject(website, {})).toBe("");
            expect(website && describeProject(website, {}, "# Title only")).toBe("");
        });

        it("falls back to the README lead paragraph when the manifest has no description", () => {
            expect(website && describeProject(website, {}, "# Site\n\nThe [source](./x.md) of a **site**.")).toBe(
                "The source of a site.",
            );
        });

        it("prefers the manifest description over the README", () => {
            expect(website && describeProject(website, { description: "From manifest" }, "# T\n\nFrom README")).toBe(
                "From manifest",
            );
        });
    });

    describe("a registry that does not describe a Lab Project", () => {
        let root: string;

        const definition = (overrides: Partial<LabProjectDefinition>): LabProjectDefinition => ({
            id: "fixture",
            name: "Fixture",
            kind: "workbench",
            sourcePath: "packages/fixture",
            manifest: { type: "package" },
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
            writeFixture({ "package.json": JSON.stringify({ workspaces: ["packages/*"] }) });
        });

        afterEach(() => {
            rmSync(root, { recursive: true, force: true });
        });

        it("fails the build when the manifest has no description and there is no README", async () => {
            writeFixture({ "packages/fixture/package.json": JSON.stringify({ name: "fixture" }) });

            await expect(loadHubContentFrom(root, [definition({})])).rejects.toThrow(
                "fixture has no description to present",
            );
        });

        it("fails the build when the README has no lead paragraph either", async () => {
            writeFixture({
                "packages/fixture/package.json": JSON.stringify({ name: "fixture" }),
                "packages/fixture/README.md": "# Fixture\n\n- only a list\n",
            });

            await expect(
                loadHubContentFrom(root, [definition({ readme: "packages/fixture/README.md" })]),
            ).rejects.toThrow("fixture has no description to present");
        });

        it("fails the build when a Lab Project names a glossary context that is not registered", async () => {
            writeFixture({ "packages/fixture/package.json": JSON.stringify({ name: "fixture", description: "A" }) });

            await expect(loadHubContentFrom(root, [definition({ glossaryContext: "nowhere" })])).rejects.toThrow(
                "fixture names the unknown glossary context nowhere",
            );
        });
    });

    describe("the real repository", () => {
        let content: HubContent;

        beforeAll(async () => {
            content = await loadHubContentFrom(findRepoRoot());
        });

        it("presents every registered Lab Project, published first in registry order", () => {
            expect(content.projects.map((project) => project.id)).toEqual(labProjects.map((project) => project.id));
        });

        it("reads version, npm name and description from the manifests", () => {
            const designSystem = content.projects.find((project) => project.id === "matrix-design-system");

            expect(designSystem?.packageName).toBe("matrix-design-system");
            expect(designSystem?.version).toMatch(/^\d+\.\d+\.\d+/);
            expect(designSystem?.description).not.toBe("");
        });

        it("gives every Project Card a description, the Website's from its README lead", () => {
            expect(content.projects.every((project) => project.description !== "")).toBe(true);
            expect(content.projects.find((project) => project.id === "website")?.description).toMatch(
                /^The source of fabrizioduroni\.it, one of the Lab Projects of Chicio Labs/,
            );
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
            ]);
        });

        it("lists a plugin's agents and skills under the plugin's name", () => {
            const sdlc = content.projects.find((project) => project.id === "chicio-labs-sdlc");

            expect(sdlc?.agents.map((agent) => agent.name)).toContain("chicio-labs-sdlc:implementer");
            expect(sdlc?.skills.map((skill) => skill.name)).toContain("chicio-labs-sdlc:sdlc");
            expect(sdlc?.agents.every((agent) => agent.description !== "")).toBe(true);
        });

        it("gives packages no agents or skills", () => {
            expect(content.projects.find((project) => project.id === "website")?.agents).toEqual([]);
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
                "design-converter",
            ]);
        });

        it("renders the system documents and their ADRs", () => {
            expect(content.system.readme.html).toContain("<h1");
            expect(content.system.glossaryMap.html).toContain("Glossary Map");
            expect(content.system.adrs.length).toBeGreaterThanOrEqual(7);
            expect(content.system.adrs[0]?.url).toBe("/chicio-labs/adr/0001/");
        });

        it("rewrites links to rendered documents to their hub pages", () => {
            expect(content.system.glossaryMap.html).toContain('href="/glossary/website/"');
        });

        it("serves the images the documents embed", () => {
            expect(content.mediaPaths).toContain("brand/readme-hero.jpg");
        });

        it("never emits a link to a path the hub does not serve", () => {
            const html = [
                content.system.readme.html,
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
