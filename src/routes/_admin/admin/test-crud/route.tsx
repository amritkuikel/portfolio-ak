import { createFileRoute } from "@tanstack/react-router";
import { staticCrumb } from "@/lib/breadcrumbs";
import { m } from "@/paraglide/messages";

// Section layout for /admin/test-crud/*: names its breadcrumb. No component: renders its child route.
export const Route = createFileRoute("/_admin/admin/test-crud")({
	staticData: { breadcrumb: staticCrumb(m.test_crud_title) },
});
