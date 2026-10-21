import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { Page, PageHeader } from "@/components/page/page";
import { __camel__FormKey, __Pascal__Form } from "@/features/__name__/components/form";
import { __camel__DetailQueryOptions } from "@/features/__name__/queries";
import { assertRoutePermission } from "@/features/rbac/route-guard";
import { loaderTitleCrumb } from "@/lib/breadcrumbs";
import { isAppError } from "@/lib/errors";
import { setErrorStatus } from "@/lib/start/http-status";
import { ensureQuery } from "@/lib/query";
import { parseParams } from "@/lib/list/params";
import { pageTitle } from "@/lib/seo";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/__name__/$id")({
	// Only UUIDs match; anything else falls through to the localized 404 ("new" is its own route).
	params: { parse: (raw) => parseParams(z.object({ id: z.uuid() }), raw) },
	beforeLoad: ({ context }) => assertRoutePermission(context.session, "__name__:update"),
	loader: async ({ context, params }) => {
		try {
			const row = await ensureQuery(context.queryClient, __camel__DetailQueryOptions(params.id));
			// Only what the breadcrumb needs; the row itself travels in the Query cache.
			return { title: row.title };
		} catch (error) {
			if (isAppError(error) && error.code === "NOT_FOUND") throw notFound();
			await setErrorStatus(error);
			throw error;
		}
	},
	staticData: { breadcrumb: loaderTitleCrumb },
	head: () => ({ meta: [{ title: pageTitle(m.__snake___edit_title()) }] }),
	component: Edit__Pascal__Page,
});

function Edit__Pascal__Page() {
	const { id } = Route.useParams();
	const { data: row } = useSuspenseQuery(__camel__DetailQueryOptions(id));
	return (
		<Page width="admin">
			<PageHeader title={m.__snake___edit_title()} />
			<__Pascal__Form key={__camel__FormKey(row)} row={row} />
		</Page>
	);
}
