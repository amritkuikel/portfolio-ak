import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronsUpDownIcon, LayoutDashboardIcon, LogOutIcon, PaletteIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/** Up to two initials from a name ("Sita Rai" -> "SR"), or the email's first letter. */
export const initials = (name: string, email: string) => {
	const words = name.trim().split(/\s+/).filter(Boolean);
	const letters = words.length > 1 ? `${words[0]?.[0] ?? ""}${words.at(-1)?.[0] ?? ""}` : (words[0]?.slice(0, 2) ?? "");
	return (letters || email.slice(0, 1)).toUpperCase();
};

export function UserAvatar({ name, email, className }: { name: string; email: string; className?: string }) {
	return (
		<Avatar className={cn("size-7 rounded-md", className)}>
			{/* Hidden from screen readers: the button around it names the user in words. */}
			<AvatarFallback
				className="rounded-md bg-accent-subtle font-medium text-caption text-foreground"
				aria-hidden="true"
			>
				{initials(name, email)}
			</AvatarFallback>
		</Avatar>
	);
}

/**
 * The signed-in user's menu: account, the admin area and appearance (when they may
 * enter it), sign out. `variant="sidebar"` shows the name and email next to the
 * avatar (the admin sidebar's footer); "compact" is the avatar alone (headers).
 * Renders nothing when signed out.
 */
export function UserMenu({ variant = "compact" }: { variant?: "compact" | "sidebar" }) {
	const { data: session } = useQuery(sessionQueryOptions());
	const { signOut } = useAuthNavigation();
	if (!session) return null;
	const { name, email } = session.user;
	const admin = canEnterAdmin(session.permissions);
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				{variant === "sidebar" ? (
					<Button
						variant="ghost"
						className="h-auto w-full justify-start gap-2 px-1.5 py-1.5 text-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0.5"
						data-testid="user-menu"
					>
						<UserAvatar name={name} email={email} />
						<span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
							<span className="truncate font-medium text-body leading-5">{name || email}</span>
							<span className="truncate text-caption text-muted-foreground">{email}</span>
						</span>
						<ChevronsUpDownIcon className="text-muted-foreground group-data-[collapsible=icon]:hidden" aria-hidden />
					</Button>
				) : (
					<Button variant="ghost" size="icon" data-testid="user-menu">
						<UserAvatar name={name} email={email} />
						<span className="sr-only">{m.user_menu_label({ name: name || email })}</span>
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" side={variant === "sidebar" ? "top" : "bottom"} className="min-w-56">
				<DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
					<span className="truncate font-medium">{name || email}</span>
					<span className="truncate text-caption text-muted-foreground">{email}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link to="/account" data-testid="nav-account">
							<UserIcon aria-hidden />
							{m.nav_account()}
						</Link>
					</DropdownMenuItem>
					{admin ? (
						<>
							<DropdownMenuItem asChild>
								<Link to="/admin">
									<LayoutDashboardIcon aria-hidden />
									{m.nav_admin()}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/admin/settings/appearance">
									<PaletteIcon aria-hidden />
									{m.admin_nav_appearance()}
								</Link>
							</DropdownMenuItem>
						</>
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
