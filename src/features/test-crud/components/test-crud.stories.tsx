import type { Meta, StoryObj } from "@storybook/react-vite";
import { useSearch } from "@tanstack/react-router";
import { expect, waitFor } from "storybook/test";
import { DataTable } from "@/components/data-table";
import { createTestCrud } from "@/functions/test-crud";
import { m } from "@/paraglide/messages";
import { sampleDetail, sampleItems, samplePublicCard } from "../../../../.storybook/mocks/data";
import { TEST_CRUD_TABLE_ID } from "../schema";
import { testCrudColumns } from "./admin-columns";
import { PublicCard, PublicCardSkeleton } from "./public-card";
import { TestCrudForm } from "./test-crud-form";

const meta = { title: "Test CRUD", component: TestCrudForm } satisfies Meta<typeof TestCrudForm>;
export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Public card
// ---------------------------------------------------------------------------

export const Card: Story = {
	render: () => (
		<ul className="grid max-w-3xl gap-6 sm:grid-cols-2">
			<li className="flex">
				<PublicCard item={samplePublicCard} />
			</li>
			<li className="flex">
				<PublicCard item={{ ...samplePublicCard, slug: "no-image", title: "Dhaka Topi", imageUrl: null, tags: [] }} />
			</li>
		</ul>
	),
};

export const CardSkeleton: Story = {
	render: () => (
		<div className="max-w-sm">
			<PublicCardSkeleton />
		</div>
	),
};

// ---------------------------------------------------------------------------
// Admin table
// ---------------------------------------------------------------------------

/** The admin list's real columns in the shared DataTable; sort comes from the URL like on the page. */
function TableDemo() {
	const { sort } = useSearch({ strict: false });
	return (
		<DataTable
			tableId={TEST_CRUD_TABLE_ID}
			rows={sampleItems}
			columns={testCrudColumns}
			getRowId={(row) => row.id}
			getRowLabel={(row) => row.title}
			sort={typeof sort === "string" ? sort : "-updated"}
			bulkActions={() => null}
		/>
	);
}

export const Table: Story = {
	parameters: { app: { route: "/admin/test-crud" } },
	render: () => <TableDemo />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("checkbox", { name: m.table_select_all() }));
		for (const item of sampleItems) {
			await expect(canvas.getByRole("checkbox", { name: m.table_select_row({ label: item.title }) })).toBeChecked();
		}
		await userEvent.click(canvas.getByRole("link", { name: m.test_crud_col_title() }));
		await waitFor(() =>
			expect(canvas.getByRole("columnheader", { name: new RegExp(m.test_crud_col_title()) })).toHaveAttribute(
				"aria-sort",
				"ascending",
			),
		);
	},
};

/** Only the status column left visible (saved preference). */
export const TableWithHiddenColumns: Story = {
	parameters: {
		app: {
			route: "/admin/test-crud",
			preferences: { tables: { [TEST_CRUD_TABLE_ID]: { hiddenColumns: ["image", "price", "tags", "updated"] } } },
		},
	},
	render: () => <TableDemo />,
};

// ---------------------------------------------------------------------------
// Create / edit form
// ---------------------------------------------------------------------------

export const NewItem: Story = { parameters: { app: { route: "/admin/test-crud/new" } } };

export const EditItem: Story = {
	args: { item: sampleDetail },
	parameters: { app: { route: `/admin/test-crud/${sampleDetail.id}` } },
};

/** Empty submit: every required field reports, the summary takes focus, nothing is saved. */
export const NewItemValidation: Story = {
	parameters: { app: { route: "/admin/test-crud/new" } },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: m.test_crud_create() }));
		const summary = await canvas.findByTestId("form-error-summary");
		await expect(summary).toHaveFocus();
		await expect(canvas.getByRole("textbox", { name: m.test_crud_field_title() })).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(createTestCrud).not.toHaveBeenCalled();
	},
};

/** Fill the form like an admin: the slug follows the title and one FormData request is sent. */
export const CreatesItem: Story = {
	parameters: { app: { route: "/admin/test-crud/new" } },
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole("textbox", { name: m.test_crud_field_title() }), "Momo Kitchen Deluxe");
		await expect(canvas.getByLabelText(m.test_crud_field_slug())).toHaveValue("momo-kitchen-deluxe");
		await userEvent.type(canvas.getByLabelText(new RegExp(`^${m.test_crud_field_summary()}`)), "Dumplings.");
		await userEvent.click(canvas.getByRole("radio", { name: m.test_crud_status_published() }));
		const price = canvas.getByLabelText(m.test_crud_field_price());
		await userEvent.clear(price);
		await userEvent.type(price, "1250.5");
		await userEvent.type(canvas.getByLabelText(new RegExp(`^${m.test_crud_field_tags()}`)), "food{Enter}");
		await userEvent.click(canvas.getByRole("button", { name: m.test_crud_create() }));

		await waitFor(() => expect(createTestCrud).toHaveBeenCalledOnce());
		const [{ data }] = (createTestCrud as unknown as { mock: { calls: Array<[{ data: FormData }]> } }).mock
			.calls[0] ?? [{ data: new FormData() }];
		await expect(JSON.parse(String(data.get("data")))).toMatchObject({
			title: "Momo Kitchen Deluxe",
			slug: "momo-kitchen-deluxe",
			summary: "Dumplings.",
			status: "published",
			price: 1250.5,
			tags: ["food"],
		});
	},
};
