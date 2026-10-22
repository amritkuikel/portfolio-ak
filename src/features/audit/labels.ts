import { m } from "@/paraglide/messages";
import type { AuditAction, AuditTarget } from "./schema";

/** Localized names, called at render time. The Record types make every action and target have one. */
export const AUDIT_ACTION_LABELS: Record<AuditAction, () => string> = {
	"role.create": m.audit_action_role_create,
	"role.update": m.audit_action_role_update,
	"role.delete": m.audit_action_role_delete,
	"role.permissions": m.audit_action_role_permissions,
	"user.invite": m.audit_action_user_invite,
	"user.roles": m.audit_action_user_roles,
	"user.ban": m.audit_action_user_ban,
	"user.unban": m.audit_action_user_unban,
	"user.sessions-revoke": m.audit_action_user_sessions_revoke,
	"user.impersonate": m.audit_action_user_impersonate,
	"user.impersonate-stop": m.audit_action_user_impersonate_stop,
	"test-crud.create": m.audit_action_test_crud_create,
	"test-crud.update": m.audit_action_test_crud_update,
	"test-crud.publish": m.audit_action_test_crud_publish,
	"test-crud.unpublish": m.audit_action_test_crud_unpublish,
	"test-crud.delete": m.audit_action_test_crud_delete,
	// @new-feature:audit-action-labels
};

export const AUDIT_TARGET_LABELS: Record<AuditTarget, () => string> = {
	role: m.audit_target_role,
	user: m.audit_target_user,
	"test-crud": m.audit_target_test_crud,
	// @new-feature:audit-target-labels
};

/** The summarized fields' names (before/after keys the services write). Unknown keys show as-is. */
export const AUDIT_FIELD_LABELS: Readonly<Record<string, () => string>> = {
	name: m.audit_field_name,
	description: m.audit_field_description,
	permissions: m.audit_field_permissions,
	admin: m.audit_field_admin,
	roles: m.audit_field_roles,
	banned: m.audit_field_banned,
	sessions: m.audit_field_sessions,
	email: m.audit_field_email,
	language: m.audit_field_language,
	status: m.audit_field_status,
	title: m.audit_field_title,
	slug: m.audit_field_slug,
	summary: m.audit_field_summary,
	price: m.audit_field_price,
	phone: m.audit_field_phone,
	tags: m.audit_field_tags,
};
