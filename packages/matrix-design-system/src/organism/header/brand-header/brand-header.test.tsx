import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandHeader } from "./brand-header";

vi.mock("../../../molecules/effects/matrix-header-background", () => ({
    MatrixHeaderBackground: () => <div data-testid="matrix-header-background" />,
}));

vi.mock("../../../atoms/effects/image-glow", () => ({
    ImageGlow: ({ alt, src, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
        <img alt={alt} src={src} {...rest} />
    ),
}));

const logo = { src: "/logo.png", width: 80, height: 80 };
const identity = { title: "CHICIO LABS", tagline: "Code. AI. Computer graphics.", logoAlt: "labs logo" };

describe("BrandHeader", () => {
    describe("render", () => {
        it("renders the injected title", () => {
            render(<BrandHeader big={false} {...identity} logo={logo} />);
            expect(screen.getByText(/CHICIO LABS/)).toBeInTheDocument();
        });

        it("renders the injected tagline", () => {
            render(<BrandHeader big={false} {...identity} logo={logo} />);
            expect(screen.getByText(/Code\. AI\. Computer graphics\./)).toBeInTheDocument();
        });

        it("renders the logo image with the injected alt text", () => {
            render(<BrandHeader big={false} {...identity} logo={logo} />);
            expect(screen.getByAltText("labs logo")).toBeInTheDocument();
        });

        it("renders no hard-coded identity of its own", () => {
            render(<BrandHeader big={false} title="X" tagline="Y" logoAlt="Z" logo={logo} />);
            expect(screen.queryByText(/CHICIO CODING/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Unplugged/)).not.toBeInTheDocument();
            expect(screen.queryByAltText("blog logo")).not.toBeInTheDocument();
        });

        it("accepts a custom wrapper component", () => {
            const Wrapper = ({ children }: React.PropsWithChildren) => (
                <div data-testid="custom-wrapper">{children}</div>
            );
            render(<BrandHeader big={false} {...identity} wrapper={Wrapper} logo={logo} />);
            expect(screen.getByTestId("custom-wrapper")).toBeInTheDocument();
        });
    });
});
