import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { toString as mdastToString } from "mdast-util-to-string";
import type {
    Emphasis,
    Heading,
    Image,
    Link,
    Paragraph,
    PhrasingContent,
    Root,
    RootContent,
    Strong,
    Text,
} from "mdast";
import type {
    MdxJsxAttribute,
    MdxJsxAttributeValueExpression,
    MdxJsxFlowElement,
    MdxJsxTextElement,
} from "mdast-util-mdx-jsx";
import type { Expression } from "estree-jsx";

type MdxJsxElement = MdxJsxFlowElement | MdxJsxTextElement;
type AnyContent = RootContent | PhrasingContent;

const textNode = (value: string): Text => ({ type: "text", value });

const emphasisNode = (value: string): Emphasis => ({ type: "emphasis", children: [textNode(value)] });

const strongNode = (value: string): Strong => ({ type: "strong", children: [textNode(value)] });

const imageNode = (url: string, alt: string): Image => ({ type: "image", url, alt });

const linkNode = (url: string, label: string): Link => ({ type: "link", url, children: [textNode(label)] });

const paragraphNode = (children: PhrasingContent[]): Paragraph => ({ type: "paragraph", children });

const headingNode = (depth: 1 | 2 | 3 | 4 | 5 | 6, text: string): Heading => ({
    type: "heading",
    depth,
    children: [textNode(text)],
});

const placeholderPhrase = (name: string): Emphasis => emphasisNode(`[interactive: ${name} — open the page]`);

const isJsxAttribute = (attribute: MdxJsxElement["attributes"][number]): attribute is MdxJsxAttribute =>
    attribute.type === "mdxJsxAttribute";

const getAttribute = (node: MdxJsxElement, name: string): MdxJsxAttribute | undefined => {
    for (const attribute of node.attributes) {
        if (isJsxAttribute(attribute) && attribute.name === name) {
            return attribute;
        }
    }

    return undefined;
};

const getEstreeExpression = (value: MdxJsxAttributeValueExpression): Expression | undefined => {
    const statement = value.data?.estree?.body[0];

    return statement?.type === "ExpressionStatement" ? (statement.expression as Expression) : undefined;
};

const getStringAttribute = (node: MdxJsxElement, name: string): string | undefined => {
    const attribute = getAttribute(node, name);

    if (!attribute || attribute.value == null) {
        return undefined;
    }
    if (typeof attribute.value === "string") {
        return attribute.value;
    }

    const expression = getEstreeExpression(attribute.value);

    return expression?.type === "Literal" && typeof expression.value === "string" ? expression.value : undefined;
};

const getStringArrayAttribute = (node: MdxJsxElement, name: string): string[] => {
    const attribute = getAttribute(node, name);

    if (!attribute || attribute.value == null || typeof attribute.value === "string") {
        return [];
    }

    const expression = getEstreeExpression(attribute.value);

    if (expression?.type !== "ArrayExpression") {
        return [];
    }

    return expression.elements.flatMap((element) =>
        element?.type === "Literal" && typeof element.value === "string" ? [element.value] : [],
    );
};

const wrapForContext = (node: MdxJsxElement, phrasing: PhrasingContent[]): AnyContent[] =>
    node.type === "mdxJsxTextElement" ? phrasing : [paragraphNode(phrasing)];

const transformImageCarousel = (node: MdxJsxElement): AnyContent[] => {
    const images = getStringArrayAttribute(node, "images");
    const alt = getStringAttribute(node, "alt") ?? "";
    const caption = getStringAttribute(node, "caption");

    if (images.length === 0) {
        return wrapForContext(node, [placeholderPhrase("ImageCarousel")]);
    }
    if (node.type === "mdxJsxTextElement") {
        const phrasing: PhrasingContent[] = images.map((src) => imageNode(src, alt));

        if (caption) {
            phrasing.push(emphasisNode(caption));
        }

        return phrasing;
    }

    const blocks: AnyContent[] = images.map((src) => paragraphNode([imageNode(src, alt)]));

    if (caption) {
        blocks.push(paragraphNode([emphasisNode(caption)]));
    }

    return blocks;
};

const transformParagraphTitleWithIcon = (node: MdxJsxElement): AnyContent[] => {
    const text = mdastToString(node).trim();

    return node.type === "mdxJsxTextElement" ? [textNode(text)] : [headingNode(2, text)];
};

const transformYoutube = (node: MdxJsxElement): AnyContent[] => {
    const videoId = getStringAttribute(node, "videoId");
    const url = videoId ? `https://youtu.be/${videoId}` : getStringAttribute(node, "url");

    if (!url) {
        return wrapForContext(node, [placeholderPhrase("Youtube")]);
    }

    return wrapForContext(node, [linkNode(url, "Watch on YouTube")]);
};

/**
 * `EggCard` carries its heading in a `title` ATTRIBUTE, and attributes are not children — without
 * this the four easter-egg titles would vanish from the generated markdown.
 */
const transformEggCard = (node: MdxJsxElement): AnyContent[] => {
    const title = getStringAttribute(node, "title");
    const children = transformList(node.children as AnyContent[]);

    return title ? [headingNode(2, title), ...children] : children;
};

/**
 * `EggSolution` renders its "Solution" label in the UI rather than in the MDX body, so the label is
 * re-emitted here to keep the markdown self-describing.
 */
const transformEggSolution = (node: MdxJsxElement): AnyContent[] => [
    paragraphNode([strongNode("Solution:")]),
    ...transformList(node.children as AnyContent[]),
];

/**
 * Components whose information the surrounding generator already renders as markdown, including the
 * per-item facts slots a page binds for its MDX. The videogames page lists its consoles and games
 * straight after placing the browser, so an "open the page" placeholder there would be noise rather
 * than a hint.
 */
const componentsRenderedByTheirGenerator = new Set([
    "VideogamesStats",
    "VideogamesCatalog",
    "MangaStats",
    "MangaCatalog",
    "MangaInformation",
    "GameInformation",
    "ConsoleInformation",
    "Projects",
]);

const transformJsxElement = (node: MdxJsxElement): AnyContent[] => {
    const { name } = node;

    if (name && componentsRenderedByTheirGenerator.has(name)) {
        return [];
    }

    if (name === "ImageCarousel") {
        return transformImageCarousel(node);
    }
    if (name === "EggCard") {
        return transformEggCard(node);
    }
    if (name === "EggSolution") {
        return transformEggSolution(node);
    }
    if (name === "ParagraphTitleWithIcon") {
        return transformParagraphTitleWithIcon(node);
    }
    if (name === "Youtube") {
        return transformYoutube(node);
    }

    const transformedChildren = transformList(node.children as AnyContent[]);

    if (transformedChildren.length > 0) {
        return transformedChildren;
    }

    return wrapForContext(node, [placeholderPhrase(name ?? "component")]);
};

type ParentContent = Extract<AnyContent, { children: unknown[] }>;

const hasChildren = (node: AnyContent): node is ParentContent =>
    "children" in node && Array.isArray((node as ParentContent).children);

const transformOne = (node: AnyContent): AnyContent[] => {
    if (node.type === "mdxjsEsm") {
        return [];
    }
    if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
        return [];
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        return transformJsxElement(node);
    }
    if (hasChildren(node)) {
        // mdast's parent node interfaces each narrow `children` to their own phrasing/block union;
        // there is no single settable type across all of them, so we round-trip through AnyContent here.
        node.children = transformList(node.children as AnyContent[]) as typeof node.children;
    }

    return [node];
};

function transformList(nodes: AnyContent[]): AnyContent[] {
    return nodes.flatMap(transformOne);
}

// remark-math must be registered before remark-mdx: it needs to claim `$...$`/`$$...$$` (and any
// LaTeX braces inside them) as math syntax before MDX's expression tokenizer gets a chance to try
// (and fail) to parse those braces as JavaScript.
const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkMdx)
    .use(remarkStringify, { bullet: "-", fences: true });

export const mdxToMarkdown = (mdx: string): string => {
    const tree = processor.parse(mdx) as Root;

    tree.children = transformList(tree.children as AnyContent[]) as Root["children"];

    return String(processor.stringify(tree)).trim();
};
