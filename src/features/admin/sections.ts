import {
	DatabaseIcon,
	KeyRoundIcon,
	type LucideIcon,
	PaletteIcon,
	ScrollTextIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";
import type { Permission } from "@/features/rbac/permissions";
import { m } from "@/paraglide/messages";
import type { FileRouteTypes } from "@/routeTree.gen";

/** Every admin page without a path param: what a section can link to. */
export type AdminPath = Exclude<Extract<FileRouteTypes["to"], `/admin/${string}`>, `${string}$${string}`>;

/** Sidebar groups, in order. The portfolio and the apps fill theirs in later tasks. */
export const ADMIN_GROUPS = ["overview", "portfolio", "apps", "access", "system"] as const;
export type AdminGroup = (typeof ADMIN_GROUPS)[number];

export const ADMIN_GROUP_LABELS: Record<AdminGroup, () => string> = {
	overview: m.admin_group_overview,
	portfolio: m.admin_group_portfolio,
	apps: m.admin_group_apps,
	access: m.admin_group_access,
	system: m.admin_group_system,
};

/**
 * The admin area's sections, in sidebar order within their group. The sidebar, the
 * command palette and the dashboard show only those whose `permission` the user
 * holds; each route also checks it in `beforeLoad`, and each server function checks
 * its own.
 */
export type AdminSection = {
	to: AdminPath;
	label: () => string;
	description: () => string;
	icon: LucideIcon;
	/** What opening it takes; null for personal pages any admin-area user may open. */
	permission: Permission | null;
	group: AdminGroup;
	/** Extra words the command palette matches (space-separated, localized). */
	keywords?: () => string;
	/** Highlight only on this exact path (a parent of another section). */
	exact?: boolean;
};

export const ADMIN_SECTIONS: ReadonlyArray<AdminSection> = [
	{
		to: "/admin/test-crud",
		label: m.admin_nav_test_crud,
		description: m.test_crud_admin_description,
		icon: DatabaseIcon,
		permission: "test-crud:read",
		group: "overview",
		keywords: m.admin_keywords_test_crud,
	},
	{
		to: "/admin/users",
		label: m.admin_nav_users,
		description: m.users_description,
		icon: UsersIcon,
		permission: "users:read",
		group: "access",
		keywords: m.admin_keywords_users,
	},
	{
		to: "/admin/roles",
		label: m.admin_nav_roles,
		description: m.roles_description,
		icon: ShieldCheckIcon,
		permission: "roles:read",
		group: "access",
		exact: true,
	},
	{
		to: "/admin/roles/permissions",
		label: m.admin_nav_permissions,
		description: m.matrix_description,
		icon: KeyRoundIcon,
		permission: "roles:read",
		group: "access",
	},
	{
		to: "/admin/audit",
		label: m.admin_nav_audit,
		description: m.audit_description,
		icon: ScrollTextIcon,
		permission: "audit:read",
		group: "system",
		keywords: m.admin_keywords_audit,
	},
	{
		to: "/admin/settings/appearance",
		label: m.admin_nav_appearance,
		description: m.appearance_description,
		icon: PaletteIcon,
		permission: null,
		group: "system",
		keywords: m.admin_keywords_appearance,
	},
	// @new-feature:admin-sections
];

/** The sections a user holding `permissions` may open, in order. */
export const permittedSections = (permissions: ReadonlyArray<Permission>) =>
	ADMIN_SECTIONS.filter((section) => section.permission === null || permissions.includes(section.permission));
