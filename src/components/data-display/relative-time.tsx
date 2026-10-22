import { useSyncExternalStore } from "react";
import { type DateInput, formatDateTime, formatRelativeTimeFrom } from "@/lib/i18n/intl";

/**
 * One clock for every RelativeTime on the page, ticking each minute: a minute is
 * the smallest step anyone reads in "5 minutes ago", and one timer serves them all.
 */
const MINUTE = 60_000;
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	if (!timer) {
		timer = setInterval(() => {
			now = Date.now();
			for (const each of listeners) each();
		}, MINUTE);
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && timer) {
			clearInterval(timer);
			timer = undefined;
		}
	};
};
const clientNow = () => {
	// Rounded to the minute, so every snapshot within one minute is the same value.
	if (!now || Date.now() - now >= MINUTE) now = Date.now();
	return now;
};

/**
 * "3 minutes ago" / "३ मिनेट पहिले", with the exact date and time in a tooltip
 * (`title`) and the machine-readable value in `<time dateTime>`.
 *
 * Hydration-safe: the server and the first browser render both use `now`, the
 * time the data was read (a loader's `generatedAt`), so they print the same
 * words. After hydration it follows the browser's clock and updates each minute.
 */
export function RelativeTime({
	value,
	now: renderedAt,
	className,
}: {
	value: DateInput;
	now: DateInput;
	className?: string;
}) {
	const serverNow = new Date(renderedAt).getTime();
	const current = useSyncExternalStore(subscribe, clientNow, () => serverNow);
	const iso = new Date(value).toISOString();
	return (
		<time dateTime={iso} title={formatDateTime(value)} className={className}>
			{formatRelativeTimeFrom(value, current)}
		</time>
	);
}
