import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
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
 * The editorial portfolio site (docs/guides/portfolio.md). It brings its own
 * header and footer, so it asks the root layout for no app chrome, and scopes
 * its design tokens under `.portfolio` (src/styles/portfolio.css).
 */
export const Route = createFileRoute("/portfolio")({
	// The header and footer need the owner's name, email and links on every page.
	loader: ({ context }) => context.queryClient.ensureQueryData(profileQueryOptions()),
	staticData: { chrome: "bare", breadcrumb: staticCrumb(m.portfolio_section_label) },
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

/** The section's frame: the token scope, a skip link, the header, the main landmark and the footer. */
function PortfolioShell({ children }: { children: ReactNode }) {
	const { data: profile } = useSuspenseQuery(profileQueryOptions());
	return (
		<div id="pf-top" className="portfolio pf-canvas flex flex-1 flex-col">
			<a
				href="#pf-main"
				className="pf-focus pf-label sr-only z-50 bg-pf-ink px-4 py-3 text-pf-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
			>
				{m.skip_to_content()}
			</a>
			<PortfolioHeader profile={profile} />
			<main id="pf-main" tabIndex={-1} className="flex-1 outline-none">
				{children}
			</main>
			<PortfolioFooter profile={profile} />
		</div>
	);
}
