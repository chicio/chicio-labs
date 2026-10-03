import { slugs } from "@/types/configuration/slug";
import { siteMetadata } from "@/types/configuration/site-metadata";
import { tracking } from "@/types/configuration/tracking";
import type { MenuEntry } from "@/components/features/design-system-next/menu";
import type { FooterLink, SocialContactLinks } from "@/components/features/design-system-next/footer";

export type NavigationTracker = (action: string) => void;

const chicioLabsHref = "https://labs.fabrizioduroni.it/";
const matrixRainHref = "https://labs.fabrizioduroni.it/matrix-rain/";

const authorPagesPrefix = `${slugs.blog.author.replace("/[authorId]", "")}/`;

const clickTracker = (onTrack: NavigationTracker | undefined, action: string) =>
    onTrack ? () => onTrack(action) : undefined;

export const buildMenuEntries = (onTrack?: NavigationTracker): MenuEntry[] => [
    { label: "Home", to: "/", onClick: clickTracker(onTrack, tracking.action.open_home) },
    {
        label: "Blog",
        groups: [
            {
                label: "Posts",
                items: [
                    {
                        label: "Latest posts",
                        to: slugs.blog.home,
                        onClick: clickTracker(onTrack, tracking.action.open_blog),
                    },
                    {
                        label: "Archive",
                        to: slugs.blog.blogArchive,
                        onClick: clickTracker(onTrack, tracking.action.open_blog_archive),
                    },
                ],
            },
            {
                label: "Discovery",
                items: [
                    {
                        label: "Authors",
                        to: slugs.blog.authors,
                        activePathPrefixes: [authorPagesPrefix],
                        onClick: clickTracker(onTrack, tracking.action.open_blog_authors),
                    },
                    {
                        label: "Tags",
                        to: slugs.blog.tags,
                        onClick: clickTracker(onTrack, tracking.action.open_blog_tags),
                    },
                ],
            },
            {
                label: "Insights",
                items: [
                    {
                        label: "Stats",
                        to: slugs.blog.stats,
                        onClick: clickTracker(onTrack, tracking.action.open_blog_stats),
                    },
                ],
            },
        ],
    },
    {
        label: "Explore",
        groups: [
            {
                label: "DSA",
                items: [
                    {
                        label: "Roadmap",
                        to: slugs.dataStructuresAndAlgorithms.roadmap,
                        onClick: clickTracker(onTrack, tracking.action.open_dsa_roadmap),
                    },
                    {
                        label: "Exercises",
                        to: slugs.dataStructuresAndAlgorithms.exercises,
                        onClick: clickTracker(onTrack, tracking.action.open_dsa_exercises),
                    },
                ],
            },
            {
                label: "Artificial Intelligence",
                items: [
                    { label: "Chat", to: slugs.chat, onClick: clickTracker(onTrack, tracking.action.open_chat) },
                    { label: "MCP", to: slugs.mcp, onClick: clickTracker(onTrack, tracking.action.open_mcp) },
                ],
            },
            {
                label: "Computer Graphics",
                items: [
                    {
                        label: "Matrix Rain",
                        to: matrixRainHref,
                        external: true,
                        onClick: clickTracker(onTrack, tracking.action.open_matrix_rain_webgpu),
                    },
                ],
            },
            {
                label: "Secrets",
                items: [
                    {
                        label: "Easter eggs",
                        to: slugs.easterEggHunt,
                        onClick: clickTracker(onTrack, tracking.action.open_easter_egg_hunt),
                    },
                ],
            },
        ],
    },
    {
        label: "The Author",
        groups: [
            {
                label: "Profile",
                items: [
                    {
                        label: "About me",
                        to: slugs.aboutMe,
                        onClick: clickTracker(onTrack, tracking.action.open_about_me),
                    },
                    {
                        label: "Contact me",
                        to: slugs.contact,
                        onClick: clickTracker(onTrack, tracking.action.open_contact),
                    },
                ],
            },
            {
                label: "Lab",
                items: [
                    {
                        label: "Chicio Labs",
                        to: chicioLabsHref,
                        external: true,
                        onClick: clickTracker(onTrack, tracking.action.open_chicio_labs),
                    },
                ],
            },
            {
                label: "Hobbies",
                items: [
                    { label: "Art", to: slugs.art, onClick: clickTracker(onTrack, tracking.action.open_art) },
                    {
                        label: "Manga",
                        to: slugs.manga.home,
                        onClick: clickTracker(onTrack, tracking.action.open_manga_collection),
                    },
                    {
                        label: "Videogames",
                        to: slugs.videogames.home,
                        onClick: clickTracker(onTrack, tracking.action.open_videogame_collection),
                    },
                ],
            },
        ],
    },
];

export const buildFooterLinks = (onTrack?: NavigationTracker): FooterLink[] => [
    { label: "Home", to: "/", onClick: clickTracker(onTrack, tracking.action.open_home) },
    { label: "Blog", to: slugs.blog.home, onClick: clickTracker(onTrack, tracking.action.open_blog) },
    { label: "Art", to: slugs.art, onClick: clickTracker(onTrack, tracking.action.open_art) },
    { label: "About Me", to: slugs.aboutMe, onClick: clickTracker(onTrack, tracking.action.open_about_me) },
    { label: "Archive", to: slugs.blog.blogArchive, onClick: clickTracker(onTrack, tracking.action.open_blog_archive) },
    { label: "Tags", to: slugs.blog.tags, onClick: clickTracker(onTrack, tracking.action.open_blog_tags) },
];

export const contactHref = slugs.contact;

export const socialContactLinks: SocialContactLinks = {
    github: siteMetadata.contacts.links.github,
    linkedin: siteMetadata.contacts.links.linkedin,
    medium: siteMetadata.contacts.links.medium,
    devto: siteMetadata.contacts.links.devto,
    twitter: siteMetadata.contacts.links.twitter,
    facebook: siteMetadata.contacts.links.facebook,
    instagram: siteMetadata.contacts.links.instagram,
};
