import { createServerFn } from "@tanstack/react-start";
import {
	type RoleSummary,
	roleIdSchema,
	roleInputSchema,
	rolePermissionsUpdateSchema,
	roleUpdateSchema,
	type UserPage,
	userBanSchema,
	userListInputSchema,
	userRolesSchema,
} from "@/features/rbac/schema";
import { zodInput } from "@/lib/fn-input";
import type { Session } from "@/lib/session";
import { requirePermission } from "@/middleware/auth";
import { db } from "@/server/db/client";
import { listUsers as listUserRows } from "@/server/rbac/repository";
import * as rbac from "@/server/rbac/service";

/**
 * Roles, permissions and users. EVERY function runs requirePermission first (a
 * test enforces it); the service adds the rules that depend on who acts and what
 * changes (no self-escalation, no lockout). Thin wrappers over src/server/rbac.
 */

const actor = (context: { user: Session["user"]; permissions: Session["permissions"] }): rbac.Actor => ({
	id: context.user.id,
	isAdmin: context.user.role === "admin",
	permissions: context.permissions,
});

export const listRoles = createServerFn({ method: "GET" })
	.middleware([requirePermission("roles:read")])
	.handler((): Promise<RoleSummary[]> => rbac.listRoles(db));

/** The roles, for the users page (filter and role dialog): same data, granted by users:read. */
export const listRoleOptions = createServerFn({ method: "GET" })
	.middleware([requirePermission("users:read")])
	.handler((): Promise<RoleSummary[]> => rbac.listRoles(db));

export const createRole = createServerFn({ method: "POST" })
	.middleware([requirePermission("roles:manage")])
	.validator(zodInput(roleInputSchema))
	.handler(({ data }) => rbac.createRole(db, data));

export const updateRole = createServerFn({ method: "POST" })
	.middleware([requirePermission("roles:manage")])
	.validator(zodInput(roleUpdateSchema))
	.handler(({ data: { id, ...input } }) => rbac.updateRole(db, id, input));

export const deleteRole = createServerFn({ method: "POST" })
	.middleware([requirePermission("roles:manage")])
	.validator(zodInput(roleIdSchema))
	.handler(({ data, context }) => rbac.deleteRole(db, actor(context), data.id));

export const updateRolePermissions = createServerFn({ method: "POST" })
	.middleware([requirePermission("roles:manage")])
	.validator(zodInput(rolePermissionsUpdateSchema))
	.handler(({ data, context }) => rbac.updateRolePermissions(db, actor(context), data));

export const listUsers = createServerFn({ method: "GET" })
	.middleware([requirePermission("users:read")])
	.validator(zodInput(userListInputSchema))
	.handler(({ data }): Promise<UserPage> => listUserRows(db, data));

export const setUserRoles = createServerFn({ method: "POST" })
	.middleware([requirePermission("users:update")])
	.validator(zodInput(userRolesSchema))
	.handler(({ data, context }) => rbac.setUserRoles(db, actor(context), data));

export const setUserBanned = createServerFn({ method: "POST" })
	.middleware([requirePermission("users:ban")])
	.validator(zodInput(userBanSchema))
	.handler(({ data, context }) => rbac.setUserBanned(db, actor(context), data.userId, data.banned));
