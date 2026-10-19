import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams, useLocation, useNavigate } from "@tanstack/react-router";
import { DownloadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { errorMessage } from "@/components/errors/error-page";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchFilter } from "@/components/filters/filters";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Demo, ExamplePage } from "@/features/dev/examples/example-page";
import { exampleKeys, exampleTasksQueryOptions } from "@/features/dev/examples/queries";
import { EXAMPLE_SEARCH_DEFAULTS, type ExampleTask, exampleTaskSearchSchema } from "@/features/dev/examples/schema";
import { deleteExampleTasks } from "@/functions/examples";
import { staticCrumb } from "@/lib/breadcrumbs";
import { downloadCsv, toCsv } from "@/lib/csv";
import { loadList } from "@/lib/query";
import { privateHead } from "@/lib/seo";
import { useListQuery } from "@/lib/use-list-query";
import { m } from "@/paraglide/messages";

/**
 * Recipes for lists (docs/guides/recipes.md): CSV export of what the table
 * shows, delete with an undo toast, and saved views (named search strings).
 *
 * - CSV: the same columns as the table, through toCsv (src/lib/csv.ts).
 * - Undo: the row disappears at once and the delete is only sent when the
 *   toast closes without "Undo". (For undo after the request, soft delete:
 *   a `deleted_at` column, a restore function, and lists that skip deleted rows.)
 * - Saved views: the URL is the list's state, so a view is its search string.
 *   Stored in localStorage here (per browser); a table with the user id makes them follow the user.
 */
export const Route = createFileRoute("/_public/dev/examples/list-extras")({
	validateSearch: exampleTaskSearchSchema,
	search: { middlewares: [stripSearchParams(EXAMPLE_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: ({ context, deps, cause }) => loadList(context.queryClient, exampleTasksQueryOptions(deps), cause),
	staticData: { breadcrumb: staticCrumb(m.examples_extras_title) },
	head: () => privateHead(m.examples_extras_title()),
	component: ListExtrasExample,
});

const UNDO_MS = 5000;
const VIEWS_KEY = "examples:saved-views";
type SavedView = { name: string; search: string };

const columns = (): DataTableColumn<ExampleTask>[] => [
	{ id: "title", header: m.examples_task, cell: (task) => task.title, cellClassName: "font-medium" },
	{ id: "status", header: m.examples_status, cell: (task) => (task.done ? m.examples_done() : m.examples_open()) },
];

const readViews = (): SavedView[] => {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(VIEWS_KEY) ?? "[]");
		return Array.isArray(parsed) ? parsed.filter((view): view is SavedView => typeof view?.name === "string") : [];
	} catch {
		return [];
	}
};
const writeViews = (views: SavedView[]) => {
	try {
		localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
	} catch {
		// Storage can be unavailable (privacy mode); the views just aren't kept.
	}
};

function ListExtrasExample() {
	const search = Route.useSearch();
	const { data } = useListQuery(exampleTasksQueryOptions(search));
	const queryClient = useQueryClient();
	const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
	const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
	useEffect(() => {
		const pending = timers.current;
		return () => {
			for (const timer of pending.values()) clearTimeout(timer);
		};
	}, []);

	const remove = useMutation({
		mutationFn: (id: string) => deleteExampleTasks({ data: { ids: [id] } }),
		onSettled: () => queryClient.invalidateQueries({ queryKey: exampleKeys.tasks() }),
		onError: (error) => toast.error(m.examples_failed(), { description: errorMessage(error) }),
	});

	const show = (id: string, visible: boolean) =>
		setHidden((current) => {
			const next = new Set(current);
			if (visible) next.delete(id);
			else next.add(id);
			return next;
		});

	const deleteWithUndo = (task: ExampleTask) => {
		show(task.id, false);
		timers.current.set(
			task.id,
			setTimeout(() => {
				timers.current.delete(task.id);
				remove.mutate(task.id);
			}, UNDO_MS),
		);
		toast(m.examples_extras_deleted({ title: task.title }), {
			duration: UNDO_MS,
			action: {
				label: m.examples_extras_undo(),
				onClick: () => {
					clearTimeout(timers.current.get(task.id));
					timers.current.delete(task.id);
					show(task.id, true);
				},
			},
		});
	};

	const rows = (data?.items ?? []).filter((task) => !hidden.has(task.id));
	const exportCsv = () =>
		downloadCsv(
			"tasks.csv",
			toCsv(rows, [
				{ header: m.examples_task(), value: (task) => task.title },
				{ header: m.examples_status(), value: (task) => (task.done ? m.examples_done() : m.examples_open()) },
				{ header: m.examples_created(), value: (task) => task.createdAt },
			]),
		);

	return (
		<ExamplePage slug="list-extras">
			<Demo title={m.examples_extras_table()} note={m.examples_extras_table_note()}>
				<div className="flex flex-wrap items-end justify-between gap-3">
					<FilterBar values={search} preserve={["sort"]}>
						<SearchFilter label={m.examples_search()} value={search.q} placeholder={m.examples_search_placeholder()} />
					</FilterBar>
					<Button variant="outline" onClick={exportCsv} data-testid="export-csv">
						<DownloadIcon aria-hidden />
						{m.examples_extras_export()}
					</Button>
				</div>
				<DataTable
					tableId="examples-extras"
					rows={rows}
					columns={columns()}
					getRowId={(task) => task.id}
					getRowLabel={(task) => task.title}
					rowActions={(task) => (
						<DropdownMenuItem variant="destructive" onSelect={() => deleteWithUndo(task)}>
							{m.examples_extras_delete()}
						</DropdownMenuItem>
					)}
				/>
			</Demo>
			<SavedViews />
		</ExamplePage>
	);
}

/** Named search strings for this list, kept in this browser. */
function SavedViews() {
	const { pathname, searchStr } = useLocation();
	const navigate = useNavigate();
	// Read after mount: the server has no localStorage, and the first render must match it.
	const [views, setViews] = useState<SavedView[]>([]);
	useEffect(() => setViews(readViews()), []);
	const [name, setName] = useState("");

	const save = () => {
		const trimmed = name.trim();
		if (!trimmed) return;
		const next = [...views.filter((view) => view.name !== trimmed), { name: trimmed, search: searchStr }];
		setViews(next);
		writeViews(next);
		setName("");
	};
	const forget = (viewName: string) => {
		const next = views.filter((view) => view.name !== viewName);
		setViews(next);
		writeViews(next);
	};

	return (
		<Demo title={m.examples_extras_views()} note={m.examples_extras_views_note()}>
			<div className="flex flex-wrap items-center gap-2">
				<Input
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder={m.examples_extras_view_name()}
					aria-label={m.examples_extras_view_name()}
					className="w-56"
				/>
				<Button variant="outline" onClick={save} disabled={!name.trim()}>
					{m.examples_extras_save_view()}
				</Button>
			</div>
			{views.length > 0 ? (
				<ul className="flex flex-col gap-2 text-sm">
					{views.map((view) => (
						<li key={view.name} className="flex flex-wrap items-center gap-2">
							<Button
								variant="link"
								className="h-auto p-0"
								onClick={() => void navigate({ href: `${pathname}${view.search}` })}
							>
								{view.name}
							</Button>
							<code className="text-muted-foreground text-xs">{view.search || "?"}</code>
							<Button variant="ghost" size="sm" onClick={() => forget(view.name)}>
								{m.examples_extras_forget()}
							</Button>
						</li>
					))}
				</ul>
			) : (
				<p className="text-muted-foreground text-sm">{m.examples_extras_no_views()}</p>
			)}
		</Demo>
	);
}
