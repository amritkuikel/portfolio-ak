import { Link } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ImageIcon, MoreHorizontalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/intl";
import { m } from "@/paraglide/messages";
import type { TestCrudListItem, TestCrudSort, TestCrudStatus } from "../schema";

/** Columns the user can hide (title, selection and actions always show). */
export const HIDEABLE_COLUMNS = ["image", "status", "price", "tags", "updated"] as const;
export type HideableColumn = (typeof HIDEABLE_COLUMNS)[number];

export const COLUMN_LABELS: Record<HideableColumn | "title", () => string> = {
	image: m.test_crud_col_image,
	title: m.test_crud_col_title,
	status: m.test_crud_col_status,
	price: m.test_crud_col_price,
	tags: m.test_crud_col_tags,
	updated: m.test_crud_col_updated,
};

export const STATUS_LABELS: Record<TestCrudStatus, () => string> = {
	draft: m.test_crud_status_draft,
	published: m.test_crud_status_published,
};

type SortableColumn = "title" | "price" | "updated";

/** Next sort when a header is clicked: ascending first, then descending. */
const nextSort = (column: SortableColumn, current: TestCrudSort): TestCrudSort =>
	current === column ? (`-${column}` as TestCrudSort) : column;

const ariaSort = (column: SortableColumn, current: TestCrudSort) =>
	current === column ? "ascending" : current === `-${column}` ? "descending" : "none";

function SortHeader({
	column,
	sort,
	sortLink,
}: {
	column: SortableColumn;
	sort: TestCrudSort;
	sortLink: (sort: TestCrudSort) => React.ReactNode;
}) {
	const state = ariaSort(column, sort);
	const Icon = state === "ascending" ? ArrowUpIcon : state === "descending" ? ArrowDownIcon : ArrowUpDownIcon;
	return (
		<TableHead aria-sort={state}>
			{sortLink(nextSort(column, sort))}
			<Icon className="ms-1 inline size-3.5 opacity-60" aria-hidden />
		</TableHead>
	);
}

export type TestCrudTableProps = {
	rows: TestCrudListItem[];
	sort: TestCrudSort;
	/** A link that applies a sort (keeps the URL as the source of truth). */
	sortLink: (sort: TestCrudSort, label: string) => React.ReactNode;
	isVisible: (column: HideableColumn) => boolean;
	selected: ReadonlySet<string>;
	onSelectedChange: (next: Set<string>) => void;
	onDelete: (row: TestCrudListItem) => void;
	onSetStatus: (row: TestCrudListItem, status: TestCrudStatus) => void;
};

export function TestCrudTable({
	rows,
	sort,
	sortLink,
	isVisible,
	selected,
	onSelectedChange,
	onDelete,
	onSetStatus,
}: TestCrudTableProps) {
	const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
	const someSelected = !allSelected && rows.some((row) => selected.has(row.id));
	const toggle = (id: string, on: boolean) => {
		const next = new Set(selected);
		if (on) next.add(id);
		else next.delete(id);
		onSelectedChange(next);
	};
	const header = (column: SortableColumn) => (
		<SortHeader column={column} sort={sort} sortLink={(next) => sortLink(next, COLUMN_LABELS[column]())} />
	);

	return (
		<div className="overflow-x-auto rounded-md border">
			<Table data-testid="test-crud-table">
				<TableHeader>
					<TableRow>
						<TableHead className="w-10">
							<Checkbox
								aria-label={m.test_crud_select_all()}
								checked={allSelected ? true : someSelected ? "indeterminate" : false}
								onCheckedChange={(checked) =>
									onSelectedChange(checked === true ? new Set(rows.map((row) => row.id)) : new Set())
								}
							/>
						</TableHead>
						{isVisible("image") ? (
							<TableHead className="w-16">
								<span className="sr-only">{COLUMN_LABELS.image()}</span>
							</TableHead>
						) : null}
						{header("title")}
						{isVisible("status") ? <TableHead>{COLUMN_LABELS.status()}</TableHead> : null}
						{isVisible("price") ? header("price") : null}
						{isVisible("tags") ? <TableHead>{COLUMN_LABELS.tags()}</TableHead> : null}
						{isVisible("updated") ? header("updated") : null}
						<TableHead className="w-12">
							<span className="sr-only">{m.test_crud_col_actions()}</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined} data-row-id={row.id}>
							<TableCell>
								<Checkbox
									aria-label={m.test_crud_select_row({ title: row.title })}
									checked={selected.has(row.id)}
									onCheckedChange={(checked) => toggle(row.id, checked === true)}
								/>
							</TableCell>
							{isVisible("image") ? (
								<TableCell>
									{row.imageUrl ? (
										<img src={row.imageUrl} alt="" loading="lazy" className="size-10 rounded border object-cover" />
									) : (
										<div className="flex size-10 items-center justify-center rounded border bg-muted">
											<ImageIcon className="size-4 text-muted-foreground" aria-hidden />
										</div>
									)}
								</TableCell>
							) : null}
							<TableCell className="max-w-72">
								<Link
									to="/admin/test-crud/$id"
									params={{ id: row.id }}
									className="font-medium underline-offset-4 hover:underline"
								>
									{row.title}
								</Link>
								<div className="truncate font-mono text-muted-foreground text-xs">{row.slug}</div>
							</TableCell>
							{isVisible("status") ? (
								<TableCell>
									<Badge variant={row.status === "published" ? "default" : "secondary"} data-testid="status">
										{STATUS_LABELS[row.status]()}
									</Badge>
								</TableCell>
							) : null}
							{isVisible("price") ? (
								<TableCell className="whitespace-nowrap tabular-nums">{formatCurrency(row.price)}</TableCell>
							) : null}
							{isVisible("tags") ? (
								<TableCell>
									<div className="flex max-w-56 flex-wrap gap-1">
										{row.tags.map((tag) => (
											<Badge key={tag} variant="outline">
												{tag}
											</Badge>
										))}
									</div>
								</TableCell>
							) : null}
							{isVisible("updated") ? (
								<TableCell className="whitespace-nowrap text-muted-foreground text-sm">
									{formatDateTime(row.updatedAt)}
								</TableCell>
							) : null}
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" aria-label={m.test_crud_row_actions({ title: row.title })}>
											<MoreHorizontalIcon aria-hidden />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem asChild>
											<Link to="/admin/test-crud/$id" params={{ id: row.id }}>
												{m.test_crud_edit()}
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => onSetStatus(row, row.status === "published" ? "draft" : "published")}
										>
											{row.status === "published" ? m.test_crud_unpublish() : m.test_crud_publish()}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem variant="destructive" onSelect={() => onDelete(row)}>
											{m.test_crud_delete()}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
