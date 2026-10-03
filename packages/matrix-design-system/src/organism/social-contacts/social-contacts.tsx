import {
    BiLogoDevTo,
    BiLogoFacebookSquare,
    BiLogoGithub,
    BiLogoInstagram,
    BiLogoLinkedin,
    BiLogoMedium,
    BiEnvelope,
} from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";
import { FC } from "react";
import { SocialContact } from "../../molecules/buttons/social-contact";
import { CallToActionInternalWithTracking } from "../../atoms/call-to-actions/call-to-action-internal-with-tracking";
import type { LinkComponent } from "../../atoms/links/anchor-link";

export interface SocialContactLinks {
    github?: string;
    linkedin?: string;
    medium?: string;
    devto?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
}

export interface SocialContactsProps {
    linkComponent?: LinkComponent;
    links: SocialContactLinks;
    /** Absent: the contact call to action is not rendered. */
    contactHref?: string;
    onTrackGithub?: () => void;
    onTrackLinkedin?: () => void;
    onTrackContact?: () => void;
    onTrackMedium?: () => void;
    onTrackDevto?: () => void;
    onTrackTwitter?: () => void;
    onTrackFacebook?: () => void;
    onTrackInstagram?: () => void;
}

export const SocialContacts: FC<SocialContactsProps> = ({
    links,
    contactHref,
    onTrackGithub,
    onTrackLinkedin,
    onTrackContact,
    onTrackMedium,
    onTrackDevto,
    onTrackTwitter,
    onTrackFacebook,
    onTrackInstagram,
    linkComponent,
}) => {
    return (
        <div className="flex flex-wrap items-center justify-center p-0 text-center">
            {links.github && (
                <SocialContact
                    link={links.github}
                    onClick={onTrackGithub}
                    icon={<BiLogoGithub size={30} title={"Github"} />}
                />
            )}
            {links.linkedin && (
                <SocialContact
                    link={links.linkedin}
                    onClick={onTrackLinkedin}
                    icon={<BiLogoLinkedin size={30} title={"Linkedin"} />}
                />
            )}
            {contactHref && (
                <CallToActionInternalWithTracking
                    linkComponent={linkComponent}
                    to={contactHref}
                    onClick={onTrackContact}
                    className="min-w-auto!"
                >
                    <BiEnvelope size={30} />
                </CallToActionInternalWithTracking>
            )}
            {links.medium && (
                <SocialContact
                    link={links.medium}
                    onClick={onTrackMedium}
                    icon={<BiLogoMedium size={30} title={"Medium"} />}
                />
            )}
            {links.devto && (
                <SocialContact
                    link={links.devto}
                    onClick={onTrackDevto}
                    icon={<BiLogoDevTo size={30} title={"Devto"} />}
                />
            )}
            {links.twitter && (
                <SocialContact
                    link={links.twitter}
                    onClick={onTrackTwitter}
                    icon={<FaXTwitter size={30} title={"Twitter"} />}
                />
            )}
            {links.facebook && (
                <SocialContact
                    link={links.facebook}
                    onClick={onTrackFacebook}
                    icon={<BiLogoFacebookSquare size={30} title={"Facebook"} />}
                />
            )}
            {links.instagram && (
                <SocialContact
                    link={links.instagram}
                    onClick={onTrackInstagram}
                    icon={<BiLogoInstagram size={30} title={"Instagram"} />}
                />
            )}
        </div>
    );
};
