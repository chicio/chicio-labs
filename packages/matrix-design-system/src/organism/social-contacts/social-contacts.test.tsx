import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SocialContacts } from "./social-contacts";

const links = {
    github: "https://github.com/chicio",
    linkedin: "https://linkedin.com/in/chicio",
    medium: "https://medium.com/@chicio",
    devto: "https://dev.to/chicio",
    twitter: "https://twitter.com/chicio",
    facebook: "https://facebook.com/chicio",
    instagram: "https://instagram.com/chicio",
};

describe("SocialContacts", () => {
    describe("render", () => {
        it("renders social icon links", () => {
            render(<SocialContacts links={links} contactHref="/contact" />);
            expect(screen.getByTitle("Github")).toBeInTheDocument();
            expect(screen.getByTitle("Linkedin")).toBeInTheDocument();
            expect(screen.getByTitle("Twitter")).toBeInTheDocument();
        });

        it("renders the contact link pointing to contactHref", () => {
            render(<SocialContacts links={links} contactHref="/contact" />);
            const contactLinks = screen.getAllByRole("link");
            const contactLink = contactLinks.find((l) => l.getAttribute("href") === "/contact");
            expect(contactLink).toBeDefined();
        });
    });

    describe("optional platforms", () => {
        it("renders only the platforms provided", () => {
            render(<SocialContacts links={{ github: links.github, linkedin: links.linkedin }} />);
            expect(screen.getByTitle("Github")).toBeInTheDocument();
            expect(screen.getByTitle("Linkedin")).toBeInTheDocument();
            expect(screen.queryByTitle("Medium")).not.toBeInTheDocument();
            expect(screen.queryByTitle("Devto")).not.toBeInTheDocument();
            expect(screen.queryByTitle("Twitter")).not.toBeInTheDocument();
            expect(screen.queryByTitle("Facebook")).not.toBeInTheDocument();
            expect(screen.queryByTitle("Instagram")).not.toBeInTheDocument();
        });

        it("never renders a link without an href when devto is omitted", () => {
            const { devto, ...withoutDevto } = links;
            expect(devto).toBeDefined();
            const { container } = render(<SocialContacts links={withoutDevto} contactHref="/contact" />);
            expect(screen.queryByTitle("Devto")).not.toBeInTheDocument();
            container.querySelectorAll("a").forEach((anchor) => {
                expect(anchor).toHaveAttribute("href");
            });
            expect(container.querySelectorAll("a")).toHaveLength(7);
        });

        it("renders the contact envelope only when contactHref is provided", () => {
            const { container, rerender } = render(<SocialContacts links={links} />);
            expect(container.querySelectorAll("a")).toHaveLength(7);
            rerender(<SocialContacts links={links} contactHref="/contact" />);
            expect(container.querySelectorAll("a")).toHaveLength(8);
            expect(container.querySelector('a[href="/contact"]')).not.toBeNull();
        });

        it("renders nothing interactive when no platform and no contact are provided", () => {
            const { container } = render(<SocialContacts links={{}} />);
            expect(container.querySelectorAll("a")).toHaveLength(0);
        });
    });

    describe("interaction", () => {
        it("calls onTrackGithub when github link is clicked", async () => {
            const onTrackGithub = vi.fn();
            render(<SocialContacts links={links} contactHref="/contact" onTrackGithub={onTrackGithub} />);
            const githubLink = screen.getByTitle("Github").closest("a")!;
            await userEvent.click(githubLink);
            expect(onTrackGithub).toHaveBeenCalledOnce();
        });

        it("calls onTrackLinkedin when linkedin link is clicked", async () => {
            const onTrackLinkedin = vi.fn();
            render(<SocialContacts links={links} contactHref="/contact" onTrackLinkedin={onTrackLinkedin} />);
            const linkedinLink = screen.getByTitle("Linkedin").closest("a")!;
            await userEvent.click(linkedinLink);
            expect(onTrackLinkedin).toHaveBeenCalledOnce();
        });
    });
});
