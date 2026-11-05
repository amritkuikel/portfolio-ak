import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MAX_PROFILES } from "@/features/parda/profiles/options";
import type { Session } from "@/lib/session";
import * as schema from "@/server/db/schema";
import * as profiles from "@/server/parda/profiles/service";
import { browsingProfile, resolveViewer } from "@/server/parda/profiles/service";
import { createTestDb } from "../utils/test-db";

/**
 * Task 67's profiles on PGlite (decision 0240): adding, changing and deleting them, the
 * rules between fields, PIN locks (hashed, rate limited, proven by the cookie), which
 * profile a browser falls back to, kids' profiles that can only switch, and the digest.
 */
let env: Awaited<ReturnType<typeof createTestDb>>;

const sessionOf = (id: string, guest = false): Session => ({
	user: { id, email: `${id}@example.com`, name: id, role: "user", twoFactorEnabled: false },
	permissions: [],
	...(guest ? { isAnonymous: true as const } : {}),
});
const viewer = async (id: string, cookie?: string, guest = false) => ({
	db: env.db,
	viewer: await resolveViewer(env.db, sessionOf(id, guest), cookie, "en"),
});
const fields = (name: string, extra: Partial<profiles.ProfileFields> = {}): profiles.ProfileFields => ({
	name,
	avatar: "moon",
	kids: false,
	cap: null,
	region: null,
	audioLanguage: null,
	autoplay: true,
	...extra,
});

beforeAll(async () => {
	env = await createTestDb();
}, 120_000);
beforeEach(async () => {
	await env.reset();
	for (const id of ["asha", "bina"]) await env.db.insert(schema.user).values({ id, name: id, email: `${id}@x.test` });
	await env.db.insert(schema.user).values({ id: "guest", name: "", email: "guest@x.test", isAnonymous: true });
});
afterAll(async () => {
	await env.close();
});

describe("managing profiles", () => {
	it("adds, changes and deletes profiles, up to the limit, the default staying", async () => {
		const asha = await viewer("asha");
		const kid = await profiles.createProfile(asha, fields("  Kid  ", { kids: true, cap: "G", region: "IN" }));
		expect(kid).toMatchObject({ name: "Kid", avatar: "moon", kids: true, cap: "G", region: "IN", isDefault: false });
		const changed = await profiles.updateProfile(
			asha,
			kid.id,
			fields("Kid", { kids: false, cap: "G", region: "NP", avatar: "unknown", audioLanguage: "ne", autoplay: false }),
		);
		// No cap without kids; a region TMDB doesn't have, or a picture that doesn't exist, is no choice.
		expect(changed).toMatchObject({
			kids: false,
			cap: null,
			region: null,
			avatar: null,
			audioLanguage: "ne",
			autoplay: false,
		});
		for (let at = 2; at < MAX_PROFILES; at += 1) await profiles.createProfile(asha, fields(`P${at}`));
		await expect(profiles.createProfile(asha, fields("One too many"))).rejects.toMatchObject({ code: "CONFLICT" });
		await profiles.deleteProfile(asha, kid.id);
		expect(await profiles.profilesOf(env.db, "asha")).toHaveLength(MAX_PROFILES - 1);
		await expect(profiles.deleteProfile(asha, asha.viewer.profile.id)).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("never makes the default profile a kids' one", async () => {
		const asha = await viewer("asha");
		const row = await profiles.updateProfile(asha, asha.viewer.profile.id, fields("Asha", { kids: true, cap: "G" }));
		expect(row).toMatchObject({ isDefault: true, kids: false, cap: null });
	});

	it("leaves a kids' profile only switching", async () => {
		const asha = await viewer("asha");
		const kid = await profiles.createProfile(asha, fields("Kid", { kids: true }));
		const asKid = await viewer("asha", profiles.profileCookieValue(kid));
		expect(asKid.viewer.profile).toMatchObject({ id: kid.id, kids: true });
		await expect(profiles.createProfile(asKid, fields("Sneaky"))).rejects.toMatchObject({ code: "FORBIDDEN" });
		await expect(profiles.updateProfile(asKid, kid.id, fields("Kid", { kids: false }))).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
		await expect(profiles.setPin(asKid, kid.id, null)).rejects.toMatchObject({ code: "FORBIDDEN" });
		// Switching to an unlocked profile works: lock yours to keep a kid out.
		expect(await profiles.switchProfile(asKid, asha.viewer.profile.id, undefined)).toBe(asha.viewer.profile.id);
	});

	it("keeps the digest for accounts only", async () => {
		await profiles.setDigest({ ...(await viewer("asha")), isGuest: false }, true);
		expect(await profiles.digestOf(env.db, "asha")).toBe(true);
		await profiles.setDigest({ ...(await viewer("asha")), isGuest: false }, false);
		expect(await profiles.digestOf(env.db, "asha")).toBe(false);
		const guest = await viewer("guest", undefined, true);
		await expect(profiles.setDigest({ ...guest, isGuest: true }, true)).rejects.toMatchObject({ code: "FORBIDDEN" });
	});
});

describe("PIN locks", () => {
	it("hashes the PIN, asks for it to switch, and counts tries", async () => {
		const asha = await viewer("asha");
		const kid = await profiles.createProfile(asha, fields("Kid", { kids: true }));
		const locked = await profiles.setPin(asha, asha.viewer.profile.id, "2468");
		expect(locked.pinHash).toMatch(/^scrypt:[\w-]+:[\w-]+$/);
		expect(locked.pinHash).not.toContain("2468");
		await expect(profiles.setPin(asha, kid.id, "12")).rejects.toMatchObject({ code: "BAD_REQUEST" });

		const asKid = await viewer("asha", profiles.profileCookieValue(kid));
		await expect(profiles.switchProfile(asKid, asha.viewer.profile.id, "0000")).rejects.toMatchObject({
			code: "BAD_REQUEST",
			fieldErrors: { pin: [expect.any(String)] },
		});
		const cookie = await profiles.switchProfile(asKid, asha.viewer.profile.id, "2468");
		expect(cookie.startsWith(`${asha.viewer.profile.id}.`)).toBe(true);
		expect((await viewer("asha", cookie)).viewer.profile.id).toBe(asha.viewer.profile.id);

		// Five tries in 15 minutes, right or wrong.
		for (let at = 0; at < 3; at += 1) {
			await expect(profiles.switchProfile(asKid, asha.viewer.profile.id, "1111")).rejects.toMatchObject({
				code: "BAD_REQUEST",
			});
		}
		await expect(profiles.switchProfile(asKid, asha.viewer.profile.id, "2468")).rejects.toMatchObject({
			code: "RATE_LIMITED",
		});
	});

	it("opens a locked profile only with the cookie's proof, and a new PIN ends the old proof", async () => {
		const asha = await viewer("asha");
		const second = await profiles.createProfile(asha, fields("Second"));
		const locked = await profiles.setPin(asha, asha.viewer.profile.id, "2468");
		const proof = profiles.profileCookieValue(locked);
		// Without the proof (the id alone, or someone's guess), the locked default isn't opened: the oldest unlocked one is.
		expect((await viewer("asha", asha.viewer.profile.id)).viewer.profile.id).toBe(second.id);
		expect((await viewer("asha", `${asha.viewer.profile.id}.forged`)).viewer.profile.id).toBe(second.id);
		expect((await viewer("asha")).viewer.profile.id).toBe(second.id);
		expect((await viewer("asha", proof)).viewer.profile.id).toBe(asha.viewer.profile.id);
		expect((await browsingProfile(env.db, sessionOf("asha"), undefined))?.id).toBe(second.id);

		const inside = await viewer("asha", proof);
		await profiles.setPin(inside, asha.viewer.profile.id, "1357");
		expect((await viewer("asha", proof)).viewer.profile.id).toBe(second.id);
	});

	it("changes a locked profile only from inside it", async () => {
		const asha = await viewer("asha");
		const second = await profiles.createProfile(asha, fields("Second"));
		const lockedSecond = await profiles.setPin(asha, second.id, "1234");
		await expect(profiles.updateProfile(asha, second.id, fields("Renamed"))).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
		await expect(profiles.setPin(asha, second.id, null)).rejects.toMatchObject({ code: "FORBIDDEN" });
		const inside = await viewer("asha", profiles.profileCookieValue(lockedSecond));
		await expect(profiles.setPin(inside, second.id, null)).resolves.toMatchObject({ pinHash: null });
	});

	it("falls back to the default when every profile is locked", async () => {
		const asha = await viewer("asha");
		await profiles.setPin(asha, asha.viewer.profile.id, "2468");
		expect((await viewer("asha")).viewer.profile.id).toBe(asha.viewer.profile.id);
	});
});
