import { z } from "zod";
import { versionSchema } from "@/lib/concurrency";
import { enumParam, type Paged, pageParam, pageSizeParam, resolvedPageSize, searchParam } from "@/lib/list";
import { email, optionalText, required } from "@/lib/validation";
import { locales } from "@/paraglide/runtime";
import { isPermission, type Permission } from "./permissions";

/** One permission from the catalog; anything else is rejected. */
export const permissionSchema = z.custom<Permission>((value) => typeof value === "string" && isPermission(value));

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLE_NAME_MAX = 40;

/** Create / rename a custom role (one schema for the dialog and the server). */
export const roleInputSchema = z.object({
	name: required({ max: ROLE_NAME_MAX }),
	description: optionalText({ max: 200 }),
});
export type RoleInput = z.output<typeof roleInputSchema>;
export type RoleFormValues = z.input<typeof roleInputSchema>;

export const roleIdSchema = z.object({ id: z.uuid() });
/** Rename: plus which role and the version the edit started from (its `updatedAt`). */
export const roleUpdateSchema = roleInputSchema.extend({ id: z.uuid(), updatedAt: versionSchema() });

/** Matrix edits: permissions to add to and remove from one role (a checkbox, or a whole resource). */
export const rolePermissionsUpdateSchema = z.object({
	roleId: z.uuid(),
	grant: z.array(permissionSchema).max(100),
	revoke: z.array(permissionSchema).max(100),
});
export type RolePermissionsUpdate = z.output<typeof rolePermissionsUpdateSchema>;

export type RoleSummary = {
	id: string;
	key: string;
	/** Custom roles' own name; system roles are labelled with messages (see roleLabel). */
	name: string;
	description: string;
	system: boolean;
	/** Stored permissions; for `admin` this is every permission (implicit). */
	permissions: Permission[];
	userCount: number;
	/** Changes on rename only (the version the role dialog sends back); permission edits are deltas. */
	updatedAt: string;
};

/** Lowercase ASCII key from a role name ("Content editor" -> "content-editor"); "" for non-Latin names. */
export const roleKeyFrom = (name: string) =>
	name
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const USER_STATUS_FILTERS = ["all", "active", "banned"] as const;
export const USER_SORTS = ["name", "-name", "email", "-email", "created", "-created"] as const;
export const USERS_TABLE_ID = "admin-users";

export const USER_SEARCH_DEFAULTS = { q: "", role: "all", status: "all", sort: "-created", page: 1 } as const;

/**
 * /admin/users search params and the list server function input. `role` is
 * "all", "admin", "user" (no custom role) or a custom role's key.
 */
export const userSearchSchema = z.object({
	q: searchParam(),
	role: z
		.string()
		.trim()
		.max(40)
		.regex(/^[a-z0-9-]+$/)
		.default("all")
		.catch("all"),
	status: enumParam(USER_STATUS_FILTERS, USER_SEARCH_DEFAULTS.status),
	sort: enumParam(USER_SORTS, USER_SEARCH_DEFAULTS.sort),
	page: pageParam(),
	pageSize: pageSizeParam(),
});
export type UserSearch = z.output<typeof userSearchSchema>;
export const userListInputSchema = userSearchSchema.extend({ pageSize: resolvedPageSize() });
export type UserListInput = z.output<typeof userListInputSchema>;

export type UserListItem = {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean;
	roles: Array<{ id: string; key: string; name: string }>;
	banned: boolean;
	createdAt: string;
};
export type UserPage = Paged<UserListItem>;

/** The roles a user holds: the admin flag plus custom roles (the `user` baseline is implicit). */
export const userRolesSchema = z.object({
	userId: z.string().min(1).max(100),
	admin: z.boolean(),
	roleIds: z.array(z.uuid()).max(50),
});
export type UserRolesInput = z.output<typeof userRolesSchema>;

export const userBanSchema = z.object({ userId: z.string().min(1).max(100), banned: z.boolean() });

/** One user, by id (sign out everywhere, impersonate). */
export const userIdSchema = z.object({ userId: z.string().min(1).max(100) });

/** Invite someone: their name, address and the language of the invitation email. */
export const userInviteSchema = z.object({
	name: required({ max: 80 }),
	email: email(),
	locale: z.enum(locales),
});
export type UserInviteInput = z.output<typeof userInviteSchema>;
export type UserInviteValues = z.input<typeof userInviteSchema>;
