import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type RevealProps = {
	as?: "div" | "li" | "figure" | "article" | "p";
	className?: string | undefined;
	/** "en" for content shown in English on a Nepali page (no translation yet). */
	lang?: string | undefined;
	children: ReactNode;
};

/**
 * Wipes its content up into view as it scrolls in (portfolio.css, .pf-reveal).
 * Visible by default: browsers without scroll-driven animations, and readers
 * who prefer reduced motion, simply see the content.
 */
export function Reveal({ as: Tag = "div", className, lang, children }: RevealProps) {
	return (
		<Tag className={cn("pf-reveal", className)} lang={lang}>
			{children}
		</Tag>
	);
}
