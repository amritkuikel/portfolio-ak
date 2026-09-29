import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

// Placeholder; the admin UI arrives with Test CRUD (Phase 9).
export const Route = createFileRoute("/_admin/admin/")({
	head: () => ({ meta: [{ title: pageTitle(m.admin_title()) }] }),
	component: AdminHome,
});

function AdminHome() {
	return (
		<main className="mx-auto max-w-5xl px-4 py-16">
			<h1 className="font-semibold text-2xl tracking-tight">{m.admin_title()}</h1>
		</main>
	);
}
