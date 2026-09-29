import { m } from "@/paraglide/messages";

export function SiteFooter() {
	return (
		<footer className="border-t">
			<div className="mx-auto max-w-5xl px-4 py-6 text-muted-foreground text-sm">{m.footer_built_with()}</div>
		</footer>
	);
}
