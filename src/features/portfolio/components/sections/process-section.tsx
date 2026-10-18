import { m } from "@/paraglide/messages";
import type { ProcessStep } from "../../types";
import { Display } from "../primitives/display";
import { Eyebrow, formatIndex } from "../primitives/eyebrow";
import { Reveal } from "../primitives/reveal";
import { TagList } from "../primitives/tag";

/**
 * Chapter four: the process. On wide screens the heading stays pinned
 * (position: sticky) while the five stages scroll past it.
 */
export function ProcessSection({ steps }: { steps: ReadonlyArray<ProcessStep> }) {
	return (
		<section id="process" aria-labelledby="process-title" className="pf-section scroll-mt-(--pf-header-h)">
			<div className="pf-container pf-grid gap-y-12">
				<div className="col-span-4 md:sticky md:top-[calc(var(--pf-header-h)+3rem)] md:col-span-5 md:self-start">
					<Eyebrow index={4}>{m.portfolio_chapter_process()}</Eyebrow>
					<Display id="process-title" size="h2" className="mt-6">
						{m.portfolio_process_heading()}
					</Display>
					<p className="pf-measure mt-6 text-pf-body text-pf-ink-2">{m.portfolio_process_intro()}</p>
				</div>
				<ol className="col-span-4 flex flex-col md:col-span-6 md:col-start-7">
					{steps.map((step, position) => (
						<Reveal
							as="li"
							key={step.id}
							className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 border-pf-line border-t py-10 md:py-14"
						>
							<span className="pf-display text-pf-h3 text-pf-accent tabular-nums">{formatIndex(position + 1)}</span>
							<div className="flex flex-col gap-4">
								<h3 className="pf-display text-pf-h2">{step.title}</h3>
								<p className="text-pf-body text-pf-ink-2">{step.body}</p>
								<div className="flex flex-wrap items-center gap-3 pt-2">
									<span className="pf-label text-pf-stone">{m.portfolio_process_outputs()}</span>
									<TagList items={step.outputs} label={m.portfolio_process_outputs()} />
								</div>
							</div>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
