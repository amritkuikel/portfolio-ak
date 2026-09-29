/**
 * The one error shape that crosses the server/client boundary.
 *
 * Server functions never leak raw errors: errorMiddleware (src/middleware/errors.ts)
 * turns anything thrown into an AppError. The serialization adapter below keeps
 * the class intact across the wire, so client code can rely on
 * `error instanceof AppError` and branch on `code`. User-facing text is never
 * sent; the client picks a localized message by `code` (see errorMessage()).
 */
import { createSerializationAdapter } from "@tanstack/react-router";

export const APP_ERROR_CODES = [
	"BAD_REQUEST",
	"UNAUTHORIZED",
	"FORBIDDEN",
	"NOT_FOUND",
	"CONFLICT",
	"RATE_LIMITED",
	"INTERNAL",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export const HTTP_STATUS: Readonly<Record<AppErrorCode, number>> = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	RATE_LIMITED: 429,
	INTERNAL: 500,
};

/** Field path -> error keys/messages, e.g. from Zod input validation. */
export type FieldErrors = Readonly<Record<string, ReadonlyArray<string>>>;

export type AppErrorShape = {
	code: AppErrorCode;
	status: number;
	/** Developer-facing detail. Never shown to users; "Internal error" for INTERNAL. */
	message: string;
	fieldErrors?: FieldErrors;
	/** Correlates a client-visible error with the server log line. */
	requestId?: string;
};

export class AppError extends Error {
	override name = "AppError";
	readonly code: AppErrorCode;
	readonly status: number;
	readonly fieldErrors: FieldErrors | undefined;
	readonly requestId: string | undefined;

	constructor(
		code: AppErrorCode,
		message: string = code,
		extra: { fieldErrors?: FieldErrors; requestId?: string; cause?: unknown } = {},
	) {
		super(message, extra.cause === undefined ? undefined : { cause: extra.cause });
		this.code = code;
		this.status = HTTP_STATUS[code];
		this.fieldErrors = extra.fieldErrors;
		this.requestId = extra.requestId;
	}

	toShape(): AppErrorShape {
		return {
			code: this.code,
			status: this.status,
			message: this.message,
			...(this.fieldErrors ? { fieldErrors: this.fieldErrors } : {}),
			...(this.requestId ? { requestId: this.requestId } : {}),
		};
	}

	static fromShape(shape: AppErrorShape): AppError {
		return new AppError(shape.code, shape.message, {
			...(shape.fieldErrors ? { fieldErrors: shape.fieldErrors } : {}),
			...(shape.requestId ? { requestId: shape.requestId } : {}),
		});
	}
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

/** Registered in src/start.ts. Rebuilds AppError on the client with its class and fields. */
export const appErrorSerializationAdapter = createSerializationAdapter({
	key: "app-error",
	test: isAppError,
	toSerializable: (error) => error.toShape(),
	fromSerializable: (shape: AppErrorShape) => AppError.fromShape(shape),
});
