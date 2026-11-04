import { z } from "zod";
import type { PardaSourceAdapter, PlayerAdapter, PlayerEvent } from "./types";

/**
 * `parda`: Parda's own protocol, spoken by the placeholder player at /parda/api. A real
 * player can speak it directly, or gets its own adapter here. Messages to the parent are
 * `{ type: "parda.player", event: { name, position?, duration?, reason? } }`, and commands
 * are `{ type: "parda.command", action, position? }`.
 */
const pardaMessage = z.object({
	type: z.literal("parda.player"),
	event: z.object({
		name: z.enum(["ready", "position", "play", "pause", "seeked", "ended", "failed"]),
		position: z.number().nonnegative().optional(),
		duration: z.number().positive().optional(),
		reason: z.string().max(200).optional(),
	}),
});

const pardaAdapter: PlayerAdapter = {
	id: "parda",
	startPosition: "param",
	command: (command) => ({ type: "parda.command", ...command }),
	parse: (data) => {
		if (typeof data !== "object" || data === null || (data as { type?: unknown }).type !== "parda.player") return null;
		const message = pardaMessage.safeParse(data);
		if (!message.success) return null;
		const { name, position = 0, duration = null, reason = "unknown" } = message.data.event;
		switch (name) {
			case "ready":
				return { kind: "ready", duration };
			case "position":
				return { kind: "position", position, duration };
			case "seeked":
				return { kind: "seeked", position };
			case "failed":
				return { kind: "failed", reason };
			default:
				return { kind: name };
		}
	},
};

/** A player that reports nothing: it never auto-falls back and isn't scored. */
const noneAdapter: PlayerAdapter = { id: "none", startPosition: "none", command: null, parse: () => null };

export const ADAPTERS: Readonly<Record<PardaSourceAdapter, PlayerAdapter>> = {
	parda: pardaAdapter,
	none: noneAdapter,
};

/**
 * The event a window message means. It counts only when it comes from the source's own
 * frame and one of its origins (a relative template's origin is the page's), and when its
 * payload passes the adapter's parser. Anything else is ignored.
 */
export function acceptMessage(
	message: Pick<MessageEvent, "origin" | "source" | "data">,
	player: { adapter: PlayerAdapter; origins: ReadonlyArray<string>; frame: MessageEventSource | null },
): PlayerEvent | null {
	if (!player.frame || message.source !== player.frame) return null;
	if (!player.origins.includes(message.origin)) return null;
	return player.adapter.parse(message.data);
}
