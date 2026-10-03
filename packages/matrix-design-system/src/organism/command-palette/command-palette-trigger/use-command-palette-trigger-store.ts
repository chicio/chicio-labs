"use client";

import { useCallback } from "react";
import type { ComponentStore } from "matrix-component-store";
import { useOsModifierKey, OsModifierKey } from "../../../hooks/use-os-modifier-key";
import { openCommandPalette } from "../../../state/command-palette/command-palette-events";

interface CommandPaletteTriggerState {
    modifierKey: OsModifierKey | null;
}

interface CommandPaletteTriggerEffects {
    handleClick: () => void;
}

export const useCommandPaletteTriggerStore = (
    onTrigger?: () => void,
): ComponentStore<CommandPaletteTriggerState, CommandPaletteTriggerEffects> => {
    const modifierKey = useOsModifierKey();

    const handleClick = useCallback(() => {
        onTrigger?.();
        openCommandPalette();
    }, [onTrigger]);

    return { state: { modifierKey }, effects: { handleClick } };
};
