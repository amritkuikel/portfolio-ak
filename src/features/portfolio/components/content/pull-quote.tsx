import { cn } from "../../lib/cn";

/** A quotation set large, hung from a crimson thread. */
export function PullQuote({ text, cite, className }: { text: string; cite?: string | undefined; className?: string }) {
	return (
		<figure className={cn("border-pf-crimson border-l-4 pl-6 md:pl-10", className)}>
			<blockquote className="pf-quote text-[clamp(1.5rem,1rem+1.8vw,2.75rem)] leading-[1.2]">
				<p>{text}</p>
			</blockquote>
			{cite ? <figcaption className="pf-label mt-5 text-pf-stone">{cite}</figcaption> : null}
		</figure>
	);
}
