import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    assertComplete,
    checkCompleteness,
    discoverLabProjectSources,
    discoverPlugins,
    discoverWorkspaces,
} from "./completeness";
import { labProjects, type LabProjectDefinition } from "./registry";
import { findRepoRoot } from "./repo";

const project = (overrides: Partial<LabProjectDefinition>): LabProjectDefinition => ({
    id: "id",
    name: "Name",
    kind: "workbench",
    sourcePath: "packages/a",
    manifest: { type: "package" },
    ...overrides,
});

describe("completeness", () => {
    describe("checkCompleteness", () => {
        it("reports nothing when every source is covered", () => {
            const report = checkCompleteness([project({ sourcePath: "packages/a" })], ["packages/a"]);

            expect(report).toEqual({ missing: [], extra: [] });
        });

        it("reports a workspace or plugin no Lab Project covers", () => {
            const report = checkCompleteness([project({})], ["packages/a", "packages/b", "claude-plugins/c"]);

            expect(report.missing).toEqual(["claude-plugins/c", "packages/b"]);
        });

        it("reports a registered source that is not in the repository", () => {
            const report = checkCompleteness([project({ sourcePath: "packages/gone" })], ["packages/a"]);

            expect(report.extra).toEqual(["packages/gone"]);
            expect(report.missing).toEqual(["packages/a"]);
        });

        it("counts a Showcase workspace as covered by its Lab Project", () => {
            const covering = project({
                showcase: { label: "Showcase", url: "https://example.com/", sourcePath: "apps/showcase" },
            });

            const report = checkCompleteness([covering], ["packages/a", "apps/showcase"]);

            expect(report).toEqual({ missing: [], extra: [] });
        });

        it("reports a Showcase whose workspace does not exist", () => {
            const covering = project({
                showcase: { label: "Showcase", url: "https://example.com/", sourcePath: "apps/showcase" },
            });

            expect(checkCompleteness([covering], ["packages/a"]).extra).toEqual(["apps/showcase"]);
        });

        it("does not look for a manifest-less Lab Project in the repository", () => {
            const converter = project({
                sourcePath: "packages/a/.design-sync",
                manifest: { type: "none", description: "A converter" },
            });

            expect(checkCompleteness([converter], []).extra).toEqual([]);
        });
    });

    describe("assertComplete", () => {
        it("accepts a complete registry", () => {
            expect(() => assertComplete({ missing: [], extra: [] })).not.toThrow();
        });

        it("names every gap in the error", () => {
            expect(() => assertComplete({ missing: ["packages/b"], extra: ["packages/gone"] })).toThrow(
                /packages\/b exists but no Lab Project covers it[\s\S]*packages\/gone is registered/,
            );
        });
    });

    describe("discovery", () => {
        let root: string;

        const manifest = (directory: string, name: string): void => {
            mkdirSync(path.join(root, directory), { recursive: true });
            writeFileSync(path.join(root, directory, name), "{}");
        };

        beforeEach(() => {
            root = mkdtempSync(path.join(tmpdir(), "labs-hub-completeness-"));
            writeFileSync(
                path.join(root, "package.json"),
                JSON.stringify({ workspaces: ["apps/*", "packages/*", "tools/single"] }),
            );
            manifest("apps/site", "package.json");
            manifest("packages/lib", "package.json");
            manifest("tools/single", "package.json");
            mkdirSync(path.join(root, "packages/not-a-workspace"), { recursive: true });
            manifest("claude-plugins/plug/.claude-plugin", "plugin.json");
            mkdirSync(path.join(root, "claude-plugins/docs"), { recursive: true });
        });

        afterEach(() => {
            rmSync(root, { recursive: true, force: true });
        });

        it("expands the workspace globs to the folders holding a package.json", () => {
            expect(discoverWorkspaces(root)).toEqual(["apps/site", "packages/lib", "tools/single"]);
        });

        it("finds only the plugin folders that carry a plugin manifest", () => {
            expect(discoverPlugins(root)).toEqual(["claude-plugins/plug"]);
        });

        it("joins workspaces and plugins", () => {
            expect(discoverLabProjectSources(root)).toEqual([
                "apps/site",
                "packages/lib",
                "tools/single",
                "claude-plugins/plug",
            ]);
        });

        it("ignores a workspace pattern without a package.json", () => {
            writeFileSync(path.join(root, "package.json"), JSON.stringify({ workspaces: ["tools/missing"] }));

            expect(discoverWorkspaces(root)).toEqual([]);
        });

        it("treats a root manifest without workspaces as having none", () => {
            writeFileSync(path.join(root, "package.json"), "{}");

            expect(discoverWorkspaces(root)).toEqual([]);
        });
    });

    describe("the real repository", () => {
        it("has a Lab Project for every workspace and plugin", () => {
            const root = findRepoRoot();

            expect(checkCompleteness(labProjects, discoverLabProjectSources(root))).toEqual({
                missing: [],
                extra: [],
            });
        });
    });
});
