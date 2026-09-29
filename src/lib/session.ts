/**
 * Session shape shared by the router context and server middleware.
 * Phase 6 (Better Auth) fills it in; until then it is always null.
 */
export type Role = "user" | "admin";

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: Role;
};

export type Session = {
	user: SessionUser;
};
