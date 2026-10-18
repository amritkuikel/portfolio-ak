import "@tanstack/react-start/server-only";
import { hasAll, type Permission } from "@/features/rbac/permissions";
import type {
	RoleInput,
	RolePermissionsUpdate,
	RoleSummary,
	UserInviteInput,
	UserRolesInput,
} from "@/features/rbac/schema";
import { staleError } from "@/lib/concurrency";
import { AppError, ruleError } from "@/lib/errors";
import { m } from "@/paraglide/messages";
import { type AuditActor, recordAudit } from "@/server/audit/record";
import type { Db } from "@/server/db/types";
import * as repo from "./repository";

/**
 * The rules of role and permission management. The server functions have
 * already checked that the actor holds the permission for the action
 * (requirePermission); these functions add the rules that depend on WHO is
 * acting and WHAT is changed, so nobody can raise their own privileges or lock
 * everyone out:
 *
 * - The admin role is fixed (every permission) and only admins change who is an admin.
 * - There is always at least one active admin.
 * - Nobody changes their own roles, or bans themselves.
 * - A non-admin can only grant, remove or hand out permissions they hold themselves,
 *   and can't change, ban or sign out an admin.
 * - Only admins impersonate, never another admin, and never from an impersonated session.
 *
 * Every change writes its audit row in the same transaction (src/server/audit, 0132).
 */
export type Actor = AuditActor & { isAdmin: boolean; permissions: ReadonlyArray<Permission> };

const notFound = (what: string) => new AppError("NOT_FOUND", `${what} not found`);
const forbidden = (dev: string, user: string) => ruleError("FORBIDDEN", dev, user);

/** A non-admin may only touch permissions they hold. */
function assertWithinOwn(actor: Actor, permissions: ReadonlyArray<Permission>) {
	if (actor.isAdmin) return;
	if (!hasAll(actor.permissions, permissions)) {
		throw forbidden("Permissions outside the actor's own", m.rbac_error_subset());
	}
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const listRoles = (db: Db): Promise<RoleSummary[]> => repo.listRoles(db);

async function customRoleOrThrow(db: Db, id: string) {
	const role = await repo.getRole(db, id);
	if (!role) throw notFound("Role");
	if (role.system) throw forbidden("System roles are fixed", m.rbac_error_system_role());
	return role;
}

async function assertNameFree(db: Db, name: string, exceptId?: string) {
	if (await repo.roleNameTaken(db, name, exceptId)) {
		throw new AppError("CONFLICT", "Role name taken", { fieldErrors: { name: [m.rbac_error_role_name_taken()] } });
	}
}

const roleTarget = (role: { id: string; name: string }) => ({ type: "role" as const, id: role.id, label: role.name });

export async function createRole(db: Db, actor: Actor, input: RoleInput) {
	await assertNameFree(db, input.name);
	return db.transaction(async (tx) => {
		const role = await repo.createRole(tx, input);
		await recordAudit(tx, actor, {
			action: "role.create",
			target: roleTarget(role),
			after: { name: role.name, description: role.description },
		});
		return { id: role.id, key: role.key };
	});
}

/** Renames a custom role, if nobody changed it since `version` (else a stale CONFLICT). */
export async function updateRole(db: Db, actor: Actor, id: string, input: RoleInput, version: string) {
	const before = await customRoleOrThrow(db, id);
	await assertNameFree(db, input.name, id);
	await db.transaction(async (tx) => {
		if (!(await repo.updateRole(tx, id, input, version))) {
			// Deleted in between: NOT_FOUND; otherwise someone renamed it first.
			await customRoleOrThrow(tx, id);
			throw staleError("Role");
		}
		await recordAudit(tx, actor, {
			action: "role.update",
			target: roleTarget({ id, name: input.name }),
			before: { name: before.name, description: before.description },
			after: { name: input.name, description: input.description },
		});
	});
}

export async function deleteRole(db: Db, actor: Actor, id: string) {
	const role = await customRoleOrThrow(db, id);
	// Deleting a role removes its permissions from everyone holding it: same rule as revoking them.
	const permissions = (await repo.rolePermissions(db, [role.id])).get(role.id) ?? [];
	assertWithinOwn(actor, permissions);
	await db.transaction(async (tx) => {
		await repo.deleteRole(tx, id);
		await recordAudit(tx, actor, {
			action: "role.delete",
			target: roleTarget(role),
			before: { name: role.name, permissions },
		});
	});
}

export async function updateRolePermissions(db: Db, actor: Actor, input: RolePermissionsUpdate) {
	const role = await repo.getRole(db, input.roleId);
	if (!role) throw notFound("Role");
	if (role.key === "admin") throw forbidden("The admin role is fixed", m.rbac_error_admin_role_fixed());
	assertWithinOwn(actor, [...input.grant, ...input.revoke]);
	await db.transaction(async (tx) => {
		const before = (await repo.rolePermissions(tx, [role.id])).get(role.id) ?? [];
		await repo.updateRolePermissions(tx, role.id, input.grant, input.revoke);
		const after = (await repo.rolePermissions(tx, [role.id])).get(role.id) ?? [];
		if (sameSet(before, after)) return;
		await recordAudit(tx, actor, {
			action: "role.permissions",
			target: roleTarget(role),
			before: { permissions: sorted(before) },
			after: { permissions: sorted(after) },
		});
	});
}

const sorted = (values: ReadonlyArray<string>) => [...values].sort();
const sameSet = (a: ReadonlyArray<string>, b: ReadonlyArray<string>) =>
	a.length === b.length && a.every((value) => b.includes(value));

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

async function targetOrThrow(db: Db, userId: string) {
	const target = await repo.getUserTarget(db, userId);
	if (!target) throw notFound("User");
	return target;
}

const userTarget = (user: { id: string; email: string }) => ({ type: "user" as const, id: user.id, label: user.email });

/** A non-admin can't act on an admin (roles, ban, sign-out). */
function assertMayActOn(actor: Actor, target: repo.UserTarget) {
	if (target.role === "admin" && !actor.isAdmin) {
		throw forbidden("Non-admin acting on an admin", m.rbac_error_admin_target());
	}
}

/**
 * Runs `change` in a transaction. When it takes away an active admin
 * (`removesAdmin`), the active admins are locked and re-read first, and the change
 * is refused if `userId` is the last one. Concurrent demotions therefore run one
 * after the other, and the second sees the first's result.
 */
async function guardLastAdmin(db: Db, userId: string, removesAdmin: boolean, change: (tx: Db) => Promise<void>) {
	await db.transaction(async (tx) => {
		if (removesAdmin) {
			const active = await repo.lockActiveAdmins(tx);
			if (active.includes(userId) && active.length <= 1) {
				throw ruleError("CONFLICT", "Last active admin", m.rbac_error_last_admin());
			}
		}
		await change(tx);
	});
}

export async function setUserRoles(db: Db, actor: Actor, input: UserRolesInput) {
	if (input.userId === actor.id) throw forbidden("Own roles", m.rbac_error_own_roles());
	const target = await targetOrThrow(db, input.userId);
	const wasAdmin = target.role === "admin";
	if (wasAdmin !== input.admin) {
		if (!actor.isAdmin) throw forbidden("Admin flag change by non-admin", m.rbac_error_admin_only());
	} else if (wasAdmin && !actor.isAdmin) {
		throw forbidden("Non-admin editing an admin", m.rbac_error_admin_target());
	}

	// Only custom roles are assignable here; unknown or system ids are refused.
	const requested = [...new Set(input.roleIds)];
	const roles = await repo.getRolesByIds(db, requested);
	if (roles.length !== requested.length || roles.some((role) => role.system)) {
		throw new AppError("BAD_REQUEST", "Unknown or system role id");
	}
	// Roles handed out or taken away must stay within the actor's own permissions.
	const current = await repo.userRoleIds(db, input.userId);
	const changed = [
		...requested.filter((id) => !current.includes(id)),
		...current.filter((id) => !requested.includes(id)),
	];
	const permissions = await repo.rolePermissions(db, changed);
	assertWithinOwn(actor, [...permissions.values()].flat());

	const before = { admin: wasAdmin, roles: sorted((await repo.getRolesByIds(db, current)).map((role) => role.name)) };
	const after = { admin: input.admin, roles: sorted(roles.map((role) => role.name)) };
	await guardLastAdmin(db, input.userId, wasAdmin && !input.admin, async (tx) => {
		await repo.setUserRoles(tx, input.userId, { admin: input.admin, roleIds: requested });
		if (changed.length === 0 && wasAdmin === input.admin) return;
		await recordAudit(tx, actor, { action: "user.roles", target: userTarget(target), before, after });
	});
}

export async function setUserBanned(db: Db, actor: Actor, userId: string, banned: boolean) {
	if (userId === actor.id) throw forbidden("Ban self", m.rbac_error_ban_self());
	const target = await targetOrThrow(db, userId);
	assertMayActOn(actor, target);
	await guardLastAdmin(db, userId, target.role === "admin" && banned, async (tx) => {
		await repo.setUserBanned(tx, userId, banned);
		await recordAudit(tx, actor, {
			action: banned ? "user.ban" : "user.unban",
			target: userTarget(target),
			before: { banned: target.banned === true },
			after: { banned },
		});
	});
}

/** Signs a user out everywhere (deletes their sessions); returns how many there were. */
export async function revokeUserSessions(db: Db, actor: Actor, userId: string): Promise<{ revoked: number }> {
	if (userId === actor.id) throw forbidden("Own sessions", m.rbac_error_revoke_self());
	const target = await targetOrThrow(db, userId);
	assertMayActOn(actor, target);
	return db.transaction(async (tx) => {
		const revoked = await repo.deleteUserSessions(tx, userId);
		await recordAudit(tx, actor, {
			action: "user.sessions-revoke",
			target: userTarget(target),
			after: { sessions: revoked },
		});
		return { revoked };
	});
}

/**
 * Invites someone: creates their account (the `user` baseline, address not yet
 * verified, no password), then `send` emails them a link to choose a password
 * (src/functions/rbac.ts issues a Better Auth reset token for it). Choosing the
 * password through that link verifies the address.
 */
export async function inviteUser(
	db: Db,
	actor: Actor,
	input: UserInviteInput,
	send: (invited: { id: string; name: string; email: string }) => Promise<void>,
): Promise<{ id: string }> {
	const email = input.email.toLowerCase();
	if (await repo.emailTaken(db, email)) {
		throw new AppError("CONFLICT", "Email taken", { fieldErrors: { email: [m.users_invite_email_taken()] } });
	}
	const invited = await db.transaction(async (tx) => {
		const created = await repo.createInvitedUser(tx, { name: input.name, email });
		await recordAudit(tx, actor, {
			action: "user.invite",
			target: userTarget(created),
			after: { name: created.name, email: created.email, language: input.locale },
		});
		return created;
	});
	await send(invited);
	return { id: invited.id };
}

// ---------------------------------------------------------------------------
// Impersonation (a recipe: decisions.md 0134)
// ---------------------------------------------------------------------------

/**
 * Starts a session as another user. `start` does it (Better Auth's
 * impersonateUser, which swaps the session cookie); it runs inside the audit
 * row's transaction, so a failed start leaves no row and a failed row no session.
 *
 * Admins only (the superuser flag): an impersonated session acts with all of the
 * target's permissions, so this isn't a permission a custom role could hold.
 * Admins can't be impersonated, and nobody impersonates from an impersonated session.
 */
export async function impersonateUser(db: Db, actor: Actor, userId: string, start: () => Promise<void>) {
	if (actor.impersonatorId) throw forbidden("Nested impersonation", m.rbac_error_impersonate_nested());
	if (!actor.isAdmin) throw forbidden("Impersonation by a non-admin", m.rbac_error_impersonate_admin_only());
	if (userId === actor.id) throw forbidden("Impersonate self", m.rbac_error_impersonate_self());
	const target = await targetOrThrow(db, userId);
	if (target.role === "admin") throw forbidden("Impersonate an admin", m.rbac_error_impersonate_admin_target());
	if (target.banned) throw ruleError("CONFLICT", "Impersonate a banned user", m.rbac_error_impersonate_banned());
	await db.transaction(async (tx) => {
		await recordAudit(tx, actor, { action: "user.impersonate", target: userTarget(target) });
		await start();
	});
}

/**
 * Ends an impersonated session (`session` is that session's actor: the target,
 * with the admin as impersonatorId). The audit row names the admin as the actor.
 */
export async function stopImpersonating(db: Db, session: AuditActor, stop: () => Promise<void>) {
	const admin = session.impersonatorId;
	if (!admin) throw new AppError("BAD_REQUEST", "Not an impersonated session");
	const target = await targetOrThrow(db, session.id);
	await db.transaction(async (tx) => {
		await recordAudit(
			tx,
			{ id: admin, requestId: session.requestId, ip: session.ip },
			{ action: "user.impersonate-stop", target: userTarget(target) },
		);
		await stop();
	});
}
