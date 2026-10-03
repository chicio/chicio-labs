import { describe, expect, it } from "vitest";
import { footerContactHref, footerLinks, footerSocialLinks, hubIdentity, menuEntries } from "./navigation";

const domain = [
    { name: "Chicio Labs", url: "/glossary/chicio-labs/", hasDecisions: true },
    { name: "Website", url: "/glossary/website/", hasDecisions: true },
    { name: "Matrix Rain", url: "/glossary/matrix-rain/", hasDecisions: false },
];

describe("navigation", () => {
    describe("menuEntries", () => {
        const entries = menuEntries(domain);

        it("lists the catalog, then the Domain, then the Websites", () => {
            expect(entries.map((entry) => entry.label)).toEqual(["Catalog", "Domain", "Websites"]);
        });

        it("builds the Domain dropdown from every glossary, and its decisions from the ones that record any", () => {
            const domainMenu = entries.find((entry) => entry.label === "Domain");
            const groups = domainMenu && "groups" in domainMenu ? domainMenu.groups : [];

            expect(groups.map((group) => group.label)).toEqual(["Glossaries", "Decisions"]);
            expect(groups[0]?.items.map((item) => item.to)).toEqual([
                "/glossary/chicio-labs/",
                "/glossary/website/",
                "/glossary/matrix-rain/",
            ]);
            expect(groups[1]?.items.map((item) => item.to)).toEqual([
                "/glossary/chicio-labs/#decisions",
                "/glossary/website/#decisions",
            ]);
        });

        it("links every Showcase and the Website absolutely, in a new tab", () => {
            const websites = entries.find((entry) => entry.label === "Websites");
            const items = websites && "groups" in websites ? websites.groups.flatMap((group) => group.items) : [];

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
