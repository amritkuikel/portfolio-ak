import { useSuspenseQuery } from "@tanstack/react-query";
import { formatMonthYear } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { aboutQueryOptions, profileQueryOptions } from "../../queries";
import type { Experience } from "../../types";
import { Chapter } from "../primitives/chapter";
import { CoverArt } from "../primitives/cover-art";
import { CoverFrame } from "../primitives/cover-frame";
import { Display } from "../primitives/display";
import { Eyebrow, formatIndex } from "../primitives/eyebrow";
import { Reveal } from "../primitives/reveal";
import { CapabilitiesSection } from "../sections/capabilities-section";
import { FinaleSection } from "../sections/finale-section";
import { VoicesSection } from "../sections/voices-section";

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

/** /about: the owner's story, principles, experience, capabilities and voices. */
export function AboutPage() {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	const { data: about } = useSuspenseQuery(aboutQueryOptions());
	const [firstParagraph, ...otherParagraphs] = profile.bio;

	return (
		<>
			<header className="pf-container pf-grid gap-y-10 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(4rem,8vw,7rem)]">
				<Eyebrow className="col-span-4 md:col-span-12">{m.portfolio_about_title()}</Eyebrow>
				<Display as="h1" size="hero" className="col-span-4 md:col-span-12">
					{m.portfolio_about_heading({ name: profile.name })}
				</Display>
				<div className="col-span-4 flex flex-col gap-6 md:col-span-6" lang={profile.lang}>
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
							lang={principle.lang}
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
					{about.experience.map((entry) => (
						<li
							key={entry.id}
							lang={entry.lang}
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

			<CapabilitiesSection capabilities={about.skills} toolbox={profile.toolbox} />
			<VoicesSection testimonials={about.testimonials} />
			<FinaleSection profile={profile} />
		</>
	);
}
