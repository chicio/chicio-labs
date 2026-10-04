import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { everyLabProjectLink, openSourceSection } from "@/lib/content/about-me/open-source-section";
import { Projects } from "./projects";

vi.mock("next/image", () => ({
    default: ({ alt, src }: { alt: string; src: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} src={src} data-next-image="true" />
    ),
}));

describe("Projects", () => {
    it("renders a card with the name of every Lab Project and Standalone Project of the Open Source section", () => {
        render(<Projects />);
        openSourceSection().forEach((project) => {
            expect(screen.getByRole("heading", { level: 3, name: project.name })).toBeInTheDocument();
        });
    });

    it("renders the Matrix Component Store now that it has a card image", () => {
        render(<Projects />);
        expect(screen.getByRole("heading", { level: 3, name: "Matrix Component Store" })).toBeInTheDocument();
    });

    it("lays the cards out in the Labs Hub's grid", () => {
        const { container } = render(<Projects />);
        const grid = container.querySelector("article")?.parentElement;
        expect(grid).toHaveClass("grid");
        expect(grid?.className).toContain("repeat(auto-fill,minmax(min(100%,320px),1fr))");
        expect(grid?.querySelectorAll("article")).toHaveLength(openSourceSection().length);
    });

    it("renders the primary action of every project as a terminal button", () => {
        render(<Projects />);
        openSourceSection().forEach((project) => {
            const primary = screen
                .getAllByRole("link", { name: new RegExp(`^>\\s*${project.primary.label}`) })
                .find((link) => link.getAttribute("href") === project.primary.href);
            expect(primary, project.name).toBeDefined();
        });
    });

    it("renders every secondary link of a project in a new tab", () => {
        render(<Projects />);
        const links = screen.getAllByRole("link");
        openSourceSection()
            .flatMap((project) => project.links)
            .forEach((projectLink) => {
                const link = links.find(
                    (candidate) =>
                        candidate.getAttribute("href") === projectLink.href &&
                        candidate.textContent === `${projectLink.label} ↗`,
                );
                expect(link, projectLink.href).toHaveAttribute("target", "_blank");
            });
    });

    it("renders the project images through next/image, from the catalog's media", () => {
        render(<Projects />);
        const images = Array.from(document.querySelectorAll("img[data-next-image]"));
        const expected = openSourceSection()
            .map((project) => project.image)
            .filter((image) => image !== undefined);
        expect(images.map((image) => image.getAttribute("src"))).toEqual(expected);
    });

    it("closes with a link to every Lab Project on Chicio Labs", () => {
        render(<Projects />);
        const link = screen.getByRole("link", { name: everyLabProjectLink.label });
        expect(link).toHaveAttribute("href", everyLabProjectLink.href);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
