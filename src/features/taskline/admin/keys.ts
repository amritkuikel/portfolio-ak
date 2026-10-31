import { createCrudKeys } from "@/lib/crud/keys";
import type { AdminActivityListInput, AdminMemberListInput, AdminProjectListInput } from "./search";

/** /admin/taskline's Query keys (the shared shape, src/lib/crud/keys.ts). */

const ROOT = ["taskline-admin"] as const;

/** The section's single reads: the overview, pickers, invitations, settings and workflows. */
export const tasklineAdminKeys = {
	all: ROOT,
	overview: () => [...ROOT, "overview"] as const,
	memberOptions: () => [...ROOT, "member-options"] as const,
	invitations: () => [...ROOT, "invitations"] as const,
	workspace: () => [...ROOT, "workspace"] as const,
	workflows: () => [...ROOT, "workflows"] as const,
	activityOptions: () => [...ROOT, "activity-options"] as const,
	accounts: () => [...ROOT, "accounts"] as const,
};

export const adminProjectKeys = createCrudKeys<AdminProjectListInput>("taskline-admin-projects");
export const adminMemberKeys = createCrudKeys<AdminMemberListInput>("taskline-admin-members");
export const adminActivityKeys = createCrudKeys<AdminActivityListInput>("taskline-admin-activity");

/** What a change to the team can move: every list and read of the section. */
export const ALL_TASKLINE_ADMIN = [
	tasklineAdminKeys.all,
	adminProjectKeys.all,
	adminMemberKeys.all,
	adminActivityKeys.all,
] as const;
