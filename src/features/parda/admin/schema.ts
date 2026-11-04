import { z } from "zod";
import type { Localized } from "@/lib/i18n/localized";
import type { PardaSourceAdapter } from "../player/adapters/types";

/** Trouble the placeholder player can rehearse (src/server/parda/player/placeholder.ts). */
export const PLACEHOLDER_CUES = ["fail", "stall", "silent"] as const;
export type PlaceholderCue = (typeof PLACEHOLDER_CUES)[number];

export const labPlayerInput = z.strictObject({
	sourceId: z.uuid(),
	media: z.enum(["movie", "tv"]),
	id: z.number().int().positive().max(999_999_999),
	season: z.number().int().nonnegative().max(9_999),
	episode: z.number().int().positive().max(99_999),
	start: z.number().int().nonnegative().max(999_999),
	cue: z.enum(PLACEHOLDER_CUES).nullable(),
});
export type LabPlayerInput = z.infer<typeof labPlayerInput>;

export type LabSandbox = "none" | "popups" | "strict";

export type LabSource = {
	id: string;
	name: Localized;
	adapter: PardaSourceAdapter;
	enabled: boolean;
	sandbox: LabSandbox;
};

/** One filled player. An empty `origins` with a path means this app itself. */
export type LabPlayer = {
	url: string;
	origins: string[];
	adapter: PardaSourceAdapter;
	sandbox: LabSandbox;
	name: Localized;
};
