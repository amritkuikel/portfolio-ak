import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { m } from "@/paraglide/messages";
import { demo, withPortfolioCanvas } from "../story-helpers";
import { CaseStudyBody } from "./case-study-body";
import { CaseStudyHero } from "./case-study-hero";
import { FactSheet } from "./fact-sheet";
import { NextProject } from "./next-project";

/** The building blocks of a case study page, on the Ledgerline demo project. */
const meta = {
	title: "Portfolio/Case study",
	decorators: [withPortfolioCanvas],
	parameters: { layout: "fullscreen", app: { route: "/work/ledgerline" } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const ledgerline = () => {
	const { projects } = demo();
	const project = projects.find((each) => each.slug === "ledgerline");
	if (!project) throw new Error("demo project missing");
	return project;
};

export const Hero: Story = {
	render: () => <CaseStudyHero project={ledgerline()} index={1} total={7} />,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { level: 1, name: "Ledgerline" })).toBeVisible();
	},
};

export const Facts: Story = {
	render: () => (
		<div className="pf-container max-w-sm py-12">
			<FactSheet project={ledgerline()} />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText(m.portfolio_case_role())).toBeVisible();
	},
};

/** Every block kind: chapters, architecture diagram, code, quote, gallery. */
export const Story_: Story = {
	name: "Story blocks",
	render: () => (
		<div className="pf-container py-12">
			<CaseStudyBody blocks={ledgerline().body} seed="ledgerline" />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText(m.portfolio_architecture_flows())).toBeInTheDocument();
		await expect(canvas.getByText(/create view account_balance/)).toBeInTheDocument();
	},
};

export const Next: Story = {
	render: () => {
		const { summaries } = demo();
		const next = summaries[1];
		if (!next) throw new Error("demo project missing");
		return <NextProject next={next} />;
	},
};
