import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { DataTable, DataTableColumnsMenu, DataTableSkeleton } from "@/components/data-table";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { auditColumns } from "@/features/audit/components/audit-columns";
import {
	AUDIT_CLEAR_FILTERS,
	AuditActiveFilters,
	AuditFilterControls,
	auditFilterChips,
} from "@/features/audit/filters";
import { auditListQueryOptions } from "@/features/audit/queries";
import { AUDIT_SEARCH_DEFAULTS, AUDIT_TABLE_ID, auditSearchSchema } from "@/features/audit/schema";
import { loadList } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { tableListInput, useListPage } from "@/lib/use-list-page";
import { m } from "@/paraglide/messages";

/** The audit log: read only, newest first, filtered from the URL (decisions.md 0132). */
export const Route = createFileRoute("/_admin/admin/audit/")({
	validateSearch: auditSearchSchema,
	search: { middlewares: [stripSearchParams(AUDIT_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps, cause }) =>
		loadList(
			context.queryClient,
			auditListQueryOptions(tableListInput(deps, context.preferences.state, AUDIT_TABLE_ID)),
			cause,
		),
	head: () => ({ meta: [{ title: pageTitle(m.audit_title()) }] }),
	component: AuditPage,
});

function AuditPage() {
	const search = Route.useSearch();
	const { page, busy, pagination } = useListPage({ tableId: AUDIT_TABLE_ID, search, query: auditListQueryOptions });
	const columns = auditColumns();
	const filtered = auditFilterChips(search).length > 0;

	return (
		<Page width="admin">
			<PageHeader title={m.audit_title()} description={m.audit_description()} />
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<FilterBar values={search} preserve={["sort", "pageSize"]}>
						<AuditFilterControls search={search} />
					</FilterBar>
					<DataTableColumnsMenu tableId={AUDIT_TABLE_ID} columns={columns} />
				</div>
				<AuditActiveFilters search={search} />
			</div>

			{page && pagination ? (
				<>
					<DataTable
						tableId={AUDIT_TABLE_ID}
						rows={page.items}
						columns={columns}
						getRowId={(row) => row.id}
						getRowLabel={(row) => row.target.label || row.target.id}
						sort={search.sort}
						busy={busy}
						data-testid="audit-table"
						empty={
							<EmptyState
								description={m.audit_empty()}
								action={filtered ? <ClearFiltersButton clearAll={AUDIT_CLEAR_FILTERS} /> : null}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={5} rows={8} />
			)}
		</Page>
	);
}
