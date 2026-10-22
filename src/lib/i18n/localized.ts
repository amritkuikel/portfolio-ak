import { getLocale, type Locale } from "@/paraglide/runtime";

/** A value typed in both languages (LocalizedField, `localizedText()`): Nepali may be empty. */
export type Localized = { en: string; ne: string };

/**
 * The value in `locale` (default: the current one), English when there is no
 * Nepali. Call it at render time. Generated features with `--localized` use it.
 *
 * @public
 */
export const localizedValue = (value: Localized, locale: Locale = getLocale()) =>
	locale === "ne" && value.ne.trim() ? value.ne : value.en;
