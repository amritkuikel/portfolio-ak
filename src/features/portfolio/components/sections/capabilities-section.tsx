import { m } from "@/paraglide/messages";
import { cn } from "../../lib/cn";
import type { Capability } from "../../types";
import { Chapter } from "../primitives/chapter";
import { threadBg } from "../primitives/eyebrow";
import { Marquee } from "../primitives/marquee";
import { Reveal } from "../primitives/reveal";

type CapabilitiesSectionProps = {
	capabilities: ReadonlyArray<Capability>;
	toolbox: ReadonlyArray<string>;
	index?: number | undefined;
};

/** Chapter three, an ink band: four areas of practice, then the daily toolbox sliding past. */
export function CapabilitiesSection({ capabilities, toolbox, index }: CapabilitiesSectionProps) {
	return (
		<Chapter
			id="capabilities"
			index={index}
			label={m.portfolio_chapter_capabilities()}
			title={m.portfolio_capabilities_heading()}
			tone="inverse"
		>
			<ul className="grid grid-cols-1 gap-x-(--pf-gutter) gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
				{capabilities.map((capability, position) => (
					<Reveal as="li" key={capability.id} className="flex flex-col gap-5 border-pf-line border-t pt-6">
						<span aria-hidden className={cn("h-2 w-10", threadBg(position))} />
						<h3 className="pf-display text-pf-h3">{capability.title}</h3>
						<p className="text-pf-body text-pf-ink-2">{capability.summary}</p>
						<ul
							aria-label={capability.title}
							className="mt-auto flex flex-col gap-1.5 pt-2 text-pf-small text-pf-stone"
						>
							{capability.skills.map((skill) => (
								<li key={skill}>{skill}</li>
							))}
						</ul>
					</Reveal>
				))}
			</ul>
			<div className="mt-[clamp(5rem,10vw,8rem)] border-pf-line border-t pt-10">
				<p className="pf-label mb-6 text-pf-stone">{m.portfolio_capabilities_toolbox()}</p>
				<Marquee items={toolbox} label={m.portfolio_capabilities_toolbox()} />
			</div>
		</Chapter>
	);
}
