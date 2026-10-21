import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Chapter } from "@/features/portfolio/components/primitives/chapter";
import { CoverArt } from "@/features/portfolio/components/primitives/cover-art";
import { CoverFrame } from "@/features/portfolio/components/primitives/cover-frame";
import { Display } from "@/features/portfolio/components/primitives/display";
import { Eyebrow, formatIndex } from "@/features/portfolio/components/primitives/eyebrow";
import { Reveal } from "@/features/portfolio/components/primitives/reveal";
import { CapabilitiesSection } from "@/features/portfolio/components/sections/capabilities-section";
import { FinaleSection } from "@/features/portfolio/components/sections/finale-section";
import { VoicesSection } from "@/features/portfolio/components/sections/voices-section";
import { profilePageJsonLd } from "@/features/portfolio/lib/structured-data";
import {
	capabilitiesQueryOptions,
	experienceQueryOptions,
	profileQueryOptions,
	testimonialsQueryOptions,
} from "@/features/portfolio/queries";
import type { Experience } from "@/features/portfolio/types";
import { staticCrumb } from "@/lib/breadcrumbs";
import { formatMonthYear } from "@/lib/i18n/intl";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/about")({
	loader: async ({ context: { queryClient } }) => {
		const [profile] = await Promise.all([
			queryClient.ensureQueryData(profileQueryOptions()),
			queryClient.ensureQueryData(experienceQueryOptions()),
			queryClient.ensureQueryData(capabilitiesQueryOptions()),
			queryClient.ensureQueryData(testimonialsQueryOptions()),
		]);
		return {
			name: profile.name,
			role: profile.role,
			intro: profile.intro,
			socials: profile.socials.map((social) => social.href),
		};
	},
	staticData: { breadcrumb: staticCrumb(m.portfolio_nav_about) },
	head: ({ loaderData }) =>
		seo({
			title: m.portfolio_about_title(),
			description: m.portfolio_about_description(),
			path: "/about",
			jsonLd: loaderData
				? profilePageJsonLd({
						name: loaderData.name,
						role: loaderData.role,
						description: loaderData.intro,
						socials: loaderData.socials,
					})
				: [],
		}),
	component: AboutPage,
});

/** "2021-04" → "April 2021" in the page's language (noon UTC: the same month in every time zone). */
const monthYear = (value: string) => formatMonthYear(new Date(`${value}-15T12:00:00Z`));

function Period({ entry }: { entry: Experience }) {
	return (
		<p className="pf-label text-pf-stone">
			<time dateTime={entry.start}>{monthYear(entry.start)}</time>
			{" – "}
			{entry.end ? <time dateTime={entry.end}>{monthYear(entry.end)}</time> : m.portfolio_about_present()}
		</p>
	);
}

function AboutPage() {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	const { data: experience } = useSuspenseQuery(experienceQueryOptions());
	const { data: capabilities } = useSuspenseQuery(capabilitiesQueryOptions());
	const { data: testimonials } = useSuspenseQuery(testimonialsQueryOptions());
	const [firstParagraph, ...otherParagraphs] = profile.bio;

	return (
		<>
			<header className="pf-container pf-grid gap-y-10 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(4rem,8vw,7rem)]">
				<Eyebrow className="col-span-4 md:col-span-12">{m.portfolio_about_title()}</Eyebrow>
				<Display as="h1" size="hero" className="col-span-4 md:col-span-12">
					{m.portfolio_about_heading({ name: profile.name })}
				</Display>
				<div className="col-span-4 flex flex-col gap-6 md:col-span-6">
					<p className="text-pf-lead">{firstParagraph}</p>
					{otherParagraphs.map((paragraph) => (
						<p key={paragraph} className="text-pf-body text-pf-ink-2">
							{paragraph}
						</p>
					))}
				</div>
				<div className="col-span-4 md:col-span-5 md:col-start-8">
					<CoverFrame aspect="portrait">
						<div className="pf-parallax h-full w-full">
							<CoverArt seed={profile.initials} motif="terrain" glyph={profile.initials} ratio="portrait" />
						</div>
					</CoverFrame>
				</div>
			</header>

			<Chapter id="principles" label={m.portfolio_about_principles()} title={m.portfolio_about_principles_heading()}>
				<ol className="grid grid-cols-1 gap-x-(--pf-gutter) gap-y-14 md:grid-cols-2">
					{profile.principles.map((principle, position) => (
						<Reveal
							as="li"
							key={principle.title}
							className="grid grid-cols-[auto_1fr] gap-x-6 border-pf-line border-t pt-6"
						>
							<span className="pf-display text-pf-h3 text-pf-accent tabular-nums">{formatIndex(position + 1)}</span>
							<div className="flex flex-col gap-3">
								<h3 className="pf-display text-pf-h3">{principle.title}</h3>
								<p className="text-pf-body text-pf-ink-2">{principle.body}</p>
							</div>
						</Reveal>
					))}
				</ol>
			</Chapter>

			<Chapter
				id="experience"
				label={m.portfolio_about_experience()}
				title={m.portfolio_about_experience_heading()}
				className="bg-pf-paper-2"
			>
				<ol>
					{experience.map((entry) => (
						<li
							key={entry.id}
							className="grid grid-cols-4 gap-x-(--pf-gutter) gap-y-3 border-pf-line border-t py-8 last:border-b md:grid-cols-12"
						>
							<div className="col-span-4 md:col-span-3">
								<Period entry={entry} />
							</div>
							<div className="col-span-4 md:col-span-4">
								<h3 className="pf-display text-pf-h3">{entry.company}</h3>
								<p className="mt-1 text-pf-body">{entry.role}</p>
								<p className="pf-label mt-2 text-pf-stone">{entry.location}</p>
							</div>
							<p className="col-span-4 text-pf-body text-pf-ink-2 md:col-span-5">{entry.summary}</p>
						</li>
					))}
				</ol>
			</Chapter>

			<CapabilitiesSection capabilities={capabilities} toolbox={profile.toolbox} />
			<VoicesSection testimonials={testimonials} />
			<FinaleSection profile={profile} />
		</>
	);
}
