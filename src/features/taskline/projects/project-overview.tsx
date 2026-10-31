import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { LockIcon, UsersIcon } from "lucide-react";
import { UserAvatar } from "@/components/data-display/user-avatar";
import { Page, PageHeader } from "@/components/page/page";
import { RichTextContent } from "@/components/rich-text-content";
import { formatNumber } from "@/lib/i18n/intl";
import type { SafeHtml } from "@/lib/safe-html";
import { m } from "@/paraglide/messages";
import { tasklineColor } from "../colors";
import { projectMembersQueryOptions, projectTasksQueryOptions } from "../queries";
import { ProjectDot } from "../shell/taskline-sidebar";
import { type ProjectRole, SANDBOX_SEGMENT } from "../types";

const PROJECT_ROLE_LABELS: Record<ProjectRole, () => string> = {
	lead: m.taskline_role_lead,
	member: m.taskline_role_member,
	viewer: m.taskline_role_viewer,
};

const route = getRouteApi("/_taskline/app/taskline/_shell/$ws/p/$key/");

/**
 * A project's overview, first version (Task 47 gives the sidebar, the palette and the
 * directory somewhere to go; Task 48 adds the view tabs, the board, the list and the
 * activity): what it is, how far along it is by status, and who is on it.
 */
export function ProjectOverview() {
	const { session } = route.useRouteContext();
	const { ws, key } = route.useParams();
	const { data } = useSuspenseQuery(projectTasksQueryOptions(session.user.id, ws, key));
	const { data: people } = useSuspenseQuery(projectMembersQueryOptions(session.user.id, ws, key));
	const { project, statuses, tasks } = data;
	const total = tasks.length;
	const closed = tasks.filter((task) => task.completedAt !== null).length;
	const counts = statuses.map((status) => ({
		status,
		count: tasks.filter((task) => task.statusId === status.id).length,
	}));
	return (
		<Page width="admin" className="mx-auto max-w-5xl" data-testid="project-overview">
			<PageHeader
				title={
					<span className="flex items-center gap-3">
						<ProjectDot project={project} className="size-4 shrink-0 rounded" />
						{project.name}
					</span>
				}
				description={
					<span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
						<span className="font-mono">{project.key}</span>
						{/* Visibility means something in the team only: a sandbox is private to its owner. */}
						{ws === SANDBOX_SEGMENT ? null : (
							<span className="flex items-center gap-1">
								{project.visibility === "private" ? <LockIcon className="size-3" aria-hidden /> : null}
								{project.visibility === "private" ? m.taskline_visibility_private() : m.taskline_visibility_team()}
							</span>
						)}
						{project.archived ? <span>{m.taskline_project_archived()}</span> : null}
					</span>
				}
			/>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="flex min-w-0 flex-col gap-6">
					<section aria-labelledby="project-about" className="flex flex-col gap-2">
						<h2 id="project-about" className="text-heading">
							{m.taskline_project_about()}
						</h2>
						{project.description ? (
							// Sanitized when saved (rules.ts, richText), like every rich text the server returns.
							<RichTextContent html={project.description as SafeHtml} />
						) : (
							<p className="text-muted-foreground">{m.taskline_project_no_description()}</p>
						)}
					</section>
					<section aria-labelledby="project-progress" className="flex flex-col gap-3">
						<h2 id="project-progress" className="text-heading">
							{m.taskline_project_progress()}
						</h2>
						<p className="text-muted-foreground text-sm">
							{m.taskline_project_progress_summary({ closed: formatNumber(closed), total: formatNumber(total) })}
						</p>
						{total > 0 ? (
							<div className="flex h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
								{counts
									.filter(({ count }) => count > 0)
									.map(({ status, count }) => (
										<span
											key={status.id}
											style={{ width: `${(count / total) * 100}%`, backgroundColor: tasklineColor(status.color) }}
										/>
									))}
							</div>
						) : null}
						<ul className="grid gap-2 sm:grid-cols-2" data-testid="project-statuses">
							{counts.map(({ status, count }) => (
								<li
									key={status.id}
									className="flex items-center gap-2 rounded-md border bg-surface-1 px-3 py-2 text-body"
								>
									<span
										aria-hidden
										className="size-2.5 rounded-full"
										style={{ backgroundColor: tasklineColor(status.color) }}
									/>
									<span className="min-w-0 flex-1 truncate">{status.name}</span>
									<span className="text-muted-foreground tabular-nums">{formatNumber(count)}</span>
								</li>
							))}
						</ul>
					</section>
				</div>
				<section aria-labelledby="project-people" className="flex flex-col gap-3">
					<h2 id="project-people" className="flex items-center gap-2 text-heading">
						<UsersIcon className="size-4 text-muted-foreground" aria-hidden />
						{m.taskline_project_people()}
					</h2>
					<ul className="flex flex-col gap-2">
						{people.map((member) => (
							<li key={member.memberId} className="flex items-center gap-2 text-body">
								<UserAvatar name={member.name} size="sm" />
								<span className="min-w-0 flex-1 truncate">{member.name}</span>
								<span className="text-caption text-muted-foreground">{PROJECT_ROLE_LABELS[member.role]()}</span>
							</li>
						))}
					</ul>
				</section>
			</div>
		</Page>
	);
}
