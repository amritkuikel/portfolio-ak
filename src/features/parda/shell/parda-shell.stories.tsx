import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { m } from "@/paraglide/messages";
import { sampleParda, withParda } from "../../../../.storybook/mocks/parda";
import { PardaAbout } from "../about/parda-about";
import { PardaHome } from "../home/parda-home";
import { PardaFrame } from "./parda-frame";

/** Parda's frame (PLAN Task 61): the top mask, the footer with TMDB's notice, and the phone's tab bar. */
const meta = {
	title: "Parda/Shell",
	decorators: [withParda],
	parameters: { layout: "fullscreen", app: { route: "/app/parda" } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** A visitor on the home page: Sign in in the top mask, Home current, TMDB's logo and notice in the footer. */
export const Visitor: Story = {
	render: () => (
		<PardaFrame>
			<PardaHome />
		</PardaFrame>
	),
	play: async ({ canvas }) => {
		const header = canvas.getByTestId("parda-header");
		await expect(within(header).getByTestId("parda-sign-in-link")).toBeVisible();
		await expect(within(header).getByRole("link", { name: m.pd_nav_home(), current: "page" })).toBeInTheDocument();
		const footer = canvas.getByTestId("parda-footer");
		await expect(within(footer).getByRole("img", { name: "TMDB" })).toBeVisible();
		await expect(within(footer).getByText(m.pd_tmdb_notice())).toBeVisible();
	},
};

/** A guest: the account menu instead of Sign in. */
export const Guest: Story = {
	parameters: { app: { session: sampleParda.guest, route: "/app/parda" } },
	render: () => (
		<PardaFrame>
			<PardaHome />
		</PardaFrame>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("user-menu")).toBeVisible();
		await expect(canvas.queryByTestId("parda-sign-in-link")).toBeNull();
	},
};

/** The notice page: the catalogue's source, playback, the ad-blocker's stores, takedowns. */
export const About: Story = {
	parameters: { app: { session: sampleParda.viewer, route: "/app/parda/about" } },
	render: () => (
		<PardaFrame>
			<PardaAbout />
		</PardaFrame>
	),
	play: async ({ canvas }) => {
		const main = canvas.getByTestId("parda-about");
		await expect(within(main).getByRole("heading", { level: 1, name: m.pd_about_title() })).toBeVisible();
		await expect(within(main).getAllByRole("link", { name: /uBlock Origin Lite/ })).toHaveLength(4);
	},
};

/** A phone: the tab bar holds the sections, the top mask only the wordmark and the controls. */
export const Phone: Story = {
	globals: { viewport: { value: "mobile1" } },
	render: () => (
		<PardaFrame>
			<PardaHome />
		</PardaFrame>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("parda-tab-bar")).toBeVisible();
	},
};
