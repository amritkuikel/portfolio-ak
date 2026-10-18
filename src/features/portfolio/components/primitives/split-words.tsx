import { Fragment } from "react";
import { cn } from "../../lib/cn";
import { cssVars } from "../../lib/css-vars";

/**
 * Text split into words that ink in one after another as it scrolls through
 * the viewport (portfolio.css, .pf-words). Each word knows its position (--i)
 * and the total (--n), so the stagger is pure CSS. Screen readers read the
 * text normally: the spans are inline and the spaces are real.
 */
export function SplitWords({ text, className }: { text: string; className?: string | undefined }) {
	const words = text
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.map((word, position) => ({ word, position, key: `${position}-${word}` }));
	return (
		<span className={cn("pf-words", className)} style={cssVars({ "--n": words.length })}>
			{words.map(({ word, position, key }) => (
				<Fragment key={key}>
					<span style={cssVars({ "--i": position })}>{word}</span>
					{position < words.length - 1 ? " " : null}
				</Fragment>
			))}
		</span>
	);
}
