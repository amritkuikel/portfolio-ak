import "@tanstack/react-start/server-only";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import type { Localized } from "@/lib/i18n/localized";
import type { Session } from "@/lib/session";
import { clientIpHash, trustedClientIp } from "@/server/auth/client-ip";
import { db } from "@/server/db/client";
import { enforceRateLimit } from "@/server/http/rate-limit";
import { browsingProfile, PROFILE_COOKIE } from "../profiles/service";
import { pardaCache, pardaControls, pardaTmdb } from "../tmdb/store";
import type { CatalogScope, CatalogServices } from "./service";

/**
 * What `withPardaCatalog` hands a catalogue function (PLAN 12.5): the services, and the
 * scope's region and cap. Null when TMDB_READ_TOKEN is unset: the page then says the
 * catalogue isn't configured.
 */
export type PardaCatalog = { services: CatalogServices; region: string; cap: string | null };

/**
 * Calls over HTTP without a session, per IP (decision 0234). A page load reads the
 * catalogue inside its own request, through the cache, so only direct calls count:
 * client-side navigation stays far below this, and a script walking the catalogue doesn't.
 */
const ANONYMOUS_LIMIT = { max: 300, windowSeconds: 300 } as const;

const isServerFunctionCall = (request: Request) => new URL(request.url).pathname.startsWith("/_serverFn/");

export async function pardaCatalog(session: Session | null): Promise<PardaCatalog | null> {
	if (!pardaTmdb) return null;
	if (!session) {
		const request = getRequest();
		if (isServerFunctionCall(request)) {
			const ip = clientIpHash(trustedClientIp(request));
			await enforceRateLimit(db, `parda-catalog:${ip ?? "unknown"}`, ANONYMOUS_LIMIT);
		}
	}
	const [settings, profile] = await Promise.all([
		pardaControls.settings(),
		browsingProfile(db, session, getCookie(PROFILE_COOKIE)),
	]);
	return {
		services: { tmdb: pardaTmdb, cache: pardaCache, controls: pardaControls },
		region: profile?.region ?? settings.region,
		// A kids' profile browses under its cap, or the admin's (decision 0236).
		cap: profile?.kids ? (profile.cap ?? ("kidsCap" in settings ? settings.kidsCap : null)) : null,
	};
}

export const catalogScope = (catalog: PardaCatalog, locale: CatalogScope["locale"]): CatalogScope => ({
	locale,
	region: catalog.region,
	cap: catalog.cap,
});

/** The admin's banner (decision 0237), null when its English is empty. Read from the controls' 30 s cache. */
export async function pardaBanner(): Promise<Localized | null> {
	const settings = await pardaControls.settings();
	const banner = "banner" in settings ? settings.banner : null;
	return banner?.en.trim() ? banner : null;
}
