import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { PortfolioFooter } from "@/features/portfolio/components/chrome/portfolio-footer";
import { PortfolioHeader } from "@/features/portfolio/components/chrome/portfolio-header";
import { PortfolioNotFound } from "@/features/portfolio/components/chrome/portfolio-not-found";
import { portfolioFontPreloads } from "@/features/portfolio/lib/fonts";
import { profileQueryOptions } from "@/features/portfolio/queries";
import { staticCrumb } from "@/lib/breadcrumbs";
import { NOINDEX } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

/**
 * The portfolio at `/` (docs/guides/portfolio.md): a pathless layout with its own
 * header and footer, its design tokens scoped under `.portfolio`
 * (src/styles/portfolio.css). Its pages never read the session, so the root
 * skips looking it up (`staticData.session: "skip"`, decision 0161).
 */
export const Route = createFileRoute("/_site")({
	// The header and footer need the owner's name, email and links on every page.
	loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions()),
	staticData: { session: "skip", breadcrumb: staticCrumb(m.portfolio_section_label) },
	// noindex is only the fallback (a 404 inside the section): every page's own seo() overrides it.
	head: () => ({ meta: [NOINDEX], links: portfolioFontPreloads(getLocale()) }),
	// A layout's notFoundComponent replaces the layout, so it brings the shell itself.
	notFoundComponent: () => (
		<PortfolioShell>
			<PortfolioNotFound />
		</PortfolioShell>
	),
	component: () => (
		<PortfolioShell>
			<Outlet />
		</PortfolioShell>
	),
});

/** The section's frame: the token scope, the header, the main landmark (the root skip link's target) and the footer. */
function PortfolioShell({ children }: { children: ReactNode }) {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	return (
		<div id="pf-top" className="portfolio pf-canvas flex flex-1 flex-col">
			<PortfolioHeader profile={profile} />
			<main {...MAIN_CONTENT} className="flex-1 outline-none">
				{children}
			</main>
			<PortfolioFooter profile={profile} />
		</div>
	);
}
