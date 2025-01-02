import type { Meta, StoryObj } from "@storybook/react";

import { Input as Component } from "src/components/input";

const meta: Meta = {
  component: Component,
};

export default meta;

export const Input: StoryObj = {
  args: {
    label: "Test",
  },
};
