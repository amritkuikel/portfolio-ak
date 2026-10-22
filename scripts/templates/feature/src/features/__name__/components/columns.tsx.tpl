import { Link } from "@tanstack/react-router";
import type { DataTableColumn } from "@/components/data-table";
import { useCan } from "@/features/rbac/can";
import { formatDateTime } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { __Pascal__ListItem } from "../schema";

/** The title, linking to the edit page for users who may edit. */
function TitleCell({ row }: { row: __Pascal__ListItem }) {
	if (!useCan("__name__:update")) return <span className="font-medium">{row.title}</span>;
	return (
		<Link to="/admin/__name__/$id" params={{ id: row.id }} className="font-medium underline-offset-4 hover:underline">
			{row.title}
		</Link>
	);
}

/** The admin list's columns; `sort` values match __UPPER___SORTS. */
export const __camel__Columns: ReadonlyArray<DataTableColumn<__Pascal__ListItem>> = [
	{
		id: "title",
		header: m.__snake___col_title,
		sort: "title",
		cellClassName: "max-w-72",
		cell: (row) => <TitleCell row={row} />,
		csv: (row) => row.title,
	},
	{
		id: "updated",
		header: m.__snake___col_updated,
		sort: "updated",
		hideable: true,
		cellClassName: "whitespace-nowrap text-muted-foreground text-sm",
		cell: (row) => formatDateTime(row.updatedAt),
		csv: (row) => row.updatedAt,
	},
];
