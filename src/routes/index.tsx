import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: Home });

// Placeholder page for Phase 1. Text moves to Paraglide messages in Phase 4.
function Home() {
	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
			<h1 className="font-semibold text-4xl tracking-tight">Portfolio</h1>
			<Card>
				<CardHeader>
					<CardTitle>Scaffold ready</CardTitle>
					<CardDescription>TanStack Start, Tailwind v4 and shadcn/ui are wired up.</CardDescription>
				</CardHeader>
				<CardContent>
					<p lang="ne" className="text-lg">
						नमस्ते। यो पाठले देवनागरी फन्ट जाँच गर्छ।
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
