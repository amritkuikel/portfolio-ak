import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

// Applies the Storybook preview (decorators, globals, a11y checks) to stories run as Vitest tests.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
