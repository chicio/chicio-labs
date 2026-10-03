import type { Meta, StoryObj } from "@storybook/react-vite";
import { Footer } from ".";
import type { FooterLink } from ".";

// Typed as plain Meta/StoryObj rather than Meta<typeof Component>. These stories render
// explicitly instead of being driven by args — several compose more than one component —
// so binding the story type to a single component's props would demand an `args` object
// that nothing reads.
const meta: Meta = {
    title: "Organism/Footer",
    component: Footer,
};

export default meta;

type Story = StoryObj;

// The footer signs off with a blinking Cursor (animate-blink: opacity 1 for 0-50%,
// 0 for 51-100%). package-capture screenshots after networkidle with no animation
// control, so the caret is captured in whatever half of the cycle it happens to be
// in — half the runs lose it. A paused animation sits at its 0% keyframe, which is
// the visible one.
const stillCaret = `
.ds-caret-still, .ds-caret-still * {
    animation-play-state: paused !important;
}
`;

// The real footer nav and social contacts, injected the way a consumer would.
const links: FooterLink[] = [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blog" },
    { label: "Art", to: "/art" },
    { label: "About Me", to: "/about-me" },
    { label: "Archive", to: "/blog/archive" },
    { label: "Tags", to: "/blog/tags" },
];

const socialLinks = {
    github: "https://github.com/chicio",
    linkedin: "https://www.linkedin.com/in/fabrizio-duroni/",
    medium: "https://medium.com/@chicio",
    devto: "https://dev.to/chicio",
    twitter: "https://twitter.com/chicio86",
    facebook: "https://www.facebook.com/fabrizio.duroni",
    instagram: "https://www.instagram.com/__chicio__/",
};

const DefaultStory = () => (
    <div className="ds-caret-still">
        <style>{stillCaret}</style>
        <Footer author="Fabrizio Duroni" links={links} contactHref="/contact" socialLinks={socialLinks} />
    </div>
);

// How it reads in place: the accent top border separates it from the page column
// above it, and the whole block is the last snap point of the scroll container.
const AtPageBottomStory = () => (
    <div className="ds-caret-still flex flex-col gap-6">
        <style>{stillCaret}</style>
        <div className="container-fixed flex flex-col gap-2">
            <h2 className="text-accent text-2xl">Memories and failures: 18 years of a software engineering career</h2>
            <p className="text-primary-text leading-relaxed">
                A personal essay looking back at my first 18 years as a software engineer, and the life, and the losses,
                that ran alongside them.
            </p>
        </div>
        <Footer author="Fabrizio Duroni" links={links} contactHref="/contact" socialLinks={socialLinks} />
    </div>
);

export const Default: Story = { render: () => <DefaultStory /> };
export const AtPageBottom: Story = { render: () => <AtPageBottomStory /> };
