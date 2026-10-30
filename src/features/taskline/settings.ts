import { z } from "zod";
import { isIsoDate } from "@/lib/i18n/date-only";
import { APP_TIME_ZONE } from "@/lib/i18n/intl";
import { NOTIFY_MODES, PROJECT_VISIBILITIES, type ProjectSettings } from "./types";

/**
 * The settings stored as jsonb (`tl_workspace.settings`, `tl_project.settings`),
 * with their defaults in code: a row holds only what was changed, so a new setting
 * needs no migration and `{}` is the default workspace. Read them with `.parse()`.
 */

const day = z.number().int().min(0).max(6);

/** The kinds of notification a member can tune (Task 50 sends them). */
export const NOTIFY_KINDS = [
	"assigned",
	"mentioned",
	"comment",
	"status",
	"due",
	"overdue",
	"added",
	"invited",
	"sprint",
	"automation",
	"timer",
] as const;
export type NotifyKind = (typeof NOTIFY_KINDS)[number];

const notifyDefaults = Object.fromEntries(
	NOTIFY_KINDS.map((kind) => [kind, kind === "assigned" || kind === "mentioned" ? "instant" : "digest"]),
) as Record<NotifyKind, (typeof NOTIFY_MODES)[number]>;

export const TEAM_QUOTA_DEFAULTS = { projects: 500, tasks: 200_000, statusesPerProject: 50, timeEntries: 1_000_000 };

export const workspaceSettings = z.object({
	/** Who may create team projects: holders of `taskline:manage` only, or every team member. */
	projectCreation: z.enum(["admins", "members"]).default("admins"),
	defaultVisibility: z.enum(PROJECT_VISIBILITIES).default("team"),
	/** Whether team members may join a team-visible project themselves. */
	membersCanJoin: z.boolean().default(true),
	/** 0 Sunday … 6 Saturday; Nepal's working week is Sunday to Friday. */
	workingDays: z.array(day).min(1).max(7).default([0, 1, 2, 3, 4, 5]),
	weekStart: day.default(0),
	timeZone: z.string().min(1).default(APP_TIME_ZONE),
	/** The hour (in `timeZone`) the daily digest goes out. */
	digestHour: z.number().int().min(0).max(23).default(7),
	notify: z
		.record(z.enum(NOTIFY_KINDS), z.enum(NOTIFY_MODES))
		.default(notifyDefaults)
		.transform((modes) => ({ ...notifyDefaults, ...modes })),
	quotas: z
		.object({
			projects: z.number().int().positive(),
			tasks: z.number().int().positive(),
			statusesPerProject: z.number().int().positive(),
			timeEntries: z.number().int().positive(),
		})
		.partial()
		.default({})
		.transform((quotas) => ({ ...TEAM_QUOTA_DEFAULTS, ...quotas })),
	trashRetentionDays: z.number().int().min(1).max(365).default(30),
	/** Time entries on or before this day can't change (Task 53). */
	timesheetLockOn: z.string().refine(isIsoDate).nullable().default(null),
	/** Days a completed task stays on the board. */
	doneColumnDays: z.number().int().min(1).max(365).default(14),
});
export type WorkspaceSettings = z.output<typeof workspaceSettings>;
/** What the column holds: any subset of the settings. */
export type StoredWorkspaceSettings = z.input<typeof workspaceSettings>;

export const projectSettings = z.object({
	sprints: z.boolean().default(false),
	time: z.boolean().default(true),
	estimation: z.enum(["points", "time"]).default("points"),
	blockCompletionWhileBlocked: z.boolean().default(false),
	doneColumnDays: z.number().int().min(1).max(365).nullable().default(null),
}) satisfies z.ZodType<ProjectSettings, unknown>;
export type StoredProjectSettings = z.input<typeof projectSettings>;
