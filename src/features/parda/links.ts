import { linkOptions } from "@tanstack/react-router";

/**
 * Every link into Parda (PLAN 12.5, "Paths"): pages link through these, so moving the
 * product is a move of `src/routes/_parda/app/parda` and this file. Links arrive with
 * their routes (PLAN 12.3).
 */
export const pardaLinks = {
	home: () => linkOptions({ to: "/app/parda" }),
	about: (hash?: string) => linkOptions({ to: "/app/parda/about", ...(hash ? { hash } : {}) }),
	signIn: (redirect?: string) => linkOptions({ to: "/app/parda/sign-in", search: { redirect } }),
	signUp: (redirect?: string) => linkOptions({ to: "/app/parda/sign-up", search: { redirect } }),
};

/** De-localized paths for redirects and `?redirect=` targets. */
export const PARDA_PATHS = { home: "/app/parda", about: "/app/parda/about" } as const;
