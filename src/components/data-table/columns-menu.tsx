import { Columns3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTablePreferences } from "@/lib/stores/hooks";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import type { DataTableColumn } from "./data-table";

/**
 * Show/hide a DataTable's hideable columns. The choice is saved per table in the
 * preferences cookie, so the server renders the same columns next time.
 */
export function DataTableColumnsMenu<Row>({
	tableId,
	columns,
	className,
}: {
	tableId: string;
	columns: ReadonlyArray<DataTableColumn<Row>>;
	className?: string;
}) {
	const preferences = useTablePreferences(tableId);
	const hideable = columns.filter((column) => column.hideable);
	if (hideable.length === 0) return null;
	return (
		// Non-modal: a small menu shouldn't aria-hide the page (it closes on Escape or outside click).
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className={cn(className)}>
					<Columns3Icon aria-hidden />
					{m.table_columns()}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{m.table_columns()}</DropdownMenuLabel>
				{hideable.map((column) => (
					<DropdownMenuCheckboxItem
						key={column.id}
						checked={preferences.isColumnVisible(column.id)}
						onCheckedChange={(checked) => preferences.setColumnVisible(column.id, checked === true)}
						onSelect={(event) => event.preventDefault()}
					>
						{column.header()}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
