import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Footer } from "./footer";
import type { FooterLink } from "./footer";
import type { SocialContactLinks } from "./footer";

const links: FooterLink[] = [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blog" },
    { label: "Art", to: "/art" },
    { label: "About Me", to: "/about-me" },
];

const socialLinks: SocialContactLinks = {
    github: "https://github.com/chicio",
    linkedin: "https://linkedin.com/in/chicio",
    medium: "https://medium.com/@chicio",
    devto: "https://dev.to/chicio",
    twitter: "https://twitter.com/chicio",
    facebook: "https://facebook.com/chicio",
    instagram: "https://instagram.com/chicio",
};

describe("Footer", () => {
    describe("render", () => {
        it("renders the author credit", () => {
            render(<Footer author="Fabrizio Duroni" links={links} contactHref="/contact" socialLinks={socialLinks} />);
            expect(screen.getByText(/Fabrizio Duroni/)).toBeInTheDocument();
        });

        it("renders the injected links in order", () => {
            render(<Footer author="Fabrizio" links={links} contactHref="/contact" socialLinks={socialLinks} />);
            const navLinks = screen
                .getAllByRole("link")
                .filter((link) => links.some((l) => l.label === link.textContent));
            expect(navLinks.map((link) => link.textContent)).toEqual(["Home", "Blog", "Art", "About Me"]);
        });

        it("renders no nav links when none are injected", () => {
            render(<Footer author="Fabrizio" links={[]} contactHref="/contact" socialLinks={socialLinks} />);
            expect(screen.queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
        });

        it("leads the contact call to action to the injected contactHref", () => {
            render(<Footer author="Fabrizio" links={links} contactHref="/get-in-touch" socialLinks={socialLinks} />);
            expect(document.querySelector('a[href="/get-in-touch"]')).not.toBeNull();
        });

        it("renders nav links for all sections", () => {
            render(<Footer author="Fabrizio" links={links} contactHref="/contact" socialLinks={socialLinks} />);
            expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
            expect(screen.getByRole("link", { name: "About Me" })).toHaveAttribute("href", "/about-me");
            expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
        });

        it("renders social contacts section", () => {
            render(<Footer author="Fabrizio" links={links} contactHref="/contact" socialLinks={socialLinks} />);
            expect(screen.getByTitle("Github")).toBeInTheDocument();
            expect(screen.getByTitle("Linkedin")).toBeInTheDocument();
        });
    });

    describe("interaction", () => {
        it("calls the link onClick when a nav link is clicked", async () => {
            const onClick = vi.fn();
            render(
                <Footer
                    author="Fabrizio"
                    links={[{ label: "Blog", to: "/blog", onClick }]}
                    contactHref="/contact"
                    socialLinks={socialLinks}
                />,
            );
            await userEvent.click(screen.getByRole("link", { name: "Blog" }));
            expect(onClick).toHaveBeenCalledOnce();
        });

        it("calls onTrackGithub when github link is clicked", async () => {
            const onTrackGithub = vi.fn();
            render(
                <Footer
                    author="Fabrizio"
                    links={links}
                    contactHref="/contact"
                    socialLinks={socialLinks}
                    socialTracking={{ onTrackGithub }}
                />,
            );
            const githubLink = screen.getByTitle("Github").closest("a")!;
            await userEvent.click(githubLink);
            expect(onTrackGithub).toHaveBeenCalledOnce();
        });
    });
});
