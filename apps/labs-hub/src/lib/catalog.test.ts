import { standaloneProjects, type StandaloneProject } from "labs-catalog";
import { describe, expect, it } from "vitest";
import { homeSections, isPublishedProject, projectInfo } from "./catalog";
import type { LabProject } from "./content";

const project = (overrides: Partial<LabProject>): LabProject => ({
    id: "id",
    name: "Name",
    kind: "public-package",
    type: "npm package",
    url: "/lab/id/",
    description: "A description",
    sourcePath: "packages/id",
    sourceUrl: "https://github.com/chicio/chicio-labs/tree/main/packages/id",
    links: { source: "https://github.com/chicio/chicio-labs/tree/main/packages/id" },
    ...overrides,
});

const standalone = (overrides: Partial<StandaloneProject> = {}): StandaloneProject => ({
    id: "tracer",
    name: "Tracer",
    type: "Computer graphics",
    meta: "C++",
    description: "A ray tracer",
    links: { github: "https://github.com/chicio/Tracer" },
    cardImage: "tracer.jpg",
    ...overrides,
});

describe("catalog", () => {
    describe("isPublishedProject", () => {
        it("counts everything but the Workbench as published", () => {
            expect(isPublishedProject(project({ kind: "workbench" }))).toBe(false);
            expect(isPublishedProject(project({ kind: "public-package" }))).toBe(true);
        });
    });

    describe("homeSections", () => {
        const sections = homeSections(
            [
                project({ id: "a", kind: "website" }),
                project({ id: "b", kind: "workbench" }),
                project({ id: "c", kind: "public-plugin" }),
            ],
            [standalone()],
        );

        it("lists the Lab Projects, then the Workbench, then the Standalone Projects", () => {
            expect(sections.map((section) => section.id)).toEqual(["lab-projects", "workbench", "standalone-projects"]);
            expect(sections.map((section) => section.title)).toEqual([
                "Lab Projects",
                "Workbench",
                "Standalone Projects",
            ]);
        });

        it("keeps the Workbench out of the Lab Projects, in catalog order", () => {
            expect(sections[0]?.cards.map((card) => card.id)).toEqual(["a", "c"]);
            expect(sections[1]?.cards.map((card) => card.id)).toEqual(["b"]);
        });

        it("describes the Standalone Projects as other experiments in their own repositories", () => {
            expect(sections[2]?.subtitle).toBe("Other experiments from the same lab, each in its own repository.");
        });

        describe("a Lab Project card", () => {
            const [card] = homeSections(
                [
                    project({
                        version: "3.0.0",
                        cardImage: "media/id.png",
                        links: {
                            visit: "https://site.dev",
                            showcase: "https://x/design-system/",
                            npm: "https://www.npmjs.com/package/id",
                            source: "https://github.com/chicio/chicio-labs/tree/main/packages/id",
                        },
                    }),
                ],
                [],
            ).flatMap((section) => section.cards);

            it("carries its type, its version as the meta and its image", () => {
                expect(card).toMatchObject({ type: "npm package", meta: "v3.0.0", image: "media/id.png" });
            });

            it("leads with its docs in the hub, then the outward links", () => {
                expect(card?.primary).toEqual({ label: "Docs", href: "/lab/id/" });
                expect(card?.links.map((link) => link.label)).toEqual(["Visit", "Showcase", "npm", "Source"]);
            });

            it("has no meta when it has no version", () => {
                const [bare] = homeSections([project({})], []).flatMap((section) => section.cards);

                expect(bare?.meta).toBeUndefined();
            });
        });

        describe("a Workbench card", () => {
            const [card] = homeSections(
                [project({ kind: "workbench", version: "0.0.0", cardImage: "media/id.png" })],
                [],
            ).flatMap((section) => section.cards);

            it("has docs only, no image and no version", () => {
                expect(card?.links).toEqual([]);
                expect(card?.image).toBeUndefined();
                expect(card?.meta).toBeUndefined();
                expect(card?.primary.label).toBe("Docs");
            });
        });

        describe("a Standalone Project card", () => {
            it("leads with GitHub, outside the hub, and carries its platform and image", () => {
                const [card] = homeSections([], [standalone()]).flatMap((section) => section.cards);

                expect(card?.primary).toEqual({ label: "GitHub", href: "https://github.com/chicio/Tracer" });
                expect(card?.meta).toBe("C++");
                expect(card?.image).toBe("media/tracer.jpg");
                expect(card?.links).toEqual([]);
            });

            it("adds its docs, thesis and download after GitHub, when it has them", () => {
                const [card] = homeSections(
                    [],
                    [
                        standalone({
                            links: {
                                github: "https://github.com/chicio/Tracer",
                                docs: "https://docs.dev",
                                thesis: "https://thesis.pdf",
                                download: "https://get.dmg",
                            },
                        }),
                    ],
                ).flatMap((section) => section.cards);

                expect(card?.links).toEqual([
                    { label: "Docs", href: "https://docs.dev" },
                    { label: "Thesis", href: "https://thesis.pdf" },
                    { label: "Download", href: "https://get.dmg" },
                ]);
            });
        });

        it("builds a card for every Standalone Project of the real catalog", () => {
            const cards = homeSections([], standaloneProjects).flatMap((section) => section.cards);

            expect(cards).toHaveLength(standaloneProjects.length);
            expect(cards.every((card) => card.image !== undefined && card.primary.href.startsWith("https://"))).toBe(
                true,
            );
        });
    });

    describe("projectInfo", () => {
        it("shows the type, the version of a published project and its workspace", () => {
            const info = projectInfo(project({ version: "5.1.0", sourcePath: "apps/website" }));

            expect(info.pills).toEqual([
                { icon: ">_", label: "Type", value: "npm package" },
                { icon: "#", label: "Version", value: "5.1.0" },
                { icon: "/", label: "Workspace", value: "apps/website" },
            ]);
        });

        it("leaves the version out of a Workbench project", () => {
            const info = projectInfo(project({ kind: "workbench", version: "0.0.0" }));

            expect(info.pills.map((pill) => pill.label)).toEqual(["Type", "Workspace"]);
        });

        it("makes Visit the primary action of the Website, then offers the changelog and the source", () => {
            const info = projectInfo(
                project({
                    kind: "website",
                    changelogUrl: "/lab/id/changelog/",
                    links: { visit: "https://site.dev", source: "https://github.com/x" },
                }),
            );

            expect(info.primary).toEqual({ label: "Visit", href: "https://site.dev" });
            expect(info.links).toEqual([
                { label: "Changelog", href: "/lab/id/changelog/", internal: true },
                { label: "Source", href: "https://github.com/x", internal: false },
            ]);
        });

        it("prefers the Showcase over npm, and keeps npm as a text link", () => {
            const info = projectInfo(
                project({ links: { showcase: "https://s/", npm: "https://npm/", source: "https://github.com/x" } }),
            );

            expect(info.primary).toEqual({ label: "Showcase", href: "https://s/" });
            expect(info.links.map((link) => link.label)).toEqual(["npm", "Source"]);
        });

        it("falls back to the source for a plugin, without repeating it as a text link", () => {
            const info = projectInfo(project({ kind: "public-plugin", links: { source: "https://github.com/x" } }));

            expect(info.primary).toEqual({ label: "Source", href: "https://github.com/x" });
            expect(info.links).toEqual([]);
        });
    });
});
