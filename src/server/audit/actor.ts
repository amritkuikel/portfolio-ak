import "@tanstack/react-start/server-only";
import { getRequest } from "@tanstack/react-start/server";
import { trustedClientIp } from "@/server/auth/client-ip";
import { currentRequestId } from "@/server/http/request-scope";
import type { AuditActor } from "./record";

/**
 * The audit actor of a server-function call: the signed-in user, the admin behind
 * an impersonated session, the request id and the client IP (the same trusted
 * source as the rate limits). Start runtime only; services take the plain AuditActor.
 */
export const auditActorFrom = (context: { user: { id: string }; impersonatedBy: string | null }): AuditActor => ({
	id: context.user.id,
	impersonatorId: context.impersonatedBy,
	requestId: currentRequestId() ?? null,
	ip: trustedClientIp(getRequest()) ?? null,
});
