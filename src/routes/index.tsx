import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber, formatRelativeTimeFrom } from "@/lib/intl";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/")({ component: Home });

// Fixed sample values: identical on server and client, so formatting can't cause hydration mismatches.
const SAMPLE_DATE = "2026-01-15T10:30:00Z";
const SAMPLE_NOW = "2026-01-18T10:30:00Z";

function Home() {
	const rows = [
		{ label: m.intl_date(), value: formatDate(SAMPLE_DATE, { dateStyle: "full" }) },
		{ label: m.intl_number(), value: formatNumber(1234567.89) },
		{ label: m.intl_currency(), value: formatCurrency(1234567.5) },
		{ label: m.intl_relative_time(), value: formatRelativeTimeFrom(SAMPLE_DATE, SAMPLE_NOW) },
	];

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-4xl tracking-tight">{m.home_title()}</h1>
				<p className="text-lg text-muted-foreground">{m.home_intro()}</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{m.intl_preview_title()}</CardTitle>
					<CardDescription>{m.intl_preview_description()}</CardDescription>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
						{rows.map((row) => (
							<div key={row.label} className="contents">
								<dt className="text-muted-foreground">{row.label}</dt>
								<dd data-testid="intl-value">{row.value}</dd>
							</div>
						))}
					</dl>
				</CardContent>
			</Card>
		</main>
	);
}
