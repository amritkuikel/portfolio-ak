import "@tanstack/react-start/server-only";
import { and, asc, count, desc, eq, exists, inArray, isNull, ne, notExists, or, type SQL, sql } from "drizzle-orm";
import { ALL_PERMISSIONS, isPermission, isSystemRole, type Permission } from "@/features/rbac/permissions";
import {
	type RoleInput,
	type RoleSummary,
	roleKeyFrom,
	type UserListInput,
	type UserListItem,
	type UserPage,
} from "@/features/rbac/schema";
import { sameVersion } from "@/server/db/concurrency";
import { allOf, countRows, orderBySort, paginate, textSearch } from "@/server/db/list";
import { role, rolePermission, session, user, userRole } from "@/server/db/schema";
import type { Db } from "@/server/db/types";

/**
 * Roles, permissions and user-role data access. Plain functions over an
 * injected Drizzle db (tested on PGlite). The rules about WHO may change what
 * live in ./service.ts; these functions just read and write.
 */

/** The fields of a user that decide their permissions. */
export type AuthSubject = { id: string; role: string | null; banned: boolean | null };

/**
 * Everything `subject` may do, resolved from the database on every request:
 * admins get the whole catalog; everyone else gets the `user` baseline plus their
 * custom roles. Banned users get nothing. Unknown strings (a permission removed
 * from the catalog) are ignored.
 */
export async function permissionsForUser(db: Db, subject: AuthSubject): Promise<Permission[]> {
	if (subject.banned) return [];
	if (subject.role === "admin") return [...ALL_PERMISSIONS];
	const rows = await db
		.selectDistinct({ permission: rolePermission.permission })
		.from(rolePermission)
		.innerJoin(role, eq(role.id, rolePermission.roleId))
		.where(
			or(
				eq(role.key, "user"),
				inArray(
					rolePermission.roleId,
					db.select({ id: userRole.roleId }).from(userRole).where(eq(userRole.userId, subject.id)),
				),
			),
		);
	const granted = new Set(rows.map((row) => row.permission));
	// Catalog order, so lists are stable.
	return ALL_PERMISSIONS.filter((permission) => granted.has(permission));
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

type RoleRow = typeof role.$inferSelect;

export async function getRole(db: Db, id: string): Promise<RoleRow | null> {
	const [row] = await db.select().from(role).where(eq(role.id, id));
	return row ?? null;
}

export async function getRolesByIds(db: Db, ids: ReadonlyArray<string>): Promise<RoleRow[]> {
	if (ids.length === 0) return [];
	return db
		.select()
		.from(role)
		.where(inArray(role.id, [...ids]));
}

export async function rolePermissions(db: Db, roleIds: ReadonlyArray<string>): Promise<Map<string, Permission[]>> {
	const map = new Map<string, Permission[]>();
	if (roleIds.length === 0) return map;
	const rows = await db
		.select()
		.from(rolePermission)
		.where(inArray(rolePermission.roleId, [...roleIds]));
	for (const row of rows) {
		if (!isPermission(row.permission)) continue;
		map.set(row.roleId, [...(map.get(row.roleId) ?? []), row.permission]);
	}
	return map;
}

/** Every role with its permissions and how many users hold it (system roles first). */
export async function listRoles(db: Db): Promise<RoleSummary[]> {
	const [roles, permissionRows, assignments, [admins], [everyone]] = await Promise.all([
		db.select().from(role).orderBy(desc(role.system), asc(role.key)),
		db.select().from(rolePermission),
		db.select({ roleId: userRole.roleId, total: count() }).from(userRole).groupBy(userRole.roleId),
		db.select({ total: count() }).from(user).where(eq(user.role, "admin")),
		db.select({ total: count() }).from(user),
	]);
	const counts = new Map(assignments.map((row) => [row.roleId, row.total]));
	return roles.map((row) => {
		const stored = permissionRows
			.filter((permission) => permission.roleId === row.id)
			.map((permission) => permission.permission)
			.filter(isPermission);
		const permissions = row.key === "admin" ? [...ALL_PERMISSIONS] : ALL_PERMISSIONS.filter((p) => stored.includes(p));
		const userCount =
			row.key === "admin"
				? (admins?.total ?? 0)
				: row.key === "user"
					? (everyone?.total ?? 0)
					: (counts.get(row.id) ?? 0);
		return {
			id: row.id,
			key: row.key,
			name: row.name,
			description: row.description,
			system: row.system,
			permissions,
			userCount,
			updatedAt: row.updatedAt.toISOString(),
		};
	});
}

/** A free key derived from the name ("editor", then "editor-2", …; "role" when the name has no Latin letters). */
async function freeRoleKey(db: Db, name: string): Promise<string> {
	const base = roleKeyFrom(name) || "role";
	const taken = new Set(
		(
			await db
				.select({ key: role.key })
				.from(role)
				.where(or(eq(role.key, base), sql`${role.key} like ${`${base}-%`}`))
		).map((row) => row.key),
	);
	if (!taken.has(base) && !isSystemRole(base)) return base;
	for (let suffix = 2; ; suffix++) {
		const candidate = `${base}-${suffix}`;
		if (!taken.has(candidate)) return candidate;
	}
}

/** True when another role already uses this name (case-insensitive). */
export async function roleNameTaken(db: Db, name: string, exceptId?: string): Promise<boolean> {
	const [row] = await db
		.select({ id: role.id })
		.from(role)
		.where(allOf(sql`lower(${role.name}) = lower(${name})`, exceptId ? ne(role.id, exceptId) : undefined))
		.limit(1);
	return row !== undefined;
}

export async function createRole(db: Db, input: RoleInput): Promise<RoleRow> {
	const key = await freeRoleKey(db, input.name);
	const [created] = await db.insert(role).values({ key, name: input.name, description: input.description }).returning();
	if (!created) throw new Error("Role insert returned no row");
	return created;
}

/** Renames a role if it still has `version` (its `updatedAt`); false when it changed since (or is gone). */
export async function updateRole(db: Db, id: string, input: RoleInput, version: string): Promise<boolean> {
	const updated = await db
		.update(role)
		.set({ name: input.name, description: input.description })
		.where(and(eq(role.id, id), sameVersion(role.updatedAt, version)))
		.returning({ id: role.id });
	return updated.length > 0;
}

/** Deletes a role; its permissions and assignments go with it (FK cascade). */
export async function deleteRole(db: Db, id: string): Promise<void> {
	await db.delete(role).where(eq(role.id, id));
}

/** Adds and removes permissions on one role in a single transaction. */
export async function updateRolePermissions(
	db: Db,
	roleId: string,
	grant: ReadonlyArray<Permission>,
	revoke: ReadonlyArray<Permission>,
): Promise<void> {
	await db.transaction(async (tx) => {
		if (grant.length > 0) {
			await tx
				.insert(rolePermission)
				.values(grant.map((permission) => ({ roleId, permission })))
				.onConflictDoNothing();
		}
		if (revoke.length > 0) {
			await tx
				.delete(rolePermission)
				.where(and(eq(rolePermission.roleId, roleId), inArray(rolePermission.permission, [...revoke])));
		}
	});
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getAuthSubject(db: Db, userId: string): Promise<AuthSubject | null> {
	const [row] = await db
		.select({ id: user.id, role: user.role, banned: user.banned })
		.from(user)
		.where(eq(user.id, userId));
	return row ?? null;
}

/** A user as the user-management rules see them (and as audit rows name them). */
export type UserTarget = AuthSubject & { name: string; email: string };

export async function getUserTarget(db: Db, userId: string): Promise<UserTarget | null> {
	const [row] = await db
		.select({ id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned })
		.from(user)
		.where(eq(user.id, userId));
	return row ?? null;
}

export async function emailTaken(db: Db, email: string): Promise<boolean> {
	const [row] = await db.select({ id: user.id }).from(user).where(sql`lower(${user.email}) = lower(${email})`).limit(1);
	return row !== undefined;
}

/** An invited account: the baseline role, no password and no sessions until they accept. */
export async function createInvitedUser(db: Db, input: { name: string; email: string }) {
	const [created] = await db
		.insert(user)
		.values({ id: crypto.randomUUID(), name: input.name, email: input.email, emailVerified: false, role: "user" })
		.returning({ id: user.id, name: user.name, email: user.email });
	if (!created) throw new Error("User insert returned no row");
	return created;
}

/** Deletes every session of a user (signed out everywhere); returns how many there were. */
export async function deleteUserSessions(db: Db, userId: string): Promise<number> {
	const deleted = await db.delete(session).where(eq(session.userId, userId)).returning({ id: session.id });
	return deleted.length;
}

/**
 * Ids of the admins who can still sign in, with their rows locked until the
 * transaction ends (call inside `db.transaction`). The lockout guard uses this so
 * two concurrent demotions can't both see "another admin is left".
 */
export async function lockActiveAdmins(tx: Db): Promise<string[]> {
	const rows = await tx
		.select({ id: user.id })
		.from(user)
		.where(and(eq(user.role, "admin"), or(eq(user.banned, false), sql`${user.banned} is null`)))
		.for("update");
	return rows.map((row) => row.id);
}

/** Custom role ids a user holds. */
export async function userRoleIds(db: Db, userId: string): Promise<string[]> {
	const rows = await db.select({ id: userRole.roleId }).from(userRole).where(eq(userRole.userId, userId));
	return rows.map((row) => row.id);
}

const SORT_COLUMNS = { name: user.name, email: user.email, created: user.createdAt };

const notBanned = or(eq(user.banned, false), sql`${user.banned} is null`);

/** "all", "admin", "user" (the baseline only: no admin flag, no custom role) or a custom role's key. */
function roleFilter(db: Db, key: string): SQL | undefined {
	if (key === "all") return undefined;
	if (key === "admin") return eq(user.role, "admin");
	if (key === "user") {
		return and(
			or(ne(user.role, "admin"), isNull(user.role)),
			notExists(db.select({ one: sql`1` }).from(userRole).where(eq(userRole.userId, user.id))),
		);
	}
	return exists(
		db
			.select({ one: sql`1` })
			.from(userRole)
			.innerJoin(role, eq(role.id, userRole.roleId))
			.where(and(eq(userRole.userId, user.id), eq(role.key, key))),
	);
}

export async function listUsers(db: Db, input: UserListInput): Promise<UserPage> {
	const where = allOf(
		textSearch(input.q, [user.name, user.email]),
		input.status === "banned" ? eq(user.banned, true) : input.status === "active" ? notBanned : undefined,
		roleFilter(db, input.role),
	);
	const order = orderBySort(input.sort, SORT_COLUMNS, { tiebreaker: user.id, fallback: "created" });
	const page = await paginate(
		input,
		{
			count: () => countRows(db, user, where),
			rows: ({ limit, offset }) =>
				db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
						banned: user.banned,
						createdAt: user.createdAt,
					})
					.from(user)
					.where(where)
					.orderBy(...order)
					.limit(limit)
					.offset(offset),
		},
		(row) => row,
	);
	const ids = page.items.map((row) => row.id);
	const assigned =
		ids.length === 0
			? []
			: await db
					.select({ userId: userRole.userId, id: role.id, key: role.key, name: role.name })
					.from(userRole)
					.innerJoin(role, eq(role.id, userRole.roleId))
					.where(inArray(userRole.userId, ids))
					.orderBy(asc(role.name));
	const items: UserListItem[] = page.items.map((row) => ({
		id: row.id,
		name: row.name,
		email: row.email,
		isAdmin: row.role === "admin",
		roles: assigned.filter((entry) => entry.userId === row.id).map(({ id, key, name }) => ({ id, key, name })),
		banned: row.banned === true,
		createdAt: row.createdAt.toISOString(),
	}));
	return { ...page, items };
}

/** Sets the admin flag (Better Auth's user.role) and the custom roles of a user, atomically. */
export async function setUserRoles(
	db: Db,
	userId: string,
	{ admin, roleIds }: { admin: boolean; roleIds: ReadonlyArray<string> },
): Promise<void> {
	await db.transaction(async (tx) => {
		await tx
			.update(user)
			.set({ role: admin ? "admin" : "user" })
			.where(eq(user.id, userId));
		await tx.delete(userRole).where(eq(userRole.userId, userId));
		if (roleIds.length > 0) {
			await tx.insert(userRole).values(roleIds.map((roleId) => ({ userId, roleId })));
		}
	});
}

/**
 * Bans (or unbans) a user. Banning also deletes their sessions, so they're
 * signed out everywhere at once; Better Auth's admin plugin refuses new
 * sign-ins while `banned` is set.
 */
export async function setUserBanned(db: Db, userId: string, banned: boolean): Promise<void> {
	await db.transaction(async (tx) => {
		await tx.update(user).set({ banned, banReason: null, banExpires: null }).where(eq(user.id, userId));
		if (banned) await tx.delete(session).where(eq(session.userId, userId));
	});
}
