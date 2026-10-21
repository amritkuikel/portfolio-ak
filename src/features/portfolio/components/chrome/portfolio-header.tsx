import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme";
import { m } from "@/paraglide/messages";
import type { Profile } from "../../types";
import { PORTFOLIO_NAV } from "./nav-items";
import { PortfolioMenu } from "./portfolio-menu";

const navLink =
	"pf-focus pf-label relative py-2 text-pf-ink-2 transition-colors hover:text-pf-ink data-[status=active]:text-pf-ink " +
	"after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:origin-left after:scale-x-0 after:bg-pf-accent " +
	"after:transition-transform after:duration-(--pf-dur-2) hover:after:scale-x-100 data-[status=active]:after:scale-x-100";

/**
 * The portfolio's own header (the app's SiteHeader is hidden by the layout's
 * `chrome: "bare"`). Sticky, solid cotton, a woven-label monogram, the sections and
 * the language and theme controls the rest of the app uses.
 */
export function PortfolioHeader({ profile }: { profile: Pick<Profile, "name" | "initials" | "role"> }) {
	return (
		<header className="sticky top-0 z-40 border-pf-line border-b bg-pf-paper">
			<div className="pf-container flex h-(--pf-header-h) items-center gap-6">
				{/* The link's name is the visible name (WCAG 2.5.3); on phones it is visually hidden, not removed. */}
				<Link to="/" className="pf-focus group/brand flex min-w-0 items-center gap-3">
					<span
						aria-hidden
						className="pf-display flex size-10 shrink-0 items-center justify-center bg-pf-ink pt-0.5 text-xl text-pf-paper shadow-[inset_0_-4px_0_var(--pf-crimson)] transition-colors duration-(--pf-dur-2) group-hover/brand:bg-pf-crimson group-hover/brand:text-pf-light-paper"
					>
						{profile.initials}
					</span>
					<span className="sr-only min-w-0 flex-col leading-tight sm:not-sr-only sm:flex">
						<span className="truncate font-medium">{profile.name}</span>
						<span aria-hidden className="pf-label truncate text-pf-stone">
							{profile.role}
						</span>
					</span>
				</Link>
				<nav aria-label={m.portfolio_nav_label()} className="ml-auto hidden md:block">
					<ul className="flex items-center gap-8">
						{PORTFOLIO_NAV.map((item) => (
							<li key={item.to}>
								<Link to={item.to} className={navLink}>
									{item.label()}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div className="hidden items-center gap-1 md:flex">
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
				<PortfolioMenu className="ml-auto md:hidden" />
			</div>
		</header>
	);
}
