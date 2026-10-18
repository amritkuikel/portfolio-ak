import { m } from "@/paraglide/messages";
import type { Permission, Resource } from "./permissions";

/** Localized names, called at render time. Every catalog entry must have one (a test checks). */
export const RESOURCE_LABELS: Record<Resource, () => string> = {
	"test-crud": m.perm_resource_test_crud,
	users: m.perm_resource_users,
	roles: m.perm_resource_roles,
	attachments: m.perm_resource_attachments,
	audit: m.perm_resource_audit,
};

export const PERMISSION_LABELS: Record<Permission, () => string> = {
	"test-crud:read": m.perm_test_crud_read,
	"test-crud:create": m.perm_test_crud_create,
	"test-crud:update": m.perm_test_crud_update,
	"test-crud:publish": m.perm_test_crud_publish,
	"test-crud:delete": m.perm_test_crud_delete,
	"users:read": m.perm_users_read,
	"users:invite": m.perm_users_invite,
	"users:update": m.perm_users_update,
	"users:ban": m.perm_users_ban,
	"roles:read": m.perm_roles_read,
	"roles:manage": m.perm_roles_manage,
	"attachments:upload": m.perm_attachments_upload,
	"audit:read": m.perm_audit_read,
};

/** A role's display name: system roles are localized, custom roles use their own name. */
export const roleLabel = (role: { key: string; name: string }) =>
	role.key === "admin" ? m.role_admin_name() : role.key === "user" ? m.role_user_name() : role.name;

export const roleDescription = (role: { key: string; description: string }) =>
	role.key === "admin"
		? m.role_admin_description()
		: role.key === "user"
			? m.role_user_description()
			: role.description;
