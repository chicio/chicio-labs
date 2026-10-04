import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogCard } from "./catalog-card";

vi.mock("next/image", () => ({
    default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} data-next-image="true" />,
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} data-next-link="true" {...rest}>
            {children}
        </a>
    ),
}));

const props = {
    name: "Matrix Rain",
    type: "npm package",
    typeHref: "https://labs.example.com/#lab-projects",
    description: "A WebGPU digital rain.",
    image: "/media/labs-catalog/matrix-rain-webgpu.png",
    primary: { label: "Docs", href: "https://labs.example.com/lab/matrix-rain-webgpu/" },
    links: [{ label: "Source", href: "https://github.com/chicio/chicio-labs" }],
};

describe("CatalogCard binding", () => {
    it("renders the card image through next/image", () => {
        const { container } = render(<CatalogCard {...props} />);
        expect(container.querySelector("img")).toHaveAttribute("data-next-image", "true");
    });

    it("renders every link through next/link", () => {
        render(<CatalogCard {...props} />);
        const links = screen.getAllByRole("link", { hidden: true });
        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => expect(link).toHaveAttribute("data-next-link", "true"));
    });
});
