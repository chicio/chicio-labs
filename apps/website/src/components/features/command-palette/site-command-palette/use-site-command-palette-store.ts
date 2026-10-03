"use client";

import { closeCommandPalette, type CommandPaletteChangeCause } from "matrix-design-system";
import { useSearch } from "@/components/features/search/use-search";
import { openTerminalOverlay } from "@/lib/terminal/terminal-events";
import type { ComponentStore } from "matrix-component-store";
import type { SearchResult } from "@/types/search/search";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useState } from "react";

export interface SiteCommandPaletteTracking {
    onOpen?: () => void;
    onOpenChat?: () => void;
    onSearchResultSelect?: () => void;
    onToggleMotion?: () => void;
    onCustomizeMatrixRain?: () => void;
    onOpenEasterEggHunt?: () => void;
    onOpenTerminal?: () => void;
}

interface SiteCommandPaletteState {
    isSearching: boolean;
    search: SearchResult;
}

interface SiteCommandPaletteEffects {
    handleOpenChange: (open: boolean, cause: CommandPaletteChangeCause) => void;
    handleQueryChange: (query: string) => void;
    handleOpenChat: () => void;
    handleOpenEasterEggHunt: () => void;
    handleOpenTerminal: () => void;
    handleSearchResultSelect: (slug: string) => void;
}

export const useSiteCommandPaletteStore = (
    searchIndexFileName: string,
    chatSlug: string,
    easterEggHuntSlug: string,
    tracking?: SiteCommandPaletteTracking,
    matchesEasterEggQuery?: (query: string) => boolean,
    onEasterEggMatch?: () => void,
): ComponentStore<SiteCommandPaletteState, SiteCommandPaletteEffects> => {
    const [open, setOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const { handleSearch, resetSearch, search } = useSearch(open, searchIndexFileName);
    const router = useRouter();

    const onOpen = tracking?.onOpen;
    const onOpenChat = tracking?.onOpenChat;
    const onOpenEasterEggHunt = tracking?.onOpenEasterEggHunt;
    const onOpenTerminal = tracking?.onOpenTerminal;
    const onSearchResultSelect = tracking?.onSearchResultSelect;

    const handleOpenChange = useCallback(
        (next: boolean, cause: CommandPaletteChangeCause) => {
            setOpen(next);

            if (next) {
                // Only the header button counts as an "open" for analytics: the tracking label is
                // hard-coded to "header", so counting keyboard opens would corrupt that series.
                if (cause === "event") {
                    onOpen?.();
                }

                return;
            }

            setIsSearching(false);
            resetSearch();
        },
        [onOpen, resetSearch],
    );

    const handleQueryChange = useCallback(
        (query: string) => {
            if (matchesEasterEggQuery?.(query)) {
                onEasterEggMatch?.();
                closeCommandPalette();

                return;
            }

            setIsSearching(query.length >= 3);
            handleSearch({ target: { value: query } } as ChangeEvent<HTMLInputElement>);
        },
        [handleSearch, matchesEasterEggQuery, onEasterEggMatch],
    );

    const handleOpenChat = useCallback(() => {
        onOpenChat?.();
        router.push(chatSlug);
    }, [onOpenChat, router, chatSlug]);

    const handleOpenEasterEggHunt = useCallback(() => {
        onOpenEasterEggHunt?.();
        router.push(easterEggHuntSlug);
    }, [onOpenEasterEggHunt, router, easterEggHuntSlug]);

    const handleOpenTerminal = useCallback(() => {
        onOpenTerminal?.();
        openTerminalOverlay();
    }, [onOpenTerminal]);

    const handleSearchResultSelect = useCallback(
        (slug: string) => {
            onSearchResultSelect?.();
            router.push(slug);
        },
        [onSearchResultSelect, router],
    );

    return {
        state: { isSearching, search },
        effects: {
            handleOpenChange,
            handleQueryChange,
            handleOpenChat,
            handleOpenEasterEggHunt,
            handleOpenTerminal,
            handleSearchResultSelect,
        },
    };
};
