import { createFileRoute } from "@tanstack/react-router";
import { AuditList } from "@/features/audit/components/audit-list";
import { auditListQueryOptions } from "@/features/audit/queries";
import { AUDIT_TABLE_ID, auditList } from "@/features/audit/search";
import { listLoader, listSearch, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/audit/")({
	...listSearch(auditList.search, auditList.defaults),
	loaderDeps: ({ search }) => search,
	loader: (route) => listLoader(route, { tableId: AUDIT_TABLE_ID, query: auditListQueryOptions }),
	head: titleHead(m.audit_title),
	component: AuditList,
});
