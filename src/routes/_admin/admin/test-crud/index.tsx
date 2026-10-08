import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { Columns3Icon, PlusIcon } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/components/errors/error-page";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testCrudPageCollection } from "@/features/test-crud/collection";
import { DeleteDialog, type DeleteRequest } from "@/features/test-crud/components/delete-dialog";
import {
	COLUMN_LABELS,
	HIDEABLE_COLUMNS,
	STATUS_LABELS,
	TestCrudTable,
} from "@/features/test-crud/components/test-crud-table";
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
	component: TestCrudAdminPage,
});

const STATUS_FILTER_LABELS: Record<TestCrudStatusFilter, () => string> = {
	all: m.test_crud_status_all,
	...STATUS_LABELS,
};

const isStatusFilter = (value: string): value is TestCrudStatusFilter =>
	(TEST_CRUD_STATUS_FILTERS as ReadonlyArray<string>).includes(value);

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

	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [pendingDelete, setPendingDelete] = useState<DeleteRequest | null>(null);
	const selectedOnPage = rows.filter((row) => selected.has(row.id)).map((row) => row.id);

	const reportFailure = (error: unknown) =>
		toast.error(m.test_crud_toast_failed(), { description: errorMessage(error) });

	const confirmDelete = ({ ids }: DeleteRequest) => {
		setPendingDelete(null);
		setSelected(new Set());
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
		setSelected(new Set());
		void navigate({ search: (prev) => ({ ...prev, q, page: 1 }) });
	};
	const filtered = search.q !== "" || search.status !== "all";

	return (
		<main className="flex flex-col gap-6 px-4 py-8 sm:px-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-2xl tracking-tight">{m.test_crud_title()}</h1>
					<p className="text-muted-foreground text-sm">{m.test_crud_admin_description()}</p>
				</div>
				<Button asChild>
					<Link to="/admin/test-crud/new">
						<PlusIcon aria-hidden />
						{m.test_crud_new()}
					</Link>
				</Button>
			</header>

			<div className="flex flex-wrap items-end gap-3">
				<search>
					<form onSubmit={onSearch} className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="test-crud-q">{m.test_crud_search_label()}</Label>
							<Input
								id="test-crud-q"
								name="q"
								type="search"
								defaultValue={search.q}
								key={search.q}
								placeholder={m.test_crud_search_placeholder()}
								className="w-64"
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
							setSelected(new Set());
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
				{/* Non-modal: a small menu shouldn't aria-hide the page (it closes on Escape or outside click). */}
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ms-auto">
							<Columns3Icon aria-hidden />
							{m.test_crud_columns()}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>{m.test_crud_columns()}</DropdownMenuLabel>
						{HIDEABLE_COLUMNS.map((column) => (
							<DropdownMenuCheckboxItem
								key={column}
								checked={table.isColumnVisible(column)}
								onCheckedChange={(checked) => table.setColumnVisible(column, checked === true)}
								onSelect={(event) => event.preventDefault()}
							>
								{COLUMN_LABELS[column]()}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{selectedOnPage.length > 0 ? (
				<div
					className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm"
					data-testid="bulk-bar"
				>
					<span aria-live="polite">{m.test_crud_selected({ count: formatNumber(selectedOnPage.length) })}</span>
					<Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
						{m.test_crud_clear_selection()}
					</Button>
					<Button
						variant="destructive"
						size="sm"
						className="ms-auto"
						onClick={() => setPendingDelete({ ids: selectedOnPage })}
					>
						{m.test_crud_delete_selected()}
					</Button>
				</div>
			) : null}

			{rows.length === 0 ? (
				<div
					className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center"
					data-testid="empty"
				>
					<p className="text-muted-foreground">{filtered ? m.test_crud_empty_filtered() : m.test_crud_empty()}</p>
					{filtered ? (
						<Button variant="outline" asChild>
							<Link to="/admin/test-crud" search={{ pageSize: search.pageSize }}>
								{m.test_crud_clear_filters()}
							</Link>
						</Button>
					) : (
						<Button asChild>
							<Link to="/admin/test-crud/new">{m.test_crud_new()}</Link>
						</Button>
					)}
				</div>
			) : (
				<TestCrudTable
					rows={rows}
					sort={search.sort}
					sortLink={(sort, label) => (
						<Link
							from={Route.fullPath}
							search={(prev) => ({ ...prev, sort, page: 1 })}
							className="font-medium hover:underline"
						>
							{label}
						</Link>
					)}
					isVisible={table.isColumnVisible}
					selected={selected}
					onSelectedChange={setSelected}
					onDelete={(row) => setPendingDelete({ ids: [row.id], title: row.title })}
					onSetStatus={setStatus}
				/>
			)}

			<Pagination
				search={search}
				page={page.page}
				pageCount={page.pageCount}
				total={page.total}
				pageSize={input.pageSize}
				onPageSize={(size) => {
					table.setPageSize(size);
					setSelected(new Set());
					void navigate({ search: (prev) => ({ ...prev, pageSize: size, page: 1 }) });
				}}
			/>

			<DeleteDialog request={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
		</main>
	);
}

function Pagination({
	search,
	page,
	pageCount,
	total,
	pageSize,
	onPageSize,
}: {
	search: TestCrudSearch;
	page: number;
	pageCount: number;
	total: number;
	pageSize: number;
	onPageSize: (size: number) => void;
}) {
	const link =
		"inline-flex h-9 items-center rounded-md border px-3 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50";
	return (
		<nav aria-label={m.test_crud_pagination()} className="flex flex-wrap items-center gap-3 text-sm">
			<span className="text-muted-foreground">{m.test_crud_total({ count: formatNumber(total) })}</span>
			<div className="ms-auto flex items-center gap-2">
				<Label htmlFor="test-crud-page-size" className="font-normal text-muted-foreground">
					{m.test_crud_page_size()}
				</Label>
				<Select value={String(pageSize)} onValueChange={(value) => onPageSize(Number(value))}>
					<SelectTrigger id="test-crud-page-size" className="w-20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZES.map((size) => (
							<SelectItem key={size} value={String(size)}>
								{formatNumber(size)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<span>{m.test_crud_page_of({ page: formatNumber(page), count: formatNumber(pageCount) })}</span>
			<Link
				from={Route.fullPath}
				search={{ ...search, page: Math.max(1, page - 1) }}
				className={link}
				aria-disabled={page <= 1 || undefined}
				tabIndex={page <= 1 ? -1 : undefined}
			>
				{m.test_crud_prev()}
			</Link>
			<Link
				from={Route.fullPath}
				search={{ ...search, page: Math.min(pageCount, page + 1) }}
				className={link}
				aria-disabled={page >= pageCount || undefined}
				tabIndex={page >= pageCount ? -1 : undefined}
			>
				{m.test_crud_next()}
			</Link>
		</nav>
	);
}
