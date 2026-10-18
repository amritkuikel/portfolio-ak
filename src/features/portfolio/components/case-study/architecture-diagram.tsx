import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { m } from "@/paraglide/messages";
import { ARCHITECTURE_TIERS } from "../../schema";
import type { CaseStudyBlock } from "../../types";

type ArchitectureBlock = Extract<CaseStudyBlock, { kind: "architecture" }>;
type Tier = (typeof ARCHITECTURE_TIERS)[number];

const TIER_LABELS: Record<Tier, () => string> = {
	client: m.portfolio_architecture_client,
	edge: m.portfolio_architecture_edge,
	service: m.portfolio_architecture_service,
	data: m.portfolio_architecture_data,
};

/**
 * A system diagram in HTML, not an image: the tiers are columns (rows on a
 * phone), the nodes are cards, and the data flows are a real list a screen
 * reader can follow ("Dashboard → Server functions").
 */
export function ArchitectureDiagram({ block }: { block: ArchitectureBlock }) {
	const tiers = ARCHITECTURE_TIERS.map((tier) => ({
		tier,
		nodes: block.nodes.filter((node) => node.tier === tier),
	})).filter((column) => column.nodes.length > 0);
	const labelOf = (id: string) => block.nodes.find((node) => node.id === id)?.label ?? id;

	return (
		<figure className="flex flex-col gap-8 border-2 border-pf-line p-5 md:p-8">
			<div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
				{tiers.map((column, position) => (
					<div key={column.tier} className="contents">
						{position > 0 ? (
							<span aria-hidden className="flex justify-center text-pf-accent">
								<ArrowDownIcon className="size-5 md:hidden" />
								<ArrowRightIcon className="hidden size-5 md:block" />
							</span>
						) : null}
						<div className="flex flex-1 flex-col gap-3">
							<p className="pf-label text-pf-stone">{TIER_LABELS[column.tier]()}</p>
							<ul className="flex flex-col gap-2">
								{column.nodes.map((node) => (
									<li key={node.id} className="border-pf-jade border-l-4 bg-pf-paper-2 px-4 py-3">
										<span className="block font-medium">{node.label}</span>
										<span className="font-pf-mono text-pf-small text-pf-ink-2">{node.detail}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				))}
			</div>
			<div className="border-pf-line border-t pt-5">
				<p className="pf-label mb-3 text-pf-stone">{m.portfolio_architecture_flows()}</p>
				<ul className="flex flex-wrap gap-x-6 gap-y-2 text-pf-small text-pf-ink-2">
					{block.edges.map(([from, to]) => (
						<li key={`${from}-${to}`}>
							{labelOf(from)} <span className="text-pf-accent">→</span> {labelOf(to)}
						</li>
					))}
				</ul>
			</div>
			<figcaption className="text-pf-small text-pf-ink-2">{block.caption}</figcaption>
		</figure>
	);
}
