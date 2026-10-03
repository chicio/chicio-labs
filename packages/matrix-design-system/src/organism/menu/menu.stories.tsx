import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from ".";
import type { MenuEntry } from ".";
import { useEffect, useRef } from "react";

// Typed as plain Meta/StoryObj rather than Meta<typeof Component>. These stories render
// explicitly instead of being driven by args — several compose more than one component —
// so binding the story type to a single component's props would demand an `args` object
// that nothing reads.
const meta: Meta = {
    title: "Organism/Menu",
    component: Menu,
};

export default meta;

type Story = StoryObj;

// The navigation tree of the real site, injected the way a consumer would.
const entries: MenuEntry[] = [
    { label: "Home", to: "/" },
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
                    { label: "Authors", to: "/blog/authors", activePathPrefixes: ["/blog/author/"] },
                    { label: "Tags", to: "/blog/tags" },
                ],
            },
            { label: "Insights", items: [{ label: "Stats", to: "/blog/stats" }] },
        ],
    },
    {
        label: "Explore",
        groups: [
            {
                label: "DSA",
                items: [
                    { label: "Roadmap", to: "/data-structures-and-algorithms/roadmap" },
                    { label: "Exercises", to: "/data-structures-and-algorithms/exercises" },
                ],
            },
            {
                label: "Artificial Intelligence",
                items: [
                    { label: "Chat", to: "/chat" },
                    { label: "MCP", to: "/mcp" },
                ],
            },
            {
                label: "Computer Graphics",
                items: [
                    {
                        label: "Matrix Rain",
                        to: "https://labs.fabrizioduroni.it/matrix-rain/",
                        external: true,
                    },
                ],
            },
            { label: "Secrets", items: [{ label: "Easter eggs", to: "/easter-egg-hunt" }] },
        ],
    },
    {
        label: "The Author",
        groups: [
            {
                label: "Profile",
                items: [
                    { label: "About me", to: "/about-me" },
                    { label: "Contact me", to: "/contact" },
                ],
            },
            {
                label: "Hobbies",
                items: [
                    { label: "Art", to: "/art" },
                    { label: "Videogames", to: "/videogames" },
                ],
            },
        ],
    },
];

// Menu owns its dropdowns' open state internally, so the cells that show a panel
// click the matching trigger on mount. Matching on the trigger's own label keeps
// the cell honest if the nav is reordered.
const useDropdownOpenedOnMount = (label: string) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const triggers = ref.current?.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="menu"]');
        Array.from(triggers ?? [])
            .find((trigger) => (trigger.textContent ?? "").trim() === label)
            ?.click();
    }, [label]);

    return ref;
};

const DefaultStory = () => <Menu showPaletteTrigger currentPath="/blog" entries={entries} />;

const BlogDropdownOpenStory = () => {
    const ref = useDropdownOpenedOnMount("Blog");

    return (
        <div ref={ref}>
            <Menu showPaletteTrigger currentPath="/blog" entries={entries} />
        </div>
    );
};

const ExploreDropdownOpenStory = () => {
    const ref = useDropdownOpenedOnMount("Explore");

    return (
        <div ref={ref}>
            <Menu showPaletteTrigger currentPath="/blog" entries={entries} />
        </div>
    );
};

const AuthorDropdownOpenStory = () => {
    const ref = useDropdownOpenedOnMount("The Author");

    return (
        <div ref={ref}>
            <Menu showPaletteTrigger currentPath="/blog" entries={entries} />
        </div>
    );
};

export const Default: Story = { render: () => <DefaultStory /> };
export const BlogDropdownOpen: Story = { render: () => <BlogDropdownOpenStory /> };
export const ExploreDropdownOpen: Story = { render: () => <ExploreDropdownOpenStory /> };
export const AuthorDropdownOpen: Story = { render: () => <AuthorDropdownOpenStory /> };
