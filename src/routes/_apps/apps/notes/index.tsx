import { createFileRoute } from "@tanstack/react-router";
import { NotesHome } from "@/features/apps/notes/components/notes-home";
import { notesListQueryOptions, notesSearchQueryOptions } from "@/features/apps/notes/queries";
import { notesSearchSchema } from "@/features/apps/notes/search";
import { listSearch } from "@/lib/crud/route";
import { ensureQuery } from "@/lib/query";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/** /apps/notes: the landing for visitors (indexable), the user's notes once they have a session. */
export const Route = createFileRoute("/_apps/apps/notes/")({
	...listSearch(notesSearchSchema, notesSearchSchema.parse({})),
	loaderDeps: ({ search }) => ({ q: search.q }),
	loader: async ({ context, deps }) => {
		if (!context.session) return;
		const userId = context.session.user.id;
		await Promise.all([
			ensureQuery(context.queryClient, notesListQueryOptions(userId)),
			deps.q ? ensureQuery(context.queryClient, notesSearchQueryOptions(userId, deps.q)) : undefined,
		]);
	},
	head: () => seo({ title: m.notes_name(), description: m.notes_seo_description(), path: "/apps/notes" }),
	component: NotesHome,
});
