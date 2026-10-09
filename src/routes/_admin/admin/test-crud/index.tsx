import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumnsMenu, DataTableSkeleton } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testCrudPageCollection } from "@/features/test-crud/collection";
import { testCrudColumns } from "@/features/test-crud/components/admin-columns";
import { STATUS_FILTER_LABELS } from "@/features/test-crud/labels";
import { testCrudListQueryOptions } from "@/features/test-crud/queries";
import {
	TEST_CRUD_SEARCH_DEFAULTS,
	TEST_CRUD_STATUS_FILTERS,
	TEST_CRUD_TABLE_ID,
	type TestCrudListInput,
	type TestCrudListItem,
	type TestCrudSearch,
	type TestCrudStatus,
	type TestCrudStatusFilter,
	testCrudSearchSchema,
} from "@/features/test-crud/schema";
import { formatNumber } from "@/lib/intl";
import { pageTitle } from "@/lib/seo";
import { useTablePreferences } from "@/lib/stores/hooks";
import { PAGE_SIZES, type Preferences } from "@/lib/stores/preferences";
import { m } from "@/paraglide/messages";

const DEFAULT_PAGE_SIZE = 20;

/** The list input: URL search, with the page size falling back to the saved table preference. */
const listInput = (search: TestCrudSearch, savedPageSize: number | undefined): TestCrudListInput => ({
	...search,
	pageSize: search.pageSize ?? savedPageSize ?? DEFAULT_PAGE_SIZE,
});

const savedPageSize = (preferences: Preferences) => preferences.tables[TEST_CRUD_TABLE_ID]?.pageSize;

export const Route = createFileRoute("/_admin/admin/test-crud/")({
	validateSearch: testCrudSearchSchema,
	// Default values stay out of generated links, so URLs stay short.
	search: { middlewares: [stripSearchParams(TEST_CRUD_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps }) =>
		// Awaited, so the page is in the SSR HTML and hydrates the Query cache
		// (which is also the TanStack DB collection's initial state).
		context.queryClient.ensureQueryData(
			testCrudListQueryOptions(listInput(deps, savedPageSize(context.preferences.state))),
		),
	head: () => ({ meta: [{ title: pageTitle(m.test_crud_title()) }] }),
	pendingComponent: TestCrudAdminPending,
	component: TestCrudAdminPage,
});

const isStatusFilter = (value: string): value is TestCrudStatusFilter =>
	(TEST_CRUD_STATUS_FILTERS as ReadonlyArray<string>).includes(value);

/** What the user asked to delete: one row (named in the dialog) or a selection. */
type DeleteRequest = { ids: string[]; title?: string; done?: () => void };

/** A component, not a constant: messages must be read at render time (per request locale). */
function NewItemButton() {
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
	const { data: page } = useSuspenseQuery(testCrudListQueryOptions(input));

	// TanStack DB collection over this page; rows render from it so optimistic
	// changes (and rollbacks) show immediately. Until it's ready (SSR, first
	// paint) the identical Query rows are used, so hydration matches.
	const dbClient = useDbClient();
	const inputKey = JSON.stringify(input);
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the serialized input; the object is new every render.
	const collection = useMemo(() => dbClient.collection(testCrudPageCollection(input)), [dbClient, inputKey]);
	const live = useLiveQuery({ query: (q) => q.from({ item: collection }) });
	const rows = useMemo(() => {
		if (!live.isReady) return page.items;
		return page.items.flatMap((item) => {
			const current = live.state.get(item.id);
			return current ? [current] : [];
		});
	}, [live.isReady, live.state, page.items]);

	const [pendingDelete, setPendingDelete] = useState<DeleteRequest | null>(null);

	const reportFailure = (error: unknown) =>
		toast.error(m.test_crud_toast_failed(), { description: errorMessage(error) });

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

	// Without JS the search form is a plain GET to this URL; with JS it navigates.
	const onSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const q = String(new FormData(event.currentTarget).get("q") ?? "");
		void navigate({ search: (prev) => ({ ...prev, q, page: 1 }) });
	};
	const filtered = search.q !== "" || search.status !== "all";
	const single = pendingDelete?.ids.length === 1 && pendingDelete.title !== undefined;

	return (
		<Page width="admin">
			<PageHeader
				title={m.test_crud_title()}
				description={m.test_crud_admin_description()}
				actions={<NewItemButton />}
			/>

			<div className="flex flex-wrap items-end gap-3">
				<search className="w-full sm:w-auto">
					<form onSubmit={onSearch} className="flex w-full items-end gap-2 sm:w-auto">
						<div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-none">
							<Label htmlFor="test-crud-q">{m.test_crud_search_label()}</Label>
							<Input
								id="test-crud-q"
								name="q"
								type="search"
								defaultValue={search.q}
								key={search.q}
								placeholder={m.test_crud_search_placeholder()}
								className="w-full sm:w-64"
							/>
						</div>
						<Button type="submit" variant="secondary">
							{m.test_crud_search_submit()}
						</Button>
					</form>
				</search>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="test-crud-status">{m.test_crud_filter_status()}</Label>
					<Select
						value={search.status}
						onValueChange={(value) => {
							if (!isStatusFilter(value)) return;
							void navigate({ search: (prev) => ({ ...prev, status: value, page: 1 }) });
						}}
					>
						<SelectTrigger id="test-crud-status" className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TEST_CRUD_STATUS_FILTERS.map((status) => (
								<SelectItem key={status} value={status}>
									{STATUS_FILTER_LABELS[status]()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DataTableColumnsMenu tableId={TEST_CRUD_TABLE_ID} columns={testCrudColumns} className="ms-auto" />
			</div>

			<DataTable
				tableId={TEST_CRUD_TABLE_ID}
				rows={rows}
				columns={testCrudColumns}
				getRowId={(row) => row.id}
				getRowLabel={(row) => row.title}
				sort={search.sort}
				data-testid="test-crud-table"
				bulkActions={({ ids, clear }) => (
					<Button variant="destructive" size="sm" onClick={() => setPendingDelete({ ids, done: clear })}>
						{m.test_crud_delete_selected()}
					</Button>
				)}
				rowActions={(row) => (
					<>
						<DropdownMenuItem asChild>
							<Link to="/admin/test-crud/$id" params={{ id: row.id }}>
								{m.test_crud_edit()}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => setStatus(row, row.status === "published" ? "draft" : "published")}>
							{row.status === "published" ? m.test_crud_unpublish() : m.test_crud_publish()}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => setPendingDelete({ ids: [row.id], title: row.title })}
						>
							{m.test_crud_delete()}
						</DropdownMenuItem>
					</>
				)}
				empty={
					<EmptyState
						data-testid="empty"
						description={filtered ? m.test_crud_empty_filtered() : m.test_crud_empty()}
						action={
							filtered ? (
								<Button variant="outline" asChild>
									<Link to="/admin/test-crud" search={{ pageSize: search.pageSize }}>
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
						void navigate({ search: (prev) => ({ ...prev, pageSize: size, page: 1 }) });
					},
				}}
			/>

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
		</Page>
	);
}

/** Same layout as the page while a client-side navigation (filter, sort, page) loads. */
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
