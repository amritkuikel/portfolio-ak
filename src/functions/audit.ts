import { createServerFn } from "@tanstack/react-start";
import { type AuditPage, auditListInputSchema } from "@/features/audit/schema";
import { zodInput } from "@/functions/_lib/validator";
import { requirePermission } from "@/middleware/auth";
import { listAuditEvents as listRows } from "@/server/audit/repository";
import { db } from "@/server/db/client";

/** The audit log (read only: rows are written by the services, decisions.md 0132). */
export const listAuditEvents = createServerFn({ method: "GET" })
	.middleware([requirePermission("audit:read")])
	.validator(zodInput(auditListInputSchema))
	.handler(({ data }): Promise<AuditPage> => listRows(db, data));
