import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboardIcon, LogOutIcon, UserIcon, UserPlusIcon } from "lucide-react";
import { UserAvatar } from "@/components/data-display/user-avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sessionQueryOptions } from "@/features/auth/queries";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { canEnterAdmin } from "@/features/rbac/permissions";
import { m } from "@/paraglide/messages";
import { PARDA_PATHS, pardaLinks } from "../links";

const AUTH_PAGES = new Set(["/app/parda/sign-in", "/app/parda/sign-up"]);

/**
 * The top mask's account control: "Sign in" for visitors (they browse and watch
 * without one, PLAN 12.2); for a session, a menu with the account (a guest is offered
 * Parda's sign-up instead), the admin area when they may enter it, and sign out,
 * which stays in Parda. Profiles join it in Task 64.
 */
export function PardaUserMenu() {
	const { data: session } = useQuery(sessionQueryOptions());
	const { signOut } = useAuthNavigation({ signedOutTo: PARDA_PATHS.home });
	const location = useLocation();
	if (!session) {
		// Already on the way in: the page is the form.
		if (AUTH_PAGES.has(location.pathname)) return null;
		return (
			<Button asChild variant="ghost" size="sm">
				<Link {...pardaLinks.signIn(location.href)} data-testid="parda-sign-in-link">
					{m.pd_sign_in()}
				</Link>
			</Button>
		);
	}
	const guest = session.isAnonymous === true;
	const name = guest ? m.guest_label() : session.user.name;
	const email = guest ? "" : session.user.email;
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" data-testid="user-menu">
					<UserAvatar name={name} email={email} />
					<span className="sr-only">{m.user_menu_label({ name: name || email })}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-56 bg-pd-mask">
				<DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
					<span className="truncate font-medium">{name || email}</span>
					{email ? <span className="truncate text-caption text-muted-foreground">{email}</span> : null}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{guest ? (
						<DropdownMenuItem asChild>
							<Link {...pardaLinks.signUp(location.href)} data-testid="nav-upgrade">
								<UserPlusIcon aria-hidden />
								{m.guest_create_account()}
							</Link>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem asChild>
							<Link to="/account" data-testid="nav-account">
								<UserIcon aria-hidden />
								{m.nav_account()}
							</Link>
						</DropdownMenuItem>
					)}
					{canEnterAdmin(session.permissions) ? (
						<DropdownMenuItem asChild>
							<Link to="/admin">
								<LayoutDashboardIcon aria-hidden />
								{m.nav_admin()}
							</Link>
						</DropdownMenuItem>
					) : null}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => void signOut()} data-testid="sign-out">
					<LogOutIcon aria-hidden />
					{m.nav_logout()}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
