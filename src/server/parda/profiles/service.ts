import "@tanstack/react-start/server-only";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { isKidsCap } from "@/features/parda/kids";
import { isProfileAvatar, isTmdbRegion, MAX_PROFILES, PIN_PATTERN } from "@/features/parda/profiles/options";
import { AppError, ruleError } from "@/lib/errors";
import { GUEST_LIFETIME_DAYS } from "@/lib/guests";
import type { Session } from "@/lib/session";
import { m } from "@/paraglide/messages";
import type { Locale } from "@/paraglide/runtime";
import { user } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import { serverEnv } from "@/server/env";
import { enforceRateLimit } from "@/server/http/rate-limit";
import type { PardaProfileRow } from "./repository";
import * as repo from "./repository";

/**
 * Who is watching (PLAN 12.5, "Middleware"; decisions 0236 and 0240): the session's user
 * and the active profile. The `pd_profile` cookie names it; a profile with a PIN counts
 * only when the cookie carries proof the PIN was entered (an HMAC of the profile and its
 * PIN hash, so changing the PIN ends it). Without a usable cookie it's the default
 * profile, or, when that one is locked, the oldest unlocked one.
 */
export const PROFILE_COOKIE = "pd_profile";

export type PardaViewer = {
	userId: string;
	isGuest: boolean;
	profile: Pick<
		PardaProfileRow,
		"id" | "name" | "avatar" | "kids" | "cap" | "region" | "audioLanguage" | "autoplay" | "isDefault"
	> & { locked: boolean };
};

const pick = (row: PardaProfileRow): PardaViewer["profile"] => ({
	id: row.id,
	name: row.name,
	avatar: row.avatar,
	kids: row.kids,
	cap: row.cap,
	region: row.region,
	audioLanguage: row.audioLanguage,
	autoplay: row.autoplay,
	isDefault: row.isDefault,
	locked: row.pinHash !== null,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The cookie's profile id and, for a locked profile, its proof. */
const parseCookie = (value: string | undefined): { id: string; proof: string } | null => {
	const [id = "", proof = ""] = (value ?? "").split(".");
	return UUID.test(id) ? { id, proof } : null;
};

const proofOf = (row: Pick<PardaProfileRow, "id" | "pinHash">) =>
	createHmac("sha256", serverEnv.BETTER_AUTH_SECRET)
		.update(`parda-profile:${row.id}:${row.pinHash}`)
		.digest("base64url");

const sameText = (a: string, b: string) => {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
};

/** Whether the cookie opens this profile: always for an unlocked one, with the right proof for a locked one. */
const opens = (row: PardaProfileRow, proof: string) => row.pinHash === null || sameText(proof, proofOf(row));

/** The cookie's value for a profile just chosen. */
export const profileCookieValue = (row: Pick<PardaProfileRow, "id" | "pinHash">) =>
	row.pinHash === null ? row.id : `${row.id}.${proofOf(row)}`;

/** The profile a cookie opens, of this owner: null for none, someone else's, or a lock without its proof. */
async function cookieProfile(db: Db, ownerId: string, cookie: string | undefined) {
	const parsed = parseCookie(cookie);
	if (!parsed) return null;
	const row = await repo.ownedProfile(db, ownerId, parsed.id);
	return row && opens(row, parsed.proof) ? row : null;
}

/** Without a usable cookie: the default profile unless it's locked, then the oldest unlocked one. */
async function fallbackProfile(db: Db, ownerId: string, name: string): Promise<PardaProfileRow> {
	const fallback = await repo.ensureDefaultProfile(db, ownerId, name);
	if (fallback.pinHash === null) return fallback;
	const profiles = await repo.profilesOf(db, ownerId);
	// Every profile locked: there's no one to keep out, so the default it is.
	return profiles.find((row) => row.pinHash === null) ?? fallback;
}

export async function resolveViewer(
	db: Db,
	session: Session,
	cookie: string | undefined,
	locale: Locale,
): Promise<PardaViewer> {
	const userId = session.user.id;
	const profile =
		(await cookieProfile(db, userId, cookie)) ??
		(await fallbackProfile(db, userId, session.user.name.trim() || m.pd_profile_default({}, { locale })));
	return { userId, isGuest: session.isAnonymous === true, profile: pick(profile) };
}

/**
 * The profile a catalogue read browses as, and the one progress is read for on a page,
 * without making one: a kids' profile caps what the catalogue shows, and a profile's
 * region picks TMDB's. Null without a session or before the first profile exists.
 */
export async function browsingProfile(
	db: Db,
	session: Session | null,
	cookie: string | undefined,
): Promise<PardaViewer["profile"] | null> {
	if (!session) return null;
	const chosen = await cookieProfile(db, session.user.id, cookie);
	if (chosen) return pick(chosen);
	const fallback = await repo.defaultProfile(db, session.user.id);
	if (!fallback) return null;
	if (fallback.pinHash === null) return pick(fallback);
	const unlocked = (await repo.profilesOf(db, session.user.id)).find((row) => row.pinHash === null);
	return pick(unlocked ?? fallback);
}

/** When the daily cleanup deletes a guest (and everything it saved): its creation plus the guest lifetime. */
export async function guestDeletesAt(db: Db, userId: string): Promise<string | null> {
	const [row] = await db.select({ createdAt: user.createdAt }).from(user).where(eq(user.id, userId)).limit(1);
	if (!row) return null;
	return new Date(row.createdAt.getTime() + GUEST_LIFETIME_DAYS * 86_400_000).toISOString();
}

// --- Managing profiles (PLAN Task 67) -----------------------------------------------

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;

/** A PIN's hash: scrypt with a random salt, `scrypt:<salt>:<hash>`. */
export async function hashPin(pin: string): Promise<string> {
	const salt = randomBytes(16);
	const hash = await scryptAsync(pin, salt, 32);
	return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

async function pinMatches(pin: string, stored: string): Promise<boolean> {
	const [kind, salt, hash] = stored.split(":");
	if (kind !== "scrypt" || !salt || !hash) return false;
	const actual = await scryptAsync(pin, Buffer.from(salt, "base64url"), 32);
	const expected = Buffer.from(hash, "base64url");
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Five tries per profile in 15 minutes: a four-digit PIN can't be walked. */
const PIN_LIMIT = { max: 5, windowSeconds: 900 } as const;

type Services = { db: Db; viewer: PardaViewer };

/**
 * A kids' profile can't add, change or delete profiles (decision 0240). Nor can anyone
 * change a locked profile but from inside it, so another adult profile can't lift a lock.
 */
function mayManage(ctx: Services, target?: PardaProfileRow) {
	if (ctx.viewer.profile.kids) throw new AppError("FORBIDDEN", "A kids' profile can't manage profiles");
	if (target && target.pinHash !== null && target.id !== ctx.viewer.profile.id) {
		throw new AppError("FORBIDDEN", "A locked profile is changed from inside it");
	}
}

async function owned(ctx: Services, id: string): Promise<PardaProfileRow> {
	const row = await repo.ownedProfile(ctx.db, ctx.viewer.userId, id);
	if (!row) throw new AppError("NOT_FOUND", "Profile not found");
	return row;
}

export type ProfileFields = {
	name: string;
	avatar: string | null;
	kids: boolean;
	cap: string | null;
	region: string | null;
	audioLanguage: Locale | null;
	autoplay: boolean;
};

/** The schema checked the shapes; these are the rules between fields. */
function cleanFields(fields: ProfileFields, isDefault: boolean): repo.ProfileWrite & { name: string } {
	// The default profile is the account's own: never a kids' one, so dropping a cookie never lifts a cap.
	const kids = fields.kids && !isDefault;
	return {
		name: fields.name.trim(),
		avatar: isProfileAvatar(fields.avatar) ? fields.avatar : null,
		kids,
		cap: kids && isKidsCap(fields.cap) ? fields.cap : null,
		region: isTmdbRegion(fields.region) ? fields.region : null,
		audioLanguage: fields.audioLanguage,
		autoplay: fields.autoplay,
	};
}

export async function createProfile(ctx: Services, fields: ProfileFields): Promise<PardaProfileRow> {
	mayManage(ctx);
	if ((await repo.countProfiles(ctx.db, ctx.viewer.userId)) >= MAX_PROFILES) {
		throw ruleError("CONFLICT", `At most ${MAX_PROFILES} profiles`, m.pd_profiles_full({ count: MAX_PROFILES }));
	}
	return repo.insertProfile(ctx.db, ctx.viewer.userId, cleanFields(fields, false));
}

export async function updateProfile(ctx: Services, id: string, fields: ProfileFields): Promise<PardaProfileRow> {
	const target = await owned(ctx, id);
	mayManage(ctx, target);
	const row = await repo.updateProfile(ctx.db, ctx.viewer.userId, id, cleanFields(fields, target.isDefault));
	if (!row) throw new AppError("NOT_FOUND", "Profile not found");
	return row;
}

/** Deletes a profile and everything it kept; the default can't go (the account's own). */
export async function deleteProfile(ctx: Services, id: string): Promise<void> {
	const target = await owned(ctx, id);
	mayManage(ctx, target);
	if (target.isDefault) throw new AppError("BAD_REQUEST", "The default profile stays");
	await repo.deleteProfile(ctx.db, ctx.viewer.userId, id);
}

/** Sets or removes a profile's PIN. Returns the row, whose cookie the caller renews when it's the active one. */
export async function setPin(ctx: Services, id: string, pin: string | null): Promise<PardaProfileRow> {
	const target = await owned(ctx, id);
	mayManage(ctx, target);
	if (pin !== null && !PIN_PATTERN.test(pin)) throw new AppError("BAD_REQUEST", "A PIN is four digits");
	const row = await repo.updateProfile(ctx.db, ctx.viewer.userId, id, {
		pinHash: pin === null ? null : await hashPin(pin),
	});
	if (!row) throw new AppError("NOT_FOUND", "Profile not found");
	return row;
}

/**
 * Picks the profile to watch as, returning the cookie's value. A locked profile needs its
 * PIN, five tries per 15 minutes; a wrong one is a field error on `pin`.
 */
export async function switchProfile(ctx: Services, id: string, pin: string | undefined): Promise<string> {
	const target = await owned(ctx, id);
	if (target.pinHash !== null && target.id !== ctx.viewer.profile.id) {
		await enforceRateLimit(ctx.db, `parda-pin:${target.id}`, PIN_LIMIT);
		if (!pin || !(await pinMatches(pin, target.pinHash))) {
			throw new AppError("BAD_REQUEST", "Wrong PIN", { fieldErrors: { pin: [m.pd_profile_pin_wrong()] } });
		}
	}
	return profileCookieValue(target);
}

/** The email digest (Task 68 sends it): accounts only, since a guest has no email. */
export async function setDigest(ctx: Services & { isGuest: boolean }, digest: boolean): Promise<void> {
	if (ctx.isGuest) throw new AppError("FORBIDDEN", "Guests have no email");
	await repo.setAccountDigest(ctx.db, ctx.viewer.userId, digest);
}

export const digestOf = (db: Db, userId: string) => repo.accountDigest(db, userId);
export const profilesOf = (db: Db, userId: string) => repo.profilesOf(db, userId);
