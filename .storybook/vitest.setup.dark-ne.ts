import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

// Second pass over every story: Nepali + dark theme (contrast and Devanagari layout).
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations, { initialGlobals: { locale: "ne", theme: "dark" } }]);
