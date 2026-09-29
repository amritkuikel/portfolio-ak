import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so tests don't run the app's env validation,
// Nitro or TanStack Start plugins. Each test supplies the env it needs.
export default defineConfig({
	// Compiles messages before tests run (options from project.inlang/paraglide.config.ts).
	plugins: [paraglideVitePlugin({ project: "./project.inlang" })],
	resolve: { tsconfigPaths: true },
	test: {
		include: ["tests/**/*.test.{ts,tsx}"],
		environment: "node",
		restoreMocks: true,
		unstubEnvs: true,
	},
});
