import { cn } from "../../lib/cn";

/** A quotation set large in the display italic, with an accent rule. */
export function PullQuote({ text, cite, className }: { text: string; cite?: string | undefined; className?: string }) {
	return (
		<figure className={cn("border-pf-accent border-l-2 pl-6 md:pl-10", className)}>
			<blockquote className="pf-display text-[clamp(1.5rem,1rem+1.8vw,2.75rem)] italic leading-[1.2]">
				<p>{text}</p>
			</blockquote>
			{cite ? <figcaption className="pf-label mt-5 text-pf-stone">— {cite}</figcaption> : null}
		</figure>
	);
}
