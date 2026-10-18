import { m } from "@/paraglide/messages";
import { cssVars } from "../../lib/css-vars";
import type { Profile } from "../../types";
import { AvailabilityBadge } from "../chrome/availability-badge";
import { ArrowAnchor, ArrowLink } from "../primitives/arrow-link";

type HeroProfile = Pick<Profile, "headline" | "intro" | "role" | "location" | "timezone" | "availability">;

/** Decorative orbit rings behind the headline: a quiet sun, in the accent colour. */
function HeroRings() {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			viewBox="0 0 600 600"
			className="pointer-events-none absolute top-[2%] -right-[22vw] w-[min(62vw,34rem)] text-pf-accent md:-right-[8vw] lg:-right-[4vw]"
		>
			<circle cx="300" cy="300" r="120" className="fill-pf-accent" />
			{[170, 215, 260, 296].map((r, ring) => (
				<circle
					key={r}
					cx="300"
					cy="300"
					r={r}
					fill="none"
					stroke="currentColor"
					strokeWidth={ring === 3 ? 1 : 1.5}
					strokeDasharray={ring === 1 ? "4 10" : undefined}
					opacity={1 - ring * 0.2}
				/>
			))}
		</svg>
	);
}

/**
 * Chapter zero: who, what and where, with the headline rising line by line
 * on load (CSS only). The values are static, so the server and the browser
 * render the same thing.
 */
export function HeroSection({ profile }: { profile: HeroProfile }) {
	const lastLine = profile.headline.length - 1;
	return (
		<section aria-labelledby="hero-title" className="relative overflow-clip">
			<HeroRings />
			<div className="pf-container relative pt-[clamp(3rem,9vw,8rem)] pb-[clamp(4rem,9vw,8rem)]">
				<div className="pf-grid gap-y-[clamp(2.5rem,6vw,5rem)]">
					<div className="col-span-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-pf-ink-2 md:col-span-12">
						<AvailabilityBadge status={profile.availability.status} />
						<p className="pf-label">{profile.role}</p>
						<p className="pf-label">
							{profile.location} · {profile.timezone}
						</p>
					</div>

					<h1 id="hero-title" className="pf-display col-span-4 text-pf-hero md:col-span-12">
						{profile.headline.map((line, position) => (
							<span key={line} className="pf-line" style={cssVars({ "--i": position })}>
								<span className={position === lastLine ? "text-pf-accent italic" : undefined}>{line}</span>
							</span>
						))}
					</h1>

					<div className="col-span-4 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
						<p className="text-pf-lead text-pf-ink-2">{profile.intro}</p>
						<div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
							<ArrowLink to="/portfolio/work">{m.portfolio_hero_cta_work()}</ArrowLink>
							<ArrowLink to="/portfolio/contact">{m.portfolio_hero_cta_contact()}</ArrowLink>
						</div>
					</div>

					<div className="col-span-4 md:col-span-4 md:row-start-3 md:self-end">
						<ArrowAnchor href="#manifesto" direction="down" className="pf-label font-normal text-pf-stone">
							{m.portfolio_hero_scroll()}
						</ArrowAnchor>
					</div>
				</div>
			</div>
		</section>
	);
}
