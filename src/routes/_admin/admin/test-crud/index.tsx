import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumnsMenu, DataTableSkeleton } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { FilterBar } from "@/components/filters/filter-bar";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCan, usePermissions } from "@/features/rbac/can";
import type { Permission } from "@/features/rbac/permissions";
import { testCrudPageCollection } from "@/features/test-crud/collection";
import { testCrudColumns } from "@/features/test-crud/components/admin-columns";
import { TestCrudEditDialog } from "@/features/test-crud/components/edit-dialog";
import { EditItemLink } from "@/features/test-crud/components/masked-links";
import {
	TEST_CRUD_CLEAR_FILTERS,
	TestCrudActiveFilters,
	TestCrudFilterControls,
	testCrudFilterChips,
} from "@/features/test-crud/filters";
import { testCrudListQueryOptions, testCrudTagsQueryOptions } from "@/features/test-crud/queries";
import {
	TEST_CRUD_SEARCH_DEFAULTS,
	TEST_CRUD_TABLE_ID,
	type TestCrudListInput,
	type TestCrudListItem,
	type TestCrudSearch,
	type TestCrudStatus,
	testCrudAdminRouteSearchSchema,
} from "@/features/test-crud/schema";
import { formatNumber } from "@/lib/intl";
import { loadList } from "@/lib/query";
import { pageTitle } from "@/lib/seo";
import { useTablePreferences } from "@/lib/stores/hooks";
import { PAGE_SIZES, type Preferences } from "@/lib/stores/preferences";
import { useListQuery } from "@/lib/use-list-query";
import { m } from "@/paraglide/messages";

const DEFAULT_PAGE_SIZE = 20;

/** The list input: the list params of the URL (not `edit`), page size falling back to the saved preference. */
const listInput = ({ edit: _edit, ...search }: TestCrudSearch & { edit?: string }, savedPageSize: number | undefined) =>
	({ ...search, pageSize: search.pageSize ?? savedPageSize ?? DEFAULT_PAGE_SIZE }) satisfies TestCrudListInput;

const savedPageSize = (preferences: Preferences) => preferences.tables[TEST_CRUD_TABLE_ID]?.pageSize;

export const Route = createFileRoute("/_admin/admin/test-crud/")({
	validateSearch: testCrudAdminRouteSearchSchema,
	// Default values stay out of generated links, so URLs stay short.
	search: { middlewares: [stripSearchParams(TEST_CRUD_SEARCH_DEFAULTS)] },
	// `edit` only opens a dialog: changing it must not reload the list.
	loaderDeps: ({ search: { edit: _edit, ...list } }) => list,
	loader: async ({ context, deps, cause }) => {
		// SSR / entering: awaited, so the rows are in the HTML and hydrate the Query cache
		// (also the TanStack DB collection's initial state). Filter changes: see loadList.
		await Promise.all([
			loadList(
				context.queryClient,
				testCrudListQueryOptions(listInput(deps, savedPageSize(context.preferences.state))),
				cause,
			),
			context.queryClient.ensureQueryData(testCrudTagsQueryOptions()),
		]);
	},
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_title()) }] }),
	pendingComponent: TestCrudAdminPending,
	component: TestCrudAdminPage,
});

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

function TestCrudAdminPage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const table = useTablePreferences(TEST_CRUD_TABLE_ID, { pageSize: DEFAULT_PAGE_SIZE });
	const input = listInput(search, table.pageSize);
	const { data: page, busy, error } = useListQuery(testCrudListQueryOptions(input));
	const { data: tags = [] } = useListQuery(testCrudTagsQueryOptions());
	if (error && !page) throw error;

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

			{page ? (
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
								action={
									filtered ? (
										<Button variant="outline" asChild>
											<Link
												from={Route.fullPath}
												search={(prev) => ({ ...prev, ...TEST_CRUD_CLEAR_FILTERS, page: undefined })}
											>
												{m.test_crud_clear_filters()}
											</Link>
										</Button>
									) : (
										<NewItemButton />
									)
								}
							/>
						}
					/>
					<Pagination
						page={page.page}
						pageCount={page.pageCount}
						total={page.total}
						pageSize={{
							value: input.pageSize,
							options: PAGE_SIZES,
							onChange: (size) => {
								table.setPageSize(size);
								void navigate({ search: (prev) => ({ ...prev, pageSize: size, page: undefined }) });
							},
						}}
					/>
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

			{search.edit && can("test-crud:update") ? <TestCrudEditDialog id={search.edit} /> : null}
		</Page>
	);
}

/** Same layout as the page while entering it takes long (filter changes keep the page instead). */
function TestCrudAdminPending() {
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
