import { m } from "@/paraglide/messages";
import { ArrowLink } from "../primitives/arrow-link";
import { Display } from "../primitives/display";
import { Eyebrow } from "../primitives/eyebrow";

/** The portfolio's 404: a missing project or article, in the site's own voice and chrome. */
export function PortfolioNotFound() {
	return (
		<section aria-labelledby="not-found-title" className="pf-section" data-testid="portfolio-not-found">
			<div className="pf-container pf-grid gap-y-8">
				<Eyebrow className="col-span-4 md:col-span-12">404</Eyebrow>
				<Display as="h1" id="not-found-title" size="h1" className="col-span-4 md:col-span-9">
					{m.portfolio_not_found_title()}
				</Display>
				<p className="col-span-4 text-pf-lead text-pf-ink-2 md:col-span-6">{m.portfolio_not_found_body()}</p>
				<div className="col-span-4 flex flex-wrap gap-x-10 gap-y-4 md:col-span-12">
					<ArrowLink to="/work">{m.portfolio_nav_work()}</ArrowLink>
					<ArrowLink to="/">{m.portfolio_not_found_cta()}</ArrowLink>
				</div>
			</div>
		</section>
	);
}
