import { Link } from "@tanstack/react-router";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function NotFoundPage() {
	return (
		<main
			{...MAIN_CONTENT}
			className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-16"
			data-testid="not-found-page"
		>
			<h1 className="font-semibold text-2xl tracking-tight">{m.not_found_title()}</h1>
			<p className="text-muted-foreground">{m.not_found_description()}</p>
			<Button asChild variant="outline">
				<Link to="/">{m.error_go_home()}</Link>
			</Button>
		</main>
	);
}
