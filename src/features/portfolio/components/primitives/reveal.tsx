import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type RevealProps = {
	as?: "div" | "li" | "figure" | "article" | "p";
	className?: string | undefined;
	children: ReactNode;
};

/**
 * Wipes its content up into view as it scrolls in (portfolio.css, .pf-reveal).
 * Visible by default: browsers without scroll-driven animations, and readers
 * who prefer reduced motion, simply see the content.
 */
export function Reveal({ as: Tag = "div", className, children }: RevealProps) {
	return <Tag className={cn("pf-reveal", className)}>{children}</Tag>;
}
