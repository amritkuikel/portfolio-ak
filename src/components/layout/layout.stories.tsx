import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { m } from "@/paraglide/messages";
import { sampleAdmin, sampleUser } from "../../../.storybook/mocks/data";
import { AdminSidebar } from "./admin-sidebar";
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

/** Admins also get the Admin link. */
export const HeaderAdmin: Story = {
	parameters: { app: { session: sampleAdmin, route: "/test-crud" } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: m.nav_admin() })).toBeVisible();
		await expect(canvas.getByRole("link", { name: m.nav_test_crud() })).toHaveAttribute("data-status", "active");
	},
};

export const Footer: Story = { render: () => <SiteFooter /> };

/** Keeps the current path when switching (/test-crud <-> /ne/test-crud). */
export const LanguageSwitch: Story = {
	parameters: { app: { route: "/test-crud" } },
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
