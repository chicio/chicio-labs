import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageTemplate } from "./page-template";
import type { MenuEntry } from "@/components/features/design-system-next/menu";
import type { FooterLink, SocialContactLinks } from "@/components/features/design-system-next/footer";

vi.mock("next/navigation", () => ({
    usePathname: () => "/",
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

vi.mock("next/image", () => ({
    default: ({ alt, src, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
        <img alt={alt} src={src} {...rest} />
    ),
}));

vi.mock("matrix-design-system", async (importOriginal) => ({
    ...(await importOriginal<typeof import("matrix-design-system")>()),
    MotionDiv: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    commandPaletteOpenEvent: "command-palette-open",
    openCommandPalette: vi.fn(),
    openMatrixRainPanel: vi.fn(),
    writeMotion: vi.fn(),
    hasMotion: () => true,
    motionChangeEvent: "motion-change",
}));
vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    motion: {
        div: ({
            children,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            style: _s,
            ...props
        }: React.HTMLAttributes<HTMLDivElement> & {
            initial?: unknown;
            animate?: unknown;
            exit?: unknown;
            transition?: unknown;
        }) => <div {...props}>{children}</div>,
        nav: ({
            children,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            style: _s,
            ...props
        }: React.HTMLAttributes<HTMLElement> & {
            initial?: unknown;
            animate?: unknown;
            exit?: unknown;
            transition?: unknown;
        }) => <nav {...props}>{children}</nav>,
    },
}));

vi.mock("matrix-rain-webgpu", () => ({
    isWebGPUSupported: () => false,
}));

const menuEntries: MenuEntry[] = [
    { label: "Home", to: "/" },
    {
        label: "The Author",
        groups: [{ label: "Hobbies", items: [{ label: "Manga", to: "/manga" }] }],
    },
];

const footerLinks: FooterLink[] = [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blog" },
];

const contactHref = "/contact";

const socialLinks: SocialContactLinks = {
    github: "https://github.com/chicio",
    linkedin: "https://linkedin.com/in/chicio",
    medium: "https://medium.com/@chicio",
    devto: "https://dev.to/chicio",
    twitter: "https://twitter.com/chicio",
    facebook: "https://facebook.com/chicio",
    instagram: "https://instagram.com/chicio",
};

describe("PageTemplate", () => {
    describe("render", () => {
        it("renders the header slot", () => {
            render(
                <PageTemplate
                    header={<div data-testid="header-slot">Header</div>}
                    author="Fabrizio"
                    menuEntries={menuEntries}
                    footerLinks={footerLinks}
                    contactHref={contactHref}
                    socialLinks={socialLinks}
                />,
            );
            expect(screen.getByTestId("header-slot")).toBeInTheDocument();
        });

        it("renders children content", () => {
            render(
                <PageTemplate
                    header={<div>Header</div>}
                    author="Fabrizio"
                    menuEntries={menuEntries}
                    footerLinks={footerLinks}
                    contactHref={contactHref}
                    socialLinks={socialLinks}
                >
                    <p>Page content goes here</p>
                </PageTemplate>,
            );
            expect(screen.getByText("Page content goes here")).toBeInTheDocument();
        });

        it("renders the footer with author name", () => {
            render(
                <PageTemplate
                    header={<div>Header</div>}
                    author="Fabrizio Duroni"
                    menuEntries={menuEntries}
                    footerLinks={footerLinks}
                    contactHref={contactHref}
                    socialLinks={socialLinks}
                />,
            );
            expect(screen.getByText(/Fabrizio Duroni/)).toBeInTheDocument();
        });

        it("signs the footer with the Website's Host Identity line", () => {
            render(
                <PageTemplate
                    header={<div>Header</div>}
                    author="Fabrizio Duroni"
                    menuEntries={menuEntries}
                    footerLinks={footerLinks}
                    contactHref={contactHref}
                    socialLinks={socialLinks}
                />,
            );
            expect(screen.getByText("> Made with 💝 by Fabrizio Duroni 'Chicio'")).toBeInTheDocument();
        });

        it("renders navigation menu", () => {
            render(
                <PageTemplate
                    header={<div>Header</div>}
                    author="Fabrizio"
                    menuEntries={menuEntries}
                    footerLinks={footerLinks}
                    contactHref={contactHref}
                    socialLinks={socialLinks}
                />,
            );
            expect(screen.getAllByRole("link", { name: "Home" }).length).toBeGreaterThan(0);
        });
    });
});
