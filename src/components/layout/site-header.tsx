import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/features/auth/queries";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { canEnterAdmin } from "@/features/rbac/permissions";
import { clientEnv } from "@/lib/client-env";
import { m } from "@/paraglide/messages";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme";

const navLink =
	"rounded-md px-2 py-1 text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:font-medium data-[status=active]:text-foreground";

export function SiteHeader() {
	// Filled by the root route's beforeLoad, so it's available during SSR and hydration.
	const { data: session } = useQuery(sessionQueryOptions());
	const { signOut } = useAuthNavigation();

	return (
		<header className="border-b">
			{/* Wraps onto two rows on narrow screens instead of overflowing. */}
			<div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
				{/* Brand name from config (VITE_APP_TITLE), identical in every locale. */}
				<Link to="/" className="font-semibold tracking-tight">
					{clientEnv.VITE_APP_TITLE}
				</Link>
				<nav aria-label={m.nav_label()} className="flex flex-wrap items-center gap-1">
					<Link to="/" className={navLink} activeOptions={{ exact: true }}>
						{m.nav_home()}
					</Link>
					<Link to="/stack" className={navLink}>
						{m.nav_stack()}
					</Link>
					<Link to="/test-crud" className={navLink}>
						{m.nav_test_crud()}
					</Link>
					{session && canEnterAdmin(session.permissions) ? (
						<Link to="/admin" className={navLink}>
							{m.nav_admin()}
						</Link>
					) : null}
				</nav>
				<div className="ml-auto flex flex-wrap items-center gap-2">
					<LanguageSwitcher />
					<ThemeToggle />
					{session ? (
						<>
							<Link to="/account" className={navLink} data-testid="nav-account">
								{m.nav_account()}
							</Link>
							<button type="button" onClick={signOut} className={navLink}>
								{m.nav_logout()}
							</button>
						</>
					) : (
						<Link to="/login" className={navLink} data-testid="nav-login">
							{m.nav_login()}
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
