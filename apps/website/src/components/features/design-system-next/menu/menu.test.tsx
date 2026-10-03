import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MenuEntry, MenuProps } from "matrix-design-system";
import { Menu } from "./menu";

vi.mock("next/navigation", () => ({
    usePathname: () => "/manga/death-note",
}));

vi.mock("next/link", () => ({
    default: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} data-next-link="true">
            {children}
        </a>
    ),
}));

vi.mock("matrix-design-system", () => ({
    Menu: ({ currentPath, pinnedOnPaths, entries, linkComponent: Link, showPaletteTrigger }: MenuProps) => (
        <nav
            data-current-path={currentPath}
            data-pinned={pinnedOnPaths?.join(",")}
            data-palette-trigger={String(showPaletteTrigger)}
        >
            {Link && <Link href="/probe">probe</Link>}
            {entries.map((entry) => (
                <span key={entry.label}>{entry.label}</span>
            ))}
        </nav>
    ),
}));

const entries: MenuEntry[] = [{ label: "Home", to: "/" }];

describe("Menu binding", () => {
    it("hands the design system Menu the path of Next's router", () => {
        render(<Menu entries={entries} />);
        expect(screen.getByRole("navigation")).toHaveAttribute("data-current-path", "/manga/death-note");
    });

    it("keeps the menu pinned on the chat page", () => {
        render(<Menu entries={entries} />);
        expect(screen.getByRole("navigation")).toHaveAttribute("data-pinned", "/chat");
    });

    it("always shows the command palette trigger", () => {
        render(<Menu entries={entries} />);
        expect(screen.getByRole("navigation")).toHaveAttribute("data-palette-trigger", "true");
    });

    it("renders links through next/link", () => {
        render(<Menu entries={entries} />);
        expect(screen.getByRole("link", { name: "probe" })).toHaveAttribute("data-next-link", "true");
    });

    it("passes the entries through", () => {
        render(<Menu entries={entries} />);
        expect(screen.getByText("Home")).toBeInTheDocument();
    });
});
