import { type Locale, locales } from "@/paraglide/runtime";

/** A value written once per language ({ en, ne }). */
export type Localized<T = string> = Readonly<Record<Locale, T>>;

/**
 * The type of `value` once every Localized field in it is resolved to one
 * language: `{ title: { en, ne } }` becomes `{ title: string }`, deeply.
 */
export type Resolved<T> =
	T extends Localized<infer U>
		? Resolved<U>
		: T extends ReadonlyArray<unknown>
			? // A mapped type over an array keeps tuples as tuples ([from, to] stays a pair).
				{ -readonly [K in keyof T]: Resolved<T[K]> }
			: T extends object
				? { [K in keyof T]: Resolved<T[K]> }
				: T;

const LOCALE_KEYS = [...locales].sort().join("|");

/** True for an object whose keys are exactly the app's locales. */
export const isLocalized = (value: unknown): value is Localized<unknown> =>
	typeof value === "object" &&
	value !== null &&
	!Array.isArray(value) &&
	Object.keys(value).sort().join("|") === LOCALE_KEYS;

/**
 * Resolves every Localized field of a content record to `locale`. Pure and
 * synchronous, so server and client render identical text (no hydration drift).
 */
export function resolveLocalized<T>(value: T, locale: Locale): Resolved<T> {
	if (isLocalized(value)) return resolveLocalized(value[locale], locale) as Resolved<T>;
	if (Array.isArray(value)) return value.map((item) => resolveLocalized(item, locale)) as Resolved<T>;
	if (typeof value === "object" && value !== null) {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, resolveLocalized(item, locale)]),
		) as Resolved<T>;
	}
	return value as Resolved<T>;
}
