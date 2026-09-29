import { useSuspenseQuery } from "@tanstack/react-query";
import { Await, createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { stackListQueryOptions } from "@/features/stack/queries";
import {
	STACK_PAGE_SIZE,
	STACK_SEARCH_DEFAULTS,
	type StackSort,
	type StackStats,
	stackSearchSchema,
} from "@/features/stack/schema";
import { getStackStats } from "@/functions/stack";
import { formatNumber } from "@/lib/intl";
import { pageTitle } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/stack")({
	validateSearch: stackSearchSchema,
	// Keep URLs clean: default values are removed from generated links.
	search: { middlewares: [stripSearchParams(STACK_SEARCH_DEFAULTS)] },
	loaderDeps: ({ search }) => search,
	loader: async ({ context: { queryClient }, deps }) => {
		// Awaited: the list is part of the SSR HTML and hydrates the Query cache.
		await queryClient.ensureQueryData(stackListQueryOptions(deps));
		// Not awaited: streamed to the client when ready (deferred).
		return { stats: getStackStats() };
	},
	head: () => ({
		meta: [{ title: pageTitle(m.stack_title()) }, { name: "description", content: m.stack_description() }],
	}),
	pendingComponent: StackPending,
	component: StackPage,
});

const SORT_LABELS: Record<StackSort, () => string> = {
	name: m.stack_sort_name,
	"-name": m.stack_sort_name_desc,
	category: m.stack_sort_category,
};

function StackPage() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const { data } = useSuspenseQuery(stackListQueryOptions(search));
	const { stats } = Route.useLoaderData();

	// Without JS the form does a normal GET to this URL; with JS we navigate client-side.
	const onSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const q = String(new FormData(event.currentTarget).get("q") ?? "");
		void navigate({ search: (prev) => ({ ...prev, q, page: 1 }) });
	};

	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
			<header className="flex flex-col gap-2">
				<h1 className="font-semibold text-3xl tracking-tight">{m.stack_title()}</h1>
				<p className="text-muted-foreground">{m.stack_description()}</p>
			</header>

			<section aria-labelledby="stack-stats" className="rounded-lg border p-4">
				<h2 id="stack-stats" className="font-medium">
					{m.stack_stats_title()}
				</h2>
				<Await
					promise={stats}
					fallback={
						<p className="text-muted-foreground" data-testid="stats-fallback">
							{m.stack_stats_loading()}
						</p>
					}
				>
					{(value: StackStats) => (
						<p data-testid="stats-value">
							{m.stack_stats_summary({ tools: formatNumber(value.tools), categories: formatNumber(value.categories) })}
						</p>
					)}
				</Await>
			</section>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<search className="w-full max-w-md">
					<form onSubmit={onSearch} className="flex items-end gap-2">
						<div className="flex flex-1 flex-col gap-1.5">
							<label htmlFor="stack-q" className="font-medium text-sm">
								{m.stack_search_label()}
							</label>
							<Input
								id="stack-q"
								name="q"
								type="search"
								defaultValue={search.q}
								key={search.q}
								placeholder={m.stack_search_placeholder()}
							/>
						</div>
						{/* Carry the current sort through a no-JS submit. */}
						<input type="hidden" name="sort" value={search.sort} />
						<Button type="submit">{m.stack_search_submit()}</Button>
					</form>
				</search>

				<nav aria-label={m.stack_sort_label()} className="flex items-center gap-1 text-sm">
					<span className="mr-1 text-muted-foreground">{m.stack_sort_label()}</span>
					{(Object.keys(SORT_LABELS) as StackSort[]).map((sort) => (
						<Link
							key={sort}
							from={Route.fullPath}
							search={(prev) => ({ ...prev, sort, page: 1 })}
							aria-current={search.sort === sort ? "true" : undefined}
							className={cn(
								"rounded-md px-2 py-1 hover:bg-accent",
								search.sort === sort ? "bg-accent font-medium" : "text-muted-foreground",
							)}
						>
							{SORT_LABELS[sort]()}
						</Link>
					))}
				</nav>
			</div>

			<p className="text-muted-foreground text-sm" aria-live="polite" data-testid="stack-count">
				{m.stack_results({ count: formatNumber(data.total) })}
			</p>

			{data.items.length === 0 ? (
				<div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
					<p>{m.stack_empty({ query: search.q })}</p>
					<Button asChild variant="outline">
						<Link from={Route.fullPath} search={(prev) => ({ ...prev, q: "", page: 1 })}>
							{m.stack_clear_search()}
						</Link>
					</Button>
				</div>
			) : (
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="stack-list">
					{data.items.map((item) => (
						<li key={item.id}>
							<Card className="h-full">
								<CardHeader>
									<CardTitle>{item.name}</CardTitle>
									<CardDescription>{item.categoryLabel}</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-1 flex-col justify-between gap-3">
									<p className="text-sm">{item.description}</p>
									<a
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm underline underline-offset-4"
									>
										{m.stack_visit()}
										<span className="sr-only"> — {item.name}</span>
									</a>
								</CardContent>
							</Card>
						</li>
					))}
				</ul>
			)}

			{data.pageCount > 1 ? (
				<nav aria-label={m.pagination_label()} className="flex items-center justify-between gap-4">
					<PageLink page={data.page - 1} disabled={data.page <= 1}>
						{m.pagination_previous()}
					</PageLink>
					<span className="text-muted-foreground text-sm">
						{m.pagination_status({ page: formatNumber(data.page), total: formatNumber(data.pageCount) })}
					</span>
					<PageLink page={data.page + 1} disabled={data.page >= data.pageCount}>
						{m.pagination_next()}
					</PageLink>
				</nav>
			) : null}
		</main>
	);
}

function PageLink({ page, disabled, children }: { page: number; disabled: boolean; children: string }) {
	if (disabled) {
		return (
			<Button variant="outline" disabled>
				{children}
			</Button>
		);
	}
	return (
		<Button asChild variant="outline">
			<Link from={Route.fullPath} search={(prev) => ({ ...prev, page })}>
				{children}
			</Link>
		</Button>
	);
}

/** Skeleton shown while a client-side navigation loads the list. */
function StackPending() {
	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12" aria-busy="true">
			<output className="sr-only">{m.pending_loading()}</output>
			<div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: STACK_PAGE_SIZE }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list; items have no identity.
					<li key={index} className="h-40 animate-pulse rounded-xl bg-muted" />
				))}
			</ul>
		</main>
	);
}
