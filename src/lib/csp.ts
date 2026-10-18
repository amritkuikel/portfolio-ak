/**
 * Content-Security-Policy for HTML pages (see docs/decisions.md 0081).
 *
 * Scripts: only those carrying this request's nonce ('strict-dynamic' lets them
 * load their own chunks, e.g. route code, Tiptap, posthog-js), so injected
 * <script> tags can't run. Network: same origin plus the configured Sentry,
 * PostHog and Cloudinary upload hosts. Images: same origin plus Cloudinary delivery. Frames: none, or
 * Cloudflare Turnstile's challenge when a captcha is configured. Styles allow inline style attributes (Radix positions popovers
 * with them); stylesheets themselves are same-origin.
 */
export type CspOptions = {
	nonce: string;
	/** Extra origins the browser may send data to (Sentry ingest, PostHog, Cloudinary uploads). */
	connectOrigins?: ReadonlyArray<string>;
	/** Extra origins images may load from (Cloudinary delivery). */
	imgOrigins?: ReadonlyArray<string>;
	/** Origins that may be framed and serve scripts our code loads (Cloudflare Turnstile). */
	frameOrigins?: ReadonlyArray<string>;
	/** Adds upgrade-insecure-requests (production only; it would break http://localhost). */
	upgradeInsecureRequests?: boolean;
};

export const originOf = (url: string | undefined): string | null => {
	if (!url) return null;
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
};

export function buildCsp({
	nonce,
	connectOrigins = [],
	imgOrigins = [],
	frameOrigins = [],
	upgradeInsecureRequests = false,
}: CspOptions): string {
	const directives: Record<string, ReadonlyArray<string>> = {
		"default-src": ["'self'"],
		// Host sources only matter to browsers without 'strict-dynamic' (which ignore them otherwise).
		"script-src": [`'nonce-${nonce}'`, "'strict-dynamic'", ...frameOrigins],
		"style-src": ["'self'", "'unsafe-inline'"],
		"img-src": ["'self'", "data:", "blob:", ...imgOrigins],
		"font-src": ["'self'"],
		"connect-src": ["'self'", ...connectOrigins],
		...(frameOrigins.length > 0 ? { "frame-src": frameOrigins } : {}),
		"object-src": ["'none'"],
		"base-uri": ["'self'"],
		"form-action": ["'self'"],
		"frame-ancestors": ["'none'"],
	};
	const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
	if (upgradeInsecureRequests) policy.push("upgrade-insecure-requests");
	return policy.join("; ");
}

/** Headers sent on every response (assets and API routes included), set via Nitro routeRules. */
export const STATIC_SECURITY_HEADERS = {
	"strict-transport-security": "max-age=63072000; includeSubDomains",
	"x-content-type-options": "nosniff",
	"referrer-policy": "strict-origin-when-cross-origin",
	"permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
	"x-frame-options": "DENY",
	"cross-origin-opener-policy": "same-origin",
} as const;
