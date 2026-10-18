import "@tanstack/react-start/server-only";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Role, Session } from "@/lib/session";
import { db } from "@/server/db/client";
import { serverEnv } from "@/server/env";
import { permissionsForUser } from "@/server/rbac/repository";
import { auth } from "./auth";
import { mustSetUpTwoFactor } from "./policy";

const toRole = (value: unknown): Role => (value === "admin" ? "admin" : "user");

/**
 * The signed-in user for the current request, validated against the database
 * by Better Auth (expired, revoked and banned sessions return null), with their
 * permissions resolved from the database for this request.
 *
 * With AUTH_REQUIRE_ADMIN_2FA on, a user with admin permissions and no second
 * factor gets none of them until they turn it on (`twoFactorRequired`), so every
 * `requirePermission` refuses and the admin gate sends them to set it up.
 */
export const getServerSession = async (): Promise<Session | null> => {
	const result = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!result) return null;
	const { user } = result;
	const role = toRole(user.role);
	const twoFactorEnabled = user.twoFactorEnabled === true;
	const permissions = await permissionsForUser(db, { id: user.id, role, banned: user.banned ?? false });
	const sessionUser = { id: user.id, email: user.email, name: user.name, role, twoFactorEnabled };
	if (mustSetUpTwoFactor({ required: serverEnv.AUTH_REQUIRE_ADMIN_2FA, permissions, twoFactorEnabled })) {
		return { user: sessionUser, permissions: [], twoFactorRequired: true };
	}
	return { user: sessionUser, permissions };
};
