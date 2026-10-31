import { HistoryIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { TimelineItem } from "@/components/data-display/activity-feed";
import { UserAvatar } from "@/components/data-display/user-avatar";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatDate, formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { PRIORITY_LABELS, TYPE_LABELS } from "../labels";
import type {
	ActivityData,
	ActivityValue,
	TaskActivity,
	TasklineMember,
	TasklineStatus,
	TaskPriority,
	TaskType,
} from "../types";

/**
 * Taskline's history as sentences (decision 0205): `tl_activity` rows, with the actor's
 * name from the members (deactivated and placeholder ones too) and the statuses'
 * names; something since deleted reads as such.
 */
export type ActivityContext = {
	members: ReadonlyArray<TasklineMember>;
	statuses: ReadonlyArray<TasklineStatus>;
};

const text = (value: ActivityValue | undefined) => (typeof value === "string" ? value : "");

function actorName(entry: Pick<TaskActivity, "actorId" | "data">, members: ActivityContext["members"]) {
	if (entry.actorId)
		return members.find((member) => member.id === entry.actorId)?.name ?? m.taskline_activity_someone();
	return entry.data.via === "admin" ? m.taskline_activity_admin() : m.taskline_activity_someone();
}

const memberName = (id: ActivityValue | undefined, members: ActivityContext["members"]) =>
	typeof id === "string" ? (members.find((member) => member.id === id)?.name ?? m.taskline_activity_someone()) : "";

const statusName = (id: ActivityValue | undefined, statuses: ActivityContext["statuses"]) =>
	statuses.find((status) => status.id === id)?.name ?? m.taskline_activity_deleted_status();

const dateText = (value: ActivityValue | undefined) =>
	typeof value === "string" ? formatDate(isoDateInstant(value), { dateStyle: "medium" }) : "";

/** A field change on a task (`task.updated`'s `{ field, from, to }`). */
function fieldPhrase(actor: string, data: ActivityData, context: ActivityContext): string {
	const { field, from, to } = data;
	switch (field) {
		case "title":
			return m.taskline_activity_title({ actor, from: text(from), to: text(to) });
		case "description":
			return m.taskline_activity_description({ actor });
		case "priority":
			return m.taskline_activity_priority({ actor, priority: PRIORITY_LABELS[(Number(to) || 0) as TaskPriority]() });
		case "type":
			return m.taskline_activity_type({ actor, type: (TYPE_LABELS[to as TaskType] ?? TYPE_LABELS.task)() });
		case "assigneeId":
			return to
				? m.taskline_activity_assigned({ actor, name: memberName(to, context.members) })
				: m.taskline_activity_unassigned({ actor });
		case "dueOn":
			return to ? m.taskline_activity_due({ actor, date: dateText(to) }) : m.taskline_activity_due_removed({ actor });
		case "startOn":
			return to
				? m.taskline_activity_start({ actor, date: dateText(to) })
				: m.taskline_activity_start_removed({ actor });
		case "labels":
			return m.taskline_activity_labels({ actor });
		case "parentId":
			return m.taskline_activity_parent({ actor });
		default:
			return m.taskline_activity_changed({ actor });
	}
}

/** One entry as a sentence: who did what. */
export function activitySentence(
	entry: Pick<TaskActivity, "kind" | "actorId" | "data">,
	context: ActivityContext,
): string {
	const actor = actorName(entry, context.members);
	const { data } = entry;
	switch (entry.kind) {
		case "task.created":
			return m.taskline_activity_created({ actor });
		case "task.updated":
			return fieldPhrase(actor, data, context);
		case "task.moved":
			return m.taskline_activity_moved({
				actor,
				from: statusName(data.from, context.statuses),
				to: statusName(data.to, context.statuses),
			});
		case "task.trashed":
			return m.taskline_activity_trashed({ actor });
		case "task.restored":
			return m.taskline_activity_restored({ actor });
		case "task.checklist":
			return m.taskline_activity_checklist({
				actor,
				done: formatNumber(Number(data.done) || 0),
				total: formatNumber(Number(data.total) || 0),
			});
		case "comment.added":
			return m.taskline_activity_commented({ actor });
		case "comment.deleted":
			return m.taskline_activity_comment_deleted({ actor });
		case "attachment.added":
			return m.taskline_activity_file_added({ actor });
		case "attachment.removed":
			return m.taskline_activity_file_removed({ actor });
		case "task.deleted":
			return m.taskline_activity_purged({ actor, task: `${text(data.ref)} ${text(data.title)}`.trim() });
		case "project.created":
			return m.taskline_activity_project_created({ actor });
		case "project.updated":
		case "project.state":
			return m.taskline_activity_project_updated({ actor });
		case "project.archived":
			return m.taskline_activity_project_archived({ actor });
		case "project.restored":
			return m.taskline_activity_project_restored({ actor });
		case "project.member_added":
			return m.taskline_activity_member_added({ actor, name: memberName(data.memberId, context.members) });
		case "project.member_removed":
			return m.taskline_activity_member_removed({ actor, name: memberName(data.memberId, context.members) });
		case "status.created":
		case "status.updated":
		case "status.deleted":
			return m.taskline_activity_workflow({ actor });
		case "label.created":
		case "label.updated":
		case "label.deleted":
			return m.taskline_activity_label_changed({ actor });
		default:
			return m.taskline_activity_changed({ actor });
	}
}

/** Timeline items for entries, newest first; `detail` adds a line (the project feed's task). */
export function activityItems(
	entries: ReadonlyArray<TaskActivity>,
	context: ActivityContext,
	detail?: (entry: TaskActivity) => ReactNode,
): TimelineItem[] {
	return [...entries]
		.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
		.map((entry) => {
			const actor = entry.actorId ? context.members.find((member) => member.id === entry.actorId) : undefined;
			return {
				id: entry.id,
				at: entry.at,
				marker: actor ? (
					<UserAvatar name={actor.name} size="sm" />
				) : (
					<HistoryIcon className="size-4 text-muted-foreground" aria-hidden />
				),
				title: activitySentence(entry, context),
				detail: detail?.(entry),
			};
		});
}
