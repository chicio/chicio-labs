import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPaletteTrigger } from "./command-palette-trigger";

let mockModifierKey: "meta" | "ctrl" | null = null;
const openCommandPaletteMock = vi.fn();

vi.mock("../../../hooks/use-os-modifier-key", () => ({
    useOsModifierKey: () => mockModifierKey,
}));

vi.mock("../../../state/command-palette/command-palette-events", () => ({
    openCommandPalette: () => openCommandPaletteMock(),
}));

afterEach(() => {
    mockModifierKey = null;
    openCommandPaletteMock.mockClear();
});

describe("CommandPaletteTrigger", () => {
    describe("render", () => {
        it("renders the button with its accessible name", () => {
            render(<CommandPaletteTrigger />);
            expect(screen.getByRole("button", { name: "Open command palette" })).toBeInTheDocument();
        });

        it("shows Search... by default", () => {
            render(<CommandPaletteTrigger />);
            expect(screen.getByText("Search...")).toBeInTheDocument();
        });

        it("shows a custom label", () => {
            render(<CommandPaletteTrigger label="Find..." />);
            expect(screen.getByText("Find...")).toBeInTheDocument();
            expect(screen.queryByText("Search...")).not.toBeInTheDocument();
        });
    });

    describe("interaction", () => {
        it("calls onTrigger and opens the command palette when clicked", async () => {
            const onTrigger = vi.fn();
            render(<CommandPaletteTrigger onTrigger={onTrigger} />);
            await userEvent.click(screen.getByRole("button", { name: "Open command palette" }));
            expect(onTrigger).toHaveBeenCalledOnce();
            expect(openCommandPaletteMock).toHaveBeenCalledOnce();
        });

        it("opens the command palette even without an onTrigger callback", async () => {
            render(<CommandPaletteTrigger />);
            await userEvent.click(screen.getByRole("button", { name: "Open command palette" }));
            expect(openCommandPaletteMock).toHaveBeenCalledOnce();
        });
    });

    describe("os modifier key shortcut badge", () => {
        it("shows the K shortcut badge when a modifier key is detected", () => {
            mockModifierKey = "meta";
            render(<CommandPaletteTrigger />);
            expect(screen.getByText("K")).toBeInTheDocument();
        });

        it("shows a different glyph for ctrl than for meta", () => {
            mockModifierKey = "meta";
            const meta = render(<CommandPaletteTrigger />);
            const metaIcon = meta.container.querySelector("kbd svg")?.innerHTML;
            meta.unmount();
            mockModifierKey = "ctrl";
            const ctrl = render(<CommandPaletteTrigger />);
            expect(ctrl.container.querySelector("kbd svg")?.innerHTML).not.toBe(metaIcon);
        });

        it("hides the shortcut badge when no modifier key is detected", () => {
            mockModifierKey = null;
            render(<CommandPaletteTrigger />);
            expect(screen.queryByText("K")).not.toBeInTheDocument();
        });
    });
});
