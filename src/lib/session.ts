import type { Permission } from "@/features/rbac/permissions";

/** Better Auth's admin flag ("admin" holds every permission; see decisions.md 0094). */
export type Role = "user" | "admin";

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: Role;
};

/**
 * Session shape shared by the router context and server middleware. `permissions`
 * is resolved on the server for every request (roles can change at any time);
 * the browser uses it only to show or hide UI.
 */
export type Session = {
	user: SessionUser;
	permissions: Permission[];
};
