import * as Sentry from "@sentry/tanstackstart-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { sessionQueryOptions } from "@/features/auth/queries";
import {
	analyticsKey,
	analyticsRunning,
	identifyUser,
	resetIdentity,
	startAnalytics,
	stopAnalytics,
	track,
} from "@/lib/analytics";
import { usePreferences, usePreferencesStore } from "@/lib/stores/hooks";
import { startWebVitals } from "@/lib/web-vitals";
import { m } from "@/paraglide/messages";

/**
 * Keeps Sentry and PostHog in step with the app (renders nothing):
 * - consent "granted" starts PostHog; anything else stops it (and before
 *   consent posthog-js isn't even downloaded);
 * - a pageview per resolved navigation while analytics runs;
 * - real-user Web Vitals (CLS, LCP, INP) once analytics runs (src/lib/web-vitals.ts);
 * - Sentry user (id only) and PostHog identify on login, cleared/reset on logout.
 */
export function ObservabilitySync() {
	const router = useRouter();
	const consent = usePreferences((preferences) => preferences.analyticsConsent);
	const { data: session } = useQuery(sessionQueryOptions());
	const userId = session?.user.id ?? null;
	const [running, setRunning] = useState(false);

	useEffect(() => {
		let cancelled = false;
		if (consent === "granted") {
			void startAnalytics().then((client) => {
				if (cancelled || !client) return;
				setRunning(true);
				track("$pageview", { $current_url: window.location.href });
				startWebVitals();
			});
		} else {
			stopAnalytics();
			setRunning(false);
		}
		return () => {
			cancelled = true;
		};
	}, [consent]);

	useEffect(() => {
		if (!running) return;
		return router.subscribe("onResolved", ({ pathChanged }) => {
			if (pathChanged && analyticsRunning()) track("$pageview", { $current_url: window.location.href });
		});
	}, [router, running]);

	const previousUser = useRef<string | null>(null);
	useEffect(() => {
		// Sentry: the user id helps group errors; no email or name is sent.
		Sentry.setUser(userId ? { id: userId } : null);
		if (running) {
			if (userId) identifyUser(userId);
			else if (previousUser.current) resetIdentity();
		}
		previousUser.current = userId;
	}, [userId, running]);

	return null;
}

/**
 * Asks for analytics consent. Rendered on the server too: the choice is a
 * cookie, so the banner is present (or absent) from the first byte and the
 * page doesn't shift after hydration. Hidden when PostHog isn't configured.
 */
export function ConsentBanner() {
	const consent = usePreferences((preferences) => preferences.analyticsConsent);
	const store = usePreferencesStore();
	if (!analyticsKey || consent !== "unset") return null;
	return (
		<section
			aria-labelledby="consent-title"
			className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80"
			data-testid="consent-banner"
		>
			<div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h2 id="consent-title" className="font-medium">
						{m.consent_title()}
					</h2>
					<p className="text-muted-foreground text-sm">{m.consent_body()}</p>
				</div>
				<div className="flex shrink-0 gap-2">
					<Button variant="outline" onClick={() => store.actions.setAnalyticsConsent("denied")}>
						{m.consent_decline()}
					</Button>
					<Button onClick={() => store.actions.setAnalyticsConsent("granted")}>{m.consent_accept()}</Button>
				</div>
			</div>
		</section>
	);
}

/** Footer control to revisit the choice (brings the banner back). Hidden without PostHog. */
export function ConsentSettingsButton() {
	const consent = usePreferences((preferences) => preferences.analyticsConsent);
	const store = usePreferencesStore();
	if (!analyticsKey || consent === "unset") return null;
	return (
		<button
			type="button"
			className="underline-offset-4 hover:underline"
			onClick={() => store.actions.setAnalyticsConsent("unset")}
		>
			{consent === "granted" ? m.consent_settings_on() : m.consent_settings_off()}
		</button>
	);
}
