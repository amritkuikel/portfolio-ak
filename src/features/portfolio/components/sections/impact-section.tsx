import { m } from "@/paraglide/messages";
import type { Metric } from "../../types";
import { Chapter } from "../primitives/chapter";
import { StatGrid } from "../primitives/stat";

/** Chapter five: a decade of work in four numbers (localized digits). */
export function ImpactSection({ metrics }: { metrics: ReadonlyArray<Metric> }) {
	return (
		<Chapter
			id="impact"
			index={5}
			label={m.portfolio_chapter_impact()}
			title={m.portfolio_impact_heading()}
			className="bg-pf-paper-2"
		>
			<StatGrid metrics={metrics} size="large" className="lg:grid-cols-4" />
		</Chapter>
	);
}
