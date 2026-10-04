import { describe, expect, it } from "vitest";
import { formatReleaseDate, parseChangelog } from "./changelog";
import { findRepoRoot, readRepoFile } from "./repo";

const modern = `# Changelog

## [2.0.3](https://github.com/chicio/chicio-blog/compare/matrix-rain-webgpu%402.0.2...matrix-rain-webgpu%402.0.3) (2026-09-11)

### Bug Fixes

* **capabilities:** :art: make the formatting gate runnable and enforce it in CI ([#635](https://github.com/chicio/chicio-blog/issues/635)) ([2359bf3](https://github.com/chicio/chicio-blog/commit/2359bf3f7ccdcfdeb52adb07c0cd75c304176ad0))
* **capabilities:** :heavy_plus_sign: declare @astrojs/markdown-remark ([#614](https://github.com/chicio/chicio-blog/issues/614)) ([38e0dc5](https://github.com/chicio/chicio-blog/commit/38e0dc5001a48da77a6289052df7cf053df1f3dd)), references [#610](https://github.com/chicio/chicio-blog/issues/610)
* :bug: a change with no scope ([#545](https://github.com/chicio/chicio-blog/issues/545)) ([4bec4e2](https://github.com/chicio/chicio-blog/commit/4bec4e29039f505bf513a3e66caec32576224636))

## [2.0.2](https://github.com/chicio/chicio-blog/compare/matrix-rain-webgpu@2.0.1...matrix-rain-webgpu@2.0.2) (2026-08-31)

## [2.0.1](https://github.com/chicio/chicio-blog/compare/matrix-rain-webgpu@2.0.0...matrix-rain-webgpu@2.0.1) (2026-08-31)

### Features

* **capabilities:** :construction_worker: wire releases into the monorepo ([#567](https://github.com/chicio/chicio-blog/issues/567)) ([5a1262e](https://github.com/chicio/chicio-blog/commit/5a1262e3746f99dfdf028d5354dc20dc5a601c05)), closes [#564](https://github.com/chicio/chicio-blog/issues/564)
`;

describe("changelog", () => {
    describe("formatReleaseDate", () => {
        it("writes an ISO date as DD Mon YYYY", () => {
            expect(formatReleaseDate("2026-09-11")).toBe("11 Sep 2026");
            expect(formatReleaseDate("2025-01-03")).toBe("03 Jan 2025");
        });

        it("leaves anything that is not an ISO date untouched", () => {
            expect(formatReleaseDate("yesterday")).toBe("yesterday");
            expect(formatReleaseDate("2026-13-01")).toBe("2026-13-01");
        });
    });

    describe("parseChangelog", () => {
        const releases = parseChangelog(modern);

        it("reads every release with its version, date and compare link, in document order", () => {
            expect(releases.map((release) => release.version)).toEqual(["2.0.3", "2.0.2", "2.0.1"]);
            expect(releases[0]?.date).toBe("2026-09-11");
            expect(releases[0]?.compareUrl).toBe(
                "https://github.com/chicio/chicio-blog/compare/matrix-rain-webgpu%402.0.2...matrix-rain-webgpu%402.0.3",
            );
        });

        it("keeps a release with no notable changes as a release with no group", () => {
            expect(releases[1]?.groups).toEqual([]);
        });

        it("reads the groups of a release and their entries", () => {
            expect(releases[0]?.groups.map((group) => group.title)).toEqual(["Bug Fixes"]);
            expect(releases[0]?.groups[0]?.entries).toHaveLength(3);
        });

        it("splits an entry into scope, message and commit, dropping shortcodes and the pull request link", () => {
            expect(releases[0]?.groups[0]?.entries[0]).toEqual({
                scope: "capabilities",
                message: "make the formatting gate runnable and enforce it in CI",
                commit: "2359bf3",
                commitUrl: "https://github.com/chicio/chicio-blog/commit/2359bf3f7ccdcfdeb52adb07c0cd75c304176ad0",
            });
        });

        it("drops the trailing references and closes text", () => {
            expect(releases[0]?.groups[0]?.entries[1]?.message).toBe("declare @astrojs/markdown-remark");
            expect(releases[2]?.groups[0]?.entries[0]?.message).toBe("wire releases into the monorepo");
        });

        it("accepts an entry with no scope", () => {
            const entry = releases[0]?.groups[0]?.entries[2];

            expect(entry?.scope).toBeUndefined();
            expect(entry?.message).toBe("a change with no scope");
        });

        it("reads a breaking change, which has a scope but no commit", () => {
            const [release] = parseChangelog(
                "## [5.0.0](https://x/compare/v4.0.0...v5.0.0) (2026-01-01)\n\n### ⚠ BREAKING CHANGES\n\n* **capabilities:** Footer no longer takes navHrefs.\n",
            );

            expect(release?.groups[0]?.title).toBe("⚠ BREAKING CHANGES");
            expect(release?.groups[0]?.entries[0]).toEqual({
                scope: "capabilities",
                message: "Footer no longer takes navHrefs.",
                commit: undefined,
                commitUrl: undefined,
            });
        });

        it("reads an old entry whose commit hash is not a link, and builds the commit URL from the compare link", () => {
            const [release] = parseChangelog(
                "## [3.7.0](https://github.com/chicio/chicio-blog/compare/v3.6.0...v3.7.0) (2026-01-03)\n\n### Features\n\n* **capabilities:** :sparkles: llms.txt ([#172](undefined/undefined/undefined/issues/172)) d9bbb1b\n* **capabilities:** ✨ RSS feed 9df4784\n",
            );

            expect(release?.groups[0]?.entries).toEqual([
                {
                    scope: "capabilities",
                    message: "llms.txt",
                    commit: "d9bbb1b",
                    commitUrl: "https://github.com/chicio/chicio-blog/commit/d9bbb1b",
                },
                {
                    scope: "capabilities",
                    message: "RSS feed",
                    commit: "9df4784",
                    commitUrl: "https://github.com/chicio/chicio-blog/commit/9df4784",
                },
            ]);
        });

        it("does not mistake a trailing word for a commit hash", () => {
            const [release] = parseChangelog("## [1.0.0](https://x/compare/a...b) (2026-01-01)\n\n### Features\n\n* **a:** decaded\n");

            expect(release?.groups[0]?.entries[0]?.message).toBe("decaded");
            expect(release?.groups[0]?.entries[0]?.commit).toBeUndefined();
        });

        it("resolves a compare link through the resolver, which is how a /// link reaches the repository", () => {
            const [release] = parseChangelog(
                "## [3.7.0](///compare/v3.6.0...v3.7.0) (2026-01-03)\n\n### Features\n\n* **a:** :sparkles: a thing 82e2099\n",
                { resolveUrl: (href) => href.replace("///", "https://github.com/chicio/chicio-labs/") },
            );

            expect(release?.compareUrl).toBe("https://github.com/chicio/chicio-labs/compare/v3.6.0...v3.7.0");
            expect(release?.groups[0]?.entries[0]?.commitUrl).toBe(
                "https://github.com/chicio/chicio-labs/commit/82e2099",
            );
        });

        it("reads the oldest releases: a scope with no colon, a dash bullet, and a date on its own line", () => {
            const releases = parseChangelog(
                "## [2.0.0](https://x/compare/v1...v2) (2025-08-29)\n\n### Features\n\n* **ux** matrix revamp\n\n## [1.0.0](https://x/releases/tag/v1.0.0)\n\nRelease date: 2025-01-19.\n\n### Features\n\n- Initial release.\n",
            );

            expect(releases[0]?.groups[0]?.entries[0]).toMatchObject({ scope: "ux", message: "matrix revamp" });
            expect(releases[1]).toMatchObject({ version: "1.0.0", date: "2025-01-19" });
            expect(releases[1]?.groups[0]?.entries[0]?.message).toBe("Initial release.");
        });

        it("reads a prerelease version", () => {
            const [release] = parseChangelog("## [1.0.0-beta.1](https://x/compare/a...b) (2026-06-01)\n");

            expect(release?.version).toBe("1.0.0-beta.1");
        });

        it("reads a release heading with no link and no date", () => {
            const [release] = parseChangelog("## 1.2.3\n\n### Features\n\n* **a:** b\n");

            expect(release).toMatchObject({ version: "1.2.3", date: undefined, compareUrl: undefined });
        });

        it("ignores everything before the first release and entries outside a group", () => {
            const parsed = parseChangelog("# Changelog\n\n* **a:** stray 1234567\n\n## [1.0.0](https://x/compare/a...b) (2026-01-01)\n\n* **a:** orphan 1234567\n");

            expect(parsed).toHaveLength(1);
            expect(parsed[0]?.groups).toEqual([]);
        });

        it("finds no release in a document that is not a changelog", () => {
            expect(parseChangelog("# Changelog\n\nNothing here yet.\n")).toEqual([]);
        });
    });

    describe("the real CHANGELOGs", () => {
        const root = findRepoRoot();
        const files = [
            "CHANGELOG.md",
            "packages/matrix-design-system/CHANGELOG.md",
            "packages/matrix-rain-webgpu/CHANGELOG.md",
            "claude-plugins/glossary-browser/CHANGELOG.md",
            "claude-plugins/image-peek/CHANGELOG.md",
        ];

        it.each(files)("%s parses into releases whose entries all carry a message", (file) => {
            const releases = parseChangelog(readRepoFile(root, file));

            expect(releases.length).toBeGreaterThan(0);
            expect(releases.every((release) => release.version !== "")).toBe(true);
            expect(releases.every((release) => release.date !== undefined)).toBe(true);

            for (const release of releases) {
                for (const group of release.groups) {
                    expect(group.entries.length, `${release.version} ${group.title}`).toBeGreaterThan(0);

                    for (const entry of group.entries) {
                        expect(entry.message, `${release.version}: ${entry.message}`).not.toBe("");
                        expect(entry.message).not.toMatch(/:[a-z_]+:|\]\(|, (closes|references) /);
                    }
                }
            }
        });

        it("keeps a release with nothing notable in Matrix Rain", () => {
            const releases = parseChangelog(readRepoFile(root, "packages/matrix-rain-webgpu/CHANGELOG.md"));

            expect(releases.find((release) => release.version === "2.0.2")?.groups).toEqual([]);
        });

        it("reads the breaking changes of the Website, which carry no commit", () => {
            const releases = parseChangelog(readRepoFile(root, "CHANGELOG.md"));
            const breaking = releases.flatMap((release) =>
                release.groups.filter((group) => group.title.includes("BREAKING")),
            );

            expect(breaking.length).toBeGreaterThan(0);
            expect(breaking.every((group) => group.entries.every((entry) => entry.commit === undefined))).toBe(true);
        });
    });
});
