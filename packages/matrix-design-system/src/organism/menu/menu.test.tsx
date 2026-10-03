import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "./menu";
import type { MenuEntry } from "./menu";
import { ScrollDirection } from "../../hooks/use-scroll-direction";

let currentPath = "/";
let mockScrollDirection: ScrollDirection = ScrollDirection.up;

vi.mock("../../hooks/use-scroll-direction", async () => {
    const actual = await vi.importActual<typeof import("../../hooks/use-scroll-direction")>(
        "../../hooks/use-scroll-direction",
    );
    return {
        ...actual,
        useScrollDirection: () => mockScrollDirection,
    };
});

vi.mock("../../atoms/animation/motion-div", () => ({
    MotionDiv: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}));

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

const onClickHome = vi.fn();
const onClickAuthors = vi.fn();
const onClickMatrixRain = vi.fn();

const buildEntries = (): MenuEntry[] => [
    { label: "Home", to: "/", onClick: onClickHome },
    {
        label: "Blog",
        groups: [
            {
                label: "Posts",
                items: [
                    { label: "Latest posts", to: "/blog" },
                    { label: "Archive", to: "/blog/archive" },
                ],
            },
            {
                label: "Discovery",
                items: [
                    {
                        label: "Authors",
                        to: "/blog/authors",
                        activePathPrefixes: ["/blog/author/"],
                        onClick: onClickAuthors,
                    },
                    { label: "Tags", to: "/blog/tags" },
                ],
            },
            { label: "Insights", items: [{ label: "Stats", to: "/blog/stats" }] },
        ],
    },
    {
        label: "Explore",
        groups: [
            { label: "Artificial Intelligence", items: [{ label: "Chat", to: "/chat" }] },
            {
                label: "Computer Graphics",
                items: [
                    {
                        label: "Matrix Rain",
                        to: "https://labs.fabrizioduroni.it/matrix-rain/",
                        external: true,
                        onClick: onClickMatrixRain,
                    },
                ],
            },
        ],
    },
];

const entries = buildEntries();

afterEach(() => {
    currentPath = "/";
    mockScrollDirection = ScrollDirection.up;
    onClickHome.mockClear();
    onClickAuthors.mockClear();
    onClickMatrixRain.mockClear();
});

const openMobileMenu = async (container: HTMLElement) => {
    const hamburgerWrapper = container.querySelector('div[class="sm:hidden"]');
    const icon = hamburgerWrapper?.querySelector<SVGElement>("svg");
    await userEvent.click(icon!);
};

const getMobilePanel = (container: HTMLElement) => container.querySelector<HTMLElement>('[class*="touch-pan-y"]');

describe("Menu", () => {
    describe("render", () => {
        it("renders the Home nav link", () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            const homeLinks = screen.getAllByRole("link", { name: "Home" });
            expect(homeLinks.length).toBeGreaterThan(0);
            expect(homeLinks[0]).toHaveAttribute("href", "/");
        });

        it("renders a Blog dropdown trigger", () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            const blogButtons = screen.getAllByRole("button", { name: "Blog" });
            expect(blogButtons.length).toBeGreaterThan(0);
        });

        it("lists the injected Blog groups and links in order", async () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            await userEvent.click(screen.getAllByRole("button", { name: "Blog" })[0]);
            const menu = screen.getAllByRole("list", { name: "Blog" })[0];
            expect(within(menu).getByText("Posts")).toBeInTheDocument();
            expect(within(menu).getByText("Discovery")).toBeInTheDocument();
            expect(within(menu).getByText("Insights")).toBeInTheDocument();
            const items = within(menu).getAllByRole("link");
            expect(items.map((item) => item.textContent)).toEqual([
                "Latest posts",
                "Archive",
                "Authors",
                "Tags",
                "Stats",
            ]);
            expect(within(menu).getByRole("link", { name: "Latest posts" })).toHaveAttribute("href", "/blog");
            expect(within(menu).getByRole("link", { name: "Stats" })).toHaveAttribute("href", "/blog/stats");
        });

        it("renders nothing but the trailing slot when no entries are injected", () => {
            render(<Menu entries={[]} currentPath={currentPath} trailing={<button>Trailing action</button>} />);
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Trailing action" })).toBeInTheDocument();
        });

        it("renders an external link with its own target and rel", async () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            await userEvent.click(screen.getAllByRole("button", { name: "Explore" })[0]);
            const menu = screen.getAllByRole("list", { name: "Explore" })[0];
            const link = within(menu).getByRole("link", { name: "Matrix Rain" });
            expect(link).toHaveAttribute("href", "https://labs.fabrizioduroni.it/matrix-rain/");
            expect(link).toHaveAttribute("target", "_blank");
        });

        it("renders the trailing slot content", () => {
            render(<Menu entries={entries} currentPath={currentPath} trailing={<button>Trailing action</button>} />);
            expect(screen.getByRole("button", { name: "Trailing action" })).toBeInTheDocument();
        });

        it("aligns the trailing slot to the end of the bar", () => {
            render(<Menu entries={entries} currentPath={currentPath} trailing={<button>Trailing action</button>} />);
            expect(screen.getByRole("button", { name: "Trailing action" }).parentElement).toHaveClass(
                "ml-auto",
                "sm:mr-3",
            );
        });

        it("renders no trailing wrapper when no slot is passed", () => {
            const { container } = render(<Menu entries={entries} currentPath={currentPath} />);
            expect(container.querySelector(".ml-auto")).toBeNull();
        });
    });

    describe("selected entry", () => {
        it("marks the top-level link matching the current path as selected", () => {
            render(<Menu entries={entries} currentPath="/" />);
            expect(screen.getAllByRole("link", { name: "Home" })[0]).toHaveClass("border-accent");
        });

        it("does not mark the top-level link as selected on another path", () => {
            render(<Menu entries={entries} currentPath="/blog" />);
            expect(screen.getAllByRole("link", { name: "Home" })[0]).not.toHaveClass("border-accent");
        });

        it("marks the dropdown link matching the current path as selected", async () => {
            render(<Menu entries={entries} currentPath="/blog/authors" />);
            await userEvent.click(screen.getAllByRole("button", { name: "Blog" })[0]);
            const menu = screen.getAllByRole("list", { name: "Blog" })[0];
            expect(within(menu).getByRole("link", { name: "Authors" })).toHaveClass("border-accent");
            expect(within(menu).getByRole("link", { name: "Tags" })).not.toHaveClass("border-accent");
        });

        it("never marks an external link as selected", async () => {
            render(
                <Menu
                    entries={[
                        {
                            label: "Explore",
                            groups: [{ label: "Out", items: [{ label: "Ext", to: "/x", external: true }] }],
                        },
                    ]}
                    currentPath="/x"
                />,
            );
            await userEvent.click(screen.getAllByRole("button", { name: "Explore" })[0]);
            const menu = screen.getAllByRole("list", { name: "Explore" })[0];
            expect(within(menu).getByRole("link", { name: "Ext" })).not.toHaveClass("border-accent");
        });

        it("marks a link selected when the current path starts with one of its activePathPrefixes", async () => {
            render(<Menu entries={entries} currentPath="/blog/author/fabrizio-duroni" />);
            await userEvent.click(screen.getAllByRole("button", { name: "Blog" })[0]);
            const menu = screen.getAllByRole("list", { name: "Blog" })[0];
            expect(within(menu).getByRole("link", { name: "Authors" })).toHaveClass("border-accent");
            expect(within(menu).getByRole("link", { name: "Tags" })).not.toHaveClass("border-accent");
        });

        it("highlights the containing dropdown when a prefix selects one of its links", () => {
            render(<Menu entries={entries} currentPath="/blog/author/fabrizio-duroni" />);
            expect(screen.getAllByRole("button", { name: "Blog" })[0]).toHaveClass("border-accent");
            expect(screen.getAllByRole("button", { name: "Explore" })[0]).not.toHaveClass("border-accent");
        });

        it("does not select a link whose activePathPrefixes do not match the current path", async () => {
            render(<Menu entries={entries} currentPath="/blog/tag/react" />);
            await userEvent.click(screen.getAllByRole("button", { name: "Blog" })[0]);
            const menu = screen.getAllByRole("list", { name: "Blog" })[0];
            expect(within(menu).getByRole("link", { name: "Authors" })).not.toHaveClass("border-accent");
            expect(screen.getAllByRole("button", { name: "Blog" })[0]).toHaveClass("border-accent");
        });

        it("never marks an external link selected through its activePathPrefixes", async () => {
            render(
                <Menu
                    entries={[
                        {
                            label: "Explore",
                            groups: [
                                {
                                    label: "Out",
                                    items: [{ label: "Ext", to: "/x", external: true, activePathPrefixes: ["/x/"] }],
                                },
                            ],
                        },
                    ]}
                    currentPath="/x/deep"
                />,
            );
            await userEvent.click(screen.getAllByRole("button", { name: "Explore" })[0]);
            const menu = screen.getAllByRole("list", { name: "Explore" })[0];
            expect(within(menu).getByRole("link", { name: "Ext" })).not.toHaveClass("border-accent");
        });
    });

    describe("interaction", () => {
        it("calls the link onClick when a dropdown link is clicked", async () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            await userEvent.click(screen.getAllByRole("button", { name: "Blog" })[0]);
            const menu = screen.getAllByRole("list", { name: "Blog" })[0];
            await userEvent.click(within(menu).getByRole("link", { name: "Authors" }));
            expect(onClickAuthors).toHaveBeenCalledOnce();
        });

        it("calls the link onClick when a top-level link is clicked", async () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            await userEvent.click(screen.getAllByRole("link", { name: "Home" })[0]);
            expect(onClickHome).toHaveBeenCalledOnce();
        });

        it("clicks a link that has no onClick without failing", async () => {
            render(<Menu entries={entries} currentPath={currentPath} />);
            await userEvent.click(screen.getAllByRole("button", { name: "Blog" })[0]);
            const menu = screen.getAllByRole("list", { name: "Blog" })[0];
            await userEvent.click(within(menu).getByRole("link", { name: "Tags" }));
            expect(onClickAuthors).not.toHaveBeenCalled();
        });
    });

    describe("mobile menu", () => {
        it("opens the mobile menu when the hamburger icon is clicked", async () => {
            const { container } = render(<Menu entries={entries} currentPath={currentPath} />);
            expect(getMobilePanel(container)).toBeNull();
            await openMobileMenu(container);
            expect(getMobilePanel(container)).not.toBeNull();
        });

        it("closes the mobile menu when the close icon is clicked", async () => {
            const { container } = render(<Menu entries={entries} currentPath={currentPath} />);
            await openMobileMenu(container);
            const mobilePanel = getMobilePanel(container)!;
            const closeIcon = mobilePanel.querySelector<SVGElement>('div[class="absolute top-2.5 left-2.5"] svg')!;
            await userEvent.click(closeIcon);
            expect(getMobilePanel(container)).toBeNull();
        });
    });

    describe("mobile link click", () => {
        it.each([
            { label: "Home", dropdown: undefined, onClick: onClickHome },
            { label: "Authors", dropdown: "Blog", onClick: onClickAuthors },
            { label: "Matrix Rain", dropdown: "Explore", onClick: onClickMatrixRain },
        ])(
            "calls the onClick and closes the mobile menu when $label is clicked",
            async ({ label, dropdown, onClick }) => {
                const { container } = render(<Menu entries={entries} currentPath={currentPath} />);
                await openMobileMenu(container);
                const mobilePanel = getMobilePanel(container)!;

                if (dropdown) {
                    await userEvent.click(within(mobilePanel).getByRole("button", { name: dropdown }));
                }
                await userEvent.click(within(mobilePanel).getByRole("link", { name: label }));

                expect(onClick).toHaveBeenCalledOnce();
                expect(getMobilePanel(container)).toBeNull();
            },
        );
    });

    describe("hide on scroll", () => {
        it("hides the menu bar when scrolling down on a non-chat page", () => {
            currentPath = "/blog";
            mockScrollDirection = ScrollDirection.down;
            const { container } = render(<Menu entries={entries} currentPath={currentPath} />);
            const menuBar = container.querySelector(".menu-container");
            expect(menuBar).toHaveAttribute("animate", "hidden");
        });

        it("hides the menu bar on a path that is not pinned", () => {
            currentPath = "/blog";
            mockScrollDirection = ScrollDirection.down;
            const { container } = render(
                <Menu entries={entries} currentPath={currentPath} pinnedOnPaths={["/chat"]} />,
            );
            expect(container.querySelector(".menu-container")).toHaveAttribute("animate", "hidden");
        });

        it("keeps the menu bar visible when scrolling up", () => {
            currentPath = "/blog";
            mockScrollDirection = ScrollDirection.up;
            const { container } = render(<Menu entries={entries} currentPath={currentPath} />);
            const menuBar = container.querySelector(".menu-container");
            expect(menuBar).toHaveAttribute("animate", "visible");
        });

        it("keeps the menu bar visible on a pinned path even when scrolling down", () => {
            currentPath = "/chat";
            mockScrollDirection = ScrollDirection.down;
            const { container } = render(
                <Menu entries={entries} currentPath={currentPath} pinnedOnPaths={["/chat"]} />,
            );
            const menuBar = container.querySelector(".menu-container");
            expect(menuBar).toHaveAttribute("animate", "visible");
        });
    });
});
