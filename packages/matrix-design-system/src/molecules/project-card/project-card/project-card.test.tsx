import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ImageComponentProps } from "../../../atoms/effects/plain-image";
import { ProjectCard } from "./project-card";

const props = {
    name: "Matrix Rain",
    description: "A WebGPU digital rain.",
    features: ["WebGPU", "TypeGPU"],
    callToActions: [
        { label: "Github", link: "https://github.com/chicio/chicio-labs" },
        { label: "NPM", link: "https://www.npmjs.com/package/matrix-rain-webgpu" },
    ],
    image: "/rain.png",
};

describe("ProjectCard", () => {
    describe("render", () => {
        it("renders the name as a heading", () => {
            render(<ProjectCard {...props} />);
            expect(screen.getByRole("heading", { level: 3, name: "Matrix Rain" })).toBeInTheDocument();
        });

        it("renders the description", () => {
            render(<ProjectCard {...props} />);
            expect(screen.getByText("A WebGPU digital rain.")).toBeInTheDocument();
        });

        it("renders every feature in order", () => {
            render(<ProjectCard {...props} />);
            const items = within(screen.getByRole("list")).getAllByRole("listitem");
            expect(items.map((item) => item.textContent)).toEqual(["WebGPU", "TypeGPU"]);
        });

        it("renders each call to action as an external link in a new tab", () => {
            render(<ProjectCard {...props} />);
            const github = screen.getByRole("link", { name: "Github" });
            expect(github).toHaveAttribute("href", "https://github.com/chicio/chicio-labs");
            expect(github).toHaveAttribute("target", "_blank");
            expect(github).toHaveAttribute("rel", "noopener noreferrer");
            expect(screen.getByRole("link", { name: "NPM" })).toHaveAttribute(
                "href",
                "https://www.npmjs.com/package/matrix-rain-webgpu",
            );
        });

        it("opens a same-tab call to action in the current tab", () => {
            render(
                <ProjectCard
                    {...props}
                    callToActions={[{ label: "Docs", link: "/lab/matrix-rain/", sameTab: true }]}
                />,
            );
            const docs = screen.getByRole("link", { name: "Docs" });
            expect(docs).toHaveAttribute("href", "/lab/matrix-rain/");
            expect(docs).not.toHaveAttribute("target");
            expect(docs).not.toHaveAttribute("rel");
        });

        it("renders no call to action when none are given", () => {
            render(<ProjectCard {...props} callToActions={[]} />);
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });

        it("renders the image with the name as alt text", () => {
            render(<ProjectCard {...props} />);
            expect(screen.getByAltText("Matrix Rain")).toHaveAttribute("src", "/rain.png");
        });

        it("accepts a static import as the image", () => {
            render(<ProjectCard {...props} image={{ src: "/imported.png", width: 10, height: 10 }} />);
            expect(screen.getByAltText("Matrix Rain")).toHaveAttribute("src", "/imported.png");
        });
    });

    describe("imageComponent", () => {
        it("renders the injected image component instead of the plain image", () => {
            const CustomImage = ({ alt }: ImageComponentProps) => <span data-testid="custom-image">{alt}</span>;
            render(<ProjectCard {...props} imageComponent={CustomImage} />);
            expect(screen.getByTestId("custom-image")).toHaveTextContent("Matrix Rain");
            expect(screen.queryByRole("img")).not.toBeInTheDocument();
        });
    });
});
