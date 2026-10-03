import { describe, expect, it } from "vitest";
import { footerContactHref, footerLinks, footerSocialLinks, hubIdentity, menuEntries } from "./navigation";

const contexts = [
    { name: "Website", url: "/glossary/website/" },
    { name: "Matrix Rain", url: "/glossary/matrix-rain/" },
];

describe("navigation", () => {
    describe("menuEntries", () => {
        const entries = menuEntries(contexts);

        it("lists the internal pages, then the glossaries, then the sites elsewhere", () => {
            expect(entries.map((entry) => entry.label)).toEqual([
                "Catalog",
                "Workbench",
                "Chicio Labs",
                "Glossaries",
                "Elsewhere",
            ]);
        });

        it("builds the glossary dropdown from the contexts", () => {
            const glossaries = entries.find((entry) => entry.label === "Glossaries");

            expect(
                glossaries && "groups" in glossaries ? glossaries.groups[0]?.items.map((item) => item.to) : [],
            ).toEqual(["/glossary/website/", "/glossary/matrix-rain/"]);
        });

        it("links every Showcase and the Website absolutely, in a new tab", () => {
            const elsewhere = entries.find((entry) => entry.label === "Elsewhere");
            const items = elsewhere && "groups" in elsewhere ? elsewhere.groups.flatMap((group) => group.items) : [];

            expect(items.map((item) => item.to)).toEqual([
                "https://www.fabrizioduroni.it",
                "https://labs.fabrizioduroni.it/design-system/",
                "https://labs.fabrizioduroni.it/matrix-rain/",
            ]);
            expect(items.every((item) => item.external)).toBe(true);
        });

        it("marks the catalog selected on the Lab Project pages", () => {
            const catalog = entries[0];

            expect(catalog && "activePathPrefixes" in catalog ? catalog.activePathPrefixes : []).toContain("/lab/");
        });

        it("only passes plain data, since the menu is a hydrated island", () => {
            expect(JSON.parse(JSON.stringify(entries))).toEqual(entries);
        });
    });

    describe("footer", () => {
        it("links the Website, both Showcases and GitHub, all in a new tab", () => {
            expect(footerLinks.map((link) => link.label)).toEqual([
                "Website",
                "Design System Showcase",
                "Matrix Rain Showcase",
                "GitHub",
            ]);
            expect(footerLinks.every((link) => link.external)).toBe(true);
        });

        it("offers GitHub and LinkedIn only, and the Website's contact page", () => {
            expect(Object.keys(footerSocialLinks)).toEqual(["github", "linkedin"]);
            expect(footerContactHref).toBe("https://www.fabrizioduroni.it/contact");
        });
    });

    describe("hubIdentity", () => {
        it("is the hub's own identity, not the Website's", () => {
            expect(hubIdentity.title).toBe("CHICIO LABS");
            expect(hubIdentity.signature).toContain("Experiments by Fabrizio Duroni");
        });
    });
});
