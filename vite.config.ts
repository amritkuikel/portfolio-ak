import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

/**
 * Nitro bundles the server output in its own Rolldown pass, where
 * @vitejs/plugin-react's handling of "use client" does not apply. Libraries such
 * as @tanstack/react-router and sonner ship "use client" for RSC frameworks; it
 * is meaningless here (no RSC), so only that exact warning from node_modules is
 * dropped. Nitro's own ignore list is kept because this handler replaces its default.
 */
const NITRO_IGNORED_CODES = new Set(["EVAL", "CIRCULAR_DEPENDENCY", "THIS_IS_UNDEFINED", "EMPTY_BUNDLE"]);

const isDependencyUseClientWarning = (code: string | undefined, message: string) =>
	code === "MODULE_LEVEL_DIRECTIVE" && message.includes('"use client"') && message.includes("node_modules");

/**
 * Fail fast on bad env, before Vite starts serving or building.
 * - Client (VITE_*) vars are inlined at build time, so they are checked for dev and build.
 * - Server vars are runtime config. They are checked for dev here, and for production
 *   when the server boots (src/server/plugins/validate-env.ts), so builds don't need production secrets.
 */
const validateEnv = async (command: "serve" | "build", mode: string) => {
	const fileEnv = loadEnv(mode, process.cwd(), "");
	// Real environment variables win over .env files, matching Vite's own precedence.
	for (const [key, value] of Object.entries(fileEnv)) process.env[key] ??= value;

	const { createClientEnv } = await import("./src/lib/client-env.schema.ts");
	createClientEnv({ ...process.env });

	if (command === "serve") {
		const { createServerEnv } = await import("./src/server/env.ts");
		createServerEnv({ ...process.env });
	}
};

export default defineConfig(async ({ command, mode }) => {
	// Vitest has its own config (vitest.config.ts); this guard covers `vite` commands only.
	await validateEnv(command, mode);

	return {
		resolve: { tsconfigPaths: true },
		environments: {
			client: {
				build: {
					rolldownOptions: {
						output: {
							// React changes rarely; a separate chunk stays cached across deploys and keeps
							// the entry chunk under Vite's 500 kB warning. See docs/decisions.md.
							codeSplitting: {
								groups: [
									{
										name: "react-vendor",
										test: /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react|react-dom|scheduler)\//,
									},
								],
							},
						},
					},
				},
			},
		},
		plugins: [
			// Options live in project.inlang/paraglide.config.ts (shared with the compile CLI).
			paraglideVitePlugin({ project: "./project.inlang" }),
			devtools(),
			nitro({
				// Validates server env at boot. See the file for why this is a Nitro plugin.
				plugins: ["./src/server/plugins/validate-env.ts"],
				rolldownConfig: {
					onwarn(warning, warn) {
						if (NITRO_IGNORED_CODES.has(warning.code ?? "")) return;
						if (isDependencyUseClientWarning(warning.code, warning.message)) return;
						warn(warning);
					},
				},
			}),
			tailwindcss(),
			tanstackStart({
				importProtection: {
					client: {
						// `files` replaces the defaults, so the default *.server.* rule is repeated.
						files: ["**/*.server.*", "**/src/server/**"],
					},
				},
			}),
			viteReact(),
		],
	};
});
