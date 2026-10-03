import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    Menu: ({ currentPath, pinnedOnPaths, entries, linkComponent: Link, trailing }: MenuProps) => (
        <nav data-current-path={currentPath} data-pinned={pinnedOnPaths?.join(",")}>
            {trailing}
            {Link && <Link href="/probe">probe</Link>}
            {entries.map((entry) => (
                <span key={entry.label}>{entry.label}</span>
            ))}
        </nav>
    ),
}));

vi.mock("matrix-design-system/command-palette", () => ({
    CommandPaletteTrigger: ({ onTrigger }: { onTrigger?: () => void }) => (
        <button onClick={onTrigger}>palette trigger</button>
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

    it("always fills the trailing slot with the command palette trigger", () => {
        render(<Menu entries={entries} />);
        expect(screen.getByRole("button", { name: "palette trigger" })).toBeInTheDocument();
    });

    it("wires onPaletteTrigger to the command palette trigger", async () => {
        const onPaletteTrigger = vi.fn();
        render(<Menu entries={entries} onPaletteTrigger={onPaletteTrigger} />);
        await userEvent.click(screen.getByRole("button", { name: "palette trigger" }));
        expect(onPaletteTrigger).toHaveBeenCalledOnce();
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
