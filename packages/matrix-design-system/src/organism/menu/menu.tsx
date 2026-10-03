"use client";

import { AnimatePresence, Variants } from "framer-motion";
import { FC } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { Close } from "../../molecules/menu/close";
import { DropdownMenu } from "../../molecules/menu/dropdown-menu";
import { HamburgerMenu } from "../../molecules/menu/hamburger-menu";
import { MenuItem } from "../../molecules/menu/menu-item";
import type { LinkComponent } from "../../atoms/links/anchor-link";
import { useGlassmorphism } from "../../hooks/use-glassmorphism";
import { MotionDiv } from "../../atoms/animation/motion-div";
import { LuCommand } from "react-icons/lu";
import { ImCtrl } from "react-icons/im";
import { useMenuStore } from "./use-menu-store";

const menuVariants: Variants = {
    hidden: {
        y: -80,
        transition: { type: "tween", duration: 0.3 },
    },
    visible: {
        y: 0,
        transition: { type: "tween", duration: 0.3 },
    },
};

const panelVariants: Variants = {
    closed: {
        x: "-100%",
        transition: { type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.6 },
    },
    open: {
        x: 0,
        transition: { type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.6 },
    },
};

export interface MenuLink {
    label: string;
    to: string;
    external?: boolean;
    onClick?: () => void;
    /** Path prefixes that also mark this link selected (e.g. `/blog/author/`). */
    activePathPrefixes?: string[];
}

export interface MenuGroup {
    label: string;
    items: MenuLink[];
}

export interface MenuDropdown {
    label: string;
    groups: MenuGroup[];
}

export type MenuEntry = MenuLink | MenuDropdown;

export interface MenuProps {
    linkComponent?: LinkComponent;
    /** The path currently being viewed, used to mark the active entry. Injected by the consumer's router. */
    currentPath: string;
    /** The navigation tree, in display order: top-level links and dropdowns of grouped links. */
    entries: MenuEntry[];
    /** Paths on which the menu never hides on scroll. */
    pinnedOnPaths?: string[];
    /** Whether the search button and its keyboard shortcut hint are shown. Required: no host gets one silently. */
    showPaletteTrigger: boolean;
    onPaletteTrigger?: () => void;
}

const noPinnedPaths: string[] = [];

const isDropdown = (entry: MenuEntry): entry is MenuDropdown => "groups" in entry;

export const Menu: FC<MenuProps> = ({
    entries,
    pinnedOnPaths = noPinnedPaths,
    showPaletteTrigger,
    onPaletteTrigger,
    linkComponent,
    currentPath,
}) => {
    const { glassmorphismClass } = useGlassmorphism({ noScale: true });
    const { state, effects } = useMenuStore(currentPath, pinnedOnPaths, onPaletteTrigger);
    const { shouldHideMenu, shouldOpenMenu, modifierKey } = state;
    const { openMenu, closeMenu, handlePaletteTrigger, handleLinkClick, isSelected } = effects;

    const baseClassName = (isMobile: boolean) => (isMobile ? "mb-2 w-80" : "hidden sm:flex xs:mb-0 xs:w-auto");
    const dropdownClassName = (isMobile: boolean) =>
        isMobile ? "z-50 mb-2 w-80" : "hidden sm:flex xs:mb-0 xs:w-auto z-50";

    const renderMenuItems = (isMobile: boolean) => (
        <>
            {entries.map((entry) => {
                const key = `${entry.label}-${isMobile ? "mobile" : "desktop"}`;

                if (isDropdown(entry)) {
                    return (
                        <DropdownMenu
                            linkComponent={linkComponent}
                            key={key}
                            label={entry.label}
                            className={dropdownClassName(isMobile)}
                            items={entry.groups.map((group) => ({
                                label: group.label,
                                items: group.items.map((link) => ({
                                    label: link.label,
                                    to: link.to,
                                    external: link.external,
                                    selected: isSelected(link),
                                    onClick: handleLinkClick(link.onClick),
                                })),
                            }))}
                        />
                    );
                }

                return (
                    <MenuItem
                        linkComponent={linkComponent}
                        className={baseClassName(isMobile)}
                        key={key}
                        to={entry.to}
                        external={entry.external}
                        selected={isSelected(entry)}
                        onClick={handleLinkClick(entry.onClick)}
                    >
                        {entry.label}
                    </MenuItem>
                );
            })}
        </>
    );

    return (
        <>
            <MotionDiv
                className={`menu-container container-fixed fixed right-0 left-0 z-50 my-3 ${shouldOpenMenu ? "xs:block hidden" : ""}`}
                variants={menuVariants}
                animate={shouldHideMenu ? "hidden" : "visible"}
                initial="visible"
            >
                <div
                    className={`${glassmorphismClass} xs:py-0 xs:pt-0 m-0 my-0 flex min-h-16 flex-row items-center gap-1 overflow-hidden px-2 sm:overflow-visible`}
                >
                    {renderMenuItems(false)}
                    {!shouldOpenMenu && (
                        <div className="sm:hidden">
                            <HamburgerMenu onClick={openMenu} />
                        </div>
                    )}
                    {showPaletteTrigger && (
                        <button
                            className="group border-accent bg-accent/10 hover:border-accent hover:bg-accent/20 ml-auto flex min-h-10 w-auto cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200 sm:mr-3 md:w-60"
                            onClick={handlePaletteTrigger}
                            aria-label="Open command palette"
                        >
                            <BiSearchAlt className="text-accent group-hover:text-accent size-3.5 shrink-0 transition-colors duration-200" />
                            <span className="text-accent/40 group-hover:text-accent/60 hidden flex-1 text-left font-mono text-sm leading-none transition-colors duration-200 md:block">
                                Search...
                            </span>
                            {modifierKey !== null && (
                                <span className="hidden items-center gap-1 md:inline-flex">
                                    <kbd className="border-accent/50 text-accent/70 group-hover:border-accent group-hover:text-accent inline-flex size-6 items-center justify-center rounded border font-mono text-sm leading-none transition-colors duration-200">
                                        {modifierKey === "meta" ? (
                                            <LuCommand className="size-3" />
                                        ) : (
                                            <ImCtrl className="size-3" />
                                        )}
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
                    )}
                </div>
            </MotionDiv>
            <AnimatePresence>
                {shouldOpenMenu && (
                    <MotionDiv
                        className="bg-black-alpha-75 fixed top-0 left-0 z-50 h-full w-full touch-pan-y overflow-y-auto backdrop-blur-sm sm:hidden"
                        style={{ willChange: "transform" }}
                        variants={panelVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        <div className="flex flex-col items-center gap-1 p-5 pt-[55px]">
                            <div className="absolute top-2.5 left-2.5">
                                <Close onClick={closeMenu} />
                            </div>
                            {renderMenuItems(true)}
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </>
    );
};
