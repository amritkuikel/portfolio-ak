import type { z } from "zod";
import { listSchema } from "@/lib/crud/schema";
import { dateParam, enumParam, searchParam } from "@/lib/list/params";
import { ACTIVITY_KINDS, PROJECT_STATUSES, PROJECT_VISIBILITIES, TEAM_ROLES } from "../types";

/**
 * The URL contracts of /admin/taskline's lists (route files import this, not ./schema.ts).
 * Ids in filters (a lead, a project, an actor) are plain text in the URL: the server
 * ignores one that isn't an id, so an edited link never fails.
 */

export const TL_ADMIN_PROJECTS_TABLE_ID = "admin-taskline-projects";
export const TL_ADMIN_MEMBERS_TABLE_ID = "admin-taskline-members";
export const TL_ADMIN_ACTIVITY_TABLE_ID = "admin-taskline-activity";

export const PROJECT_STATUS_FILTERS = ["all", ...PROJECT_STATUSES] as const;
export const PROJECT_VISIBILITY_FILTERS = ["all", ...PROJECT_VISIBILITIES] as const;

/** Name first. `q` matches the name or key; `lead` is a member id or `none`. */
export const adminProjectList = listSchema({
	sorts: ["name", "-name", "key", "-key", "-updated", "updated"],
	filters: {
		status: enumParam(PROJECT_STATUS_FILTERS, "all"),
		visibility: enumParam(PROJECT_VISIBILITY_FILTERS, "all"),
		lead: searchParam(40),
	},
});
export type AdminProjectSearch = z.output<typeof adminProjectList.search>;
export type AdminProjectListInput = z.output<typeof adminProjectList.input>;

export const MEMBER_STATE_FILTERS = ["active", "deactivated", "all"] as const;
export const MEMBER_ROLE_FILTERS = ["all", ...TEAM_ROLES] as const;

/** By name. `q` matches the name, title or the account's email. */
export const adminMemberList = listSchema({
	sorts: ["name", "-name", "-joined", "joined"],
	filters: {
		state: enumParam(MEMBER_STATE_FILTERS, "active"),
		role: enumParam(MEMBER_ROLE_FILTERS, "all"),
	},
});
export type AdminMemberSearch = z.output<typeof adminMemberList.search>;
export type AdminMemberListInput = z.output<typeof adminMemberList.input>;

export const ACTIVITY_KIND_FILTERS = ["all", ...ACTIVITY_KINDS] as const;

/** Newest first. Filters: the project, the actor (a member id), the kind and the days (the team's time zone). */
export const adminActivityList = listSchema({
	sorts: ["-at", "at"],
	filters: {
		project: searchParam(40),
		actor: searchParam(40),
		kind: enumParam(ACTIVITY_KIND_FILTERS, "all"),
		from: dateParam(),
		to: dateParam(),
	},
});
export type AdminActivitySearch = z.output<typeof adminActivityList.search>;
export type AdminActivityListInput = z.output<typeof adminActivityList.input>;
