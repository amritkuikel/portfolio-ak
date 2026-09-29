import { createFileRoute } from "@tanstack/react-router";
import { getDbHealth } from "@/functions/health";

export const Route = createFileRoute("/health")({
	loader: () => getDbHealth(),
	// Always re-check; a cached health result is meaningless.
	staleTime: 0,
	gcTime: 0,
	component: HealthPage,
});

// Placeholder UI for Phase 3. Text moves to Paraglide messages in Phase 4.
function HealthPage() {
	const health = Route.useLoaderData();
	const ok = health.status === "ok";
	return (
		<main className="mx-auto max-w-3xl px-4 py-16">
			<h1 className="font-semibold text-2xl tracking-tight">Health</h1>
			<dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
				<dt className="text-muted-foreground">Database</dt>
				<dd data-testid="db-status" className={ok ? "text-green-700 dark:text-green-400" : "text-destructive"}>
					{ok ? "OK" : "Unreachable"}
				</dd>
				<dt className="text-muted-foreground">Latency</dt>
				<dd>{health.latencyMs} ms</dd>
				<dt className="text-muted-foreground">Checked at</dt>
				<dd>
					<time dateTime={health.checkedAt}>{health.checkedAt}</time>
				</dd>
			</dl>
		</main>
	);
}
