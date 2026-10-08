import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { storybookAliases, storybookEnv } from "./aliases.ts";

// Storybook-only Vite config: Tailwind, Paraglide and React, plus module mocks.
// .env files are not read (envDir: false), so real keys never reach Storybook.
for (const [key, value] of Object.entries(storybookEnv)) process.env[key] = value;
for (const key of ["VITE_SENTRY_DSN", "VITE_POSTHOG_KEY", "VITE_POSTHOG_HOST"]) delete process.env[key];

export default defineConfig({
	envDir: false,
	resolve: { tsconfigPaths: true, alias: storybookAliases },
	plugins: [paraglideVitePlugin({ project: "./project.inlang" }), tailwindcss(), viteReact()],
});
