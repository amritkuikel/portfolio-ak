import type { QueryClient } from "@tanstack/react-query";
import { ensureQuery, prefetch } from "@/lib/query";
import type { Locale } from "@/paraglide/runtime";
import { tmdbImage } from "../kit/image";
import { pardaPageQueryOptions, pardaRailQueryOptions } from "../queries";
import type { PardaPage } from "../search";
import type { HeroPreload } from "./head";

/**
 * The home's and the hubs' loader (routes import it with `await import()`, 0194):
 * awaits the billboard and the first rails, starts every later rail without waiting
 * (they stream into the same response), and returns only the first picture for the
 * head's preload.
 */
export async function loadPardaPage(
	queryClient: QueryClient,
	locale: Locale,
	page: PardaPage,
	signedIn = false,
): Promise<HeroPreload> {
	const data = await ensureQuery(queryClient, pardaPageQueryOptions(locale, page));
	// The home's Continue watching renders on the server for a session (decision 0236); a failure only leaves it out.
	if (signedIn && page === "home" && data.configured) {
		const { pardaContinueQueryOptions } = await import("../library/queries");
		await ensureQuery(queryClient, pardaContinueQueryOptions(locale)).catch(() => undefined);
	}
	if (!data.configured) return { narrow: null, wide: null };
	for (const rail of data.rails) {
		if (rail.titles === undefined) prefetch(queryClient, pardaRailQueryOptions(locale, page, rail.id));
	}
	const first = data.billboard[0];
	if (!first) return { narrow: null, wide: null };
	const poster = tmdbImage(data.imageBase, first.poster, "poster");
	const backdrop = tmdbImage(data.imageBase, first.backdrop, "backdrop");
	return { narrow: poster ?? backdrop, wide: backdrop ?? poster };
}
