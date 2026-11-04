/**
 * A source's URL templates (decision 0230). Isomorphic: the admin's form validates with
 * these and the server fills them. A template is an absolute https URL whose origin the
 * row lists, or a path on this app (or on PARDA_PLAYER_BASE).
 */

export const TEMPLATE_TOKENS = ["id", "imdb", "season", "episode", "color", "lang", "start"] as const;
export type TemplateToken = (typeof TEMPLATE_TOKENS)[number];
export type TemplateValues = Partial<Record<TemplateToken, string | number>>;

const TOKEN = /\{([a-z]+)\}/g;

/** The filled template; null when it needs a value we don't have (an IMDb id TMDB doesn't list). */
export function fillTemplate(template: string, values: TemplateValues): string | null {
	let missing = false;
	const filled = template.replace(TOKEN, (_, token: TemplateToken) => {
		const value = values[token];
		if (value === undefined || value === "") {
			missing = true;
			return "";
		}
		return encodeURIComponent(String(value));
	});
	return missing ? null : filled;
}

export const isRelativeTemplate = (template: string) => template.startsWith("/") && !template.startsWith("//");

const httpsOriginOf = (template: string): string | null => {
	try {
		// Tokens aren't valid in a host; a template that puts one there fails here.
		const url = new URL(template.replace(TOKEN, "0"));
		return url.protocol === "https:" ? url.origin : null;
	} catch {
		return null;
	}
};

export type TemplateProblem = "not-https" | "origin-not-listed" | "unknown-token" | "invalid-origin";

/** What's wrong with a source's templates and origins; empty when it can be saved. */
export function sourceProblems(row: {
	movieTemplate: string;
	tvTemplate: string;
	origins: ReadonlyArray<string>;
}): TemplateProblem[] {
	const problems = new Set<TemplateProblem>();
	for (const origin of row.origins) {
		if (httpsOriginOf(origin) !== origin) problems.add("invalid-origin");
	}
	for (const template of [row.movieTemplate, row.tvTemplate]) {
		for (const [, token] of template.matchAll(TOKEN)) {
			if (!TEMPLATE_TOKENS.includes(token as TemplateToken)) problems.add("unknown-token");
		}
		if (isRelativeTemplate(template)) continue;
		const origin = httpsOriginOf(template);
		if (!origin) problems.add("not-https");
		else if (!row.origins.includes(origin)) problems.add("origin-not-listed");
	}
	return [...problems];
}
