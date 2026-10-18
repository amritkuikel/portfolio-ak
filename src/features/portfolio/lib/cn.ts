import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `cn` for portfolio components. tailwind-merge can't tell that `text-pf-h2`
 * is a font size and `text-pf-accent` a colour (both are custom), so out of
 * the box it keeps only the last one. Registering the scale fixes that, scoped
 * to the portfolio so the app's `cn` (src/lib/utils.ts) is unchanged.
 */
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [
				{ text: ["pf-label", "pf-small", "pf-body", "pf-lead", "pf-h3", "pf-h2", "pf-h1", "pf-hero", "pf-mega"] },
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
