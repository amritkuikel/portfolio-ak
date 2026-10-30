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
	// portfolio:start
	"profile.update": m.audit_action_profile_update,
	"project.create": m.audit_action_project_create,
	"project.update": m.audit_action_project_update,
	"project.publish": m.audit_action_project_publish,
	"project.unpublish": m.audit_action_project_unpublish,
	"project.delete": m.audit_action_project_delete,
	"project.reorder": m.audit_action_project_reorder,
	"post.create": m.audit_action_post_create,
	"post.update": m.audit_action_post_update,
	"post.publish": m.audit_action_post_publish,
	"post.unpublish": m.audit_action_post_unpublish,
	"post.delete": m.audit_action_post_delete,
	"portfolio-section.create": m.audit_action_portfolio_section_create,
	"portfolio-section.update": m.audit_action_portfolio_section_update,
	"portfolio-section.delete": m.audit_action_portfolio_section_delete,
	"portfolio-section.reorder": m.audit_action_portfolio_section_reorder,
	"message.archive": m.audit_action_message_archive,
	"message.unarchive": m.audit_action_message_unarchive,
	"message.delete": m.audit_action_message_delete,
	"media.update": m.audit_action_media_update,
	"media.delete": m.audit_action_media_delete,
	// portfolio:end
	// apps:start
	"link.block": m.audit_action_link_block,
	"link.unblock": m.audit_action_link_unblock,
	"link.delete": m.audit_action_link_delete,
	// apps:end
	// @new-feature:audit-action-labels
};

export const AUDIT_TARGET_LABELS: Record<AuditTarget, () => string> = {
	role: m.audit_target_role,
	user: m.audit_target_user,
	"test-crud": m.audit_target_test_crud,
	// portfolio:start
	profile: m.audit_target_profile,
	project: m.audit_target_project,
	post: m.audit_target_post,
	experience: m.audit_target_experience,
	skill: m.audit_target_skill,
	"process-step": m.audit_target_process_step,
	testimonial: m.audit_target_testimonial,
	message: m.audit_target_message,
	media: m.audit_target_media,
	// portfolio:end
	link: m.audit_target_link, // @apps
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
	// portfolio:start
	year: m.audit_field_year,
	featured: m.audit_field_featured,
	disciplines: m.audit_field_disciplines,
	stack: m.audit_field_stack,
	availability: m.audit_field_availability,
	label: m.audit_field_label,
	alt: m.audit_field_alt,
	altNe: m.audit_field_alt_ne,
	moved: m.audit_field_moved,
	// portfolio:end
	target: m.audit_field_target, // @apps
};
