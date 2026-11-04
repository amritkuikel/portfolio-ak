import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense } from "react";
import { expect, waitFor, within } from "storybook/test";
import { m } from "@/paraglide/messages";
import { sampleAdmin } from "../../../../.storybook/mocks/data";
import { SANDBOX_LABELS } from "./labels";
import { PardaSettingsPage } from "./settings/settings-page";
import { PardaSourceNewPage } from "./sources/source-form";
import { PardaSourcesPage } from "./sources/source-list";
import { PardaTakedownNewPage } from "./titles/takedown-form";

/** /admin/parda's control pages (PLAN Task 65) with the mocked functions (.storybook/mocks/functions/parda-admin/). */
function Sources() {
	return (
		<Suspense>
			<PardaSourcesPage />
		</Suspense>
	);
}

const meta = {
	title: "Parda/Admin",
	component: Sources,
	parameters: { app: { session: sampleAdmin, route: "/admin/parda/sources" } },
} satisfies Meta<typeof Sources>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The servers in order under the kill switch: one pinned with open reports, one sandboxed, one disabled. */
export const SourceList: Story = {
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole("heading", { level: 1, name: m.pd_admin_sources_title() })).toBeVisible();
		await expect(canvas.getByRole("switch", { name: m.pd_admin_playback_switch() })).toBeChecked();
		await expect(canvas.getByText(m.pd_admin_source_pinned())).toBeVisible();
		await expect(canvas.getByText(m.pd_admin_source_sandbox({ sandbox: SANDBOX_LABELS.popups() }))).toBeVisible();
		await expect(canvas.getByRole("link", { name: /^(Server 1|सर्भर 1)$/ })).toBeVisible();
	},
};

/** A new source: every field, and a sandbox brings its warning. */
export const NewSource: Story = {
	parameters: { app: { session: sampleAdmin, route: "/admin/parda/sources/new" } },
	render: () => <PardaSourceNewPage />,
	play: async ({ canvas, userEvent }) => {
		await expect(await canvas.findByLabelText(m.pd_admin_source_movie_template())).toBeVisible();
		await expect(canvas.queryByTestId("parda-sandbox-warning")).toBeNull();
		await userEvent.click(canvas.getByRole("combobox", { name: m.pd_admin_source_sandbox_label() }));
		await userEvent.click(await within(document.body).findByRole("option", { name: SANDBOX_LABELS.popups() }));
		await expect(await canvas.findByTestId("parda-sandbox-warning")).toBeVisible();
		// The list has closed and the page is no longer hidden from assistive technology (the a11y check runs next).
		await waitFor(() => expect(document.querySelector("[data-aria-hidden]")).toBeNull());
	},
};

/** Blocking a title: its type, its TMDB id and the reason. */
export const BlockTitle: Story = {
	parameters: { app: { session: sampleAdmin, route: "/admin/parda/titles/new" } },
	render: () => <PardaTakedownNewPage />,
	play: async ({ canvas }) => {
		await expect(await canvas.findByLabelText(m.pd_admin_takedown_id())).toHaveValue("");
		await expect(canvas.getByLabelText(m.pd_admin_takedown_reason())).toBeVisible();
	},
};

/** The kill switch, the catalogue's region and kids' cap, the players' languages, the banner and the purge. */
export const Settings: Story = {
	parameters: { app: { session: sampleAdmin, route: "/admin/parda/settings" } },
	render: () => (
		<Suspense>
			<PardaSettingsPage />
		</Suspense>
	),
	play: async ({ canvas }) => {
		await expect(await canvas.findByLabelText(m.pd_admin_settings_region())).toHaveValue("US");
		await expect(canvas.getByRole("switch", { name: m.pd_admin_playback_switch() })).toBeChecked();
		await expect(canvas.getByRole("button", { name: m.pd_admin_purge_action() })).toBeVisible();
	},
};
