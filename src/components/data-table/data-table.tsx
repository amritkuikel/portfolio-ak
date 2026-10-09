import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, MoreHorizontalIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { SearchLink } from "@/components/navigation/search-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/intl";
import { useTablePreferences } from "@/lib/stores/hooks";
import { m } from "@/paraglide/messages";

/** One column of a DataTable. Define a feature's columns once, next to its schema. */
export type DataTableColumn<Row> = {
	/** Stable id: used for visibility preferences and React keys. */
	id: string;
	/** Localized header label (a Paraglide message). */
	header: () => string;
	/** Keep the header for screen readers only (image or icon columns). */
	srOnlyHeader?: boolean;
	cell: (row: Row) => ReactNode;
	/** Makes the header a sort link: the ascending value in `?sort=`; descending is `-value`. */
	sort?: string;
	/** Listed in the Columns menu and hideable by the user. */
	hideable?: boolean;
	headClassName?: string;
	cellClassName?: string;
};

export type BulkSelection = { ids: string[]; clear: () => void };

export type DataTableProps<Row> = {
	/** Key for this table's saved preferences (hidden columns, page size). */
	tableId: string;
	rows: ReadonlyArray<Row>;
	columns: ReadonlyArray<DataTableColumn<Row>>;
	getRowId: (row: Row) => string;
	/** Human name of a row, for "Select {label}" and "Actions for {label}". */
	getRowLabel: (row: Row) => string;
	/** The current `?sort=` value, when any column is sortable. */
	sort?: string;
	/** Adds a checkbox column; actions for the selection appear in a bar above the table. */
	bulkActions?: (selection: BulkSelection) => ReactNode;
	/** Menu items (DropdownMenuItem) for a row's "…" menu. */
	rowActions?: (row: Row) => ReactNode;
	/** Shown instead of the table when there are no rows. */
	empty?: ReactNode;
	/** New rows are loading (a filter or page change); the current ones are dimmed meanwhile. */
	busy?: boolean;
	"data-testid"?: string;
};

type SortState = "ascending" | "descending" | "none";

const sortState = (column: string, current: string | undefined): SortState =>
	current === column ? "ascending" : current === `-${column}` ? "descending" : "none";

const SORT_ICONS = { ascending: ArrowUpIcon, descending: ArrowDownIcon, none: ArrowUpDownIcon } as const;

/**
 * A server-paginated table: rows are the current page (from a loader), sorting
 * is a link that changes `?sort=` (and resets `?page=`), so the URL stays the
 * source of truth and the table renders fully on the server. Selection is local
 * to the page and never outlives the rows it refers to.
 */
export function DataTable<Row>({
	tableId,
	rows,
	columns,
	getRowId,
	getRowLabel,
	sort,
	bulkActions,
	rowActions,
	empty,
	busy = false,
	"data-testid": testId,
}: DataTableProps<Row>) {
	const preferences = useTablePreferences(tableId);
	const visible = columns.filter((column) => !column.hideable || preferences.isColumnVisible(column.id));
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

	if (rows.length === 0 && empty) return <div aria-busy={busy || undefined}>{empty}</div>;

	const ids = rows.map(getRowId);
	// Only rows still on this page count (after a delete, a filter or a page change).
	const selected = ids.filter((id) => selectedIds.has(id));
	const allSelected = ids.length > 0 && selected.length === ids.length;
	const clear = () => setSelectedIds(new Set());
	const toggle = (id: string, on: boolean) => {
		const next = new Set(selectedIds);
		if (on) next.add(id);
		else next.delete(id);
		setSelectedIds(next);
	};

	return (
		<div
			className="flex flex-col gap-3 transition-opacity aria-busy:opacity-60 motion-reduce:transition-none"
			aria-busy={busy || undefined}
		>
			{bulkActions && selected.length > 0 ? (
				<div
					className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm"
					data-testid="bulk-bar"
				>
					<span aria-live="polite">{m.table_selected({ count: formatNumber(selected.length) })}</span>
					<Button variant="ghost" size="sm" onClick={clear}>
						{m.table_clear_selection()}
					</Button>
					<div className="ms-auto flex flex-wrap items-center gap-2">{bulkActions({ ids: selected, clear })}</div>
				</div>
			) : null}
			<div className="overflow-x-auto rounded-md border">
				<Table data-testid={testId}>
					<TableHeader>
						<TableRow>
							{bulkActions ? (
								<TableHead className="w-10">
									<Checkbox
										aria-label={m.table_select_all()}
										checked={allSelected ? true : selected.length > 0 ? "indeterminate" : false}
										onCheckedChange={(checked) => setSelectedIds(checked === true ? new Set(ids) : new Set())}
									/>
								</TableHead>
							) : null}
							{visible.map((column) => (
								<HeaderCell key={column.id} column={column} sort={sort} />
							))}
							{rowActions ? (
								<TableHead className="w-12">
									<span className="sr-only">{m.table_actions()}</span>
								</TableHead>
							) : null}
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => {
							const id = getRowId(row);
							const isSelected = selectedIds.has(id);
							return (
								<TableRow key={id} data-state={isSelected ? "selected" : undefined} data-row-id={id}>
									{bulkActions ? (
										<TableCell>
											<Checkbox
												aria-label={m.table_select_row({ label: getRowLabel(row) })}
												checked={isSelected}
												onCheckedChange={(checked) => toggle(id, checked === true)}
											/>
										</TableCell>
									) : null}
									{visible.map((column) => (
										<TableCell key={column.id} className={column.cellClassName}>
											{column.cell(row)}
										</TableCell>
									))}
									{rowActions ? (
										<TableCell>
											{/* Non-modal: a small menu shouldn't aria-hide the page (it closes on Escape or outside click). */}
											<DropdownMenu modal={false}>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														aria-label={m.table_row_actions({ label: getRowLabel(row) })}
													>
														<MoreHorizontalIcon aria-hidden />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">{rowActions(row)}</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									) : null}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

function HeaderCell<Row>({ column, sort }: { column: DataTableColumn<Row>; sort: string | undefined }) {
	const label = column.header();
	if (column.srOnlyHeader) {
		return (
			<TableHead className={column.headClassName}>
				<span className="sr-only">{label}</span>
			</TableHead>
		);
	}
	if (!column.sort) return <TableHead className={column.headClassName}>{label}</TableHead>;
	const state = sortState(column.sort, sort);
	const Icon = SORT_ICONS[state];
	// Ascending first, then descending.
	const next = state === "ascending" ? `-${column.sort}` : column.sort;
	return (
		<TableHead aria-sort={state} className={column.headClassName}>
			<SearchLink
				patch={{ sort: next, page: 1 }}
				className="inline-flex items-center gap-1 rounded-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				{label}
				<Icon className="size-3.5 opacity-60" aria-hidden />
			</SearchLink>
		</TableHead>
	);
}
