"use client";

import { FC, ReactNode } from "react";
import { MenuItem } from "../../molecules/menu/menu-item";
import { SocialContacts } from "../social-contacts";
import type { LinkComponent } from "../../atoms/links/anchor-link";
import { Cursor, TerminalLine } from "../../atoms/typography/terminal-blocks";
import type { FooterSocialTrackingCallbacks } from "./use-footer-store";
import { useFooterStore } from "./use-footer-store";
import type { SocialContactLinks } from "../social-contacts";

export type { SocialContactLinks };

export interface FooterLink {
    label: string;
    to: string;
    onClick?: () => void;
    /** Opens the link in a new tab, as `MenuItem` does for its external links. */
    external?: boolean;
}

export interface FooterProps {
    linkComponent?: LinkComponent;
    /** The Host Identity: the sign-off line, required and never defaulted. */
    signature: ReactNode;
    /** The navigation links, in display order. */
    links: FooterLink[];
    /** Where the contact call to action of the social contacts leads. Absent: the call to action is not rendered. */
    contactHref?: string;
    /** Absent: the social contacts are not rendered. */
    socialLinks?: SocialContactLinks;
    socialTracking?: FooterSocialTrackingCallbacks;
}

export const Footer: FC<FooterProps> = ({
    signature,
    links,
    contactHref,
    socialLinks,
    socialTracking,
    linkComponent,
}) => {
    const { effects } = useFooterStore(socialTracking);
    const {
        onTrackGithub,
        onTrackLinkedin,
        onTrackContact,
        onTrackMedium,
        onTrackDevto,
        onTrackTwitter,
        onTrackFacebook,
        onTrackInstagram,
    } = effects;
    const hasSocialContacts = socialLinks !== undefined || contactHref !== undefined;

    return (
        <footer className="bg-primary-dark border-t-accent relative w-full shrink-0 snap-start border-t-2 border-solid shadow-lg">
            <div className="flex w-full flex-col items-center">
                <div className="grid w-full grid-cols-2 gap-3 px-5 py-7 sm:mx-auto sm:max-w-4xl sm:auto-cols-auto sm:grid-flow-col sm:grid-cols-none sm:justify-center">
                    {links.map((link) => (
                        <MenuItem
                            key={link.label}
                            linkComponent={linkComponent}
                            to={link.to}
                            onClick={link.onClick}
                            external={link.external}
                            selected={false}
                        >
                            {link.label}
                        </MenuItem>
                    ))}
                </div>
                <hr />
                <div className="from-general-background-light to-primary-color-dark flex w-full flex-col items-center justify-center gap-3 bg-gradient-to-b px-4 py-6">
                    {hasSocialContacts && (
                        <SocialContacts
                            linkComponent={linkComponent}
                            links={socialLinks ?? {}}
                            contactHref={contactHref}
                            onTrackGithub={onTrackGithub}
                            onTrackLinkedin={onTrackLinkedin}
                            onTrackContact={onTrackContact}
                            onTrackMedium={onTrackMedium}
                            onTrackDevto={onTrackDevto}
                            onTrackTwitter={onTrackTwitter}
                            onTrackFacebook={onTrackFacebook}
                            onTrackInstagram={onTrackInstagram}
                        />
                    )}
                    <TerminalLine>
                        {signature}
                        <Cursor />
                    </TerminalLine>
                </div>
            </div>
        </footer>
    );
};
