import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableColumnsMenu } from "@/components/data-table/columns-menu";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Demo, ExamplePage } from "@/features/dev/examples/example-page";
import { PRIORITY_LABELS } from "@/features/dev/examples/labels";
import { exampleKeys, exampleTasksQueryOptions } from "@/features/dev/examples/queries";
import { EXAMPLE_SEARCH_DEFAULTS, type ExampleTask, exampleTaskSearchSchema } from "@/features/dev/examples/schema";
import { deleteExampleTasks, resetExampleTasks, setExampleTasksDone } from "@/functions/examples";
import { useListQuery } from "@/hooks/use-list-query";
import { staticCrumb } from "@/lib/breadcrumbs";
import { formatDate, formatNumber } from "@/lib/i18n/intl";
import { loadList } from "@/lib/query";
import { privateHead } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/**
 * DataTable + bulk actions. The feature supplies only column definitions and
 * actions; the shared DataTable does the rest: sort links in the headers (the
 * URL's ?sort=), selection with a bulk bar, row menus, column visibility saved in
 * preferences. Writes are plain mutations that refresh the list afterwards (the
 * optimistic version is the next example).
 */
export const Route = createFileRoute("/_public/dev/examples/data-table")({
	validateSearch: exampleTaskSearchSchema,
	search: { middlewares: [stripSearchParams(EXAMPLE_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps, cause }) => loadList(context.queryClient, exampleTasksQueryOptions(deps), cause),
	staticData: { breadcrumb: staticCrumb(m.examples_table_title) },
	head: () => privateHead(m.examples_table_title()),
	component: DataTableExample,
});

const TABLE_ID = "examples-tasks";

/** Columns: defined once per feature (normally next to its schema), at render time for the locale. */
const columns = (): DataTableColumn<ExampleTask>[] => [
	{ id: "title", header: m.examples_task, sort: "title", cell: (task) => task.title, cellClassName: "font-medium" },
	{
		id: "priority",
		header: m.examples_priority,
		hideable: true,
		cell: (task) => <Badge variant="secondary">{PRIORITY_LABELS[task.priority]()}</Badge>,
	},
	{
		id: "status",
		header: m.examples_status,
		cell: (task) => (task.done ? m.examples_done() : m.examples_open()),
	},
	{
		id: "created",
		header: m.examples_created,
		sort: "created",
		hideable: true,
		cell: (task) => formatDate(task.createdAt, { dateStyle: "medium" }),
		cellClassName: "whitespace-nowrap",
	},
];

function DataTableExample() {
	const search = Route.useSearch();
	const { data, busy, error } = useListQuery(exampleTasksQueryOptions(search));
	const queryClient = useQueryClient();
	const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; clear: () => void } | null>(null);

	const refresh = () => queryClient.invalidateQueries({ queryKey: exampleKeys.tasks() });
	const onError = (failure: unknown) => toast.error(m.examples_failed(), { description: errorMessage(failure) });
	const setDone = useMutation({
		mutationFn: (input: { ids: string[]; done: boolean }) => setExampleTasksDone({ data: { ...input, fail: false } }),
		onSuccess: ({ updated }) => toast.success(m.examples_updated({ count: formatNumber(updated) })),
		onError,
		onSettled: refresh,
	});
	const remove = useMutation({
		mutationFn: (ids: string[]) => deleteExampleTasks({ data: { ids } }),
		onSuccess: ({ deleted }) => toast.success(m.examples_deleted({ count: formatNumber(deleted) })),
		onError,
		onSettled: refresh,
	});
	const reset = useMutation({ mutationFn: () => resetExampleTasks(), onSettled: refresh, onError });

	if (error && !data) throw error;
	if (!data) return null;
	const tableColumns = columns();
	return (
		<ExamplePage slug="data-table">
			<Demo title={m.examples_table_demo()} note={m.examples_table_note()}>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<DataTableColumnsMenu tableId={TABLE_ID} columns={tableColumns} />
					<Button variant="outline" size="sm" onClick={() => reset.mutate()} disabled={reset.isPending}>
						{m.examples_reset()}
					</Button>
				</div>
				<DataTable
					tableId={TABLE_ID}
					rows={data.items}
					columns={tableColumns}
					getRowId={(task) => task.id}
					getRowLabel={(task) => task.title}
					sort={search.sort}
					busy={busy || setDone.isPending || remove.isPending}
					empty={<EmptyState description={m.examples_no_results()} />}
					bulkActions={({ ids, clear }) => (
						<>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setDone.mutate({ ids, done: true }, { onSuccess: clear })}
							>
								{m.examples_mark_done()}
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setDone.mutate({ ids, done: false }, { onSuccess: clear })}
							>
								{m.examples_mark_open()}
							</Button>
							<Button size="sm" variant="destructive" onClick={() => setPendingDelete({ ids, clear })}>
								{m.examples_delete()}
							</Button>
						</>
					)}
					rowActions={(task) => (
						<>
							<DropdownMenuItem onSelect={() => setDone.mutate({ ids: [task.id], done: !task.done })}>
								{task.done ? m.examples_mark_open() : m.examples_mark_done()}
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onSelect={() => setPendingDelete({ ids: [task.id], clear: () => {} })}
							>
								{m.examples_delete()}
							</DropdownMenuItem>
						</>
					)}
					data-testid="example-table"
				/>
				<Pagination page={data.page} pageCount={data.pageCount} total={data.total} hideWhenSingle />
			</Demo>
			<ConfirmDialog
				open={pendingDelete !== null}
				title={m.examples_delete_title({ count: formatNumber(pendingDelete?.ids.length ?? 0) })}
				description={m.examples_delete_body()}
				confirmLabel={m.examples_delete()}
				destructive
				onCancel={() => setPendingDelete(null)}
				onConfirm={() => {
					if (!pendingDelete) return;
					remove.mutate(pendingDelete.ids, { onSuccess: pendingDelete.clear });
					setPendingDelete(null);
				}}
			/>
		</ExamplePage>
	);
}
