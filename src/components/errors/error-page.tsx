import * as Sentry from "@sentry/tanstackstart-react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type AppErrorCode, isAppError } from "@/lib/errors";
import { m } from "@/paraglide/messages";

const messages: Record<AppErrorCode, () => string> = {
	BAD_REQUEST: m.error_bad_request,
	UNAUTHORIZED: m.error_unauthorized,
	FORBIDDEN: m.error_forbidden,
	NOT_FOUND: m.error_not_found,
	CONFLICT: m.error_conflict,
	RATE_LIMITED: m.error_rate_limited,
	INTERNAL: m.error_internal,
};

/** Localized user-facing text for any error. Never shows raw error messages. */
export const errorMessage = (error: unknown): string =>
	isAppError(error) ? messages[error.code]() : m.error_internal();

/**
 * Route error boundary. Shows a localized message chosen by AppError code,
 * the request id for support, and a retry that re-runs loaders and queries.
 */
export function ErrorPage({ error, reset }: ErrorComponentProps) {
	const router = useRouter();
	const queryErrorReset = useQueryErrorResetBoundary();
	const requestId = isAppError(error) ? error.requestId : undefined;

	// Render/loader errors in the browser. AppErrors are expected or already reported
	// on the server (see sentry.ts); a no-op without a DSN.
	useEffect(() => {
		if (!isAppError(error)) Sentry.captureException(error);
	}, [error]);

	const retry = () => {
		queryErrorReset.reset();
		reset();
		void router.invalidate();
	};

	return (
		<main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-16" data-testid="error-page">
			<h1 className="font-semibold text-2xl tracking-tight">{m.error_title()}</h1>
			<p className="text-muted-foreground" role="alert" data-error-code={isAppError(error) ? error.code : "UNKNOWN"}>
				{errorMessage(error)}
			</p>
			{requestId ? (
				<p className="font-mono text-muted-foreground text-xs">{m.error_reference({ id: requestId })}</p>
			) : null}
			<div className="flex gap-2">
				<Button type="button" onClick={retry}>
					{m.error_retry()}
				</Button>
				<Button asChild variant="outline">
					<Link to="/">{m.error_go_home()}</Link>
				</Button>
			</div>
		</main>
	);
}
