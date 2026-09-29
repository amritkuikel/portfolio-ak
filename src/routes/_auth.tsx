import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { redirectSearchSchema } from "@/lib/redirect";

/**
 * Sign-in pages (login, register; more in Phase 6). Signed-in users are sent
 * on to their ?redirect= target, or home.
 */
export const Route = createFileRoute("/_auth")({
	validateSearch: redirectSearchSchema,
	beforeLoad: ({ context, search }) => {
		if (context.session) throw redirect({ href: search.redirect ?? "/" });
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
			<Outlet />
		</main>
	);
}
