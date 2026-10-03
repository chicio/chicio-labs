"use client";

import { FC } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { LuCommand } from "react-icons/lu";
import { ImCtrl } from "react-icons/im";
import { useCommandPaletteTriggerStore } from "./use-command-palette-trigger-store";

export interface CommandPaletteTriggerProps {
    /** The text shown next to the search icon on wide screens. */
    label?: string;
    /** Called when the button is clicked, before the palette opens. Meant for tracking. */
    onTrigger?: () => void;
}

export const CommandPaletteTrigger: FC<CommandPaletteTriggerProps> = ({ label = "Search...", onTrigger }) => {
    const { state, effects } = useCommandPaletteTriggerStore(onTrigger);
    const { modifierKey } = state;
    const { handleClick } = effects;

    return (
        <button
            className="group border-accent bg-accent/10 hover:border-accent hover:bg-accent/20 flex min-h-10 w-auto cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200 md:w-60"
            onClick={handleClick}
            aria-label="Open command palette"
        >
            <BiSearchAlt className="text-accent group-hover:text-accent size-3.5 shrink-0 transition-colors duration-200" />
            <span className="text-accent/40 group-hover:text-accent/60 hidden flex-1 text-left font-mono text-sm leading-none transition-colors duration-200 md:block">
                {label}
            </span>
            {modifierKey !== null && (
                <span className="hidden items-center gap-1 md:inline-flex">
                    <kbd className="border-accent/50 text-accent/70 group-hover:border-accent group-hover:text-accent inline-flex size-6 items-center justify-center rounded border font-mono text-sm leading-none transition-colors duration-200">
                        {modifierKey === "meta" ? <LuCommand className="size-3" /> : <ImCtrl className="size-3" />}
                    </kbd>
                    <span className="text-accent/70 group-hover:text-accent font-mono text-sm leading-none transition-colors duration-200">
                        +
                    </span>
                    <kbd className="border-accent/50 text-accent/70 group-hover:border-accent group-hover:text-accent inline-flex size-6 items-center justify-center rounded border font-mono text-base leading-none transition-colors duration-200">
                        K
                    </kbd>
                </span>
            )}
        </button>
    );
};
