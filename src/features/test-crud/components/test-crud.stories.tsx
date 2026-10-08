import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { createTestCrud } from "@/functions/test-crud";
import { m } from "@/paraglide/messages";
import { sampleDetail, sampleItems, samplePublicCard } from "../../../../.storybook/mocks/data";
import type { TestCrudSort } from "../schema";
import { DeleteDialog } from "./delete-dialog";
import { PublicCard, PublicCardSkeleton } from "./public-card";
import { TestCrudForm } from "./test-crud-form";
import { HIDEABLE_COLUMNS, type HideableColumn, TestCrudTable } from "./test-crud-table";

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

function TableDemo({ hidden = [] }: { hidden?: HideableColumn[] }) {
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [sort, setSort] = useState<TestCrudSort>("-updated");
	return (
		<TestCrudTable
			rows={sampleItems}
			sort={sort}
			sortLink={(next, label) => (
				<button type="button" className="font-medium hover:underline" onClick={() => setSort(next)}>
					{label}
				</button>
			)}
			isVisible={(column) => !hidden.includes(column)}
			selected={selected}
			onSelectedChange={setSelected}
			onDelete={fn()}
			onSetStatus={fn()}
		/>
	);
}

export const Table: Story = {
	parameters: { app: { route: "/admin/test-crud" } },
	render: () => <TableDemo />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("checkbox", { name: m.test_crud_select_all() }));
		for (const item of sampleItems) {
			await expect(canvas.getByRole("checkbox", { name: m.test_crud_select_row({ title: item.title }) })).toBeChecked();
		}
		await userEvent.click(canvas.getByRole("button", { name: m.test_crud_col_title() }));
		await expect(canvas.getByRole("columnheader", { name: new RegExp(m.test_crud_col_title()) })).toHaveAttribute(
			"aria-sort",
			"ascending",
		);
	},
};

export const TableWithHiddenColumns: Story = {
	render: () => <TableDemo hidden={HIDEABLE_COLUMNS.filter((column) => column !== "status")} />,
};

export const DeleteConfirmation: Story = {
	render: () => <DeleteDialog request={{ ids: ["1"], title: "Momo Kitchen" }} onCancel={fn()} onConfirm={fn()} />,
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
