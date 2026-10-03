"use client";

import { FC } from "react";
import { Menu as DesignSystemMenu, type MenuProps } from "matrix-design-system";
import { CommandPaletteTrigger } from "matrix-design-system/command-palette";
import { NextLink } from "@/components/features/design-system-next/next-link";
import { slugs } from "@/types/configuration/slug";
import { useMenuStore } from "./use-menu-store";

export type { MenuProps };

type MenuBindingProps = Omit<MenuProps, "linkComponent" | "currentPath" | "pinnedOnPaths" | "trailing"> & {
    onPaletteTrigger?: () => void;
};

const pinnedOnPaths = [slugs.chat];

/**
 * Menu bound to next/link and to Next's router. The design system takes the active path as a prop
 * rather than reading it from a router it should not know about, the menu stays visible on the chat page, and
 * this site always offers the command palette trigger in the trailing slot.
 */
export const Menu: FC<MenuBindingProps> = ({ onPaletteTrigger, ...props }) => {
    const { state } = useMenuStore();
    const { currentPath } = state;

    return (
        <DesignSystemMenu
            {...props}
            currentPath={currentPath}
            pinnedOnPaths={pinnedOnPaths}
            linkComponent={NextLink}
            trailing={<CommandPaletteTrigger onTrigger={onPaletteTrigger} />}
        />
    );
};
