/**
 * Shared, localized Zod helpers for forms and server functions.
 *
 * Messages are Paraglide functions evaluated when validation runs (Zod's `error`
 * callback), so the same schema reports errors in whichever language the user
 * is using, on the client and on the server. Numbers inside messages are
 * formatted for that language too (e.g. "कम्तीमा ८ ...").
 */
import { z } from "zod";
import { m } from "@/paraglide/messages";
import { formatNumber } from "./intl";

const n = (value: number) => formatNumber(value);

/** Non-empty trimmed string. */
export const required = (options: { max?: number } = {}) => {
	const base = z
		.string({ error: () => m.validation_required() })
		.trim()
		.min(1, { error: () => m.validation_required() });
	return options.max === undefined
		? base
		: base.max(options.max, { error: () => m.validation_text_max({ max: n(options.max ?? 0) }) });
};

/** Optional text: empty string allowed, trimmed. */
export const optionalText = (options: { max?: number } = {}) => {
	const base = z.string().trim();
	return options.max === undefined
		? base
		: base.max(options.max, { error: () => m.validation_text_max({ max: n(options.max ?? 0) }) });
};

export const email = () =>
	z
		.string({ error: () => m.validation_required() })
		.trim()
		.min(1, { error: () => m.validation_required() })
		.pipe(z.email({ error: () => m.validation_email() }));

/** http(s) URL. Pass `{ optional: true }` to also accept an empty string. */
export const url = (options: { optional?: boolean } = {}) => {
	const valid = z.url({ protocol: /^https?$/, error: () => m.validation_url() });
	const text = z.string({ error: () => m.validation_required() }).trim();
	return options.optional
		? text.pipe(z.union([z.literal(""), valid]))
		: text.min(1, { error: () => m.validation_required() }).pipe(valid);
};

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * 0 (very weak) to 4 (very strong): one point each for length >= 12, mixed
 * case, digits and symbols, with anything under the minimum length scoring 0.
 * Deliberately simple and dependency-free; the server (Better Auth) enforces length.
 */
export const passwordStrength = (value: string): PasswordStrength => {
	if (value.length < PASSWORD_MIN_LENGTH) return 0;
	const points =
		Number(value.length >= 12) +
		Number(/[a-z]/.test(value) && /[A-Z]/.test(value)) +
		Number(/\d/.test(value)) +
		Number(/[^A-Za-z0-9]/.test(value));
	return Math.min(4, Math.max(1, points)) as PasswordStrength;
};

/** Minimum length plus a minimum strength score (default 2, "fair"). */
export const password = (options: { minStrength?: PasswordStrength } = {}) => {
	const minStrength = options.minStrength ?? 2;
	return z
		.string({ error: () => m.validation_required() })
		.min(1, { error: () => m.validation_required() })
		.min(PASSWORD_MIN_LENGTH, { error: () => m.validation_password_min({ min: n(PASSWORD_MIN_LENGTH) }) })
		.max(PASSWORD_MAX_LENGTH, { error: () => m.validation_text_max({ max: n(PASSWORD_MAX_LENGTH) }) })
		.refine((value) => passwordStrength(value) >= minStrength, { error: () => m.validation_password_weak() });
};

// ---------------------------------------------------------------------------
// Numbers and money
// ---------------------------------------------------------------------------

type RangeOptions = { min?: number; max?: number; integer?: boolean };

/** A finite number within an optional range. Fields store `undefined` when empty. */
export const numberRange = ({ min, max, integer }: RangeOptions = {}) => {
	let schema = z.number({ error: () => m.validation_number() }).finite({ error: () => m.validation_number() });
	if (integer) schema = schema.int({ error: () => m.validation_integer() });
	if (min !== undefined) schema = schema.min(min, { error: () => m.validation_number_min({ min: n(min) }) });
	if (max !== undefined) schema = schema.max(max, { error: () => m.validation_number_max({ max: n(max) }) });
	return schema;
};

const hasAtMostTwoDecimals = (value: number) => Math.abs(Math.round(value * 100) - value * 100) < 1e-6;

/** A money amount: non-negative by default, at most 2 decimal places. */
export const currency = ({ min = 0, max }: { min?: number; max?: number } = {}) =>
	numberRange({ min, ...(max === undefined ? {} : { max }) }).refine(hasAtMostTwoDecimals, {
		error: () => m.validation_currency_decimals(),
	});

// ---------------------------------------------------------------------------
// Choices
// ---------------------------------------------------------------------------

/** A selected value (select, radio, combobox): must not be empty. */
export const choice = () =>
	z.string({ error: () => m.validation_required() }).min(1, { error: () => m.validation_required() });

/** Several selected values (checkbox group, multi-select). */
export const choices = ({ min = 1 }: { min?: number } = {}) =>
	z.array(z.string()).min(min, { error: () => m.validation_select_min({ min: n(min) }) });

/** A checkbox that must be ticked (terms, consent). */
export const mustAccept = () => z.literal(true, { error: () => m.validation_must_accept() });
