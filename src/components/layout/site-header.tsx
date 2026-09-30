import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/features/auth/queries";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { clientEnv } from "@/lib/client-env";
import { m } from "@/paraglide/messages";
import { LanguageSwitcher } from "./language-switcher";

const navLink =
	"rounded-md px-2 py-1 text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:font-medium data-[status=active]:text-foreground";

export function SiteHeader() {
	// Filled by the root route's beforeLoad, so it's available during SSR and hydration.
	const { data: session } = useQuery(sessionQueryOptions());
	const { signOut } = useAuthNavigation();

	return (
		<header className="border-b">
			<div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
				{/* Brand name from config (VITE_APP_TITLE), identical in every locale. */}
				<Link to="/" className="font-semibold tracking-tight">
					{clientEnv.VITE_APP_TITLE}
				</Link>
				<nav aria-label={m.nav_label()} className="flex items-center gap-1">
					<Link to="/" className={navLink} activeOptions={{ exact: true }}>
						{m.nav_home()}
					</Link>
					<Link to="/stack" className={navLink}>
						{m.nav_stack()}
					</Link>
					{session?.user.role === "admin" ? (
						<Link to="/admin" className={navLink}>
							{m.nav_admin()}
						</Link>
					) : null}
				</nav>
				<div className="ml-auto flex items-center gap-2">
					<LanguageSwitcher />
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
