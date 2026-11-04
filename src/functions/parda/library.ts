import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ContinueRailData, PardaViewerData, TitleProgressData } from "@/features/parda/library/types";
import { zodInput } from "@/functions/_lib/validator";
import { requirePardaViewer, withPardaServices } from "@/middleware/parda";
import { locales } from "@/paraglide/runtime";
import * as library from "@/server/parda/library/service";
import { guestDeletesAt } from "@/server/parda/profiles/service";

/**
 * Parda's library (PLAN 12.5, decision 0236): progress, Continue watching and marks, for
 * anyone with a session (guests included). Each runs `requirePardaViewer` (the session
 * and the active profile) then `withPardaServices`; every service call acts on that
 * profile only (tests/server/parda-access.test.ts).
 */

const locale = z.enum(locales);
const media = z.enum(["movie", "tv"]);
const tmdbId = z.number().int().positive().max(2_147_483_647);
const season = z.number().int().min(0).max(9_999);
const episode = z.number().int().min(1).max(99_999);
const seconds = z.number().min(0).max(86_400);
const titleInput = z.strictObject({ media, id: tmdbId });

const progressFields = {
	media,
	id: tmdbId,
	season: season.optional(),
	episode: episode.optional(),
	watched: seconds,
	duration: seconds.positive().nullable(),
};
const progressInput = z.strictObject({ ...progressFields, sourceId: z.uuid().nullable() });
const markInput = z.strictObject({
	media,
	id: tmdbId,
	scope: z.enum(["title", "season", "episode"]),
	season: season.optional(),
	episode: episode.optional(),
	watched: z.boolean(),
	locale,
});
const importInput = z.strictObject({
	entries: z.array(z.strictObject({ ...progressFields, updatedAt: z.number().int().positive() })).max(50),
});

export const getPardaViewer = createServerFn({ method: "GET" })
	.middleware([requirePardaViewer, withPardaServices])
	.handler(
		async ({ context }): Promise<PardaViewerData> => ({
			profile: {
				id: context.viewer.profile.id,
				name: context.viewer.profile.name,
				autoplay: context.viewer.profile.autoplay,
			},
			isGuest: context.viewer.isGuest,
			guestDeletesAt: context.viewer.isGuest ? await guestDeletesAt(context.db, context.viewer.userId) : null,
		}),
	);

export const getPardaContinue = createServerFn({ method: "GET" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(z.strictObject({ locale })))
	.handler(({ data, context }): Promise<ContinueRailData> => library.continueWatching(context, data.locale));

export const getPardaTitleProgress = createServerFn({ method: "GET" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(titleInput.extend({ locale }).strict()))
	.handler(
		({ data, context }): Promise<TitleProgressData> =>
			library.titleProgress(context, { media: data.media, id: data.id }, data.locale),
	);

export const savePardaProgress = createServerFn({ method: "POST" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(progressInput))
	.handler(({ data, context }) => library.saveProgress(context, data));

export const markPardaWatched = createServerFn({ method: "POST" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(markInput))
	.handler(async ({ data, context }): Promise<{ ok: true }> => {
		await library.mark(context, data, data.locale);
		return { ok: true };
	});

export const removePardaContinue = createServerFn({ method: "POST" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(titleInput))
	.handler(async ({ data, context }): Promise<{ ok: true }> => {
		await library.removeFromContinue(context, data);
		return { ok: true };
	});

export const rewatchPardaTitle = createServerFn({ method: "POST" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(titleInput))
	.handler(async ({ data, context }): Promise<{ ok: true }> => {
		await library.rewatch(context, data);
		return { ok: true };
	});

/** The browser's progress from before the session, once. */
export const importPardaProgress = createServerFn({ method: "POST" })
	.middleware([requirePardaViewer, withPardaServices])
	.validator(zodInput(importInput))
	.handler(({ data, context }) =>
		library.importLocal(
			context,
			data.entries.map((entry) => ({ ...entry, sourceId: null })),
		),
	);
