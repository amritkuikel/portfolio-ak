import { clientEnv } from "./client-env";

/** Title template: "Page · Site". The site name comes from VITE_APP_TITLE. */
export const pageTitle = (page?: string): string =>
	page ? `${page} · ${clientEnv.VITE_APP_TITLE}` : clientEnv.VITE_APP_TITLE;
