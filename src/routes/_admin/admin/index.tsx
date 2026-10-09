import { createFileRoute, Link } from "@tanstack/react-router";
import { DatabaseIcon } from "lucide-react";
import { Page, PageHeader } from "@/components/page/page";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/")({
	head: () => ({ meta: [{ title: pageTitle(m.admin_title()) }] }),
	component: AdminHome,
});

/** Admin sections, one card each (the sidebar lists the same places). */
const SECTIONS = [
	{ to: "/admin/test-crud", title: m.test_crud_title, description: m.test_crud_admin_description, icon: DatabaseIcon },
] as const;

function AdminHome() {
	return (
		<Page width="admin">
			<PageHeader title={m.admin_title()} description={m.admin_dashboard_description()} />
			<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{SECTIONS.map((section) => (
					<li key={section.to} className="flex">
						<Card className="relative w-full transition-shadow focus-within:ring-[3px] focus-within:ring-ring/50 hover:shadow-md">
							<CardHeader>
								<section.icon className="size-5 text-muted-foreground" aria-hidden />
								<CardTitle>
									{/* Stretched over the card: the whole card is clickable, one link for screen readers. */}
									<Link to={section.to} className="outline-none after:absolute after:inset-0">
										{section.title()}
									</Link>
								</CardTitle>
								<CardDescription>{section.description()}</CardDescription>
							</CardHeader>
						</Card>
					</li>
				))}
			</ul>
		</Page>
	);
}
