import type { CaseStudyBlock } from "../../types";
import { CodeBlock } from "../content/code-block";
import { PullQuote } from "../content/pull-quote";
import { Display } from "../primitives/display";
import { Reveal } from "../primitives/reveal";
import { ArchitectureDiagram } from "./architecture-diagram";
import { Gallery } from "./gallery";

/** Renders one typed case study block. Exhaustive: a new block type fails typecheck until it has a renderer. */
function Block({ block, seed }: { block: CaseStudyBlock; seed: string }) {
	switch (block.type) {
		case "chapter":
			return (
				<section lang={block.lang} className="flex flex-col gap-6">
					<Display as="h2" size="h3">
						{block.title}
					</Display>
					{block.body.map((paragraph) => (
						<p key={paragraph} className="pf-measure text-pf-lead text-pf-ink-2">
							{paragraph}
						</p>
					))}
				</section>
			);
		case "quote":
			return <PullQuote text={block.text} cite={block.cite || undefined} />;
		case "code":
			return <CodeBlock code={block.code} language={block.language} caption={block.caption || undefined} />;
		case "architecture":
			return <ArchitectureDiagram block={block} />;
		case "gallery":
			return <Gallery seed={seed} captions={block.captions} />;
		default: {
			const unknown: never = block;
			return unknown;
		}
	}
}

/** The story of a project, block by block, each wiping into view. */
export function CaseStudyBody({ blocks, seed }: { blocks: ReadonlyArray<CaseStudyBlock>; seed: string }) {
	return (
		<div className="flex flex-col gap-[clamp(3.5rem,7vw,6rem)]">
			{blocks.map((block) => (
				<Reveal key={block.id}>
					<Block block={block} seed={seed} />
				</Reveal>
			))}
		</div>
	);
}
