import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumnsMenu, DataTableSkeleton } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCan, usePermissions } from "@/features/rbac/can";
import type { Permission } from "@/features/rbac/permissions";
import { formatNumber } from "@/lib/intl";
import { useListPage } from "@/lib/use-list-page";
import { useListQuery } from "@/lib/use-list-query";
import { m } from "@/paraglide/messages";
import { testCrudPageCollection } from "../collection";
import {
	TEST_CRUD_CLEAR_FILTERS,
	TestCrudActiveFilters,
	TestCrudFilterControls,
	testCrudFilterChips,
} from "../filters";
import { testCrudListQueryOptions, testCrudTagsQueryOptions } from "../queries";
import {
	TEST_CRUD_TABLE_ID,
	type TestCrudAdminRouteSearch,
	type TestCrudListItem,
	type TestCrudStatus,
} from "../schema";
import { testCrudColumns } from "./admin-columns";
import { TestCrudEditDialog } from "./edit-dialog";
import { EditItemLink } from "./masked-links";

/**
 * The admin list page (/admin/test-crud): filters, the table with row and bulk
 * actions (optimistic through a TanStack DB collection), pagination, the delete
 * confirmation and the masked edit dialog. The route file only loads data and
 * passes the search in.
 */

/** What the user asked to delete: one row (named in the dialog) or a selection. */
type DeleteRequest = { ids: string[]; title?: string; done?: () => void };

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

	const [pendingDelete, setPendingDelete] = useState<DeleteRequest | null>(null);

	const reportFailure = (failure: unknown) =>
		toast.error(m.test_crud_toast_failed(), { description: errorMessage(failure) });

	const confirmDelete = () => {
		if (!pendingDelete) return;
		const { ids, done } = pendingDelete;
		setPendingDelete(null);
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

	// What this user may do (the server checks each action again).
	const permissions = usePermissions();
	const can = (permission: Permission) => permissions.includes(permission);
	const canChangeRows = can("test-crud:update") || can("test-crud:publish") || can("test-crud:delete");

	const filtered = testCrudFilterChips(search).length > 0;
	const single = pendingDelete?.ids.length === 1 && pendingDelete.title !== undefined;

	return (
		<Page width="admin">
			<PageHeader
				title={m.test_crud_title()}
				description={m.test_crud_admin_description()}
				actions={<NewItemButton />}
			/>

			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<FilterBar values={search} preserve={["sort", "pageSize"]}>
						<TestCrudFilterControls search={search} tags={tags} />
					</FilterBar>
					<DataTableColumnsMenu tableId={TEST_CRUD_TABLE_ID} columns={testCrudColumns} />
				</div>
				<TestCrudActiveFilters search={search} />
			</div>

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
						bulkActions={
							can("test-crud:delete")
								? ({ ids, clear }) => (
										<Button variant="destructive" size="sm" onClick={() => setPendingDelete({ ids, done: clear })}>
											{m.test_crud_delete_selected()}
										</Button>
									)
								: undefined
						}
						rowActions={
							canChangeRows
								? (row) => (
										<>
											{can("test-crud:update") ? (
												<>
													<DropdownMenuItem asChild>
														<EditItemLink id={row.id}>{m.test_crud_edit_in_dialog()}</EditItemLink>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link to="/admin/test-crud/$id" params={{ id: row.id }}>
															{m.test_crud_edit()}
														</Link>
													</DropdownMenuItem>
												</>
											) : null}
											{can("test-crud:publish") ? (
												<DropdownMenuItem
													onSelect={() => setStatus(row, row.status === "published" ? "draft" : "published")}
												>
													{row.status === "published" ? m.test_crud_unpublish() : m.test_crud_publish()}
												</DropdownMenuItem>
											) : null}
											{can("test-crud:delete") ? (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onSelect={() => setPendingDelete({ ids: [row.id], title: row.title })}
													>
														{m.test_crud_delete()}
													</DropdownMenuItem>
												</>
											) : null}
										</>
									)
								: undefined
						}
						empty={
							<EmptyState
								data-testid="empty"
								description={filtered ? m.test_crud_empty_filtered() : m.test_crud_empty()}
								action={filtered ? <ClearFiltersButton clearAll={TEST_CRUD_CLEAR_FILTERS} /> : <NewItemButton />}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={5} rows={8} />
			)}

			<ConfirmDialog
				open={pendingDelete !== null}
				destructive
				title={
					single
						? m.test_crud_delete_title()
						: m.test_crud_bulk_delete_title({ count: formatNumber(pendingDelete?.ids.length ?? 0) })
				}
				description={
					single ? m.test_crud_delete_body({ title: pendingDelete?.title ?? "" }) : m.test_crud_bulk_delete_body()
				}
				confirmLabel={m.test_crud_confirm_delete()}
				onConfirm={confirmDelete}
				onCancel={() => setPendingDelete(null)}
			/>

			{edit && can("test-crud:update") ? <TestCrudEditDialog id={edit} /> : null}
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
