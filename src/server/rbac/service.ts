import "@tanstack/react-start/server-only";
import { hasAll, type Permission } from "@/features/rbac/permissions";
import type { RoleInput, RolePermissionsUpdate, RoleSummary, UserRolesInput } from "@/features/rbac/schema";
import { staleError } from "@/lib/concurrency";
import { AppError, ruleError } from "@/lib/errors";
import { m } from "@/paraglide/messages";
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
 *   and can't change an admin's roles or ban an admin.
 */
export type Actor = { id: string; isAdmin: boolean; permissions: ReadonlyArray<Permission> };

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

export async function createRole(db: Db, input: RoleInput) {
	await assertNameFree(db, input.name);
	const role = await repo.createRole(db, input);
	return { id: role.id, key: role.key };
}

/** Renames a custom role, if nobody changed it since `version` (else a stale CONFLICT). */
export async function updateRole(db: Db, id: string, input: RoleInput, version: string) {
	await customRoleOrThrow(db, id);
	await assertNameFree(db, input.name, id);
	if (!(await repo.updateRole(db, id, input, version))) {
		// Deleted in between: NOT_FOUND; otherwise someone renamed it first.
		await customRoleOrThrow(db, id);
		throw staleError("Role");
	}
}

export async function deleteRole(db: Db, actor: Actor, id: string) {
	const role = await customRoleOrThrow(db, id);
	// Deleting a role removes its permissions from everyone holding it: same rule as revoking them.
	const permissions = (await repo.rolePermissions(db, [role.id])).get(role.id) ?? [];
	assertWithinOwn(actor, permissions);
	await repo.deleteRole(db, id);
}

export async function updateRolePermissions(db: Db, actor: Actor, input: RolePermissionsUpdate) {
	const role = await repo.getRole(db, input.roleId);
	if (!role) throw notFound("Role");
	if (role.key === "admin") throw forbidden("The admin role is fixed", m.rbac_error_admin_role_fixed());
	assertWithinOwn(actor, [...input.grant, ...input.revoke]);
	await repo.updateRolePermissions(db, role.id, input.grant, input.revoke);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

async function targetOrThrow(db: Db, userId: string) {
	const target = await repo.getAuthSubject(db, userId);
	if (!target) throw notFound("User");
	return target;
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

	await guardLastAdmin(db, input.userId, wasAdmin && !input.admin, (tx) =>
		repo.setUserRoles(tx, input.userId, { admin: input.admin, roleIds: requested }),
	);
}

export async function setUserBanned(db: Db, actor: Actor, userId: string, banned: boolean) {
	if (userId === actor.id) throw forbidden("Ban self", m.rbac_error_ban_self());
	const target = await targetOrThrow(db, userId);
	const isAdmin = target.role === "admin";
	if (isAdmin && !actor.isAdmin) throw forbidden("Non-admin banning an admin", m.rbac_error_admin_target());
	await guardLastAdmin(db, userId, isAdmin && banned, (tx) => repo.setUserBanned(tx, userId, banned));
}
