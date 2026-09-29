import { Link } from "@tanstack/react-router";
import { clientEnv } from "@/lib/client-env";

export function SiteHeader() {
	return (
		<header className="border-b">
			<div className="mx-auto flex h-14 max-w-5xl items-center px-4">
				<Link to="/" className="font-semibold tracking-tight">
					{clientEnv.VITE_APP_TITLE}
				</Link>
			</div>
		</header>
	);
}
