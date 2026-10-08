import { Link } from "@tanstack/react-router";
import {
	DatabaseIcon,
	LayoutDashboardIcon,
	type LucideIcon,
	PanelLeftCloseIcon,
	PanelLeftOpenIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/lib/stores/hooks";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

type NavItem = { to: "/admin" | "/admin/test-crud"; label: () => string; icon: LucideIcon; exact?: boolean };

const NAV: ReadonlyArray<NavItem> = [
	{ to: "/admin", label: m.admin_nav_dashboard, icon: LayoutDashboardIcon, exact: true },
	{ to: "/admin/test-crud", label: m.admin_nav_test_crud, icon: DatabaseIcon },
];

const SIDEBAR_ID = "admin-sidebar";

/**
 * Collapsible admin sidebar. Open/collapsed lives in the preferences store and a
 * cookie, so the server renders the remembered width (no jump after hydration).
 * Collapsed, items show icons only; their names stay available to screen
 * readers (sr-only) and as tooltips.
 */
export function AdminSidebar() {
	const { collapsed, toggle } = useSidebar();
	const ToggleIcon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
	return (
		<aside
			className={cn(
				"flex shrink-0 flex-col gap-1 border-e p-2 transition-[width] motion-reduce:transition-none",
				// Always icon-only on phones: a 224px sidebar would leave too little room for content.
				collapsed ? "w-14" : "w-14 md:w-56",
			)}
			data-collapsed={collapsed || undefined}
			data-testid="admin-sidebar"
		>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="self-end"
				aria-expanded={!collapsed}
				aria-controls={SIDEBAR_ID}
				aria-label={collapsed ? m.admin_sidebar_expand() : m.admin_sidebar_collapse()}
				onClick={toggle}
			>
				<ToggleIcon aria-hidden />
			</Button>
			<nav id={SIDEBAR_ID} aria-label={m.admin_sidebar_label()}>
				<ul className="flex flex-col gap-1">
					{NAV.map((item) => (
						<li key={item.to}>
							<Link
								to={item.to}
								activeOptions={{ exact: item.exact ?? false }}
								title={collapsed ? item.label() : undefined}
								className="flex h-9 items-center gap-3 rounded-md px-2.5 text-muted-foreground text-sm outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-foreground"
							>
								<item.icon className="size-4 shrink-0" aria-hidden />
								<span className={cn(collapsed ? "sr-only" : "max-md:sr-only")}>{item.label()}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}

/** Admin pages: sidebar + content. */
export function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-1">
			<AdminSidebar />
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
