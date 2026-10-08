import path from "node:path";
import { fileURLToPath } from "node:url";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { storybookAliases, storybookEnv } from "./.storybook/aliases.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Separate from vite.config.ts so tests don't run the app's env validation,
// Nitro or TanStack Start plugins. Each test supplies the env it needs.
export default defineConfig({
	// Compiles messages before tests run (options from project.inlang/paraglide.config.ts).
	plugins: [paraglideVitePlugin({ project: "./project.inlang" })],
	resolve: { tsconfigPaths: true },
	test: {
		projects: [
			{
				// `pnpm test`: unit, component (jsdom) and server tests.
				extends: true,
				test: {
					name: "unit",
					include: ["tests/**/*.test.{ts,tsx}"],
					environment: "node",
					setupFiles: ["tests/setup/env.ts", "tests/setup/dom.ts"],
					restoreMocks: true,
					unstubEnvs: true,
				},
			},
			{
				// `pnpm test:storybook`: every story renders in real Chrome; play functions
				// run and the a11y addon fails the story on any violation. English, light theme.
				extends: true,
				plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") }), tailwindcss()],
				resolve: { alias: storybookAliases },
				define: Object.fromEntries(
					Object.entries(storybookEnv).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
				),
				test: {
					name: "storybook",
					// Rendering in a real browser is slower than jsdom; give stories (Tiptap, axe) room.
					testTimeout: 30_000,
					browser: {
						enabled: true,
						headless: true,
						// The installed Chrome: no Playwright browser download needed.
						provider: playwright({ launchOptions: { channel: "chrome" } }),
						instances: [{ browser: "chromium" }],
					},
					setupFiles: [".storybook/vitest.setup.ts"],
				},
			},
			{
				// The same stories again in Nepali with the dark theme.
				extends: true,
				plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") }), tailwindcss()],
				resolve: { alias: storybookAliases },
				define: Object.fromEntries(
					Object.entries(storybookEnv).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
				),
				test: {
					name: "storybook-dark-ne",
					// Rendering in a real browser is slower than jsdom; give stories (Tiptap, axe) room.
					testTimeout: 30_000,
					browser: {
						enabled: true,
						headless: true,
						// The installed Chrome: no Playwright browser download needed.
						provider: playwright({ launchOptions: { channel: "chrome" } }),
						instances: [{ browser: "chromium" }],
					},
					setupFiles: [".storybook/vitest.setup.dark-ne.ts"],
				},
			},
		],
	},
});
