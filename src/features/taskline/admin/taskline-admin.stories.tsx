import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense } from "react";
import { expect } from "storybook/test";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { sampleAdmin } from "../../../../.storybook/mocks/data";
import { TASKLINE_NAME } from "../brand";
import { TasklineOverviewPage } from "./overview/overview-page";
import { TasklineSettingsPage } from "./settings/settings-page";
import { TasklineWorkflowsPage } from "./workflows/workflows-page";

/** /admin/taskline's pages with the mocked functions (.storybook/mocks/functions/taskline-admin/). */
function Overview() {
	return (
		<Suspense>
			<TasklineOverviewPage />
		</Suspense>
	);
}

const meta = {
	title: "Taskline/Admin",
	component: Overview,
	parameters: { app: { session: sampleAdmin, route: "/admin/taskline" } },
} satisfies Meta<typeof Overview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The team at a glance: the numbers, twelve weeks, each project's health, the people and the sandboxes. */
export const TeamOverview: Story = {
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole("heading", { level: 1, name: TASKLINE_NAME })).toBeVisible();
		await expect(canvas.getByRole("heading", { name: m.taskline_admin_health_title() })).toBeVisible();
		await expect(canvas.getByRole("link", { name: /Website relaunch/ })).toBeVisible();
	},
};

/** The workspace's settings: name and address, projects, calendar, limits (with what's in use). */
export const Settings: Story = {
	parameters: { app: { session: sampleAdmin, route: "/admin/taskline/settings" } },
	render: () => (
		<Suspense>
			<TasklineSettingsPage />
		</Suspense>
	),
	play: async ({ canvas }) => {
		await expect(await canvas.findByLabelText(m.taskline_admin_workspace_slug())).toHaveValue("team");
		await expect(canvas.getByText(m.taskline_admin_quota_used({ used: formatNumber(96) }))).toBeVisible();
	},
};

/** New projects' statuses, the task types and the team's labels. */
export const Workflows: Story = {
	parameters: { app: { session: sampleAdmin, route: "/admin/taskline/workflows" } },
	render: () => (
		<Suspense>
			<TasklineWorkflowsPage />
		</Suspense>
	),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole("heading", { name: m.taskline_admin_workflows_title() })).toBeVisible();
		await expect(canvas.getByLabelText(m.taskline_admin_label_name_of({ name: "Urgent" }))).toHaveValue("Urgent");
	},
};
