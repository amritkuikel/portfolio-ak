import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { FlaskConicalIcon, FolderKanbanIcon, ListTodoIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/components/errors/error-page";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatDate } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { tasklineColor } from "../colors";
import { tasklineLinks } from "../links";
import { myTasksQueryOptions, startSandboxMutation, tasklineNavQueryOptions } from "../queries";
import { ProjectDot } from "../shell/taskline-sidebar";
import type { MyTask, NavProject } from "../types";

const route = getRouteApi("/_taskline/app/taskline/_shell/home");

/**
 * /app/taskline/home, first version (PLAN Task 47): the caller's open tasks across
 * their workspaces by due date, and the projects they last worked on. Someone with
 * no workspace at all is offered a sandbox, and told how to join the team.
 */
export function TasklineHome() {
	const { session } = route.useRouteContext();
	const userId = session.user.id;
	const { data: nav } = useSuspenseQuery(tasklineNavQueryOptions(userId));
	const { data: mine } = useSuspenseQuery(myTasksQueryOptions(userId));
	const guest = session.isAnonymous === true;
	const hasSandbox = nav.workspaces.some((workspace) => workspace.kind === "sandbox");

	if (nav.workspaces.length === 0) {
		return (
			<Page width="narrow" data-testid="taskline-home">
				<PageHeader title={m.taskline_home_welcome()} description={m.taskline_home_welcome_body()} />
				<EmptyState
					icon={UsersIcon}
					title={m.taskline_home_no_team()}
					description={m.taskline_home_no_team_body()}
					primaryAction={<StartSandboxButton userId={userId} />}
					data-testid="taskline-home-empty"
				/>
			</Page>
		);
	}

	return (
		<Page width="admin" className="mx-auto max-w-6xl" data-testid="taskline-home">
			<PageHeader
				title={guest ? m.taskline_home_title() : m.taskline_home_greeting({ name: session.user.name })}
				description={m.taskline_home_description()}
			/>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<section aria-labelledby="home-tasks" className="flex min-w-0 flex-col gap-3">
					<h2 id="home-tasks" className="text-heading">
						{m.taskline_home_tasks()}
					</h2>
					{mine.tasks.length === 0 ? (
						<EmptyState icon={ListTodoIcon} description={m.taskline_home_tasks_empty()} />
					) : (
						<ul className="flex flex-col divide-y rounded-lg border bg-surface-1" data-testid="my-tasks">
							{mine.tasks.map((task) => (
								<MyTaskRow key={task.id} task={task} today={mine.today} />
							))}
						</ul>
					)}
				</section>
				<section aria-labelledby="home-recent" className="flex flex-col gap-3">
					<h2 id="home-recent" className="text-heading">
						{m.taskline_home_recent()}
					</h2>
					{nav.recent.length === 0 ? (
						<EmptyState icon={FolderKanbanIcon} description={m.taskline_home_recent_empty()} />
					) : (
						<ul className="flex flex-col gap-2" data-testid="recent-projects">
							{nav.recent.map((project) => (
								<li key={project.id}>
									<RecentProject project={project} several={nav.workspaces.length > 1} />
								</li>
							))}
						</ul>
					)}
					{guest || hasSandbox ? null : (
						<div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4">
							<p className="text-muted-foreground text-sm">{m.taskline_home_sandbox_offer()}</p>
							<StartSandboxButton userId={userId} variant="outline" />
						</div>
					)}
				</section>
			</div>
		</Page>
	);
}

function MyTaskRow({ task, today }: { task: MyTask; today: string }) {
	const overdue = task.dueOn !== null && task.dueOn < today;
	return (
		<li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
			<span className="w-20 shrink-0 font-mono text-caption text-muted-foreground">{task.ref}</span>
			<span className="min-w-0 flex-1 truncate font-medium text-body">{task.title}</span>
			<span className="flex items-center gap-1.5 text-caption text-muted-foreground">
				<span
					aria-hidden
					className="size-2 rounded-full"
					style={{ backgroundColor: tasklineColor(task.status.color) }}
				/>
				{task.status.name}
			</span>
			<Link
				{...tasklineLinks.project(task.project.ws, task.project.key)}
				className="flex items-center gap-1.5 text-caption underline-offset-4 hover:underline"
			>
				<ProjectDot project={task.project} className="size-2 rounded-sm" />
				{task.project.name}
			</Link>
			{task.dueOn ? (
				<span
					className={cn("text-caption tabular-nums", overdue ? "font-medium text-danger" : "text-muted-foreground")}
				>
					{overdue
						? m.taskline_due_overdue({ date: formatDate(isoDateInstant(task.dueOn), { dateStyle: "medium" }) })
						: m.taskline_due_on({ date: formatDate(isoDateInstant(task.dueOn), { dateStyle: "medium" }) })}
				</span>
			) : null}
		</li>
	);
}

function RecentProject({ project, several }: { project: NavProject; several: boolean }) {
	return (
		<Link
			{...tasklineLinks.project(project.ws, project.key)}
			className="flex items-center gap-3 rounded-lg border bg-surface-1 px-3 py-2.5 outline-none transition-colors hover:bg-surface-2 focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			<ProjectDot project={project} className="size-3 shrink-0 rounded" />
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-medium text-body">{project.name}</span>
				{several ? (
					<span className="flex items-center gap-1 text-caption text-muted-foreground">
						{project.workspaceKind === "sandbox" ? <FlaskConicalIcon className="size-3" aria-hidden /> : null}
						{project.workspaceKind === "sandbox" ? m.taskline_workspace_sandbox() : m.taskline_workspace_team()}
					</span>
				) : null}
			</span>
			<span className="font-mono text-caption text-muted-foreground">{project.key}</span>
		</Link>
	);
}

/** Starts the caller's sandbox (seeded in their language) and opens its projects. */
function StartSandboxButton({ userId, variant = "default" }: { userId: string; variant?: "default" | "outline" }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const start = useMutation({
		...startSandboxMutation(queryClient, userId),
		onSuccess: (workspace) => void navigate(tasklineLinks.projects(workspace.segment)),
		onError: (error) => toast.error(errorMessage(error)),
	});
	return (
		<Button
			variant={variant}
			onClick={() => start.mutate()}
			disabled={start.isPending}
			aria-busy={start.isPending}
			data-testid="start-sandbox"
		>
			{start.isPending ? <Spinner aria-hidden /> : <FlaskConicalIcon aria-hidden />}
			{start.isPending ? m.taskline_sandbox_starting() : m.taskline_sandbox_start()}
		</Button>
	);
}
