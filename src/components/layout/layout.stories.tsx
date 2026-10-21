import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { m } from "@/paraglide/messages";
import { sampleAdmin, sampleUser } from "../../../.storybook/mocks/data";
import { AdminSidebar } from "./admin-sidebar";
import { ImpersonationBanner } from "./impersonation-banner";
import { LanguageSwitcher } from "./language-switcher";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ThemeToggle } from "./theme";

const meta = { title: "Layout/Site", component: SiteHeader, parameters: { layout: "fullscreen" } } satisfies Meta<
	typeof SiteHeader
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderAnonymous: Story = {};

export const HeaderSignedIn: Story = { parameters: { app: { session: sampleUser } } };

/** A section's links (here /dev's, as its layout passes them); admins also get the Admin link. */
export const HeaderAdmin: Story = {
	args: {
		links: [
			{ to: "/dev", label: m.nav_dev, exact: true },
			{ to: "/dev/stack", label: m.nav_stack },
			{ to: "/dev/test-crud", label: m.nav_test_crud },
			{ to: "/dev/examples", label: m.nav_examples },
		],
	},
	parameters: { app: { session: sampleAdmin, route: "/dev/test-crud" } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: m.nav_admin() })).toBeVisible();
		await expect(canvas.getByRole("link", { name: m.nav_test_crud() })).toHaveAttribute("data-status", "active");
	},
};

export const Footer: Story = { render: () => <SiteFooter /> };

/** An admin viewing the app as Sita: whose view it is, and the way back. */
export const ImpersonatingBanner: Story = {
	parameters: { app: { session: { ...sampleUser, impersonatedBy: "admin-1" } } },
	render: () => <ImpersonationBanner />,
	play: async ({ canvas }) => {
		await expect(canvas.getByText(m.impersonation_banner({ name: "Sita", email: "sita@example.com" }))).toBeVisible();
		// Leaving reloads the page (not possible in a story); the e2e account flow clicks it.
		await expect(canvas.getByRole("button", { name: m.impersonation_stop() })).toBeEnabled();
	},
};

/** Keeps the current path when switching (/dev/test-crud <-> /ne/dev/test-crud). */
export const LanguageSwitch: Story = {
	parameters: { app: { route: "/dev/test-crud" } },
	render: () => <LanguageSwitcher />,
};

export const ThemeMenu: Story = {
	render: () => <ThemeToggle />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByTestId("theme-toggle"));
	},
};

export const AdminSidebarExpanded: Story = {
	parameters: { app: { route: "/admin/test-crud" } },
	render: () => <AdminSidebar />,
};

export const AdminSidebarCollapsed: Story = {
	parameters: { app: { route: "/admin", preferences: { sidebarCollapsed: true } } },
	render: () => <AdminSidebar />,
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole("button", { name: m.admin_sidebar_expand() });
		await expect(toggle).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(toggle);
		await expect(canvas.getByRole("button", { name: m.admin_sidebar_collapse() })).toHaveAttribute(
			"aria-expanded",
			"true",
		);
	},
};
