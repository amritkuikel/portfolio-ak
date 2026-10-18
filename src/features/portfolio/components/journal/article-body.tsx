import type { ProseBlock } from "../../types";
import { CodeBlock } from "../content/code-block";
import { PullQuote } from "../content/pull-quote";

/** Renders one typed article block. Exhaustive: a new block kind fails typecheck until it has a renderer. */
function Block({ block }: { block: ProseBlock }) {
	switch (block.kind) {
		case "paragraph":
			return <p className="text-pf-lead text-pf-ink-2 first-of-type:text-pf-ink">{block.text}</p>;
		case "heading":
			return <h2 className="pf-display mt-6 text-pf-h3">{block.text}</h2>;
		case "quote":
			return <PullQuote text={block.text} cite={block.cite} className="my-6" />;
		case "code":
			return <CodeBlock code={block.code} language={block.language} caption={block.caption} className="my-4" />;
		case "list":
			return (
				<ul className="flex flex-col gap-3 text-pf-lead text-pf-ink-2">
					{block.items.map((item) => (
						<li key={item} className="flex gap-4">
							<span aria-hidden className="mt-[0.7em] h-px w-5 shrink-0 bg-pf-accent" />
							<span>{item}</span>
						</li>
					))}
				</ul>
			);
		default: {
			const unknown: never = block;
			return unknown;
		}
	}
}

const blockKey = (block: ProseBlock): string => {
	switch (block.kind) {
		case "list":
			return `list:${block.items.join("|")}`;
		case "code":
			return `code:${block.code}`;
		default:
			return `${block.kind}:${block.text}`;
	}
};

/** A journal article: typed blocks, no HTML (so nothing to sanitize), at a reading measure. */
export function ArticleBody({ blocks }: { blocks: ReadonlyArray<ProseBlock> }) {
	return (
		<div className="pf-measure flex flex-col gap-7">
			{blocks.map((block) => (
				<Block key={blockKey(block)} block={block} />
			))}
		</div>
	);
}
