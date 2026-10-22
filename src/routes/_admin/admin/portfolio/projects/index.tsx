import { createFileRoute } from "@tanstack/react-router";
import { ProjectList } from "@/features/portfolio/admin/components/project-list";
import { ProjectsPending } from "@/features/portfolio/admin/components/project-pages";
import { projectListQueryOptions } from "@/features/portfolio/admin/queries";
import { PROJECTS_TABLE_ID } from "@/features/portfolio/constants";
import { projectList } from "@/features/portfolio/search";
import { listLoader, listSearch, titleHead } from "@/lib/crud/route";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_admin/admin/portfolio/projects/")({
	...listSearch(projectList.search, projectList.defaults),
	loaderDeps: ({ search }) => search,
	loader: (route) => listLoader(route, { tableId: PROJECTS_TABLE_ID, query: projectListQueryOptions }),
	head: titleHead(m.portfolio_admin_projects_title),
	pendingComponent: ProjectsPending,
	component: ProjectList,
});
