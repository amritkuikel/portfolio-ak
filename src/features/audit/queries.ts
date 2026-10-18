import { queryOptions } from "@tanstack/react-query";
import { listAuditEvents } from "@/functions/audit";
import type { AuditListInput } from "./schema";

export const auditKeys = {
	all: ["audit"] as const,
	list: (input: AuditListInput) => [...auditKeys.all, "list", input] as const,
};

export const auditListQueryOptions = (input: AuditListInput) =>
	queryOptions({ queryKey: auditKeys.list(input), queryFn: () => listAuditEvents({ data: input }) });
