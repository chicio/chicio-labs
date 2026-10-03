import { describe, expect, it } from "vitest";
import { rewriteImage, rewriteLink, type LinkContext } from "./links";

const context: LinkContext = {
    pages: new Map([
        ["packages/lib/README.md", "/lab/lib/"],
        ["packages/lib/CHANGELOG.md", "/lab/lib/changelog/"],
        ["GLOSSARY-MAP.md", "/glossary/chicio-labs/"],
        ["docs/adr/0001-monorepo.md", "/glossary/chicio-labs/adr/0001/"],
    ]),
    isDirectory: (repoPath) => repoPath === "packages/lib" || repoPath === "claude-plugins",
};

describe("links", () => {
    describe("rewriteLink", () => {
        it("keeps a fragment on the same page", () => {
            expect(rewriteLink("README.md", "#install", context)).toEqual({ href: "#install", external: false });
        });

        it("keeps an absolute link and opens http(s) ones in a new tab", () => {
            expect(rewriteLink("README.md", "https://example.com/x", context)).toEqual({
                href: "https://example.com/x",
                external: true,
            });
            expect(rewriteLink("README.md", "mailto:me@example.com", context)).toEqual({
                href: "mailto:me@example.com",
                external: false,
            });
        });

        it("leads a link to a registered document to its hub page", () => {
            expect(rewriteLink("packages/lib/other.md", "./README.md", context)).toEqual({
                href: "/lab/lib/",
                external: false,
            });
            expect(rewriteLink("README.md", "packages/lib/CHANGELOG.md", context)).toEqual({
                href: "/lab/lib/changelog/",
                external: false,
            });
        });

        it("keeps the fragment of a link to a hub page", () => {
            expect(rewriteLink("README.md", "packages/lib/README.md#usage", context).href).toBe("/lab/lib/#usage");
        });

        it("resolves a link relative to the document it appears in", () => {
            expect(rewriteLink("claude-plugins/x/README.md", "../../docs/adr/0001-monorepo.md", context).href).toBe(
                "/glossary/chicio-labs/adr/0001/",
            );
        });

        it("resolves a root-absolute link against the repository root", () => {
            expect(rewriteLink("packages/lib/README.md", "/GLOSSARY-MAP.md", context).href).toBe(
                "/glossary/chicio-labs/",
            );
        });

        it("sends an unrendered file to GitHub as a blob in a new tab", () => {
            expect(rewriteLink("README.md", "./LICENSE", context)).toEqual({
                href: "https://github.com/chicio/chicio-labs/blob/main/LICENSE",
                external: true,
            });
        });

        it("sends a folder to GitHub as a tree", () => {
            expect(rewriteLink("README.md", "packages/lib/", context)).toEqual({
                href: "https://github.com/chicio/chicio-labs/tree/main/packages/lib",
                external: true,
            });
        });

        it("keeps the query and fragment of a GitHub link", () => {
            expect(rewriteLink("README.md", "src/a.ts#L10", context).href).toBe(
                "https://github.com/chicio/chicio-labs/blob/main/src/a.ts#L10",
            );
        });

        it("resolves a GitHub-relative link that climbs out of the repository against the repository URL", () => {
            expect(rewriteLink("README.md", "../../actions/workflows/ci.yml", context)).toEqual({
                href: "https://github.com/chicio/chicio-labs/actions/workflows/ci.yml",
                external: true,
            });
        });

        it("sends a link to the repository root to the repository", () => {
            expect(rewriteLink("packages/lib/README.md", "../..", context)).toEqual({
                href: "https://github.com/chicio/chicio-labs",
                external: true,
            });
        });

        it("repairs the triple-slash compare links of old changelog entries", () => {
            expect(rewriteLink("CHANGELOG.md", "///compare/v3.5.0...v3.6.0", context)).toEqual({
                href: "https://github.com/chicio/chicio-labs/compare/v3.5.0...v3.6.0",
                external: true,
            });
        });

        it("leaves an empty link and a query-only link alone", () => {
            expect(rewriteLink("README.md", "", context)).toEqual({ href: "", external: false });
            expect(rewriteLink("README.md", "?tab=a", context)).toEqual({ href: "?tab=a", external: false });
        });
    });

    describe("rewriteImage", () => {
        it("keeps a remote image", () => {
            expect(rewriteImage("README.md", "https://img.shields.io/x.svg")).toEqual({
                src: "https://img.shields.io/x.svg",
            });
        });

        it("serves a repository image from the hub", () => {
            expect(rewriteImage("README.md", "brand/readme-hero.jpg")).toEqual({
                src: "/docs-media/brand/readme-hero.jpg",
                localPath: "brand/readme-hero.jpg",
            });
        });

        it("resolves an image relative to its document", () => {
            expect(rewriteImage("packages/lib/README.md", "./img/a.png").localPath).toBe("packages/lib/img/a.png");
        });

        it("keeps an image that points outside the repository", () => {
            expect(rewriteImage("README.md", "../outside.png")).toEqual({ src: "../outside.png" });
        });

        it("keeps an empty source", () => {
            expect(rewriteImage("README.md", "")).toEqual({ src: "" });
        });
    });
});
