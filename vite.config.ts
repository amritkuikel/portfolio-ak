import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

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

export default defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		nitro({
			rolldownConfig: {
				onwarn(warning, warn) {
					if (NITRO_IGNORED_CODES.has(warning.code ?? "")) return;
					if (isDependencyUseClientWarning(warning.code, warning.message)) return;
					warn(warning);
				},
			},
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});
