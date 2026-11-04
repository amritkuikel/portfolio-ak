import "@tanstack/react-start/server-only";
import { eq } from "drizzle-orm";
import { GUEST_LIFETIME_DAYS } from "@/lib/guests";
import type { Session } from "@/lib/session";
import { m } from "@/paraglide/messages";
import type { Locale } from "@/paraglide/runtime";
import { user } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import { defaultProfile, ensureDefaultProfile, ownedProfile, type PardaProfileRow } from "./repository";

/**
 * Who is watching (PLAN 12.5, "Middleware"; decision 0236): the session's user and the
 * active profile, from the `pd_profile` cookie when it names one of theirs, else their
 * default profile, made on the first call. Profiles to pick from arrive with Task 67.
 */
export const PROFILE_COOKIE = "pd_profile";

export type PardaViewer = {
	userId: string;
	isGuest: boolean;
	profile: Pick<PardaProfileRow, "id" | "name" | "kids" | "cap" | "region" | "autoplay">;
};

const pick = (row: PardaProfileRow): PardaViewer["profile"] => ({
	id: row.id,
	name: row.name,
	kids: row.kids,
	cap: row.cap,
	region: row.region,
	autoplay: row.autoplay,
});

const isUuid = (value: string | undefined): value is string =>
	value !== undefined && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function resolveViewer(
	db: Db,
	session: Session,
	cookieProfile: string | undefined,
	locale: Locale,
): Promise<PardaViewer> {
	const userId = session.user.id;
	const chosen = isUuid(cookieProfile) ? await ownedProfile(db, userId, cookieProfile) : null;
	const profile =
		chosen ??
		(await ensureDefaultProfile(db, userId, session.user.name.trim() || m.pd_profile_default({}, { locale })));
	return { userId, isGuest: session.isAnonymous === true, profile: pick(profile) };
}

/**
 * The profile a catalogue read browses as, without making one: a kids' profile caps
 * what the catalogue shows. Only a `pd_profile` cookie can name a kids' profile (the
 * default never is one), so without it there's no query.
 */
export async function browsingProfile(
	db: Db,
	session: Session | null,
	cookieProfile: string | undefined,
): Promise<PardaViewer["profile"] | null> {
	if (!session || !isUuid(cookieProfile)) return null;
	const row = await ownedProfile(db, session.user.id, cookieProfile);
	return row ? pick(row) : null;
}

/** The profile progress is read for on a page, without making one: null before the first save. */
export async function readingProfile(
	db: Db,
	session: Session | null,
	cookieProfile: string | undefined,
): Promise<PardaViewer["profile"] | null> {
	if (!session) return null;
	const chosen = isUuid(cookieProfile) ? await ownedProfile(db, session.user.id, cookieProfile) : null;
	const row = chosen ?? (await defaultProfile(db, session.user.id));
	return row ? pick(row) : null;
}

/** When the daily cleanup deletes a guest (and everything it saved): its creation plus the guest lifetime. */
export async function guestDeletesAt(db: Db, userId: string): Promise<string | null> {
	const [row] = await db.select({ createdAt: user.createdAt }).from(user).where(eq(user.id, userId)).limit(1);
	if (!row) return null;
	return new Date(row.createdAt.getTime() + GUEST_LIFETIME_DAYS * 86_400_000).toISOString();
}
