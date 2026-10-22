import { createFileRoute } from "@tanstack/react-router";
import { RolesList } from "@/features/rbac/components/roles-list";
import { rolesQueryOptions } from "@/features/rbac/queries";
import { titleHead } from "@/lib/crud/route";
import { ensureQuery } from "@/lib/query";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/roles/")({
	loader: ({ context }) => ensureQuery(context.queryClient, rolesQueryOptions()),
	head: titleHead(m.roles_title),
	component: RolesList,
});
