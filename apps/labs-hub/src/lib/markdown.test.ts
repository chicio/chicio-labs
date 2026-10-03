import { describe, expect, it } from "vitest";
import type { LinkContext } from "./links";
import { extractLead, extractTitle, renderMarkdown } from "./markdown";

const links: LinkContext = {
    pages: new Map([["docs/adr/0001-a.md", "/glossary/chicio-labs/adr/0001/"]]),
    isDirectory: () => false,
};

const render = (markdown: string, onLocalImage?: (repoPath: string) => void): Promise<string> =>
    renderMarkdown(markdown, { sourcePath: "README.md", links, onLocalImage });

describe("markdown", () => {
    describe("renderMarkdown", () => {
        it("gives headings GitHub-style ids", async () => {
            expect(await render("## Getting started")).toContain('<h2 id="getting-started">Getting started</h2>');
        });

        it("renders GFM tables inside the design system's table wrapper", async () => {
            const html = await render("| a | b |\n| - | - |\n| 1 | 2 |");

            expect(html).toContain('<div class="table-wrapper"><table>');
            expect(html).toContain("</table></div>");
        });

        it("expands emoji shortcodes", async () => {
            expect(await render("Done :memo:")).toContain("📝");
        });

        it("keeps nested code fences and mustache text verbatim", async () => {
            const html = await render("````md\n```ts\nconst a = {{ value }};\n```\n````");

            expect(html).toContain("```ts");
            expect(html).toContain("{{ value }}");
        });

        it("escapes placeholder text instead of treating it as markup", async () => {
            expect(await render("`<placeholder>`")).toContain("&#x3C;placeholder>");
        });

        it("drops raw HTML", async () => {
            expect(await render('<script>alert("x")</script>\n\ntext')).not.toContain("<script>");
        });

        it("rewrites a link to a registered document to its hub page", async () => {
            const html = await render("[ADR](docs/adr/0001-a.md)");

            expect(html).toContain('<a href="/glossary/chicio-labs/adr/0001/">ADR</a>');
        });

        it("opens a link that leaves the hub in a new tab", async () => {
            const html = await render("[Docs](https://example.com) and [file](LICENSE)");

            expect(html).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">Docs</a>');
            expect(html).toContain(
                '<a href="https://github.com/chicio/chicio-labs/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">file</a>',
            );
        });

        it("rewrites reference-style links and opens external ones in a new tab", async () => {
            const html = await render("[docs][d]\n\n[d]: LICENSE");

            expect(html).toContain('href="https://github.com/chicio/chicio-labs/blob/main/LICENSE"');
            expect(html).toContain('target="_blank"');
        });

        it("serves a local image from the hub and reports it", async () => {
            const reported: string[] = [];
            const html = await render("![Hero](brand/hero.jpg)", (repoPath) => reported.push(repoPath));

            expect(html).toContain('src="/docs-media/brand/hero.jpg"');
            expect(reported).toEqual(["brand/hero.jpg"]);
        });

        it("keeps a remote image and reports nothing", async () => {
            const reported: string[] = [];
            const html = await render("![Badge](https://img.shields.io/x.svg)", (repoPath) => reported.push(repoPath));

            expect(html).toContain('src="https://img.shields.io/x.svg"');
            expect(reported).toEqual([]);
        });

        it("renders a local image without a listener", async () => {
            expect(await render("![Hero](brand/hero.jpg)")).toContain("/docs-media/brand/hero.jpg");
        });
    });

    describe("extractTitle", () => {
        it("reads the first level-one heading and strips inline marks", () => {
            expect(extractTitle("intro\n\n# The `Hub` *docs*\n\n# Second", "fallback")).toBe("The Hub docs");
        });

        it("ignores a hash comment inside a code fence", () => {
            expect(extractTitle("```bash\n# install\n```\n\n# Real title", "fallback")).toBe("Real title");
        });

        it("falls back when there is no level-one heading", () => {
            expect(extractTitle("## Only a subheading", "CHANGELOG.md")).toBe("CHANGELOG.md");
        });
    });

    describe("extractLead", () => {
        it("is the first paragraph as plain text, without links, emphasis, code marks or line breaks", () => {
            const markdown =
                "# Title\n\nThe [source](https://x.dev) of **a** `site`,\nin two lines.\n\nSecond paragraph.";

            expect(extractLead(markdown)).toBe("The source of a site, in two lines.");
        });

        it("is empty when the document has no paragraph", () => {
            expect(extractLead("# Only a title\n\n- a list")).toBe("");
        });
    });
});
