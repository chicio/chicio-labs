"use client";

import { useState, useCallback } from "react";
import { ScrollDirection, useScrollDirection } from "../../hooks/use-scroll-direction";
import type { ComponentStore } from "matrix-component-store";

interface SelectableLink {
    to: string;
    external?: boolean;
    activePathPrefixes?: string[];
}

interface MenuState {
    pathname: string;
    shouldHideMenu: boolean;
    shouldOpenMenu: boolean;
}

interface MenuEffects {
    openMenu: () => void;
    closeMenu: () => void;
    handleLinkClick: (onClick?: () => void) => () => void;
    isSelected: (link: SelectableLink) => boolean;
}

export const useMenuStore = (pathname: string, pinnedOnPaths: string[]): ComponentStore<MenuState, MenuEffects> => {
    const direction = useScrollDirection();
    const [shouldOpenMenu, setShouldOpenMenu] = useState(false);
    const shouldHideMenu = pinnedOnPaths.includes(pathname) ? false : direction === ScrollDirection.down;

    const openMenu = useCallback(() => setShouldOpenMenu(true), []);
    const closeMenu = useCallback(() => setShouldOpenMenu(false), []);

    const handleLinkClick = useCallback(
        (onClick?: () => void) => () => {
            onClick?.();
            closeMenu();
        },
        [closeMenu],
    );

    const isSelected = useCallback(
        (link: SelectableLink) =>
            !link.external &&
            (link.to === pathname || (link.activePathPrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false)),
        [pathname],
    );

    return {
        state: { pathname, shouldHideMenu, shouldOpenMenu },
        effects: { openMenu, closeMenu, handleLinkClick, isSelected },
    };
};
