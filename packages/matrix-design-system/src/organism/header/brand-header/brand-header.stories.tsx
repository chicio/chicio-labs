import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandHeader } from ".";
import { squarePortrait } from "../../../stories/sample-media";

// Typed as plain Meta/StoryObj rather than Meta<typeof Component>. These stories render
// explicitly instead of being driven by args — several compose more than one component —
// so binding the story type to a single component's props would demand an `args` object
// that nothing reads.
const meta: Meta = {
    title: "Organism/Brand Header",
    component: BrandHeader,
};

export default meta;

type Story = StoryObj;

// The Cursor blink is a CSS keyframe animation and the capture freezes the page clock, so an
// unpaused cursor photographs at whatever frame it happens to be in (often the transparent half).
// Pausing it pins it to the 0% keyframe, where it is visible.
const freeze = `.ds-still, .ds-still * { animation-play-state: paused !important; }`;

// The rain backdrop is absolutely positioned against the nearest positioned ancestor, so each
// story gives it a relative box of its own instead of letting it reach the canvas edges.
const CompactStory = () => (
    <div className="ds-still relative h-72 w-full overflow-hidden px-4">
        <style>{freeze}</style>
        <BrandHeader
            big={false}
            title="CHICIO LABS"
            tagline="Code. AI. Computer graphics."
            logoAlt="Chicio Labs logo"
            logo={squarePortrait}
        />
    </div>
);

const BigStory = () => (
    <div className="ds-still relative h-[520px] w-full overflow-hidden px-4">
        <style>{freeze}</style>
        <BrandHeader
            big={true}
            title="CHICIO CODING"
            tagline="Pixels. Code. Unplugged."
            logoAlt="blog logo"
            logo={squarePortrait}
        />
    </div>
);

export const Compact: Story = { render: () => <CompactStory /> };

export const Big: Story = { render: () => <BigStory /> };
