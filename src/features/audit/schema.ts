import { z } from "zod";
import { enumParam, type Paged, pageParam, pageSizeParam, resolvedPageSize, searchParam } from "@/lib/list";
import { dateParam } from "@/lib/search";

/**
 * The audit log (docs/decisions.md 0132): what is recorded, and the list
 * contract of /admin/audit. Rows are written by the services
 * (src/server/audit/record.ts); this file is shared with the browser.
 */

/** Every recorded action. A new one needs a label (./labels.ts; its type requires one) and a writer. */
export const AUDIT_ACTIONS = [
	"role.create",
	"role.update",
	"role.delete",
	"role.permissions",
	"user.invite",
	"user.roles",
	"user.ban",
	"user.unban",
	"user.sessions-revoke",
	"user.impersonate",
	"user.impersonate-stop",
	"test-crud.publish",
	"test-crud.unpublish",
	"test-crud.delete",
	// @new-feature:audit-actions
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_TARGETS = [
	"role",
	"user",
	"test-crud",
	// @new-feature:audit-targets
] as const;
export type AuditTarget = (typeof AUDIT_TARGETS)[number];

/** A summarized field value: short, JSON, never a secret. */
export type AuditValue = string | number | boolean | null | string[];
export type AuditValues = Record<string, AuditValue>;

// ---------------------------------------------------------------------------
// List: URL search params == listAuditEvents input
// ---------------------------------------------------------------------------

export const AUDIT_ACTION_FILTERS = ["all", ...AUDIT_ACTIONS] as const;
export const AUDIT_TARGET_FILTERS = ["all", ...AUDIT_TARGETS] as const;
export const AUDIT_SORTS = ["-time", "time"] as const;
export const AUDIT_TABLE_ID = "admin-audit";

export const AUDIT_SEARCH_DEFAULTS = {
	q: "",
	actor: "",
	action: "all",
	target: "all",
	sort: "-time",
	page: 1,
} as const;

/**
 * Filters: `q` (the target's name or id, or a request id), `actor` (name or
 * email), the action, the target type and the day range (app time zone).
 */
export const auditSearchSchema = z.object({
	q: searchParam(),
	actor: searchParam(),
	action: enumParam(AUDIT_ACTION_FILTERS, AUDIT_SEARCH_DEFAULTS.action),
	target: enumParam(AUDIT_TARGET_FILTERS, AUDIT_SEARCH_DEFAULTS.target),
	from: dateParam(),
	to: dateParam(),
	sort: enumParam(AUDIT_SORTS, AUDIT_SEARCH_DEFAULTS.sort),
	page: pageParam(),
	pageSize: pageSizeParam(),
});
export type AuditSearch = z.output<typeof auditSearchSchema>;
export const auditListInputSchema = auditSearchSchema.extend({ pageSize: resolvedPageSize() });
export type AuditListInput = z.output<typeof auditListInputSchema>;

/** The filter keys (what "Clear all" resets; sort and page size are kept). */
export const AUDIT_FILTER_KEYS = ["q", "actor", "action", "target", "from", "to"] as const;

export type AuditEventItem = {
	id: string;
	action: AuditAction;
	/** The account that acted; `id` is null once it was deleted (name and email are then from the time). */
	actor: { id: string | null; name: string; email: string };
	/** The admin behind an impersonated session, when there was one. */
	impersonator: string | null;
	target: { type: AuditTarget; id: string; label: string };
	before: AuditValues | null;
	after: AuditValues | null;
	requestId: string | null;
	ip: string | null;
	createdAt: string;
};
export type AuditPage = Paged<AuditEventItem>;
