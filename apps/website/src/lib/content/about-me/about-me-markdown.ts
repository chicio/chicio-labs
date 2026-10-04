import { aboutMe } from "@/lib/content/about-me/about-me";
import { openSourceProjectsMarkdown } from "@/lib/content/about-me/open-source-projects";
import { contentBodyMarkdown } from "@/lib/mdx/content-body-markdown";
import { contentItemMarkdown } from "@/lib/mdx/content-item-markdown";

/**
 * The Open Source section is the last of the page, and its `<Projects />` placeholder renders nothing in the
 * markdown (the component is in `componentsRenderedByTheirGenerator`), so the real list goes after the body.
 */
export const aboutMeMarkdown = contentItemMarkdown(
    aboutMe,
    (page) => `${contentBodyMarkdown(page)}\n\n${openSourceProjectsMarkdown()}\n`,
);
