import type { ReactNode } from "react";
import { Page, PageHeader } from "@/components/page/page";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { type ExampleSlug, exampleBySlug } from "./registry";

/** The frame of every example page: title, what it shows, where the code and the guide are. */
export function ExamplePage({ slug, children }: { slug: ExampleSlug; children: ReactNode }) {
	const example = exampleBySlug(slug);
	return (
		<Page className="gap-8">
			<PageHeader title={example.title()} description={example.description()} breadcrumbs>
				<dl className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
					<dt className="text-muted-foreground">{m.examples_source()}</dt>
					<dd className="break-all font-mono text-xs leading-5">{example.source}</dd>
					<dt className="text-muted-foreground">{m.examples_guide()}</dt>
					<dd className="break-all font-mono text-xs leading-5">{example.guide}</dd>
				</dl>
			</PageHeader>
			{children}
		</Page>
	);
}

/** One part of an example, with a heading (h2) and an optional note. */
export function Demo({
	title,
	note,
	children,
	className,
}: {
	title: string;
	note?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("flex flex-col gap-3 rounded-xl border p-4 sm:p-6", className)}>
			<div className="flex flex-col gap-1">
				<h2 className="font-semibold text-lg">{title}</h2>
				{note ? <p className="text-muted-foreground text-sm">{note}</p> : null}
			</div>
			{children}
		</section>
	);
}

/** A definition list of label/value rows (what the example measured). */
export function Facts({ rows }: { rows: ReadonlyArray<{ label: string; value: ReactNode; testId?: string }> }) {
	return (
		// Stacked on phones; label and value side by side from sm (long values must not overflow).
		<dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[max-content_minmax(0,1fr)] sm:gap-y-2">
			{rows.map((row) => (
				<div key={row.label} className="contents">
					<dt className="text-muted-foreground">{row.label}</dt>
					<dd data-testid={row.testId} className="mb-2 min-w-0 break-words sm:mb-0">
						{row.value}
					</dd>
				</div>
			))}
		</dl>
	);
}
