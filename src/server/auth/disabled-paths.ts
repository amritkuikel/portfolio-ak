import "@tanstack/react-start/server-only";

/**
 * The admin plugin's HTTP endpoints, all turned off (Better Auth answers 404).
 * Users, roles and bans are managed through src/functions/rbac.ts, whose service
 * enforces the rules (no self-escalation, always one active admin); calling these
 * directly would skip them. The plugin stays for its `role`/`banned` fields and
 * sign-in checks, and server code can still call `auth.api.*` (decisions.md 0112).
 * tests/server/auth-disabled-paths.test.ts fails if a Better Auth upgrade adds one.
 */
export const DISABLED_ADMIN_PATHS = [
	"/admin/ban-user",
	"/admin/create-user",
	"/admin/get-user",
	"/admin/has-permission",
	"/admin/impersonate-user",
	"/admin/list-users",
	"/admin/list-user-sessions",
	"/admin/remove-user",
	"/admin/revoke-user-session",
	"/admin/revoke-user-sessions",
	"/admin/set-role",
	"/admin/set-user-password",
	"/admin/stop-impersonating",
	"/admin/unban-user",
	"/admin/update-user",
];
