import type { Permission } from "@/features/rbac/permissions";

/** Better Auth's admin flag ("admin" holds every permission; see decisions.md 0094). */
export type Role = "user" | "admin";

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: Role;
	twoFactorEnabled: boolean;
};

/**
 * Session shape shared by the router context and server middleware. `permissions`
 * is resolved on the server for every request (roles can change at any time);
 * the browser uses it only to show or hide UI.
 */
export type Session = {
	user: SessionUser;
	permissions: Permission[];
	/**
	 * Set when AUTH_REQUIRE_ADMIN_2FA is on and this user holds admin permissions
	 * without two-factor turned on. `permissions` is then empty until they set it up
	 * (decisions.md 0126).
	 */
	twoFactorRequired?: true;
};
