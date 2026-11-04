import { createFileRoute, notFound } from "@tanstack/react-router";
import { pardaHead } from "@/features/parda/brand";
import { titleParamsSchema } from "@/features/parda/search";
import { PardaTitlePage } from "@/features/parda/title/parda-title-page";
import { loadDetailOr404 } from "@/lib/crud/route";
import { getLocale } from "@/paraglide/runtime";

/**
 * /app/parda/movie/550, /app/parda/series/1396: a title (decision 0234). Until Task 63
 * builds the full page it shows the hero, the facts and the overview, and stays
 * private. A blocked or unknown title is Parda's 404; TMDB failing is a 503.
 */
export const Route = createFileRoute("/_parda/app/parda/$type/$id")({
	loader: async ({ context, params }) => {
		const parsed = titleParamsSchema.safeParse(params);
		if (!parsed.success) throw notFound();
		const { pardaTitleQueryOptions } = await import("@/features/parda/queries");
		const data = await loadDetailOr404(
			context.queryClient,
			pardaTitleQueryOptions(getLocale(), parsed.data.type, parsed.data.id),
		);
		return { title: data.configured ? data.title.title : undefined };
	},
	head: ({ loaderData }) => pardaHead(loaderData?.title),
	component: PardaTitlePage,
});
