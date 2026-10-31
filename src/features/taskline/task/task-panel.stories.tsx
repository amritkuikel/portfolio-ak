import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { m } from "@/paraglide/messages";
import { patchTasklineTask } from "../../../../.storybook/mocks/functions/taskline/tasks";
import { sampleProjectTasks, sampleTaskDetail, sampleTasklineMember } from "../../../../.storybook/mocks/taskline";
import { TaskPanel } from "./task-panel";

/** The task, as the sheet over a view and its own page show it (Task 48). */
const meta = {
	title: "Taskline/Task",
	component: TaskPanel,
	args: {
		task: sampleTaskDetail,
		project: sampleProjectTasks,
		userId: sampleTasklineMember.user.id,
		ws: "team",
		variant: "page",
		onTrashed: fn(),
	},
	parameters: { app: { session: sampleTasklineMember } },
} satisfies Meta<typeof TaskPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Its fields, the versioned title and description, the checklist and subtasks; a field change saves at once. */
export const Editing: Story = {
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByLabelText(m.taskline_field_title())).toHaveValue("Fix the broken contact form");
		await expect(canvas.getByTestId("task-status")).toHaveValue("st-doing");
		await expect(canvas.getByTestId("task-checklist")).toHaveTextContent("Reproduce it on a phone");
		await userEvent.selectOptions(canvas.getByTestId("task-priority"), "3");
		await waitFor(() =>
			expect(patchTasklineTask).toHaveBeenCalledWith({ data: { ws: "team", ref: "WEB-4", priority: 3 } }),
		);
	},
};

/** Its history, as sentences. */
export const Activity: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByTestId("task-tab-activity"));
		await expect(canvas.getByTestId("task-activity")).toHaveTextContent("Bikash Thapa");
	},
};

/** A viewer reads it: no form, no trash. */
export const ReadOnly: Story = {
	args: {
		task: { ...sampleTaskDetail, can: { view: true, comment: true, edit: false, manage: false, logTime: false } },
	},
	play: async ({ canvas }) => {
		await expect(canvas.queryByTestId("task-form")).toBeNull();
		await expect(canvas.queryByTestId("task-trash")).toBeNull();
		await expect(canvas.getByTestId("task-priority")).toBeDisabled();
	},
};
