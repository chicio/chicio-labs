import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { BrandHeaderProps } from "matrix-design-system";
import { BrandHeader } from "./brand-header";

vi.mock("next/image", () => ({
    default: ({ alt }: { alt: string }) => <span data-next-image="true">{alt}</span>,
}));

vi.mock("matrix-design-system", () => ({
    BrandHeader: ({ big, title, tagline, logoAlt, imageComponent: Image }: BrandHeaderProps) => (
        <header data-big={String(big)}>
            <h1>{title}</h1>
            <p>{tagline}</p>
            {Image && <Image src="/logo.png" alt={logoAlt} width={80} height={80} />}
        </header>
    ),
}));

describe("BrandHeader binding", () => {
    it("passes the Website's Host Identity title", () => {
        render(<BrandHeader big={false} />);
        expect(screen.getByRole("heading", { name: "CHICIO CODING" })).toBeInTheDocument();
    });

    it("passes the Website's Host Identity tagline", () => {
        render(<BrandHeader big={false} />);
        expect(screen.getByText("Pixels. Code. Unplugged.")).toBeInTheDocument();
    });

    it("passes the Website's Host Identity logo alternative text through next/image", () => {
        render(<BrandHeader big={false} />);
        expect(screen.getByText("blog logo")).toHaveAttribute("data-next-image", "true");
    });

    it("forwards the remaining props", () => {
        render(<BrandHeader big />);
        expect(screen.getByRole("banner")).toHaveAttribute("data-big", "true");
    });
});
