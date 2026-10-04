import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { everyLabProjectLink, openSourceProjects } from "@/lib/content/about-me/open-source-projects";
import { Projects } from "./projects";

vi.mock("next/image", () => ({
    default: ({ alt, src }: { alt: string; src: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} src={src} data-next-image="true" />
    ),
}));

describe("Projects", () => {
    it("renders a card with the name of every open source project", () => {
        render(<Projects />);
        openSourceProjects().forEach((project) => {
            expect(screen.getByRole("heading", { level: 3, name: project.name })).toBeInTheDocument();
        });
    });

    it("renders every link of a project as an external link", () => {
        render(<Projects />);
        const links = screen.getAllByRole("link");
        openSourceProjects()
            .flatMap((project) => project.links)
            .forEach((projectLink) => {
                const link = links.find((candidate) => candidate.getAttribute("href") === projectLink.href);
                expect(link).toHaveTextContent(projectLink.label);
                expect(link).toHaveAttribute("target", "_blank");
            });
    });

    it("renders the project images through next/image", () => {
        render(<Projects />);
        const [project] = openSourceProjects();
        expect(screen.getAllByAltText(project.name)[0]).toHaveAttribute("data-next-image", "true");
    });

    it("renders the project images from the catalog's media", () => {
        render(<Projects />);
        const [project] = openSourceProjects();
        expect(screen.getAllByAltText(project.name)[0]).toHaveAttribute("src", project.image);
    });

    it("closes with a link to every Lab Project on Chicio Labs", () => {
        render(<Projects />);
        const link = screen.getByRole("link", { name: everyLabProjectLink.label });
        expect(link).toHaveAttribute("href", everyLabProjectLink.href);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
