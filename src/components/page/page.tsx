import type { ComponentProps, ReactNode } from "react";
import type { Crumb } from "@/lib/breadcrumbs";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";

const WIDTHS = {
	/** Admin pages: full width of the content area next to the sidebar. */
	admin: "px-4 py-8 sm:px-6",
	/** Public grids and lists. */
	wide: "mx-auto max-w-6xl px-4 py-10 sm:py-14",
	/** General public pages. */
	default: "mx-auto max-w-5xl px-4 py-12",
	/** Reading width: detail pages, forms, account. */
	narrow: "mx-auto max-w-3xl px-4 py-10 sm:py-14",
} as const;

/**
 * The page's <main> landmark with one of the app's standard widths and
 * paddings, so every page lines up the same way. Children are stacked with gaps.
 */
export function Page({
	width = "default",
	className,
	...props
}: ComponentProps<"main"> & { width?: keyof typeof WIDTHS }) {
	return <main className={cn("flex w-full min-w-0 flex-col gap-6", WIDTHS[width], className)} {...props} />;
}

/**
 * Breadcrumbs, the page's <h1>, an optional description and actions (top right on
 * wide screens, below the title on narrow ones), plus optional extra content such
 * as a search form. One per page.
 */
export function PageHeader({
	title,
	description,
	actions,
	breadcrumbs = true,
	breadcrumbsJsonLd = false,
	size = "default",
	children,
	className,
}: {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	/** The route's breadcrumb trail above the title (true), none (false) or an explicit trail. */
	breadcrumbs?: boolean | Crumb[];
	/** Also emit the trail as schema.org JSON-LD (indexable public pages). */
	breadcrumbsJsonLd?: boolean;
	/** "display" is the large public-page heading. */
	size?: "default" | "display";
	children?: ReactNode;
	className?: string;
}) {
	return (
		<header className={cn("flex flex-col gap-4", className)}>
			{breadcrumbs ? (
				<Breadcrumbs jsonLd={breadcrumbsJsonLd} items={Array.isArray(breadcrumbs) ? breadcrumbs : undefined} />
			) : null}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-1.5">
					<h1
						className={cn(
							"font-semibold tracking-tight",
							size === "display" ? "text-3xl leading-tight sm:text-4xl" : "text-2xl",
						)}
					>
						{title}
					</h1>
					{description ? (
						<div className={cn("max-w-2xl text-muted-foreground", size === "default" && "text-sm")}>{description}</div>
					) : null}
				</div>
				{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
			</div>
			{children}
		</header>
	);
}
