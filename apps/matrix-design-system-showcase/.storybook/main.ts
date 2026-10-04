import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    // Stories live beside the components they document, inside the package. Storybook globs across
    // the workspace to reach them: colocation is what keeps a story honest when its component
    // changes, and it is also where .design-sync reads them from, so there is one source of truth.
    stories: ["../../../packages/matrix-design-system/src/**/*.stories.@(ts|tsx)"],
    addons: [],
    staticDirs: [{ from: "../../../packages/matrix-design-system/brand", to: "/brand" }],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    // The TypeScript-aware docgen, so prop tables carry the real types rather than what can be
    // inferred from JS. Slower than the default, which does not matter at this size.
    typescript: {
        reactDocgen: "react-docgen-typescript",
    },
};

export default config;
