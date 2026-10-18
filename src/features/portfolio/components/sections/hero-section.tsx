import { m } from "@/paraglide/messages";
import { cssVars } from "../../lib/css-vars";
import type { Profile } from "../../types";
import { AvailabilityBadge } from "../chrome/availability-badge";
import { ArrowAnchor, ArrowLink } from "../primitives/arrow-link";
import { Weave } from "../primitives/weave";

type HeroProfile = Pick<Profile, "headline" | "intro" | "role" | "location" | "timezone" | "availability">;

/**
 * Chapter zero: who, what and where. The headline rises line by line while a
 * length of Dhaka cloth weaves itself beside it, row by row (CSS only, once).
 * The values are static, so the server and the browser render the same thing.
 */
export function HeroSection({ profile }: { profile: HeroProfile }) {
	return (
		<section aria-labelledby="hero-title" className="relative overflow-clip">
			<div className="pf-container pt-[clamp(2rem,6vw,5rem)] pb-[clamp(4rem,8vw,7rem)]">
				<div className="pf-grid gap-y-[clamp(2rem,5vw,4rem)]">
					<div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-pf-ink-2 md:col-span-12">
						<AvailabilityBadge status={profile.availability.status} />
						<p className="pf-label">{profile.role}</p>
						<p className="pf-label font-normal">{profile.location}</p>
						<p className="pf-label font-normal text-pf-stone">{profile.timezone}</p>
					</div>

					<h1 id="hero-title" className="pf-display col-span-4 text-pf-hero md:col-span-12 lg:col-span-9">
						{profile.headline.map((line, position) => (
							<span key={line} className="pf-line" style={cssVars({ "--i": position })}>
								<span>{line}</span>
							</span>
						))}
					</h1>

					{/* On phones a band under the headline; from large screens a hanging length beside it. */}
					<div className="col-span-4 h-24 sm:h-32 md:col-span-12 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-2 lg:h-auto lg:min-h-[28rem]">
						<Weave seed="hero" columns={31} rows={72} animate />
					</div>

					<div className="col-span-4 md:col-span-7 lg:col-span-5">
						<p className="text-pf-lead text-pf-ink-2">{profile.intro}</p>
						<div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
							<ArrowLink to="/portfolio/work">{m.portfolio_hero_cta_work()}</ArrowLink>
							<ArrowLink to="/portfolio/contact">{m.portfolio_hero_cta_contact()}</ArrowLink>
						</div>
					</div>

					<div className="col-span-4 md:col-span-4 md:col-start-9 md:self-end lg:col-span-3 lg:col-start-7">
						<ArrowAnchor href="#manifesto" direction="down" className="pf-label text-pf-stone">
							{m.portfolio_hero_scroll()}
						</ArrowAnchor>
					</div>
				</div>
			</div>
		</section>
	);
}
