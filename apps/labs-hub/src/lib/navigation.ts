import type { MenuEntry } from "matrix-design-system";
import { designSystemShowcase, matrixRainShowcase } from "./registry";
import { REPOSITORY_URL, WEBSITE_URL } from "./repo";

export const catalogUrl = "/";

/** A glossary as the menu lists it: its page, and whether that page records any decisions. */
export interface DomainEntry {
    name: string;
    url: string;
    hasDecisions: boolean;
}

export const decisionsAnchor = "decisions";

/**
 * The hub's menu: the catalog, the Domain (every glossary and its decisions) and the Websites. Every Showcase link is
 * absolute, so it works under `astro dev` too, where the Showcases are not served, and opens in a new tab like any
 * other link that leaves the hub.
 */
export const menuEntries = (domain: readonly DomainEntry[]): MenuEntry[] => [
    { label: "Catalog", to: catalogUrl, activePathPrefixes: ["/lab/"] },
    {
        label: "Domain",
        groups: [
            {
                label: "Glossaries",
                items: domain.map((entry) => ({ label: entry.name, to: entry.url, activePathPrefixes: [entry.url] })),
            },
            {
                label: "Decisions",
                items: domain
                    .filter((entry) => entry.hasDecisions)
                    .map((entry) => ({ label: entry.name, to: `${entry.url}#${decisionsAnchor}` })),
            },
        ],
    },
    {
        label: "Websites",
        groups: [
            {
                label: "Websites",
                items: [
                    { label: "fabrizioduroni.it", to: WEBSITE_URL, external: true },
                    { label: designSystemShowcase.label, to: designSystemShowcase.url, external: true },
                    { label: matrixRainShowcase.label, to: matrixRainShowcase.url, external: true },
                ],
            },
        ],
    },
];

export const footerLinks = [
    { label: "Website", to: WEBSITE_URL, external: true },
    { label: designSystemShowcase.label, to: designSystemShowcase.url, external: true },
    { label: matrixRainShowcase.label, to: matrixRainShowcase.url, external: true },
    { label: "GitHub", to: REPOSITORY_URL, external: true },
];

export const footerContactHref = `${WEBSITE_URL}/contact`;

/** Duplicated from the Website's site metadata: the hub is a separate app and cannot import it. */
export const footerSocialLinks = {
    github: "https://github.com/chicio",
    linkedin: "https://www.linkedin.com/in/fabrizio-duroni/",
};

export const hubIdentity = {
    title: "CHICIO LABS",
    tagline: "Code. AI. Computer graphics.",
    logoAlt: "Chicio Labs logo",
    logo: "/logo.png",
    signature: "> Experiments by Fabrizio Duroni 'Chicio'",
};
