import type { MenuEntry } from "matrix-design-system";
import type { GlossaryContext } from "./content";
import { designSystemShowcase, matrixRainShowcase } from "./registry";
import { REPOSITORY_URL, WEBSITE_URL } from "./repo";

export const catalogUrl = "/";
export const workbenchUrl = "/#workbench";
export const systemPageUrl = "/chicio-labs/";

/**
 * The hub's menu. Every Showcase link is absolute, so it works under `astro dev` too, where the Showcases are not
 * served, and opens in a new tab like any other link that leaves the hub.
 */
export const menuEntries = (contexts: readonly Pick<GlossaryContext, "name" | "url">[]): MenuEntry[] => [
    { label: "Catalog", to: catalogUrl, activePathPrefixes: ["/lab/"] },
    { label: "Workbench", to: workbenchUrl },
    { label: "Chicio Labs", to: systemPageUrl, activePathPrefixes: ["/chicio-labs/"] },
    {
        label: "Glossaries",
        groups: [
            {
                label: "Contexts",
                items: contexts.map((context) => ({
                    label: context.name,
                    to: context.url,
                    activePathPrefixes: [context.url],
                })),
            },
        ],
    },
    {
        label: "Elsewhere",
        groups: [
            {
                label: "Sites",
                items: [
                    { label: "Website", to: WEBSITE_URL, external: true },
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
