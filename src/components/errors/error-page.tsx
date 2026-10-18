import * as Sentry from "@sentry/tanstackstart-react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, Link, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type AppErrorCode, FORM_ERROR_KEY, isAppError } from "@/lib/errors";
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
	isAppError(error) ? (error.fieldErrors?.[FORM_ERROR_KEY]?.[0] ?? messages[error.code]()) : m.error_internal();

/** Codes that retrying won't fix: the page offers a way forward instead. */
const titles: Partial<Record<AppErrorCode, () => string>> = {
	UNAUTHORIZED: m.error_title_unauthorized,
	FORBIDDEN: m.error_title_forbidden,
};

/**
 * Route error boundary. Shows a localized title and message chosen by AppError
 * code, the request id for support, and the actions that fit the error:
 * - UNAUTHORIZED: log in (returning here afterwards);
 * - FORBIDDEN (the "forbidden page" for routes guarded with assertRoutePermission): go back;
 * - anything else: try again, which re-runs loaders and queries.
 */
export function ErrorPage({ error, reset }: ErrorComponentProps) {
	const router = useRouter();
	const location = useLocation();
	const queryErrorReset = useQueryErrorResetBoundary();
	const code = isAppError(error) ? error.code : undefined;
	const requestId = isAppError(error) ? error.requestId : undefined;
	const title = (code && titles[code]) || m.error_title;

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

	// Same markup on the server and the client; whether there is a page to go back to is decided on click.
	const goBack = () => {
		if (router.history.canGoBack()) router.history.back();
		else void router.navigate({ to: "/" });
	};

	return (
		<main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-16" data-testid="error-page">
			<h1 className="font-semibold text-2xl tracking-tight">{title()}</h1>
			<p className="text-muted-foreground" role="alert" data-error-code={code ?? "UNKNOWN"}>
				{errorMessage(error)}
			</p>
			{requestId ? (
				<p className="font-mono text-muted-foreground text-xs">{m.error_reference({ id: requestId })}</p>
			) : null}
			<div className="flex flex-wrap gap-2">
				{code === "UNAUTHORIZED" ? (
					<Button asChild>
						<Link to="/login" search={{ redirect: location.href }}>
							{m.error_sign_in()}
						</Link>
					</Button>
				) : code === "FORBIDDEN" ? (
					<Button type="button" onClick={goBack}>
						{m.error_go_back()}
					</Button>
				) : (
					<Button type="button" onClick={retry}>
						{m.error_retry()}
					</Button>
				)}
				<Button asChild variant="outline">
					<Link to="/">{m.error_go_home()}</Link>
				</Button>
			</div>
		</main>
	);
}
