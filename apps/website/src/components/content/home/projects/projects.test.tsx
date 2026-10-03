import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { projects } from "@/content/home/projects";
import { Projects } from "./projects";

vi.mock("next/image", () => ({
    default: ({ alt, src }: { alt: string; src: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} src={src} data-next-image="true" />
    ),
}));

describe("Projects", () => {
    it("renders a card with the name of every project", () => {
        render(<Projects />);
        Object.values(projects).forEach((project) => {
            expect(screen.getByRole("heading", { level: 3, name: project.name })).toBeInTheDocument();
        });
    });

    it("renders every call to action of a project as an external link", () => {
        render(<Projects />);
        const links = screen.getAllByRole("link");
        Object.values(projects)
            .flatMap((project) => project.callToActions)
            .forEach((callToAction) => {
                const link = links.find((candidate) => candidate.getAttribute("href") === callToAction.link);
                expect(link).toHaveTextContent(callToAction.label);
                expect(link).toHaveAttribute("target", "_blank");
            });
    });

    it("renders the project images through next/image", () => {
        render(<Projects />);
        const [project] = Object.values(projects);
        expect(screen.getAllByAltText(project.name)[0]).toHaveAttribute("data-next-image", "true");
    });
});
