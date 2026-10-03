"use client";

import {
    commandPaletteCloseEvent,
    commandPaletteOpenEvent,
} from "../../../state/command-palette/command-palette-events";
import type { CommandPaletteChangeCause } from "../../../state/command-palette/command-palette-change-cause";
import type { ComponentStore } from "matrix-component-store";
import { useCallback, useEffect, useState } from "react";

interface CommandPaletteState {
    open: boolean;
}

interface CommandPaletteEffects {
    close: () => void;
    stopPropagation: (e: React.MouseEvent) => void;
    handleQueryChange: (value: string) => void;
}

export const useCommandPaletteStore = (
    onOpenChange?: (open: boolean, cause: CommandPaletteChangeCause) => void,
    onQueryChange?: (query: string) => void,
): ComponentStore<CommandPaletteState, CommandPaletteEffects> => {
    const [open, setOpen] = useState(false);

    const changeOpen = useCallback(
        (next: boolean, cause: CommandPaletteChangeCause) => {
            setOpen(next);
            onOpenChange?.(next, cause);
        },
        [onOpenChange],
    );

    const close = useCallback(() => changeOpen(false, "dismiss"), [changeOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                changeOpen(!open, "shortcut");
            }
        };
        const handleOpenEvent = () => changeOpen(true, "event");
        const handleCloseEvent = () => changeOpen(false, "event");

        window.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener(commandPaletteOpenEvent, handleOpenEvent);
        window.addEventListener(commandPaletteCloseEvent, handleCloseEvent);

        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener(commandPaletteOpenEvent, handleOpenEvent);
            window.removeEventListener(commandPaletteCloseEvent, handleCloseEvent);
        };
    }, [changeOpen, open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                changeOpen(false, "escape");
            }
        };

        window.addEventListener("keydown", handleEsc, true);

        return () => window.removeEventListener("keydown", handleEsc, true);
    }, [open, changeOpen]);

    const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    const handleQueryChange = useCallback(
        (value: string) => {
            onQueryChange?.(value.trim());
        },
        [onQueryChange],
    );

    return {
        state: { open },
        effects: { close, stopPropagation, handleQueryChange },
    };
};
