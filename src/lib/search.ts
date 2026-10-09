import { defaultParseSearch, defaultStringifySearch } from "@tanstack/react-router";
import { z } from "zod";

/**
 * URL search params: filter param schemas and the app's search serialization.
 *
 * Shape of a filter URL (identical with and without JavaScript, because a plain
 * GET <form> produces exactly this):
 *
 *   /admin/test-crud?status=draft&tags=food&tags=nepal&priceMin=100&from=2026-01-01&hasImage=true
 *
 * - arrays are repeated keys, never JSON;
 * - empty values (an unfilled form field) mean "not set";
 * - every param is forgiving (`.catch`): a bad value is dropped, not an error page.
 *
 * Basic list params (q, sort, page, pageSize) live in ./list.ts; both sets are
 * combined in a feature's search schema and reused as its server function input.
 */

/** "" / null from a submitted-but-empty form field means "not set". */
const blankToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

/**
 * A multi-value param (`?tags=a&tags=b`): always an array, de-duplicated, at most
 * `max` items. Accepts one value, repeated keys, or a JSON array (old links).
 * Invalid items are dropped; the rest are kept.
 */
export const arrayParam = <T extends z.ZodType<string>>(item: T, { max = 20 }: { max?: number } = {}) =>
	z
		.preprocess((value) => {
			const raw = value === undefined || value === "" ? [] : Array.isArray(value) ? value : [value];
			const valid = raw.map(String).filter((entry) => item.safeParse(entry).success);
			return [...new Set(valid)].slice(0, max);
		}, z.array(item))
		// Optional in links (absent = []), always an array once parsed.
		.default(() => [])
		.catch(() => []);

/** An optional number (`?priceMin=100`), within [min, max]; anything else is "not set". */
export const numberParam = ({ min = 0, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {}) =>
	z.preprocess(blankToUndefined, z.coerce.number().finite().min(min).max(max).optional()).catch(undefined);

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** An optional calendar date (`?from=2026-09-01`, what <input type="date"> submits). */
export const dateParam = () =>
	z
		.preprocess(
			blankToUndefined,
			z
				.string()
				.regex(DATE_ONLY)
				.refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)))
				.optional(),
		)
		.catch(undefined);

/** An optional yes/no filter (`?hasImage=true|false`); absent means "any". */
export const booleanParam = () =>
	z
		.preprocess(
			(value) => (value === "true" || value === true ? true : value === "false" || value === false ? false : undefined),
			z.boolean().optional(),
		)
		.catch(undefined);

/**
 * Router search serialization (src/router.tsx): the defaults, except that
 * arrays of plain values become repeated keys (`tags=a&tags=b`), the format
 * HTML forms submit. Parsing already reads repeated keys as arrays.
 */
export function stringifySearch(search: Record<string, unknown>): string {
	const arrays: Array<[string, unknown[]]> = [];
	const rest: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(search)) {
		const plain =
			Array.isArray(value) &&
			value.every((item) => typeof item === "string" || typeof item === "number" || typeof item === "boolean");
		if (plain) arrays.push([key, value]);
		else rest[key] = value;
	}
	const params = new URLSearchParams(defaultStringifySearch(rest));
	for (const [key, values] of arrays) for (const value of values) params.append(key, String(value));
	const query = params.toString();
	return query ? `?${query}` : "";
}

export const parseSearch = defaultParseSearch;

/**
 * The search patch for a filter form: every named control becomes a key, with
 * repeated names collected into arrays and empty values removed (undefined, so
 * the key disappears from the URL). Mirrors what the browser submits without JS.
 */
export function formSearchPatch(form: HTMLFormElement, { exclude = [] }: { exclude?: ReadonlyArray<string> } = {}) {
	const names = new Set<string>();
	for (const element of Array.from(form.elements)) {
		const name = (element as HTMLInputElement).name;
		if (name && !exclude.includes(name)) names.add(name);
	}
	const data = new FormData(form);
	const patch: Record<string, unknown> = {};
	for (const name of names) {
		const values = data.getAll(name).filter((value): value is string => typeof value === "string" && value !== "");
		const multiple = Array.from(form.elements).some(
			(element) => (element as HTMLInputElement).name === name && (element as HTMLInputElement).type === "checkbox",
		);
		patch[name] = multiple ? values : values[0];
	}
	return patch;
}

/**
 * Route `params.parse` with a Zod schema: the parsed params, or `false` so the
 * route doesn't match (the request then gets the localized 404, with status 404).
 *
 *   params: { parse: (raw) => parseParams(z.object({ id: z.uuid() }), raw) },
 */
export function parseParams<T extends z.ZodType<Record<string, unknown>>>(
	schema: T,
	raw: Record<string, string>,
): z.output<T> | false {
	const result = schema.safeParse(raw);
	return result.success ? result.data : false;
}
