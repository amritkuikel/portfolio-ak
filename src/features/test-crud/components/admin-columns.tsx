import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import type { DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/features/attachments/components/cloud-image";
import { useCan } from "@/features/rbac/can";
import { formatCurrency, formatDateTime } from "@/lib/intl";
import { m } from "@/paraglide/messages";
import { STATUS_LABELS } from "../labels";
import type { TestCrudListItem } from "../schema";

/** The title, linking to the edit page for users who may edit. */
function TitleCell({ row }: { row: TestCrudListItem }) {
	const canEdit = useCan("test-crud:update");
	return (
		<>
			{canEdit ? (
				<Link
					to="/admin/test-crud/$id"
					params={{ id: row.id }}
					className="font-medium underline-offset-4 hover:underline"
				>
					{row.title}
				</Link>
			) : (
				<span className="font-medium">{row.title}</span>
			)}
			<div className="truncate font-mono text-muted-foreground text-xs">{row.slug}</div>
		</>
	);
}

/**
 * The admin list's columns. `sort` values match TEST_CRUD_SORTS; `hideable`
 * columns appear in the Columns menu. Title, selection and actions always show.
 */
export const testCrudColumns: ReadonlyArray<DataTableColumn<TestCrudListItem>> = [
	{
		id: "image",
		header: m.test_crud_col_image,
		srOnlyHeader: true,
		hideable: true,
		headClassName: "w-16",
		cell: (row) =>
			row.image ? (
				<CloudImage
					image={row.image}
					variant="thumb"
					alt=""
					loading="lazy"
					className="size-10 rounded border object-cover"
				/>
			) : (
				<div className="flex size-10 items-center justify-center rounded border bg-muted">
					<ImageIcon className="size-4 text-muted-foreground" aria-hidden />
				</div>
			),
	},
	{
		id: "title",
		header: m.test_crud_col_title,
		sort: "title",
		cellClassName: "max-w-72",
		cell: (row) => <TitleCell row={row} />,
	},
	{
		id: "status",
		header: m.test_crud_col_status,
		hideable: true,
		cell: (row) => (
			<Badge variant={row.status === "published" ? "default" : "secondary"} data-testid="status">
				{STATUS_LABELS[row.status]()}
			</Badge>
		),
	},
	{
		id: "price",
		header: m.test_crud_col_price,
		sort: "price",
		hideable: true,
		cellClassName: "whitespace-nowrap tabular-nums",
		cell: (row) => formatCurrency(row.price),
	},
	{
		id: "tags",
		header: m.test_crud_col_tags,
		hideable: true,
		cell: (row) => (
			<div className="flex max-w-56 flex-wrap gap-1">
				{row.tags.map((tag) => (
					<Badge key={tag} variant="outline">
						{tag}
					</Badge>
				))}
			</div>
		),
	},
	{
		id: "updated",
		header: m.test_crud_col_updated,
		sort: "updated",
		hideable: true,
		cellClassName: "whitespace-nowrap text-muted-foreground text-sm",
		cell: (row) => formatDateTime(row.updatedAt),
	},
];
