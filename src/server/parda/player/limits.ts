import "@tanstack/react-start/server-only";
import { createHash } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import type { PardaViewerKind } from "@/features/parda/player/playback";
import type { Session } from "@/lib/session";
import { clientIpHash, trustedClientIp } from "@/server/auth/client-ip";
import { db } from "@/server/db/client";
import { consumeRateLimit, enforceRateLimit, type RateLimitRule } from "@/server/http/rate-limit";

/**
 * The watch page's writes are open to visitors without a session (decision 0236), so each
 * is limited per user, or per IP without one: playbacks generously (a few per title, with
 * fallbacks), reports tightly. A failure that counts against a source on a title has its
 * own limit (decision 0238).
 */
const LIMITS = {
	play: { max: 120, windowSeconds: 600 },
	report: { max: 5, windowSeconds: 600 },
	fail: { max: 10, windowSeconds: 3_600 },
} as const satisfies Record<string, RateLimitRule>;

/** Who's calling, as the rate limiter knows them: the user, or the hashed IP. */
const clientKey = (session: Session | null) =>
	session ? `u:${session.user.id}` : `ip:${clientIpHash(trustedClientIp(getRequest())) ?? "unknown"}`;

export async function limitPlayback(session: Session | null, action: "play" | "report"): Promise<void> {
	await enforceRateLimit(db, `parda-${action}:${clientKey(session)}`, LIMITS[action]);
}

/**
 * A failed playback that may count against its source on this title: the caller's tag
 * (the key hashed again, so no user id or IP hash is stored) when they're under the limit,
 * else null and the failure only counts in the daily rollup.
 */
export async function failureClient(session: Session | null): Promise<string | null> {
	const key = clientKey(session);
	const { allowed } = await consumeRateLimit(db, `parda-fail:${key}`, LIMITS.fail);
	return allowed ? createHash("sha256").update(`parda-fail:${key}`).digest("base64url").slice(0, 22) : null;
}

export const viewerKind = (session: Session | null): PardaViewerKind =>
	session ? (session.isAnonymous ? "guest" : "account") : "anonymous";
