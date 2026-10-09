import type { Meta, StoryObj } from "@storybook/react-vite";
import { useSearch } from "@tanstack/react-router";
import { expect, fn, waitFor, within } from "storybook/test";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/intl";
import { m } from "@/paraglide/messages";
import { DataTableColumnsMenu } from "./columns-menu";
import { DataTable, type DataTableColumn } from "./data-table";
import { DataTableSkeleton } from "./data-table-skeleton";

type Person = { id: string; name: string; city: string; age: number };

const people: Person[] = [
	{ id: "1", name: "Sita", city: "Kathmandu", age: 31 },
	{ id: "2", name: "Ram", city: "Pokhara", age: 27 },
	{ id: "3", name: "Gita", city: "Lalitpur", age: 45 },
];

const columns: ReadonlyArray<DataTableColumn<Person>> = [
	{ id: "name", header: () => "Name", sort: "name", cell: (row) => row.name },
	{ id: "city", header: () => "City", hideable: true, cell: (row) => row.city },
	{
		id: "age",
		header: () => "Age",
		sort: "age",
		hideable: true,
		cellClassName: "tabular-nums",
		cell: (row) => row.age,
	},
];

const onBulkDelete = fn();
const onEdit = fn();

/** Reads `?sort=` from the story router's URL, like a real route's validateSearch would. */
function PeopleTable({ rows = people }: { rows?: Person[] }) {
	const { sort } = useSearch({ strict: false });
	return (
		<div className="flex flex-col gap-3">
			<DataTableColumnsMenu tableId="story-people" columns={columns} className="self-end" />
			<DataTable
				tableId="story-people"
				rows={rows}
				columns={columns}
				getRowId={(row) => row.id}
				getRowLabel={(row) => row.name}
				sort={typeof sort === "string" ? sort : undefined}
				bulkActions={({ ids, clear }) => (
					<Button
						variant="destructive"
						size="sm"
						onClick={() => {
							onBulkDelete(ids);
							clear();
						}}
					>
						Delete selected
					</Button>
				)}
				rowActions={(row) => <DropdownMenuItem onSelect={() => onEdit(row.id)}>Edit</DropdownMenuItem>}
				empty={<EmptyState description="No people match." data-testid="empty" />}
			/>
		</div>
	);
}

const meta = {
	title: "Data/DataTable",
	component: PeopleTable,
	parameters: { app: { route: "/admin/people" } },
} satisfies Meta<typeof PeopleTable>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Select all -> the bulk bar acts on exactly the selected ids, then clears. */
export const Selection: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("checkbox", { name: m.table_select_all() }));
		await expect(canvas.getByTestId("bulk-bar")).toHaveTextContent(m.table_selected({ count: formatNumber(3) }));
		await userEvent.click(canvas.getByRole("checkbox", { name: m.table_select_row({ label: "Ram" }) }));
		await userEvent.click(canvas.getByRole("button", { name: "Delete selected" }));
		await expect(onBulkDelete).toHaveBeenCalledWith(["1", "3"]);
		await expect(canvas.queryByTestId("bulk-bar")).toBeNull();
	},
};

/** Sorting is a link that changes ?sort= (ascending first, then descending). */
export const Sorting: Story = {
	play: async ({ canvas, userEvent }) => {
		const header = () => canvas.getByRole("columnheader", { name: /Name/ });
		await expect(header()).toHaveAttribute("aria-sort", "none");
		await userEvent.click(canvas.getByRole("link", { name: /Name/ }));
		await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "ascending"));
		await userEvent.click(canvas.getByRole("link", { name: /Name/ }));
		await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "descending"));
	},
};

export const RowActions: Story = {
	play: async ({ canvas, userEvent, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: m.table_row_actions({ label: "Gita" }) }));
		const menu = within(canvasElement.ownerDocument.body);
		await userEvent.click(await menu.findByRole("menuitem", { name: "Edit" }));
		await expect(onEdit).toHaveBeenCalledWith("3");
	},
};

/** Hidden columns come from the saved table preferences (server-rendered the same way). */
export const HiddenColumn: Story = {
	parameters: {
		app: { route: "/admin/people", preferences: { tables: { "story-people": { hiddenColumns: ["city"] } } } },
	},
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole("columnheader", { name: "City" })).toBeNull();
	},
};

export const Empty: Story = { args: { rows: [] } };

export const Loading: Story = { render: () => <DataTableSkeleton columns={4} rows={5} /> };

export const PaginationAdmin: Story = {
	parameters: { app: { route: "/admin/people?page=2" } },
	render: () => (
		<Pagination
			page={2}
			pageCount={5}
			total={93}
			pageSize={{ value: 20, options: [10, 20, 50, 100], onChange: fn() }}
		/>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: m.pagination_previous() })).toHaveAttribute("rel", "prev");
		await expect(canvas.getByRole("link", { name: m.pagination_next() })).toHaveAttribute(
			"href",
			expect.stringMatching(/\/admin\/people\?page=3$/),
		);
	},
};

/** First page: "Previous" is plain text, not a dead link. */
export const PaginationPublicFirstPage: Story = {
	render: () => <Pagination page={1} pageCount={3} layout="center" hideWhenSingle />,
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole("link", { name: m.pagination_previous() })).toBeNull();
		await expect(canvas.getByText(m.pagination_previous())).toHaveAttribute("aria-disabled", "true");
	},
};
