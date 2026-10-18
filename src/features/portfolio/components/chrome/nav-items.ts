import { m } from "@/paraglide/messages";

/** The portfolio's main sections, in navigation order. Labels are messages, called at render time. */
export const PORTFOLIO_NAV = [
	{ to: "/portfolio/work", label: m.portfolio_nav_work },
	{ to: "/portfolio/about", label: m.portfolio_nav_about },
	{ to: "/portfolio/journal", label: m.portfolio_nav_journal },
	{ to: "/portfolio/contact", label: m.portfolio_nav_contact },
] as const;
