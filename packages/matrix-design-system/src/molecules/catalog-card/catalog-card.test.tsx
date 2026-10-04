import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ImageComponentProps } from "../../atoms/effects/plain-image";
import type { LinkComponentProps } from "../../atoms/links/anchor-link";
import { CatalogCard, type CatalogCardProps } from "./catalog-card";

const props: CatalogCardProps = {
    name: "Matrix Rain",
    type: "Package",
    typeHref: "#lab-projects",
    meta: "v1.2.0",
    description: "A WebGPU digital rain.",
    image: "/rain.webp",
    primary: { label: "Docs", href: "/lab/matrix-rain/" },
    links: [
        { label: "Showcase", href: "https://example.com/rain/" },
        { label: "Source", href: "https://github.com/chicio/chicio-labs" },
    ],
};

describe("CatalogCard", () => {
    describe("content", () => {
        it("renders the name as a heading", () => {
            render(<CatalogCard {...props} />);
            expect(screen.getByRole("heading", { level: 3, name: "Matrix Rain" })).toBeInTheDocument();
        });

        it("renders the type as a Tag leading to the section and the meta beside it", () => {
            render(<CatalogCard {...props} />);
            expect(screen.getByRole("link", { name: "Package" })).toHaveAttribute("href", "#lab-projects");
            expect(screen.getByText("v1.2.0")).toBeInTheDocument();
        });

        it("renders no meta when there is none", () => {
            render(<CatalogCard {...props} meta={undefined} />);
            expect(screen.queryByText("v1.2.0")).not.toBeInTheDocument();
        });

        it("renders the description", () => {
            render(<CatalogCard {...props} />);
            expect(screen.getByText("A WebGPU digital rain.")).toHaveClass("line-clamp-3");
        });
    });

    describe("links", () => {
        it("renders every secondary link, in order, in a new tab", () => {
            render(<CatalogCard {...props} />);
            const showcase = screen.getByRole("link", { name: "Showcase ↗" });
            const source = screen.getByRole("link", { name: "Source ↗" });
            expect(showcase).toHaveAttribute("href", "https://example.com/rain/");
            expect(showcase).toHaveAttribute("target", "_blank");
            expect(showcase).toHaveAttribute("rel", "noopener noreferrer");
            expect(showcase.compareDocumentPosition(source) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });

        it("renders no secondary links when none are given", () => {
            render(<CatalogCard {...props} links={undefined} />);
            expect(screen.queryByRole("link", { name: /↗/ })).not.toBeInTheDocument();
        });

        it("renders the primary action as a TerminalButton in the same tab", () => {
            render(<CatalogCard {...props} />);
            const primary = screen.getByRole("link", { name: /^>\s*Docs/ });
            expect(primary).toHaveAttribute("href", "/lab/matrix-rain/");
            expect(primary).not.toHaveAttribute("target");
        });

        it("puts the primary action after the description and the secondary links", () => {
            const { container } = render(<CatalogCard {...props} />);
            const article = within(container).getByRole("article");
            const text = article.textContent ?? "";
            expect(text.indexOf("A WebGPU digital rain.")).toBeLessThan(text.indexOf("Showcase"));
            expect(text.indexOf("Source")).toBeLessThan(text.indexOf("> Docs"));
        });
    });

    describe("image", () => {
        it("renders the image first, linked to the primary action and hidden from assistive technology", () => {
            const { container } = render(<CatalogCard {...props} />);
            const imageLink = container.querySelector("article > a");
            expect(imageLink).toHaveAttribute("href", "/lab/matrix-rain/");
            expect(imageLink).toHaveAttribute("aria-hidden", "true");
            expect(imageLink).toHaveAttribute("tabindex", "-1");
            expect(imageLink?.querySelector("img")).toHaveAttribute("src", "/rain.webp");
        });

        it("renders a card without an image as tall as its content", () => {
            const { container } = render(<CatalogCard {...props} image={undefined} />);
            expect(container.querySelector("img")).not.toBeInTheDocument();
            expect(screen.getByRole("article")).toHaveClass("h-fit");
        });

        it("renders a card with an image with no height of its own", () => {
            render(<CatalogCard {...props} />);
            expect(screen.getByRole("article")).not.toHaveClass("h-fit");
        });
    });

    describe("injected components", () => {
        it("renders every link through the injected link component", () => {
            const CustomLink = ({ href, children }: LinkComponentProps) => (
                <a href={href} data-custom-link="true">
                    {children}
                </a>
            );
            const { container } = render(<CatalogCard {...props} linkComponent={CustomLink} />);
            expect(container.querySelectorAll("a")).toHaveLength(
                container.querySelectorAll("[data-custom-link]").length,
            );
            expect(container.querySelectorAll("a").length).toBe(5);
        });

        it("renders the injected image component instead of the plain image", () => {
            const CustomImage = ({ src }: ImageComponentProps) => (
                <span data-testid="custom-image">{typeof src === "string" ? src : src.src}</span>
            );
            render(<CatalogCard {...props} imageComponent={CustomImage} />);
            expect(screen.getByTestId("custom-image")).toHaveTextContent("/rain.webp");
        });
    });
});
