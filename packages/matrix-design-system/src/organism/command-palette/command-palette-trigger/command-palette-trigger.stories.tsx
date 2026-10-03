import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPaletteTrigger } from ".";

const meta: Meta<typeof CommandPaletteTrigger> = {
    title: "Organism/Command Palette Trigger",
    component: CommandPaletteTrigger,
};

export default meta;

type Story = StoryObj<typeof CommandPaletteTrigger>;

export const Default: Story = {};

export const CustomLabel: Story = { args: { label: "Find..." } };
