import { createFileRoute, Link } from "@tanstack/react-router";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

// Stub page; the real form arrives in Phase 6.
export const Route = createFileRoute("/_auth/register")({
	head: () => ({ meta: [{ title: pageTitle(m.auth_register_title()) }] }),
	component: RegisterPage,
});

function RegisterPage() {
	const search = Route.useSearch();
	return (
		<>
			<h1 className="font-semibold text-2xl tracking-tight">{m.auth_register_title()}</h1>
			<p className="text-muted-foreground">{m.auth_coming_soon()}</p>
			<p className="text-sm">
				{m.auth_have_account()}{" "}
				<Link to="/login" search={search} className="font-medium underline underline-offset-4">
					{m.auth_login_title()}
				</Link>
			</p>
		</>
	);
}
