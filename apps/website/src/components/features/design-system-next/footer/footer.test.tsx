import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SocialContactLinks } from "matrix-design-system";
import { Footer } from "./footer";

vi.mock("next/link", () => ({
    default: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} data-next-link="true">
            {children}
        </a>
    ),
}));

const socialLinks: SocialContactLinks = {
    github: "https://github.com/chicio",
    linkedin: "https://linkedin.com/in/chicio",
    medium: "https://medium.com/@chicio",
    devto: "https://dev.to/chicio",
    twitter: "https://twitter.com/chicio",
    facebook: "https://facebook.com/chicio",
    instagram: "https://instagram.com/chicio",
};

describe("Footer binding", () => {
    it("renders the navigation links through next/link", () => {
        render(
            <Footer
                signature="> Made with"
                links={[{ label: "Blog", to: "/blog" }]}
                contactHref="/contact"
                socialLinks={socialLinks}
            />,
        );
        expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("data-next-link", "true");
    });

    it("leads the contact call to action to the given page", () => {
        render(<Footer signature="> Made with" links={[]} contactHref="/contact" socialLinks={socialLinks} />);
        expect(screen.getAllByRole("link").some((link) => link.getAttribute("href") === "/contact")).toBe(true);
    });
});
