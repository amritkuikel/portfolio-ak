import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { m } from "@/paraglide/messages";
import { demo, withPortfolioCanvas } from "../story-helpers";
import { CapabilitiesSection } from "./capabilities-section";
import { FinaleSection } from "./finale-section";
import { HeroSection } from "./hero-section";
import { ImpactSection } from "./impact-section";
import { JournalTeaserSection } from "./journal-teaser-section";
import { ManifestoSection } from "./manifesto-section";
import { ProcessSection } from "./process-section";
import { SelectedWorkSection } from "./selected-work-section";
import { VoicesSection } from "./voices-section";

/** The chapters of the portfolio home page, on demo data. */
const meta = {
	title: "Portfolio/Sections",
	decorators: [withPortfolioCanvas],
	parameters: { layout: "fullscreen", app: { route: "/" } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
	render: () => <HeroSection profile={demo().profile} />,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(canvas.getByRole("link", { name: m.portfolio_hero_cta_work() })).toBeVisible();
	},
};

export const Manifesto: Story = { render: () => <ManifestoSection profile={demo().profile} /> };

export const SelectedWork: Story = {
	render: () => {
		const { summaries } = demo();
		return <SelectedWorkSection projects={summaries.filter((project) => project.featured)} total={summaries.length} />;
	},
	play: async ({ canvas }) => {
		// One stop per card: the title link (the cover repeats it for pointers only).
		await expect(canvas.getAllByRole("article")).toHaveLength(4);
		await expect(canvas.getByRole("link", { name: "Ledgerline" })).toBeVisible();
	},
};

export const Capabilities: Story = {
	render: () => {
		const { capabilities, profile } = demo();
		return <CapabilitiesSection capabilities={capabilities} toolbox={profile.toolbox} index={3} />;
	},
};

export const Process: Story = { render: () => <ProcessSection steps={demo().processSteps} /> };

export const Impact: Story = { render: () => <ImpactSection metrics={demo().profile.impact} /> };

export const Voices: Story = { render: () => <VoicesSection testimonials={demo().testimonials} index={6} /> };

export const Journal: Story = { render: () => <JournalTeaserSection posts={demo().posts.slice(0, 3)} /> };

export const Finale: Story = {
	render: () => <FinaleSection profile={demo().profile} />,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { name: m.portfolio_finale_heading() })).toBeVisible();
	},
};
