import { Link } from "@tanstack/react-router";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { Profile } from "../../types";
import { ArrowAnchor } from "../primitives/arrow-link";
import { Eyebrow } from "../primitives/eyebrow";
import { Weave } from "../primitives/weave";
import { PORTFOLIO_NAV } from "./nav-items";

type FooterProfile = Pick<Profile, "name" | "email" | "socials" | "since" | "updated">;

/** The closing indigo band, edged with a woven selvedge: a last call to action, the sitemap, the colophon and a giant wordmark. */
export function PortfolioFooter({ profile }: { profile: FooterProfile }) {
	const years = `${formatNumber(profile.since, { useGrouping: false })}–${formatNumber(profile.updated, { useGrouping: false })}`;
	return (
		<footer className="pf-inverse overflow-clip">
			<div className="h-14 md:h-20">
				<Weave seed="selvedge" columns={241} rows={11} cell={8} />
			</div>
			<div className="pf-container pt-[clamp(5rem,10vw,9rem)]">
				<div className="pf-grid gap-y-8 border-pf-line border-b pb-[clamp(4rem,8vw,7rem)]">
					<div className="col-span-4 md:col-span-7">
						<Eyebrow>{m.portfolio_footer_cta()}</Eyebrow>
						<a
							href={`mailto:${profile.email}`}
							className="pf-focus pf-display pf-link mt-6 inline-block text-pf-h2 [overflow-wrap:anywhere]"
						>
							{profile.email}
						</a>
					</div>
				</div>

				<div className="pf-grid gap-y-12 py-[clamp(3rem,6vw,5rem)]">
					<nav aria-label={m.portfolio_footer_navigate()} className="col-span-2 md:col-span-3">
						<h2 className="pf-label mb-5 text-pf-stone">{m.portfolio_footer_navigate()}</h2>
						<ul className="flex flex-col gap-3">
							<li>
								<Link to="/" className="pf-focus pf-link" activeOptions={{ exact: true }}>
									{m.portfolio_nav_home()}
								</Link>
							</li>
							{PORTFOLIO_NAV.map((item) => (
								<li key={item.to}>
									<Link to={item.to} className="pf-focus pf-link">
										{item.label()}
									</Link>
								</li>
							))}
						</ul>
					</nav>
					<div className="col-span-2 md:col-span-3">
						<h2 className="pf-label mb-5 text-pf-stone">{m.portfolio_footer_elsewhere()}</h2>
						<ul className="flex flex-col gap-3">
							{profile.socials.map((social) => (
								<li key={social.network}>
									<ArrowAnchor href={social.href} direction="external" rel="me noopener" className="font-normal">
										{social.network}
									</ArrowAnchor>
								</li>
							))}
						</ul>
					</div>
					<div className="col-span-4 md:col-span-4 md:col-start-9">
						<h2 className="pf-label mb-5 text-pf-stone">{m.portfolio_footer_colophon()}</h2>
						<p className="pf-measure text-pf-small text-pf-ink-2">{m.portfolio_footer_colophon_body()}</p>
					</div>
				</div>

				<p
					aria-hidden
					className="pf-display select-none pb-[0.06em] text-[clamp(3.5rem,0.5rem+16.5vw,24rem)] leading-[0.85]"
				>
					{profile.name}
				</p>

				<div className="flex flex-wrap items-center justify-between gap-4 border-pf-line border-t py-6 text-pf-small text-pf-ink-2">
					<p>{m.portfolio_footer_copyright({ years, name: profile.name })}</p>
					<ArrowAnchor href="#pf-top" direction="up" className="font-normal text-pf-small">
						{m.portfolio_footer_back_to_top()}
					</ArrowAnchor>
				</div>
			</div>
		</footer>
	);
}
