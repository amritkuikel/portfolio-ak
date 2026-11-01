import { CalendarRangeIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatDayMonth, formatNumber } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import type { SprintMeasure } from "../search";
import type { SprintSummary, SprintTotals, Velocity } from "../types";

/** Small pieces the backlog, the report, Home and the admin share (Task 52). */

export const dayText = (day: string) => formatDayMonth(day);

/** What the charts and totals count: points, or tasks while estimates are in time (Task 53 brings minutes). */
export const measureOf = (estimation: "points" | "time"): SprintMeasure =>
	estimation === "points" ? "points" : "tasks";

/** "Points: 13" or "Tasks: 4". */
export const amountText = (value: number, measure: SprintMeasure) =>
	measure === "points"
		? m.taskline_sprint_points({ value: formatNumber(value) })
		: m.taskline_sprint_tasks({ value: formatNumber(value) });

/** The recent velocity as a sentence, or that there's none yet. */
export function velocityText(velocity: Velocity, estimation: "points" | "time"): string {
	const value = estimation === "points" ? velocity.points : velocity.tasks;
	if (value === null) return m.taskline_velocity_none();
	return estimation === "points"
		? m.taskline_velocity_points({ value: formatNumber(value), sprints: formatNumber(velocity.sprints) })
		: m.taskline_velocity_tasks({ value: formatNumber(value), sprints: formatNumber(velocity.sprints) });
}

/** Days from today to the last day, both counted (0 once it's past). */
export const daysLeft = (sprint: Pick<SprintSummary, "endOn">, today: string) =>
	Math.max(0, Math.round((Date.parse(sprint.endOn) - Date.parse(today)) / 86_400_000) + 1);

export function SprintDates({
	sprint,
	className,
}: {
	sprint: Pick<SprintSummary, "startOn" | "endOn">;
	className?: string;
}) {
	return (
		<span className={cn("inline-flex items-center gap-1 text-caption text-muted-foreground", className)}>
			<CalendarRangeIcon className="size-3.5" aria-hidden />
			{m.taskline_sprint_dates({ start: dayText(sprint.startOn), end: dayText(sprint.endOn) })}
		</span>
	);
}

/** Done of scope, as a bar with its numbers. */
export function SprintProgress({ totals, measure }: { totals: SprintTotals; measure: SprintMeasure }) {
	const scope = measure === "points" ? totals.scopePoints : totals.scopeTasks;
	const done = measure === "points" ? totals.donePoints : totals.doneTasks;
	const label =
		measure === "points"
			? m.taskline_sprint_progress_points({ done: formatNumber(done), scope: formatNumber(scope) })
			: m.taskline_sprint_progress_tasks({ done: formatNumber(done), scope: formatNumber(scope) });
	return (
		<div className="flex flex-col gap-1">
			<Progress value={scope === 0 ? 0 : Math.round((done / scope) * 100)} aria-label={label} />
			<span className="text-caption text-muted-foreground tabular-nums">{label}</span>
		</div>
	);
}
