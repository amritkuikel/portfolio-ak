import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { localizeHref } from "@/paraglide/runtime";
import { refreshAuth } from "./queries";

/**
 * After Better Auth changes the session cookie (sign in/out), refresh cached
 * auth state and re-run route guards, then go to `to` (a validated same-site path).
 */
export function useAuthNavigation() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const refresh = async () => {
		await refreshAuth(queryClient);
		await router.invalidate();
	};

	return {
		refresh,
		/** After signing in. `to` is de-localized (e.g. "/account"); the router re-prefixes it. */
		afterSignIn: async (to: string) => {
			await refreshAuth(queryClient);
			await router.navigate({ href: localizeHref(to), replace: true });
		},
		signOut: async () => {
			await authClient.signOut();
			await refreshAuth(queryClient);
			await router.navigate({ href: localizeHref("/"), replace: true });
		},
	};
}

/** A localized absolute path for Better Auth callbackURL / redirectTo options. */
export const localizedPath = (path: string) => localizeHref(path);
