import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authErrorMessage } from "@/features/auth/errors";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { m } from "@/paraglide/messages";

/**
 * "Try it": starts a guest session (Better Auth's anonymous plugin, decision 0185) and
 * shows the app in place of its landing. The guest gets sample data in the page's
 * language. Rate limited per address (a guest is a user row).
 */
export function TryAppButton() {
	const [pending, setPending] = useState(false);
	const { refresh } = useAuthNavigation();
	const start = async () => {
		setPending(true);
		// Loaded on demand, like sign-out: most visitors never press it.
		const { authClient } = await import("@/lib/auth-client");
		const { error } = await authClient.signIn.anonymous();
		if (error) {
			setPending(false);
			toast.error(authErrorMessage(error));
			return;
		}
		await refresh();
		setPending(false);
	};
	return (
		<Button size="lg" onClick={() => void start()} disabled={pending} data-testid="try-app">
			<PlayIcon aria-hidden />
			{pending ? m.apps_starting() : m.apps_try()}
		</Button>
	);
}
