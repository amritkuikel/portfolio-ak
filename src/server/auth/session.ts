import "@tanstack/react-start/server-only";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Role, Session } from "@/lib/session";
import { auth } from "./auth";

const toRole = (value: unknown): Role => (value === "admin" ? "admin" : "user");

/**
 * The signed-in user for the current request, validated against the database
 * by Better Auth (expired, revoked and banned sessions return null).
 */
export const getServerSession = async (): Promise<Session | null> => {
	const result = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!result) return null;
	const { user } = result;
	return {
		user: { id: user.id, email: user.email, name: user.name, role: toRole(user.role) },
	};
};
