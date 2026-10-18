/**
 * Which app chrome a route renders around its content.
 *
 * By default every page gets the root layout's <SiteHeader>. A section with its
 * own full-bleed navigation (the editorial /portfolio site) opts out on its
 * layout route:
 *
 *   staticData: { chrome: "bare" }
 *
 * Any matched route setting it hides the header for the whole subtree. Pages
 * that don't set it are unaffected (decision 0105).
 */
export type RouteChrome = "bare";

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		/** "bare": the root layout renders no site header (the section brings its own). */
		chrome?: RouteChrome;
	}
}

/** True when a matched route asked for no app chrome. */
export const isBareChrome = (matches: ReadonlyArray<{ staticData: { chrome?: RouteChrome | undefined } }>): boolean =>
	matches.some((match) => match.staticData.chrome === "bare");
