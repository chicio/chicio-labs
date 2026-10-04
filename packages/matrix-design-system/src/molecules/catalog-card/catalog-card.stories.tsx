import type { Meta, StoryObj } from "@storybook/react-vite";
import { CatalogCard } from ".";
import { landscapeImage } from "../../stories/sample-media";

// Typed as plain Meta/StoryObj rather than Meta<typeof Component>. These stories render
// explicitly instead of being driven by args — several compose more than one component —
// so binding the story type to a single component's props would demand an `args` object
// that nothing reads.
const meta: Meta = {
    title: "Molecules/Catalog Card",
    component: CatalogCard,
};

export default meta;

type Story = StoryObj;

const grid = "grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))]";

const LabProjectStory = () => (
    <div className={grid}>
        <CatalogCard
            name="Matrix Rain"
            type="Package"
            typeHref="#lab-projects"
            meta="v1.2.0"
            description="A WebGPU digital rain, published as an npm package, with tunable glyphs, speed and trails."
            image={landscapeImage}
            primary={{ label: "Docs", href: "https://labs.fabrizioduroni.it/lab/matrix-rain-webgpu/" }}
            links={[
                { label: "Showcase", href: "https://labs.fabrizioduroni.it/matrix-rain/" },
                { label: "npm", href: "https://www.npmjs.com/package/matrix-rain-webgpu" },
                { label: "Source", href: "https://github.com/chicio/chicio-labs" },
            ]}
        />
    </div>
);

const StandaloneProjectStory = () => (
    <div className={grid}>
        <CatalogCard
            name="ID3TagEditor"
            type="iOS / mobile"
            typeHref="#standalone-projects"
            meta="Swift"
            description="A Swift library to edit ID3 Tag of any mp3 file."
            image={landscapeImage}
            primary={{ label: "GitHub", href: "https://github.com/chicio/ID3TagEditor" }}
        />
    </div>
);

const WithoutImageStory = () => (
    <div className={grid}>
        <CatalogCard
            name="Chicio Labs SDLC"
            type="Claude Code skills"
            typeHref="#workbench"
            description="The agentic SDLC pipeline behind this repository: explore, Human Gate, parallel Work Units, reviews and a pull request."
            primary={{ label: "Docs", href: "https://labs.fabrizioduroni.it/lab/chicio-labs-sdlc/" }}
        />
    </div>
);

export const LabProject: Story = { render: () => <LabProjectStory /> };
export const StandaloneProject: Story = { render: () => <StandaloneProjectStory /> };
export const WithoutImage: Story = { render: () => <WithoutImageStory /> };
