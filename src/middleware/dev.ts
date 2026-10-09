import { createMiddleware } from "@tanstack/react-start";
import { AppError } from "@/lib/errors";

/** Refuses with NOT_FOUND outside development (`import.meta.env.DEV` is the constant false in builds). */
export const assertDev = () => {
	if (!import.meta.env.DEV) throw new AppError("NOT_FOUND", "Not found");
};

/** Server functions that exist for the /dev pages only: NOT_FOUND in production. */
export const devOnlyMiddleware = createMiddleware({ type: "function" }).server(({ next }) => {
	assertDev();
	return next();
});
