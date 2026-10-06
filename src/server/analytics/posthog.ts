import "@tanstack/react-start/server-only";
import { getCookie } from "@tanstack/react-start/server";
import { PostHog } from "posthog-node";
import { analyticsHost, analyticsKey, posthogCookieName } from "@/lib/analytics";
import { PREFERENCE_COOKIES } from "@/lib/stores/preferences";

/**
 * Server-side PostHog (posthog-node). Same consent rule as the browser: events
 * are sent only when the request carries the "granted" consent cookie. With no
 * VITE_POSTHOG_KEY no client is created and nothing is sent.
 */
let client: PostHog | null | undefined;

const getClient = (): PostHog | null => {
	if (client === undefined) {
		client = analyticsKey
			? new PostHog(analyticsKey, {
					host: analyticsHost,
					// Serverless: send each event right away instead of batching in memory.
					flushAt: 1,
					flushInterval: 0,
					// A slow PostHog must not slow page renders (the flag falls back to off).
					featureFlagsRequestTimeoutMs: 1500,
				})
			: null;
	}
	return client;
};

const hasConsent = () => getCookie(PREFERENCE_COOKIES.analytics) === "granted";

/** The browser's PostHog distinct id, if the visitor consented (the cookie only exists then). */
const consentedDistinctId = (): string | null => {
	if (!analyticsKey || !hasConsent()) return null;
	const raw = getCookie(posthogCookieName(analyticsKey));
	if (!raw) return null;
	try {
		const parsed: unknown = JSON.parse(raw);
		const id = parsed && typeof parsed === "object" && "distinct_id" in parsed ? parsed.distinct_id : undefined;
		return typeof id === "string" && id.length > 0 && id.length <= 200 ? id : null;
	} catch {
		return null;
	}
};

/** Records a server event for a user, if PostHog is configured and they consented. Never throws. */
export async function captureServerEvent(
	event: string,
	distinctId: string,
	properties: Record<string, string | number | boolean | null> = {},
) {
	const posthog = getClient();
	if (!posthog || !hasConsent()) return;
	try {
		await posthog.captureImmediate({ event, distinctId, properties, disableGeoip: true });
	} catch (error) {
		console.warn("[analytics] capture failed:", error instanceof Error ? error.message : error);
	}
}

/**
 * Evaluates a boolean feature flag for this request. Without consent the
 * evaluation uses a shared anonymous id (no per-visitor identifier leaves the
 * server) and never records a `$feature_flag_called` event. Off on any failure.
 */
export async function isFlagEnabled(flag: string): Promise<boolean> {
	const posthog = getClient();
	if (!posthog) return false;
	try {
		const value = await posthog.getFeatureFlag(flag, consentedDistinctId() ?? "anonymous", {
			sendFeatureFlagEvents: false,
			disableGeoip: true,
		});
		return value === true || (typeof value === "string" && value !== "control");
	} catch {
		return false;
	}
}
