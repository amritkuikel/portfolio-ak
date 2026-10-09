import { DatabaseIcon, KeyRoundIcon, type LucideIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import type { Permission } from "@/features/rbac/permissions";
import { m } from "@/paraglide/messages";

/**
 * The admin area's sections, in sidebar order. The sidebar and the dashboard
 * show only those whose `permission` the user holds; each route also checks it
 * in `beforeLoad`, and each server function checks its own.
 */
export type AdminSection = {
	to: "/admin/test-crud" | "/admin/users" | "/admin/roles" | "/admin/roles/permissions";
	label: () => string;
	description: () => string;
	icon: LucideIcon;
	permission: Permission;
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
	},
	{
		to: "/admin/users",
		label: m.admin_nav_users,
		description: m.users_description,
		icon: UsersIcon,
		permission: "users:read",
	},
	{
		to: "/admin/roles",
		label: m.admin_nav_roles,
		description: m.roles_description,
		icon: ShieldCheckIcon,
		permission: "roles:read",
		exact: true,
	},
	{
		to: "/admin/roles/permissions",
		label: m.admin_nav_permissions,
		description: m.matrix_description,
		icon: KeyRoundIcon,
		permission: "roles:read",
	},
];
