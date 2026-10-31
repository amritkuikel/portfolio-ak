import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getTasklineActivityOptions, listTasklineActivity } from "@/functions/taskline-admin/activity";
import {
	addTasklineMembers,
	deactivateTasklineMember,
	inviteTasklineMember,
	listTasklineInvitations,
	listTasklineMemberOptions,
	listTasklineMembers,
	reactivateTasklineMember,
	resendTasklineInvitation,
	revokeTasklineInvitation,
	searchTasklineAccounts,
	updateTasklineMember,
} from "@/functions/taskline-admin/members";
import { getTasklineOverview } from "@/functions/taskline-admin/overview";
import {
	createTasklineAdminProject,
	deleteTasklineAdminProject,
	exportTasklineAdminProject,
	getTasklineAdminProject,
	isTasklineProjectKeyFree,
	listTasklineAdminProjects,
	removeTasklineAdminProjectMember,
	setTasklineAdminProjectArchived,
	setTasklineAdminProjectMember,
	setTasklineAdminProjectState,
	transferTasklineProjectLead,
	updateTasklineAdminProject,
} from "@/functions/taskline-admin/projects";
import {
	createTasklineWorkspaceLabel,
	deleteTasklineWorkspaceLabel,
	getTasklineWorkflows,
	getTasklineWorkspace,
	updateTasklineWorkflows,
	updateTasklineWorkspace,
	updateTasklineWorkspaceLabel,
} from "@/functions/taskline-admin/settings";
import type { ProjectHealth, ProjectRole, ProjectStatus, TasklineColor, TeamRole } from "../types";
import { adminActivityKeys, adminMemberKeys, adminProjectKeys, tasklineAdminKeys } from "./keys";
import type {
	AdminCreateProjectInput,
	AdminUpdateProjectInput,
	InviteMemberInput,
	UpdateMemberInput,
	UpdateWorkflowsInput,
	UpdateWorkspaceInput,
} from "./schema";
import type { AdminActivityListInput, AdminMemberListInput, AdminProjectListInput } from "./search";

/** /admin/taskline's reads (queryOptions) and writes (mutationOptions); routes load this on demand (0194). */

export const tasklineOverviewQueryOptions = () =>
	queryOptions({ queryKey: tasklineAdminKeys.overview(), queryFn: () => getTasklineOverview() });

export const adminProjectListQueryOptions = (input: AdminProjectListInput) =>
	queryOptions({ queryKey: adminProjectKeys.list(input), queryFn: () => listTasklineAdminProjects({ data: input }) });

export const adminProjectQueryOptions = (id: string) =>
	queryOptions({ queryKey: adminProjectKeys.detail(id), queryFn: () => getTasklineAdminProject({ data: { id } }) });

export const memberOptionsQueryOptions = () =>
	queryOptions({ queryKey: tasklineAdminKeys.memberOptions(), queryFn: () => listTasklineMemberOptions() });

export const adminMemberListQueryOptions = (input: AdminMemberListInput) =>
	queryOptions({ queryKey: adminMemberKeys.list(input), queryFn: () => listTasklineMembers({ data: input }) });

export const invitationsQueryOptions = () =>
	queryOptions({ queryKey: tasklineAdminKeys.invitations(), queryFn: () => listTasklineInvitations() });

export const adminWorkspaceQueryOptions = () =>
	queryOptions({ queryKey: tasklineAdminKeys.workspace(), queryFn: () => getTasklineWorkspace() });

export const adminWorkflowsQueryOptions = () =>
	queryOptions({ queryKey: tasklineAdminKeys.workflows(), queryFn: () => getTasklineWorkflows() });

export const adminActivityQueryOptions = (input: AdminActivityListInput) =>
	queryOptions({ queryKey: adminActivityKeys.list(input), queryFn: () => listTasklineActivity({ data: input }) });

export const activityOptionsQueryOptions = () =>
	queryOptions({ queryKey: tasklineAdminKeys.activityOptions(), queryFn: () => getTasklineActivityOptions() });

/** The "Add people" picker's search (AsyncComboboxField, RelationField). */
export const accountSearch = {
	queryKey: tasklineAdminKeys.accounts(),
	search: (q: string) => searchTasklineAccounts({ data: { q } }),
};

/** The create form's check while typing. */
export const isProjectKeyFree = (key: string) => isTasklineProjectKeyFree({ data: { key } });

const key = (name: string) => [...tasklineAdminKeys.all, "mutation", name] as const;

/** Writes, keyed (useMutationState can find them). useCrudMutation and useCrudForm add the rest. */
export const tasklineAdminMutations = {
	createProject: () =>
		mutationOptions({
			mutationKey: key("create-project"),
			mutationFn: (input: AdminCreateProjectInput) => createTasklineAdminProject({ data: input }),
		}),
	updateProject: () =>
		mutationOptions({
			mutationKey: key("update-project"),
			mutationFn: (input: AdminUpdateProjectInput) => updateTasklineAdminProject({ data: input }),
		}),
	setProjectState: () =>
		mutationOptions({
			mutationKey: key("project-state"),
			mutationFn: (input: { id: string; status?: Exclude<ProjectStatus, "archived">; health?: ProjectHealth | null }) =>
				setTasklineAdminProjectState({ data: input }),
		}),
	setProjectArchived: () =>
		mutationOptions({
			mutationKey: key("archive-project"),
			mutationFn: (input: { id: string; archived: boolean }) => setTasklineAdminProjectArchived({ data: input }),
		}),
	transferLead: () =>
		mutationOptions({
			mutationKey: key("transfer-lead"),
			mutationFn: (input: { id: string; memberId: string }) => transferTasklineProjectLead({ data: input }),
		}),
	deleteProject: () =>
		mutationOptions({
			mutationKey: key("delete-project"),
			mutationFn: (input: { id: string; confirmKey: string }) => deleteTasklineAdminProject({ data: input }),
		}),
	exportProject: () =>
		mutationOptions({
			mutationKey: key("export-project"),
			mutationFn: (input: { id: string; format: "json" | "csv" }) => exportTasklineAdminProject({ data: input }),
		}),
	setProjectMember: () =>
		mutationOptions({
			mutationKey: key("project-member"),
			mutationFn: (input: { id: string; memberId: string; role: ProjectRole }) =>
				setTasklineAdminProjectMember({ data: input }),
		}),
	removeProjectMember: () =>
		mutationOptions({
			mutationKey: key("remove-project-member"),
			mutationFn: (input: { id: string; memberId: string }) => removeTasklineAdminProjectMember({ data: input }),
		}),
	addMembers: () =>
		mutationOptions({
			mutationKey: key("add-members"),
			mutationFn: (input: { userIds: string[]; role: TeamRole }) => addTasklineMembers({ data: input }),
		}),
	updateMember: () =>
		mutationOptions({
			mutationKey: key("update-member"),
			mutationFn: (input: UpdateMemberInput) => updateTasklineMember({ data: input }),
		}),
	deactivateMember: () =>
		mutationOptions({
			mutationKey: key("deactivate-member"),
			mutationFn: (input: { id: string; reassignTo: string | null }) => deactivateTasklineMember({ data: input }),
		}),
	reactivateMember: () =>
		mutationOptions({
			mutationKey: key("reactivate-member"),
			mutationFn: (input: { id: string }) => reactivateTasklineMember({ data: input }),
		}),
	invite: () =>
		mutationOptions({
			mutationKey: key("invite"),
			mutationFn: (input: InviteMemberInput) => inviteTasklineMember({ data: input }),
		}),
	resendInvitation: () =>
		mutationOptions({
			mutationKey: key("resend-invitation"),
			mutationFn: (input: { id: string }) => resendTasklineInvitation({ data: input }),
		}),
	revokeInvitation: () =>
		mutationOptions({
			mutationKey: key("revoke-invitation"),
			mutationFn: (input: { id: string }) => revokeTasklineInvitation({ data: input }),
		}),
	updateWorkspace: () =>
		mutationOptions({
			mutationKey: key("update-workspace"),
			mutationFn: (input: UpdateWorkspaceInput & { id: string }) => {
				const { id: _id, ...data } = input;
				return updateTasklineWorkspace({ data });
			},
		}),
	updateWorkflows: () =>
		mutationOptions({
			mutationKey: key("update-workflows"),
			mutationFn: (input: UpdateWorkflowsInput) => updateTasklineWorkflows({ data: input }),
		}),
	createLabel: () =>
		mutationOptions({
			mutationKey: key("create-label"),
			mutationFn: (input: { name: string; color: TasklineColor }) => createTasklineWorkspaceLabel({ data: input }),
		}),
	updateLabel: () =>
		mutationOptions({
			mutationKey: key("update-label"),
			mutationFn: (input: { id: string; name: string; color: TasklineColor }) =>
				updateTasklineWorkspaceLabel({ data: input }),
		}),
	deleteLabel: () =>
		mutationOptions({
			mutationKey: key("delete-label"),
			mutationFn: (input: { id: string }) => deleteTasklineWorkspaceLabel({ data: input }),
		}),
};
