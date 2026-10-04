import { Content } from "@/types/content/content";
import { slugs } from "@/types/configuration/slug";
import { dsaExercisesList, exercises, topics } from "./data-structures-and-algorithms/data-structures-and-algorithms";
import {
    dsaExerciseMarkdown,
    dsaExercisesListMarkdown,
    dsaMarkdown,
    dsaTopicMarkdown,
} from "./data-structures-and-algorithms/data-structures-and-algorithms-markdown";
import { posts } from "./posts/posts";
import { blogListingMarkdown, blogPostMarkdown, homepageMarkdown } from "./posts/posts-markdown";
import { consoles, games, videogamesHome } from "./videogames/videogames";
import { consoleMarkdown, gameMarkdown, videogamesMarkdown } from "./videogames/videogames-markdown";
import { aboutMe } from "./about-me/about-me";
import { aboutMeMarkdown } from "./about-me/about-me-markdown";
import { art } from "./art/art";
import { artMarkdown } from "./art/art-markdown";
import { mangaHome, mangas } from "./manga/manga";
import { mangaListMarkdown, mangaMarkdown } from "./manga/manga-markdown";
import { contactMarkdown } from "./contact/contact-markdown";
import { blogStatsMarkdown } from "@/lib/blog-stats/blog-stats-markdown";
import { mdxPageMarkdown } from "@/lib/mdx/mdx-page-markdown";
import { createSection } from "./section";

/**
 * One description of a routable piece of content, from which the subsystems that need to enumerate the
 * site are derived rather than restating it: the `/markdown` route's static params and dispatch, and
 * the search index.
 *
 * A single page and a collection share this one shape. A collection supplies `params` (every concrete
 * param set its `slug` template expands to); a page omits it, meaning the template expands to exactly
 * one path. `content` is what a page actually is; `searchable` says whether it reaches site search.
 */
export interface ContentRegistryEntry {
    /** Route shape, with dynamic segments in brackets — see `slug-template.ts`. */
    slug: string;
    /** Every concrete param set for this slug. Omitted for a single page. */
    params?: () => Record<string, string>[];
    /** Markdown for one concrete path; returns null when that path has no content. */
    markdown: (params: Record<string, string>) => string | null;
    /**
     * The content behind this entry, for the entries that have some. It is what supplies each page its
     * real title, date and image, so anything derived from content reads it here rather than being told
     * the same values a second time. Omitted by aggregate pages, which have no content of their own.
     */
    content?: () => Content[];
    /** Whether this entry's content belongs in site search. */
    searchable?: boolean;
}

const paramsOf = (section: { list: () => Content[] }) => () => section.list().map((item) => item.slug.params);

const singleItem = (section: { single: () => Content | undefined }) => () => {
    const content = section.single();

    return content ? [content] : [];
};

/**
 * A page backed by a standard `src/content/<slug>/content.mdx`: its markdown comes from the generic
 * generator and its content from the file, so registering one is a single call.
 */
const mdxPage = (slug: string): ContentRegistryEntry => {
    const section = createSection({ slug });

    return {
        slug,
        markdown: () => mdxPageMarkdown(slug),
        content: singleItem(section),
    };
};

/**
 * Single pages come first so that an exact literal slug always wins over a collection template of the
 * same length (`/videogames/console/games` must not be read as a console named "games").
 */
export const contentRegistry: ContentRegistryEntry[] = [
    { slug: "/", markdown: homepageMarkdown },
    { slug: slugs.blog.home, markdown: blogListingMarkdown },
    { slug: slugs.blog.stats, markdown: blogStatsMarkdown },
    { slug: slugs.contact, markdown: contactMarkdown },
    { slug: slugs.aboutMe, markdown: aboutMeMarkdown, content: singleItem(aboutMe), searchable: true },
    mdxPage(slugs.mcp),
    mdxPage(slugs.cookiePolicy),
    { slug: slugs.art, markdown: artMarkdown, content: singleItem(art) },
    { ...mdxPage(slugs.easterEggHunt), searchable: true },
    { slug: slugs.dataStructuresAndAlgorithms.home, markdown: dsaMarkdown },
    { ...mdxPage(slugs.dataStructuresAndAlgorithms.roadmap), searchable: true },
    {
        slug: slugs.dataStructuresAndAlgorithms.exercises,
        markdown: dsaExercisesListMarkdown,
        content: singleItem(dsaExercisesList),
        searchable: true,
    },
    {
        slug: slugs.videogames.home,
        markdown: videogamesMarkdown,
        content: singleItem(videogamesHome),
        searchable: true,
    },
    {
        slug: slugs.manga.home,
        markdown: mangaListMarkdown,
        content: singleItem(mangaHome),
        searchable: true,
    },
    {
        slug: slugs.blog.blogPost,
        params: paramsOf(posts),
        markdown: blogPostMarkdown,
        content: posts.list,
        searchable: true,
    },
    {
        slug: slugs.dataStructuresAndAlgorithms.topic,
        params: paramsOf(topics),
        markdown: dsaTopicMarkdown,
        content: topics.list,
        searchable: true,
    },
    {
        slug: slugs.dataStructuresAndAlgorithms.exercise,
        params: paramsOf(exercises),
        markdown: dsaExerciseMarkdown,
        content: exercises.list,
        searchable: true,
    },
    {
        slug: slugs.videogames.console,
        params: paramsOf(consoles),
        markdown: consoleMarkdown,
        content: consoles.list,
        searchable: true,
    },
    {
        slug: slugs.videogames.game,
        params: paramsOf(games),
        markdown: gameMarkdown,
        content: games.list,
        searchable: true,
    },
    {
        slug: slugs.manga.manga,
        params: paramsOf(mangas),
        markdown: mangaMarkdown,
        content: mangas.list,
        searchable: true,
    },
];
