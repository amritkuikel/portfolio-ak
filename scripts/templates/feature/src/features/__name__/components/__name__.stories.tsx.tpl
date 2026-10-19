import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { DataTable } from "@/components/data-table";
import { create__Pascal__ } from "@/functions/__name__";
import { m } from "@/paraglide/messages";
import { sample__Pascal__, sample__Pascal__Rows } from "../../../../.storybook/mocks/functions/__name__";
import { __UPPER___TABLE_ID } from "../schema";
import { __camel__Columns } from "./columns";
import { __Pascal__Form } from "./form";

const meta = { title: "__Title__", component: __Pascal__Form } satisfies Meta<typeof __Pascal__Form>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Table: Story = {
	parameters: { app: { route: "/admin/__name__" } },
	render: () => (
		<DataTable
			tableId={__UPPER___TABLE_ID}
			rows={sample__Pascal__Rows}
			columns={__camel__Columns}
			getRowId={(row) => row.id}
			getRowLabel={(row) => row.title}
			sort="-updated"
			bulkActions={() => null}
		/>
	),
};

export const NewRow: Story = { parameters: { app: { route: "/admin/__name__/new" } } };

export const EditRow: Story = {
	args: { row: sample__Pascal__ },
	parameters: { app: { route: `/admin/__name__/${sample__Pascal__.id}` } },
};

/** Empty submit: the title reports, nothing is saved. */
export const Validation: Story = {
	parameters: { app: { route: "/admin/__name__/new" } },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: m.__snake___create() }));
		await expect(await canvas.findByTestId("form-error-summary")).toHaveFocus();
		await expect(create__Pascal__).not.toHaveBeenCalled();
	},
};

/** A filled form sends one request with the fields. */
export const Creates: Story = {
	parameters: { app: { route: "/admin/__name__/new" } },
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole("textbox", { name: m.__snake___field_title() }), "First row");
		await userEvent.click(canvas.getByRole("button", { name: m.__snake___create() }));
		await waitFor(() =>
			expect(create__Pascal__).toHaveBeenCalledWith({ data: expect.objectContaining({ title: "First row" }) }),
		);
	},
};
