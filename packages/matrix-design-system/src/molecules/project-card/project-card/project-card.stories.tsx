import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectCard } from ".";
import { landscapeImage } from "../../../stories/sample-media";

// Typed as plain Meta/StoryObj rather than Meta<typeof Component>. These stories render
// explicitly instead of being driven by args — several compose more than one component —
// so binding the story type to a single component's props would demand an `args` object
// that nothing reads.
const meta: Meta = {
    title: "Molecules/Project Card",
    component: ProjectCard,
};

export default meta;

type Story = StoryObj;

const DefaultStory = () => (
    <ProjectCard
        name="Matrix Rain"
        description="A WebGPU digital rain, published as an npm package."
        features={["Rendered on the GPU with TypeGPU", "Tunable glyph size, speed and trails", "React and plain DOM"]}
        callToActions={[
            { label: "Github", link: "https://github.com/chicio/chicio-labs" },
            { label: "NPM", link: "https://www.npmjs.com/package/matrix-rain-webgpu" },
        ]}
        image={landscapeImage}
    />
);

const SingleCallToActionStory = () => (
    <ProjectCard
        name="Chicio Labs"
        description="Every Lab Project, in one place."
        features={["Published projects first", "Then the Workbench"]}
        callToActions={[{ label: "Github", link: "https://github.com/chicio/chicio-labs" }]}
        image={landscapeImage}
    />
);

export const Default: Story = { render: () => <DefaultStory /> };
export const SingleCallToAction: Story = { render: () => <SingleCallToActionStory /> };
