import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { authFeaturesQueryOptions } from "@/features/auth/queries";
import { m } from "@/paraglide/messages";
import { profileQueryOptions } from "../../queries";
import { AvailabilityBadge } from "../chrome/availability-badge";
import { ContactForm } from "../contact/contact-form";
import { CopyEmailButton } from "../contact/copy-email-button";
import { ArrowAnchor } from "../primitives/arrow-link";
import { Display } from "../primitives/display";
import { Eyebrow } from "../primitives/eyebrow";

const FIT = [m.portfolio_contact_fit_1, m.portfolio_contact_fit_2, m.portfolio_contact_fit_3] as const;

function Detail({ term, children }: { term: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2 border-pf-line border-t py-5">
			<dt className="pf-label text-pf-stone">{term}</dt>
			<dd className="text-pf-body">{children}</dd>
		</div>
	);
}

/** /contact: email (mailto + copy), the details, and the contact form (its messages reach the admin inbox). */
export function ContactPage() {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	const { data: features } = useSuspenseQuery(authFeaturesQueryOptions());
	return (
		<>
			<header className="pf-container pf-grid gap-y-10 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(4rem,8vw,7rem)]">
				<Eyebrow className="col-span-4 md:col-span-12">{m.portfolio_contact_title()}</Eyebrow>
				<Display as="h1" size="hero" className="col-span-4 md:col-span-12">
					{m.portfolio_contact_heading()}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-6">{m.portfolio_contact_intro()}</p>
				<div className="col-span-4 flex flex-col items-start gap-5 md:col-span-12">
					<a
						href={`mailto:${profile.email}`}
						className="pf-focus pf-display pf-link text-pf-h2 text-pf-accent [overflow-wrap:anywhere]"
					>
						{profile.email}
					</a>
					<CopyEmailButton email={profile.email} />
				</div>
			</header>

			<section aria-labelledby="contact-details" className="pf-container pf-grid gap-y-16 pb-[clamp(5rem,10vw,9rem)]">
				<div className="col-span-4 md:col-span-5">
					<h2 id="contact-details" className="pf-label mb-4 text-pf-stone">
						{m.portfolio_contact_details()}
					</h2>
					<dl>
						<Detail term={m.portfolio_contact_availability()}>
							<AvailabilityBadge status={profile.availability.status} className="mb-2 flex" />
							<span className="text-pf-ink-2">{profile.availability.note}</span>
						</Detail>
						<Detail term={m.portfolio_contact_location()}>{profile.location}</Detail>
						<Detail term={m.portfolio_contact_timezone()}>{profile.timezone}</Detail>
						<Detail term={m.portfolio_contact_response()}>{m.portfolio_contact_response_time()}</Detail>
						<Detail term={m.portfolio_footer_elsewhere()}>
							<ul className="flex flex-col gap-2">
								{profile.socials.map((social) => (
									<li key={social.network}>
										<ArrowAnchor href={social.href} direction="external" rel="me noopener">
											{social.network} <span className="text-pf-stone">{social.handle}</span>
										</ArrowAnchor>
									</li>
								))}
							</ul>
						</Detail>
					</dl>
					<h2 className="pf-display mt-14 mb-6 text-pf-h3">{m.portfolio_contact_fit_heading()}</h2>
					<ol className="flex flex-col">
						{FIT.map((item, position) => (
							<li key={item()} className="flex gap-6 border-pf-line border-t py-6 text-pf-body">
								<span className="pf-label pt-1 text-pf-accent">{position + 1}</span>
								<span>{item()}</span>
							</li>
						))}
					</ol>
				</div>
				<div className="col-span-4 md:col-span-6 md:col-start-7">
					<ContactForm turnstileSiteKey={features.turnstileSiteKey} />
				</div>
			</section>
		</>
	);
}
