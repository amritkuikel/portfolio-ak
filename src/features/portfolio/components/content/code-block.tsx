import { cn } from "../../lib/cn";

type CodeBlockProps = {
	code: string;
	language: string;
	caption?: string | undefined;
	className?: string | undefined;
};

/**
 * A code sample as a figure. Plain text (no highlighter shipped to the
 * browser); long lines scroll inside the block, never the page, and the
 * scrolling region is focusable for keyboard users.
 */
export function CodeBlock({ code, language, caption, className }: CodeBlockProps) {
	return (
		<figure className={cn("pf-inverse overflow-clip rounded-sm", className)}>
			<div className="flex items-center justify-between gap-4 border-pf-line border-b px-5 py-3">
				<span aria-hidden className="flex gap-1.5">
					<span className="size-2.5 rounded-full bg-pf-accent" />
					<span className="size-2.5 rounded-full bg-pf-stone opacity-50" />
					<span className="size-2.5 rounded-full bg-pf-stone opacity-50" />
				</span>
				<span className="pf-label text-pf-stone">{language}</span>
			</div>
			{/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be focusable so keyboard users can scroll it (axe scrollable-region-focusable). */}
			<pre tabIndex={0} className="pf-focus overflow-x-auto p-5 font-pf-mono text-pf-small leading-relaxed">
				<code>{code}</code>
			</pre>
			{caption ? (
				<figcaption className="border-pf-line border-t px-5 py-3 text-pf-small text-pf-ink-2">{caption}</figcaption>
			) : null}
		</figure>
	);
}
