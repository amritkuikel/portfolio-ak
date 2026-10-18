import { m } from "@/paraglide/messages";
import type { Profile } from "../../types";
import { ArrowAnchor, ArrowLink } from "../primitives/arrow-link";
import { Display } from "../primitives/display";
import { Eyebrow } from "../primitives/eyebrow";

/** The last chapter, a vermilion band: the invitation, set as large as the page allows. */
export function FinaleSection({ profile }: { profile: Pick<Profile, "email" | "availability"> }) {
	return (
		<section aria-labelledby="finale-title" className="pf-accent-band pf-section">
			<div className="pf-container pf-grid gap-y-10">
				<Eyebrow className="col-span-4 text-current md:col-span-12">{m.portfolio_finale_eyebrow()}</Eyebrow>
				<Display as="h2" id="finale-title" size="hero" className="col-span-4 md:col-span-12">
					{m.portfolio_finale_heading()}
				</Display>
				<p className="col-span-4 text-pf-lead md:col-span-5">{profile.availability.note}</p>
				<div className="col-span-4 flex flex-col items-start gap-5 md:col-span-5 md:col-start-8 md:items-end md:self-end">
					<ArrowLink to="/portfolio/contact" size="large" className="text-current [&_svg]:text-current">
						{m.portfolio_finale_cta()}
					</ArrowLink>
					<ArrowAnchor
						href={`mailto:${profile.email}`}
						direction="external"
						className="text-current [&_svg]:text-current"
					>
						{profile.email}
					</ArrowAnchor>
				</div>
			</div>
		</section>
	);
}
