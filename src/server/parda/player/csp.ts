import "@tanstack/react-start/server-only";
import { originOf } from "@/lib/http/csp";
import { serverEnv } from "@/server/env";
import { errorFields, log } from "@/server/log";
import type { PardaSourceRow } from "../controls";
import { pardaControls } from "../tmdb/store";
import { embedOrigins, TRAILER_ORIGIN } from "./sources";

const TRAILER_THUMBNAILS = "https://i.ytimg.com";

/**
 * The CSP additions of Parda's pages (decision 0230), from the sources cached for 30 s.
 * A failed read frames only trailers: a page must not fail over its headers.
 */
export async function pardaCspOrigins(options: { includeDisabled: boolean }) {
	const imageOrigin = originOf(serverEnv.TMDB_IMAGE_BASE);
	const img = [TRAILER_THUMBNAILS, ...(imageOrigin ? [imageOrigin] : [])];
	let sources: PardaSourceRow[];
	try {
		sources = await pardaControls.sources();
	} catch (error) {
		log("error", "parda sources unavailable for the CSP", errorFields(error));
		return { embed: [TRAILER_ORIGIN], img };
	}
	return { embed: embedOrigins(sources, { ...options, base: serverEnv.PARDA_PLAYER_BASE }), img };
}
