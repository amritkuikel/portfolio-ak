import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
	type RoleSummary,
	roleIdSchema,
	roleInputSchema,
	rolePermissionsUpdateSchema,
	roleUpdateSchema,
	type UserPage,
	userBanSchema,
	userIdSchema,
	userInviteSchema,
	userListInputSchema,
	userRolesSchema,
} from "@/features/rbac/schema";
import { zodInput } from "@/lib/fn-input";
import type { Session } from "@/lib/session";
import { requirePermission } from "@/middleware/auth";
import { auditActorFrom } from "@/server/audit/actor";
import { auth } from "@/server/auth/auth";
import { sendInvitation } from "@/server/auth/invite";
import { db } from "@/server/db/client";
import { listUsers as listUserRows } from "@/server/rbac/repository";
import * as rbac from "@/server/rbac/service";

/**
 * Roles, permissions and users. EVERY function runs requirePermission first (a
 * test enforces it); the service adds the rules that depend on who acts and what
 * changes (no self-escalation, no lockout) and writes the audit rows. Thin
 * wrappers over src/server/rbac.
 */

type Context = { user: Session["user"]; permissions: Session["permissions"]; impersonatedBy: string | null };

const actor = (context: Context): rbac.Actor => ({
	...auditActorFrom(context),
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
	.handler(({ data, context }) => rbac.createRole(db, actor(context), data));

export const updateRole = createServerFn({ method: "POST" })
	.middleware([requirePermission("roles:manage")])
	.validator(zodInput(roleUpdateSchema))
	.handler(({ data: { id, updatedAt, ...input }, context }) =>
		rbac.updateRole(db, actor(context), id, input, updatedAt),
	);

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

/** Signs a user out on every device. */
export const revokeUserSessions = createServerFn({ method: "POST" })
	.middleware([requirePermission("users:ban")])
	.validator(zodInput(userIdSchema))
	.handler(({ data, context }) => rbac.revokeUserSessions(db, actor(context), data.userId));

/** Creates an account and emails the person a link to choose their password, in the language picked. */
export const inviteUser = createServerFn({ method: "POST" })
	.middleware([requirePermission("users:invite")])
	.validator(zodInput(userInviteSchema))
	.handler(({ data, context }) =>
		rbac.inviteUser(db, actor(context), data, (invited) =>
			sendInvitation(invited, { locale: data.locale, inviter: context.user.name }),
		),
	);

/**
 * Opens a session as another user (impersonation, decisions.md 0134). Admins only:
 * the service refuses everyone else, whatever their permissions. The browser then
 * reloads into the user's view; the banner's "Stop" calls stopImpersonating (functions/auth.ts).
 */
export const impersonateUser = createServerFn({ method: "POST" })
	.middleware([requirePermission("users:update")])
	.validator(zodInput(userIdSchema))
	.handler(async ({ data, context }): Promise<void> => {
		const headers = getRequestHeaders();
		await rbac.impersonateUser(db, actor(context), data.userId, async () => {
			await auth.api.impersonateUser({ body: { userId: data.userId }, headers });
		});
	});
