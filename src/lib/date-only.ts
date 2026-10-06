/**
 * Calendar dates without a time or time zone, stored as "YYYY-MM-DD".
 *
 * Date pickers work with local Date objects (midnight in the browser's zone);
 * converting through year/month/day parts, never through toISOString(),
 * prevents the classic off-by-one-day bug east or west of UTC.
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export type IsoDate = string;

export const isIsoDate = (value: unknown): value is IsoDate => {
	if (typeof value !== "string") return false;
	const match = ISO_DATE.exec(value);
	if (!match) return false;
	const date = fromIsoDate(value);
	return date !== undefined && toIsoDate(date) === value;
};

/** Local Date -> "YYYY-MM-DD". */
export const toIsoDate = (date: Date): IsoDate =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** "YYYY-MM-DD" -> local Date at midnight, or undefined if malformed. */
export const fromIsoDate = (value: string | undefined): Date | undefined => {
	const match = value ? ISO_DATE.exec(value) : null;
	if (!match) return undefined;
	const [, year, month, day] = match;
	return new Date(Number(year), Number(month) - 1, Number(day));
};

/**
 * "YYYY-MM-DD" -> the instant to pass to formatDate(). Noon UTC lands on the same
 * calendar day in every time zone from UTC-11 to UTC+11 (Nepal is UTC+5:45).
 */
export const isoDateInstant = (value: IsoDate): Date => new Date(`${value}T12:00:00Z`);
