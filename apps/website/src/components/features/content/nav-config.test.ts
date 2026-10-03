import { describe, it, expect, vi } from "vitest";
import type { MenuDropdown, MenuEntry, MenuLink } from "matrix-design-system";
import { slugs } from "@/types/configuration/slug";
import { tracking } from "@/types/configuration/tracking";
import { buildFooterLinks, buildMenuEntries, contactHref } from "./nav-config";

const isDropdown = (entry: MenuEntry): entry is MenuDropdown => "groups" in entry;

const findDropdown = (entries: MenuEntry[], label: string) => {
    const dropdown = entries.filter(isDropdown).find((entry) => entry.label === label);
    if (!dropdown) {
        throw new Error(`No dropdown labelled ${label}`);
    }
    return dropdown;
};

const allLinks = (entries: MenuEntry[]): MenuLink[] =>
    entries.flatMap((entry) => (isDropdown(entry) ? entry.groups.flatMap((group) => group.items) : [entry]));

const findLink = (entries: MenuEntry[], label: string) => {
    const link = allLinks(entries).find((candidate) => candidate.label === label);
    if (!link) {
        throw new Error(`No link labelled ${label}`);
    }
    return link;
};

describe("nav-config", () => {
    describe("buildMenuEntries", () => {
        it("keeps the top-level order: Home, Blog, Explore, The Author", () => {
            expect(buildMenuEntries().map((entry) => entry.label)).toEqual(["Home", "Blog", "Explore", "The Author"]);
        });

        it("lists the hobbies as Art, Manga and Videogames, in that order", () => {
            const hobbies = findDropdown(buildMenuEntries(), "The Author").groups.find(
                (group) => group.label === "Hobbies",
            );
            expect(hobbies?.items.map((item) => [item.label, item.to])).toEqual([
                ["Art", slugs.art],
                ["Manga", slugs.manga.home],
                ["Videogames", slugs.videogames.home],
            ]);
        });

        it("places the Lab group between Profile and Hobbies in The Author", () => {
            expect(findDropdown(buildMenuEntries(), "The Author").groups.map((group) => group.label)).toEqual([
                "Profile",
                "Lab",
                "Hobbies",
            ]);
        });

        it("links Chicio Labs to the Labs Hub", () => {
            expect(findLink(buildMenuEntries(), "Chicio Labs")).toMatchObject({
                to: "https://labs.fabrizioduroni.it/",
                external: true,
            });
        });

        it("keeps the Authors link selected on the author pages", () => {
            expect(findLink(buildMenuEntries(), "Authors")).toMatchObject({
                to: slugs.blog.authors,
                activePathPrefixes: ["/blog/author/"],
            });
        });

        it("marks Matrix Rain as an external link", () => {
            expect(findLink(buildMenuEntries(), "Matrix Rain")).toMatchObject({ external: true });
        });

        it("gives links no click handler when nothing tracks them", () => {
            expect(allLinks(buildMenuEntries()).every((link) => link.onClick === undefined)).toBe(true);
        });

        it("reports the tracking action of each link it is built with", () => {
            const onTrack = vi.fn();
            const links = allLinks(buildMenuEntries(onTrack));
            links.forEach((link) => link.onClick?.());
            expect(onTrack.mock.calls.map(([action]) => action)).toEqual([
                tracking.action.open_home,
                tracking.action.open_blog,
                tracking.action.open_blog_archive,
                tracking.action.open_blog_authors,
                tracking.action.open_blog_tags,
                tracking.action.open_blog_stats,
                tracking.action.open_dsa_roadmap,
                tracking.action.open_dsa_exercises,
                tracking.action.open_chat,
                tracking.action.open_mcp,
                tracking.action.open_matrix_rain_webgpu,
                tracking.action.open_easter_egg_hunt,
                tracking.action.open_about_me,
                tracking.action.open_contact,
                tracking.action.open_chicio_labs,
                tracking.action.open_art,
                tracking.action.open_manga_collection,
                tracking.action.open_videogame_collection,
            ]);
        });
    });

    describe("buildFooterLinks", () => {
        it("keeps the six footer links in order", () => {
            expect(buildFooterLinks().map((link) => [link.label, link.to])).toEqual([
                ["Home", "/"],
                ["Blog", slugs.blog.home],
                ["Art", slugs.art],
                ["About Me", slugs.aboutMe],
                ["Archive", slugs.blog.blogArchive],
                ["Tags", slugs.blog.tags],
            ]);
        });

        it("reports the tracking action of each link it is built with", () => {
            const onTrack = vi.fn();
            buildFooterLinks(onTrack).forEach((link) => link.onClick?.());
            expect(onTrack.mock.calls.map(([action]) => action)).toEqual([
                tracking.action.open_home,
                tracking.action.open_blog,
                tracking.action.open_art,
                tracking.action.open_about_me,
                tracking.action.open_blog_archive,
                tracking.action.open_blog_tags,
            ]);
        });

        it("gives links no click handler when nothing tracks them", () => {
            expect(buildFooterLinks().every((link) => link.onClick === undefined)).toBe(true);
        });
    });

    describe("contactHref", () => {
        it("is the contact page", () => {
            expect(contactHref).toBe(slugs.contact);
        });
    });
});
