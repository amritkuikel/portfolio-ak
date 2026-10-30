import { type ActiveOptions, linkOptions } from "@tanstack/react-router";
import {
	BriefcaseIcon, // @portfolio
	DatabaseIcon,
	FolderKanbanIcon, // @portfolio
	ImagesIcon, // @portfolio
	InboxIcon, // @portfolio
	KeyRoundIcon,
	LayoutGridIcon, // @apps
	type LucideIcon,
	NotebookPenIcon, // @portfolio
	PaletteIcon,
	QuoteIcon, // @portfolio
	ScrollTextIcon,
	ShieldCheckIcon,
	UserRoundIcon, // @portfolio
	UsersIcon,
	WorkflowIcon, // @portfolio
	WrenchIcon, // @portfolio
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
	/** The link (a typed `linkOptions` object, spread in): where it goes and when it counts as current. */
	to: AdminPath;
	activeOptions?: ActiveOptions;
	label: () => string;
	description: () => string;
	icon: LucideIcon;
	/** What opening it takes; null for personal pages any admin-area user may open. */
	permission: Permission | null;
	group: AdminGroup;
	/** Extra words the command palette matches (space-separated, localized). */
	keywords?: () => string;
};

export const ADMIN_SECTIONS: ReadonlyArray<AdminSection> = [
	{
		...linkOptions({ to: "/admin/test-crud" }),
		label: m.admin_nav_test_crud,
		description: m.test_crud_admin_description,
		icon: DatabaseIcon,
		permission: "test-crud:read",
		group: "overview",
		keywords: m.admin_keywords_test_crud,
	},
	// portfolio:start
	{
		...linkOptions({ to: "/admin/portfolio/profile" }),
		label: m.admin_nav_portfolio_profile,
		description: m.portfolio_admin_profile_description,
		icon: UserRoundIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_profile,
	},
	{
		...linkOptions({ to: "/admin/portfolio/projects" }),
		label: m.admin_nav_portfolio_projects,
		description: m.portfolio_admin_projects_description,
		icon: FolderKanbanIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_projects,
	},
	{
		...linkOptions({ to: "/admin/portfolio/journal" }),
		label: m.admin_nav_portfolio_posts,
		description: m.portfolio_admin_posts_description,
		icon: NotebookPenIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_posts,
	},
	{
		...linkOptions({ to: "/admin/portfolio/experience" }),
		label: m.admin_nav_portfolio_experience,
		description: m.portfolio_admin_experience_description,
		icon: BriefcaseIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_experience,
	},
	{
		...linkOptions({ to: "/admin/portfolio/skills" }),
		label: m.admin_nav_portfolio_skills,
		description: m.portfolio_admin_skills_description,
		icon: WrenchIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_skills,
	},
	{
		...linkOptions({ to: "/admin/portfolio/process" }),
		label: m.admin_nav_portfolio_process,
		description: m.portfolio_admin_process_description,
		icon: WorkflowIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_process,
	},
	{
		...linkOptions({ to: "/admin/portfolio/testimonials" }),
		label: m.admin_nav_portfolio_testimonials,
		description: m.portfolio_admin_testimonials_description,
		icon: QuoteIcon,
		permission: "portfolio:read",
		group: "portfolio",
		keywords: m.admin_keywords_portfolio_testimonials,
	},
	{
		...linkOptions({ to: "/admin/portfolio/messages" }),
		label: m.admin_nav_messages,
		description: m.messages_description,
		icon: InboxIcon,
		permission: "messages:read",
		group: "portfolio",
		keywords: m.admin_keywords_messages,
	},
	{
		...linkOptions({ to: "/admin/media" }),
		label: m.admin_nav_media,
		description: m.media_description,
		icon: ImagesIcon,
		permission: "media:read",
		group: "portfolio",
		keywords: m.admin_keywords_media,
	},
	// portfolio:end
	// apps:start
	{
		...linkOptions({ to: "/admin/apps" }),
		label: m.admin_nav_apps,
		description: m.apps_usage_description,
		icon: LayoutGridIcon,
		permission: "apps:read",
		group: "apps",
		keywords: m.admin_keywords_apps,
	},
	// apps:end
	{
		...linkOptions({ to: "/admin/users" }),
		label: m.admin_nav_users,
		description: m.users_description,
		icon: UsersIcon,
		permission: "users:read",
		group: "access",
		keywords: m.admin_keywords_users,
	},
	{
		// Only on this exact path: Permissions is under it.
		...linkOptions({ to: "/admin/roles", activeOptions: { exact: true } }),
		label: m.admin_nav_roles,
		description: m.roles_description,
		icon: ShieldCheckIcon,
		permission: "roles:read",
		group: "access",
	},
	{
		...linkOptions({ to: "/admin/roles/permissions" }),
		label: m.admin_nav_permissions,
		description: m.matrix_description,
		icon: KeyRoundIcon,
		permission: "roles:read",
		group: "access",
	},
	{
		...linkOptions({ to: "/admin/audit" }),
		label: m.admin_nav_audit,
		description: m.audit_description,
		icon: ScrollTextIcon,
		permission: "audit:read",
		group: "system",
		keywords: m.admin_keywords_audit,
	},
	{
		...linkOptions({ to: "/admin/settings/appearance" }),
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
