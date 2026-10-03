import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findRepoRoot, isRepoDirectory, listRepoDirectory, readRepoJson, repoFileExists } from "./repo";

describe("repo", () => {
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(path.join(tmpdir(), "labs-hub-repo-"));
        writeFileSync(path.join(root, "package.json"), JSON.stringify({ workspaces: ["apps/*"] }));
        mkdirSync(path.join(root, "apps/hub/src"), { recursive: true });
        writeFileSync(path.join(root, "apps/hub/package.json"), JSON.stringify({ name: "hub" }));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    describe("findRepoRoot", () => {
        it("walks up past a workspace manifest to the one declaring workspaces", () => {
            expect(findRepoRoot(path.join(root, "apps/hub/src"))).toBe(root);
        });

        it("throws when no ancestor declares workspaces", () => {
            const lone = mkdtempSync(path.join(tmpdir(), "labs-hub-lone-"));

            try {
                expect(() => findRepoRoot(lone)).toThrow(/No repository root/);
            } finally {
                rmSync(lone, { recursive: true, force: true });
            }
        });

        it("finds the real repository from the hub's own folder", () => {
            expect(repoFileExists(findRepoRoot(), "GLOSSARY-MAP.md")).toBe(true);
        });
    });

    describe("filesystem helpers", () => {
        it("reads a JSON file", () => {
            expect(readRepoJson<{ name: string }>(root, "apps/hub/package.json").name).toBe("hub");
        });

        it("tells a directory from a file and from nothing", () => {
            expect(isRepoDirectory(root, "apps/hub")).toBe(true);
            expect(isRepoDirectory(root, "apps/hub/package.json")).toBe(false);
            expect(isRepoDirectory(root, "apps/missing")).toBe(false);
        });

        it("lists a directory sorted, and nothing for a missing one", () => {
            expect(listRepoDirectory(root, "apps/hub")).toEqual(["package.json", "src"]);
            expect(listRepoDirectory(root, "apps/missing")).toEqual([]);
        });
    });
});
