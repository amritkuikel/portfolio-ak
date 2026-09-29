import { Link } from "@tanstack/react-router";
import { clientEnv } from "@/lib/client-env";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
	return (
		<header className="border-b">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
				{/* Brand name from config (VITE_APP_TITLE), identical in every locale. */}
				<Link to="/" className="font-semibold tracking-tight">
					{clientEnv.VITE_APP_TITLE}
				</Link>
				<LanguageSwitcher />
			</div>
		</header>
	);
}
