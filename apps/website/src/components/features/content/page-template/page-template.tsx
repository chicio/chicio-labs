import { ContentContainer } from "matrix-design-system";
import { Footer } from "@/components/features/design-system-next/footer";
import { Menu } from "@/components/features/design-system-next/menu";
import { FC, ReactNode } from "react";
import type { MenuEntry } from "@/components/features/design-system-next/menu";
import type {
    FooterLink,
    SocialContactLinks,
    FooterSocialTrackingCallbacks,
} from "@/components/features/design-system-next/footer";

export interface BlogPageProps {
    header: React.ReactElement;
    author: string;
    menuEntries: MenuEntry[];
    footerLinks: FooterLink[];
    contactHref: string;
    socialLinks: SocialContactLinks;
    onPaletteTrigger?: () => void;
    footerSocialTracking?: FooterSocialTrackingCallbacks;
    children?: ReactNode;
}

export const PageTemplate: FC<BlogPageProps> = ({
    header,
    children,
    author,
    menuEntries,
    footerLinks,
    contactHref,
    socialLinks,
    onPaletteTrigger,
    footerSocialTracking,
}) => (
    <>
        <Menu entries={menuEntries} onPaletteTrigger={onPaletteTrigger} />
        <ContentContainer>
            {header}
            <div className="mt-4">{children}</div>
        </ContentContainer>
        <Footer
            signature={`> Made with 💝 by ${author} 'Chicio'`}
            links={footerLinks}
            contactHref={contactHref}
            socialLinks={socialLinks}
            socialTracking={footerSocialTracking}
        />
    </>
);
