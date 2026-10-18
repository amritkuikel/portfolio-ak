import { Link } from "@tanstack/react-router";
import { type KeyboardEvent, useRef } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme";
import { m } from "@/paraglide/messages";
import { cn } from "../../lib/cn";
import { formatIndex } from "../primitives/eyebrow";
import { PORTFOLIO_NAV } from "./nav-items";

/**
 * The phone menu: a native <details> disclosure, so it opens and closes before
 * JavaScript loads. Once hydrated, choosing a link or pressing Escape closes it.
 */
export function PortfolioMenu({ className }: { className?: string | undefined }) {
	const details = useRef<HTMLDetailsElement>(null);
	const close = () => {
		if (details.current) details.current.open = false;
	};
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Escape" || !details.current?.open) return;
		close();
		details.current.querySelector("summary")?.focus();
	};

	return (
		<details ref={details} className={cn("group", className)} onKeyDown={onKeyDown}>
			<summary className="pf-focus pf-label flex cursor-pointer list-none items-center gap-2 border-2 border-pf-ink px-4 py-2 [&::-webkit-details-marker]:hidden">
				<span className="group-open:hidden">{m.portfolio_menu_open()}</span>
				<span className="hidden group-open:inline">{m.portfolio_menu_close()}</span>
			</summary>
			<div className="pf-canvas fixed inset-x-0 top-(--pf-header-h) bottom-0 z-40 flex flex-col overflow-y-auto border-pf-line border-t">
				<nav aria-label={m.portfolio_nav_label()} className="pf-container flex-1 py-10">
					<ul className="flex flex-col gap-2">
						{PORTFOLIO_NAV.map((item, position) => (
							<li key={item.to}>
								<Link
									to={item.to}
									onClick={close}
									className="pf-focus pf-display flex items-baseline gap-4 py-2 text-pf-h2 data-[status=active]:text-pf-accent"
								>
									<span className="pf-label text-pf-stone">{formatIndex(position + 1)}</span>
									{item.label()}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div className="pf-container flex items-center justify-between gap-4 border-pf-line border-t py-6">
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</details>
	);
}
