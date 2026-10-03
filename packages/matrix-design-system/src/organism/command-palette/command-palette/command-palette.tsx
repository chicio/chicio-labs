"use client";

import { Overlay } from "../../../atoms/effects/overlay";
import { useGlassmorphism } from "../../../hooks/use-glassmorphism";
import { CommandPaletteContext } from "../../../state/command-palette/command-palette-context";
import type { CommandPaletteChangeCause } from "../../../state/command-palette/command-palette-change-cause";
import { motion } from "framer-motion";
import { FC, ReactNode } from "react";
import { Command } from "cmdk";
import { useCommandPaletteStore } from "./use-command-palette-store";

export interface CommandPaletteProps {
    placeholder?: string;
    onOpenChange?: (open: boolean, cause: CommandPaletteChangeCause) => void;
    onQueryChange?: (query: string) => void;
    children: ReactNode;
}

export const CommandPalette: FC<CommandPaletteProps> = ({
    placeholder = "type to search_",
    onOpenChange,
    onQueryChange,
    children,
}) => {
    const { glassmorphismClass } = useGlassmorphism({ noScale: true });
    const { state, effects } = useCommandPaletteStore(onOpenChange, onQueryChange);
    const { open } = state;
    const { close, stopPropagation, handleQueryChange } = effects;

    if (!open) {
        return null;
    }

    return (
        <Overlay delay={0} onClick={close} className="z-50">
            <div className="flex min-h-screen items-start justify-center px-4 pt-[15vh]">
                <motion.div
                    className={`${glassmorphismClass} w-full max-w-150 overflow-hidden`}
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onClick={stopPropagation}
                >
                    <Command shouldFilter={false} className="flex flex-col">
                        <div className="border-accent/20 flex items-center gap-2 border-b px-4 py-3">
                            <span className="text-accent shrink-0 font-mono text-sm font-bold text-shadow-md">
                                {">"}
                            </span>
                            <Command.Input
                                className="text-accent placeholder:text-accent/40 caret-accent flex-1 bg-transparent font-mono outline-none"
                                placeholder={placeholder}
                                onValueChange={handleQueryChange}
                                autoFocus
                            />
                        </div>

                        <Command.List className="max-h-[55vh] overflow-y-auto py-2">
                            <CommandPaletteContext.Provider value={close}>{children}</CommandPaletteContext.Provider>
                        </Command.List>

                        <div className="border-accent/20 text-accent/40 xs:flex hidden gap-6 border-t px-4 py-2 font-mono text-xs">
                            <span>↑↓ navigate</span>
                            <span>↵ select</span>
                            <span>esc close</span>
                        </div>
                    </Command>
                </motion.div>
            </div>
        </Overlay>
    );
};
