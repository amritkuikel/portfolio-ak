import { cn } from "../../lib/cn";
import { formatMetric } from "../../lib/format-metric";
import type { Metric } from "../../types";

type StatProps = {
	metric: Metric;
	size?: "default" | "large";
	className?: string | undefined;
};

/**
 * One number with its label, for a <dl>. The label comes first in the markup
 * (term, then value) and the number shows first on screen.
 */
export function Stat({ metric, size = "default", className }: StatProps) {
	return (
		<div className={cn("flex flex-col-reverse gap-3 border-pf-line border-t pt-5", className)}>
			<dt className="text-pf-small text-pf-ink-2">{metric.label}</dt>
			<dd className={cn("pf-display tabular-nums", size === "large" ? "text-pf-h1" : "text-pf-h2")}>
				{formatMetric(metric)}
			</dd>
		</div>
	);
}

/** A row of stats. */
export function StatGrid({
	metrics,
	size,
	label,
	className,
}: {
	metrics: ReadonlyArray<Metric>;
	size?: StatProps["size"];
	label?: string | undefined;
	className?: string | undefined;
}) {
	return (
		<dl aria-label={label} className={cn("grid grid-cols-1 gap-x-(--pf-gutter) gap-y-10 sm:grid-cols-2", className)}>
			{metrics.map((metric) => (
				<Stat key={metric.label} metric={metric} size={size} />
			))}
		</dl>
	);
}
