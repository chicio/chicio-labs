import type { Element, Root as HastRoot } from "hast";
import type { Paragraph, PhrasingContent, Root as MdastRoot } from "mdast";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";
import { rewriteImage, rewriteLink, type LinkContext } from "./links";

export interface MarkdownOptions {
    /** The repository path of the document being rendered: relative links and images resolve against it. */
    sourcePath: string;
    links: LinkContext;
    /** Called with the repository path of every local image the document embeds. */
    onLocalImage?: (repoPath: string) => void;
}

const newTab = { target: "_blank", rel: ["noopener", "noreferrer"] };

const remarkRewriteReferences =
    ({ sourcePath, links, onLocalImage }: MarkdownOptions) =>
    () =>
    (tree: MdastRoot): void => {
        const externalDefinitions = new Set<string>();

        visit(tree, (node) => {
            if (node.type === "definition") {
                const rewritten = rewriteLink(sourcePath, node.url, links);

                node.url = rewritten.href;

                if (rewritten.external) {
                    externalDefinitions.add(node.identifier);
                }
            } else if (node.type === "link") {
                const rewritten = rewriteLink(sourcePath, node.url, links);

                node.url = rewritten.href;

                if (rewritten.external) {
                    node.data = { ...node.data, hProperties: newTab };
                }
            } else if (node.type === "image") {
                const rewritten = rewriteImage(sourcePath, node.url);

                node.url = rewritten.src;

                if (rewritten.localPath !== undefined) {
                    onLocalImage?.(rewritten.localPath);
                }
            }
        });

        visit(tree, "linkReference", (node) => {
            if (externalDefinitions.has(node.identifier)) {
                node.data = { ...node.data, hProperties: newTab };
            }
        });
    };

const isTable = (node: Element): boolean => node.tagName === "table";

/** The design system styles `.table-wrapper`: a bordered, horizontally scrollable frame around a table. */
const rehypeWrapTables = () => (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
        if (!isTable(node) || parent === undefined || index === undefined) {
            return;
        }

        parent.children[index] = {
            type: "element",
            tagName: "div",
            properties: { className: ["table-wrapper"] },
            children: [node],
        };

        return [SKIP, index + 1];
    });
};

/**
 * Renders a Markdown document of the repository to HTML for the hub. Raw HTML in the source is dropped, not passed
 * through: the documents are plain Markdown, so there is nothing to execute and nothing to escape.
 */
export const renderMarkdown = async (markdown: string, options: MarkdownOptions): Promise<string> => {
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkEmoji)
        .use(remarkRewriteReferences(options))
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeWrapTables)
        .use(rehypeStringify)
        .process(markdown);

    return String(file);
};

const firstHeadingPattern = /^#\s+(.+?)\s*#*\s*$/m;
const fencedCodePattern = /^(```|~~~)[\s\S]*?^\1/gm;

/** The text of the first level-one heading, without inline Markdown marks, or the fallback. */
export const extractTitle = (markdown: string, fallback: string): string => {
    const heading = firstHeadingPattern.exec(markdown.replace(fencedCodePattern, ""))?.[1];

    return heading === undefined ? fallback : heading.replace(/[`*_]/g, "");
};

const inlineText = (node: PhrasingContent): string => {
    if (node.type === "text" || node.type === "inlineCode") {
        return node.value;
    }

    return "children" in node ? node.children.map(inlineText).join("") : "";
};

/** The lead paragraph of a document as plain text: no links, emphasis or code marks. Empty when there is none. */
export const extractLead = (markdown: string): string => {
    const paragraph = unified()
        .use(remarkParse)
        .parse(markdown)
        .children.find((node): node is Paragraph => node.type === "paragraph");

    return paragraph === undefined ? "" : paragraph.children.map(inlineText).join("").replace(/\s+/g, " ").trim();
};
