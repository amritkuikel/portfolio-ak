import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { m } from "@/paraglide/messages";
import { COVER_MOTIFS } from "../../schema";
import { demo, withPortfolioCanvas } from "../story-helpers";
import { ArrowAnchor, ArrowLink } from "./arrow-link";
import { CoverArt } from "./cover-art";
import { CoverFrame } from "./cover-frame";
import { Display } from "./display";
import { Eyebrow } from "./eyebrow";
import { Marquee } from "./marquee";
import { ScreenArt } from "./screen-art";
import { SplitWords } from "./split-words";
import { StatGrid } from "./stat";
import { TagList } from "./tag";

/** "Ink & Paper": the portfolio's design system (docs/guides/portfolio.md). */
const meta = {
	title: "Portfolio/Primitives",
	decorators: [withPortfolioCanvas],
	parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Typography: Story = {
	render: () => (
		<div className="pf-container flex flex-col gap-8 py-12">
			<Eyebrow index={1}>{m.portfolio_chapter_manifesto()}</Eyebrow>
			<Display as="h1" size="hero">
				{m.portfolio_finale_heading()}
			</Display>
			<Display size="h2">{m.portfolio_work_heading()}</Display>
			<Display as="h3" size="h3">
				{m.portfolio_process_heading()}
			</Display>
			<p className="pf-measure text-pf-lead text-pf-ink-2">{demo().profile.intro}</p>
			<p className="pf-label text-pf-stone">{m.portfolio_capabilities_toolbox()}</p>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
	},
};

export const Links: Story = {
	render: () => (
		<div className="pf-container flex flex-wrap items-center gap-10 py-12">
			<ArrowLink to="/portfolio/work">{m.portfolio_hero_cta_work()}</ArrowLink>
			<ArrowLink to="/portfolio/work" direction="left">
				{m.portfolio_case_back()}
			</ArrowLink>
			<ArrowLink to="/portfolio/contact" size="large">
				{m.portfolio_finale_cta()}
			</ArrowLink>
			<ArrowAnchor href="https://example.com" direction="external">
				GitHub
			</ArrowAnchor>
		</div>
	),
};

export const TagsAndStats: Story = {
	render: () => {
		const { profile, projects } = demo();
		return (
			<div className="pf-container flex flex-col gap-12 py-12">
				<TagList items={projects[0]?.stack ?? []} label={m.portfolio_case_stack()} />
				<StatGrid metrics={profile.impact} size="large" className="lg:grid-cols-4" />
			</div>
		);
	},
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole("term")).toHaveLength(4);
	},
};

export const InverseBand: Story = {
	render: () => (
		<div className="pf-inverse py-12">
			<div className="pf-container flex flex-col gap-6">
				<Eyebrow index={3}>{m.portfolio_chapter_capabilities()}</Eyebrow>
				<Display size="h2">{m.portfolio_capabilities_heading()}</Display>
				<Marquee items={demo().profile.toolbox} label={m.portfolio_capabilities_toolbox()} />
			</div>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("list", { name: m.portfolio_capabilities_toolbox() })).toBeInTheDocument();
	},
};

export const AccentBand: Story = {
	render: () => (
		<div className="pf-accent-band py-12">
			<div className="pf-container">
				<Display size="h2">{m.portfolio_finale_heading()}</Display>
			</div>
		</div>
	),
};

export const ScrollWords: Story = {
	render: () => (
		<div className="pf-container py-12">
			<p className="pf-display text-pf-h3">
				<SplitWords text={demo().profile.manifesto} />
			</p>
		</div>
	),
};

/** Every motif, seeded by a project slug: the same seed always draws the same cover. */
export const CoverMotifs: Story = {
	render: () => (
		<div className="pf-container grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
			{COVER_MOTIFS.map((motif) => (
				<figure key={motif} className="flex flex-col gap-2">
					<CoverFrame aspect="portrait">
						<CoverArt seed={`story-${motif}`} motif={motif} glyph="Aa" ratio="portrait" />
					</CoverFrame>
					<figcaption className="pf-label text-pf-stone">{motif}</figcaption>
				</figure>
			))}
		</div>
	),
};

export const Screens: Story = {
	render: () => (
		<div className="pf-container grid grid-cols-1 gap-6 py-12 md:grid-cols-3">
			{[0, 1, 2].map((screen) => (
				<ScreenArt key={screen} seed="ledgerline" screen={screen} />
			))}
		</div>
	),
};
