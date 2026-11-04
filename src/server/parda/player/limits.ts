import "@tanstack/react-start/server-only";
import { getRequest } from "@tanstack/react-start/server";
import type { PardaViewerKind } from "@/features/parda/player/playback";
import type { Session } from "@/lib/session";
import { clientIpHash, trustedClientIp } from "@/server/auth/client-ip";
import { db } from "@/server/db/client";
import { enforceRateLimit, type RateLimitRule } from "@/server/http/rate-limit";

/**
 * The watch page's writes are open to visitors without a session (decision 0236), so each
 * is limited per user, or per IP without one: playbacks generously (a few per title, with
 * fallbacks), reports tightly.
 */
const LIMITS = {
	play: { max: 120, windowSeconds: 600 },
	report: { max: 5, windowSeconds: 600 },
} as const satisfies Record<string, RateLimitRule>;

export async function limitPlayback(session: Session | null, action: keyof typeof LIMITS): Promise<void> {
	const who = session ? `u:${session.user.id}` : `ip:${clientIpHash(trustedClientIp(getRequest())) ?? "unknown"}`;
	await enforceRateLimit(db, `parda-${action}:${who}`, LIMITS[action]);
}

export const viewerKind = (session: Session | null): PardaViewerKind =>
	session ? (session.isAnonymous ? "guest" : "account") : "anonymous";
