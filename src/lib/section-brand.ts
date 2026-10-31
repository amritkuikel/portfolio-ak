import { useMatches } from "@tanstack/react-router";
import type { AccentPreference } from "@/lib/stores/preferences";

/**
 * A section that is its own product (Taskline, decision 0208) brands the whole
 * document, not just its frame:
 *
 *   staticData: { brand: TASKLINE_BRAND }
 *
 * The root then puts the section's accent on `<html data-accent>` (so dialogs and
 * menus, which portal to <body>, and the tokens derived from `--primary` match it),
 * and links the section's icons and manifest instead of the app's.
 */
export type SectionBrand = {
	/** The section's accent, whatever accent the visitor picked for the admin area. */
	accent: AccentPreference;
	/** Its favicons, touch icon and manifest (the root's head links them in place of the app's). */
	links: () => Array<{ rel: string; href: string; type?: string; sizes?: string }>;
};

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		/** This section's brand: accent, icons and manifest. */
		brand?: SectionBrand;
	}
}

type Match = { staticData: { brand?: SectionBrand | undefined } };

/** The deepest matched section's brand, if any. `matches` is undefined where a head is computed without them (tests). */
export const sectionBrandOf = (matches: ReadonlyArray<Match> | undefined): SectionBrand | undefined => {
	for (const match of [...(matches ?? [])].reverse()) if (match.staticData.brand) return match.staticData.brand;
	return undefined;
};

/** The deepest matched section's accent, if it has a brand. */
export const useSectionAccent = () => useMatches({ select: (matches) => sectionBrandOf(matches)?.accent });
