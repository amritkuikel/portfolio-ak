import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { DataTable, DataTableSkeleton, type RowAction } from "@/components/data-table";
import { useConfirm } from "@/components/dialogs/confirm";
import { errorMessage } from "@/components/errors/error-page";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { useCan } from "@/features/rbac/can";
import { useListPage } from "@/hooks/use-list-page";
import { useListQuery } from "@/hooks/use-list-query";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { testCrudPageCollection } from "../collection";
import {
	TEST_CRUD_CLEAR_FILTERS,
	TestCrudActiveFilters,
	TestCrudFilterControls,
	testCrudFilterChips,
} from "../filters";
import { testCrudListQueryOptions, testCrudTagsQueryOptions } from "../queries";
import { TEST_CRUD_TABLE_ID, type TestCrudListItem, type TestCrudStatus } from "../schema";
import type { TestCrudAdminRouteSearch } from "../search";
import { testCrudColumns } from "./admin-columns";
import { TestCrudEditDialog } from "./edit-dialog";
import { EditItemLink } from "./masked-links";

/**
 * The admin list page (/admin/test-crud): filters, the table with row and bulk
 * actions (optimistic through a TanStack DB collection), pagination, the delete
 * confirmation and the masked edit dialog. The route file only loads data and
 * passes the search in.
 */

/** A component, not a constant: messages must be read at render time (per request locale). Needs test-crud:create. */
function NewItemButton() {
	if (!useCan("test-crud:create")) return null;
	return (
		<Button asChild>
			<Link to="/admin/test-crud/new">
				<PlusIcon aria-hidden />
				{m.test_crud_new()}
			</Link>
		</Button>
	);
}

export function TestCrudAdminList({ search }: { search: TestCrudAdminRouteSearch }) {
	// `edit` only opens the dialog; the rest is the list's input.
	const { edit, ...listSearch } = search;
	const { input, page, busy, pagination } = useListPage({
		tableId: TEST_CRUD_TABLE_ID,
		search: listSearch,
		query: testCrudListQueryOptions,
	});
	const { data: tags = [] } = useListQuery(testCrudTagsQueryOptions());

	// TanStack DB collection over this page; rows render from it so optimistic
	// changes (and rollbacks) show immediately. Until it's ready (SSR, first
	// paint) the identical Query rows are used, so hydration matches. While a new
	// filter loads, the previous page's rows stay on screen (busy).
	const dbClient = useDbClient();
	const inputKey = JSON.stringify(input);
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the serialized input; the object is new every render.
	const collection = useMemo(() => dbClient.collection(testCrudPageCollection(input)), [dbClient, inputKey]);
	const live = useLiveQuery({ query: (q) => q.from({ item: collection }) });
	const items = page?.items;
	const rows = useMemo(() => {
		if (!items) return [];
		if (busy || !live.isReady) return items;
		return items.flatMap((item) => {
			const current = live.state.get(item.id);
			return current ? [current] : [];
		});
	}, [busy, live.isReady, live.state, items]);

	const confirm = useConfirm();
	const reportFailure = (failure: unknown) =>
		toast.error(m.test_crud_toast_failed(), { description: errorMessage(failure) });

	/** One row (named in the dialog) or a selection; `done` clears the selection once confirmed. */
	const deleteItems = async (ids: string[], title?: string, done?: () => void) => {
		const single = ids.length === 1 && title !== undefined;
		const confirmed = await confirm({
			destructive: true,
			title: single ? m.test_crud_delete_title() : m.test_crud_bulk_delete_title({ count: formatNumber(ids.length) }),
			description: single ? m.test_crud_delete_body({ title }) : m.test_crud_bulk_delete_body(),
			confirmLabel: m.test_crud_confirm_delete(),
		});
		if (!confirmed) return;
		done?.();
		const tx = collection.delete(ids);
		tx.isPersisted.promise.then(
			() =>
				toast.success(
					ids.length === 1
						? m.test_crud_toast_deleted()
						: m.test_crud_toast_bulk_deleted({ count: formatNumber(ids.length) }),
				),
			reportFailure,
		);
	};

	const setStatus = (row: TestCrudListItem, status: TestCrudStatus) => {
		const tx = collection.update(row.id, (draft) => {
			draft.status = status;
		});
		tx.isPersisted.promise.then(
			() => toast.success(status === "published" ? m.test_crud_toast_published() : m.test_crud_toast_unpublished()),
			reportFailure,
		);
	};

	// What this user may do (the server checks each action again); row actions carry their own permission.
	const canDelete = useCan("test-crud:delete");
	const canEdit = useCan("test-crud:update");
	const rowActions = (row: TestCrudListItem): RowAction[] => [
		{
			id: "edit-dialog",
			label: m.test_crud_edit_in_dialog(),
			permission: "test-crud:update",
			render: (label) => <EditItemLink id={row.id}>{label}</EditItemLink>,
		},
		{
			id: "edit",
			label: m.test_crud_edit(),
			permission: "test-crud:update",
			render: (label) => (
				<Link to="/admin/test-crud/$id" params={{ id: row.id }}>
					{label}
				</Link>
			),
		},
		{
			id: "publish",
			label: row.status === "published" ? m.test_crud_unpublish() : m.test_crud_publish(),
			permission: "test-crud:publish",
			onSelect: () => setStatus(row, row.status === "published" ? "draft" : "published"),
		},
		{
			id: "delete",
			label: m.test_crud_delete(),
			permission: "test-crud:delete",
			destructive: true,
			separated: true,
			onSelect: () => void deleteItems([row.id], row.title),
		},
	];

	const filtered = testCrudFilterChips(search).length > 0;

	return (
		<Page width="admin">
			<PageHeader
				title={m.test_crud_title()}
				description={m.test_crud_admin_description()}
				actions={<NewItemButton />}
			/>

			{page && pagination ? (
				<>
					<DataTable
						tableId={TEST_CRUD_TABLE_ID}
						rows={rows}
						columns={testCrudColumns}
						getRowId={(row) => row.id}
						getRowLabel={(row) => row.title}
						sort={search.sort}
						busy={busy}
						data-testid="test-crud-table"
						toolbar={
							<FilterBar values={search} preserve={["sort", "pageSize"]}>
								<TestCrudFilterControls search={search} tags={tags} />
							</FilterBar>
						}
						activeFilters={<TestCrudActiveFilters search={search} />}
						exportName="test-crud"
						savedViews
						bulkActions={
							canDelete
								? ({ ids, clear }) => (
										<Button variant="destructive" size="sm" onClick={() => void deleteItems(ids, undefined, clear)}>
											{m.test_crud_delete_selected()}
										</Button>
									)
								: undefined
						}
						rowActions={rowActions}
						empty={
							<EmptyState
								data-testid="empty"
								variant={filtered ? "no-matches" : "empty"}
								description={filtered ? m.test_crud_empty_filtered() : m.test_crud_empty()}
								primaryAction={filtered ? <ClearFiltersButton clearAll={TEST_CRUD_CLEAR_FILTERS} /> : <NewItemButton />}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={5} rows={8} />
			)}

			{edit && canEdit ? <TestCrudEditDialog id={edit} /> : null}
		</Page>
	);
}

/** Same layout as the page while entering it takes long (filter changes keep the page instead). */
export function TestCrudAdminPending() {
	return (
		<Page width="admin">
			<PageHeader
				title={m.test_crud_title()}
				description={m.test_crud_admin_description()}
				actions={<NewItemButton />}
			/>
			<DataTableSkeleton columns={5} rows={8} />
		</Page>
	);
}
