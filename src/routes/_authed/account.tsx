import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

// Placeholder; account settings arrive in Phase 6.
export const Route = createFileRoute("/_authed/account")({
	head: () => ({ meta: [{ title: pageTitle(m.account_title()) }] }),
	component: AccountPage,
});

function AccountPage() {
	const { session } = Route.useRouteContext();
	return (
		<main className="mx-auto max-w-3xl px-4 py-16">
			<h1 className="font-semibold text-2xl tracking-tight">{m.account_title()}</h1>
			<p className="mt-2 text-muted-foreground">{session.user.email}</p>
		</main>
	);
}
