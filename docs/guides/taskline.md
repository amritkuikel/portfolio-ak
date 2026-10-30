# Taskline

Taskline is the project management app at `/app/taskline` (Part 5 of [PLAN.md](../PLAN.md), section 11): one team that the admin runs from `/admin`, and a private sandbox per user so visitors can try it. It grows from Kanban (0188), which it replaces in Task 48.

**Status:** Task 46 built the foundation: the tables, the access resolver, the activity log, the services and server functions for workspaces, projects, statuses, labels and tasks, the sandbox's seed and claim, and the demo team. There is no UI yet (Task 47 adds the shell and the first pages). Each later task adds a section here.

## Where things are

Taskline is its own strip-demo layer, `taskline`, independent of `apps` (`pnpm strip-demo --keep-taskline` keeps it).

| Piece | Path |
| --- | --- |
| Shared shapes and inputs | `src/features/taskline/`: `types.ts` (constants, DTOs; no imports, the schema reads it), `settings.ts` (`workspaceSettings`, `projectSettings`), `schema.ts` (every function's input) |
| Tables | `src/server/db/schema/taskline/{workspace,project,task}.ts`, migration `0016_taskline` (which also inserts the team workspace) |
| Access | `src/server/taskline/access.ts`: `resolveWorkspace`, `resolveProject`, `assertCan` |
| History and freshness | `src/server/taskline/activity.ts` (`recordActivity`), `rev.ts` (`bumpRev`, `nextTaskNumber`, `saveVersioned`), `rules.ts` (quotas, shared errors, rich text) |
| Services | `src/server/taskline/{workspace,projects,workflow,tasks}/{repository,service}.ts`; `sandbox.ts` (seed, claim, the `GUEST_DATA` entry) |
| Functions | `src/functions/taskline/{workspaces,projects,workflow,tasks}.ts` (app); `src/functions/taskline-admin/` (admin, from Task 49) |
| Middleware | `src/middleware/taskline.ts`: `requireTasklineUser`, `withTasklineServices` |
| Demo team | `scripts/lib/taskline-seed.ts`, `pnpm db:seed-taskline` |
| Tests | `tests/server/taskline-access.test.ts` (the matrix), `taskline.test.ts` (the rules), `taskline-seed.test.ts` |

Shared files mark Taskline's code with `taskline:start`/`taskline:end` or a trailing `// @taskline`: the schema index, the permission catalog and its labels, `GUEST_DATA`, the guard test, `scripts/lib/local-db.ts`. `src/lib/fractional-index.ts` belongs to both `apps` and `taskline` (strip-demo's `SHARED` list) until Kanban goes in Task 48.

## Workspaces and members (0203, 0207)

- **One team, many sandboxes.** `tl_workspace.kind` is `team` (exactly one, a partial unique index; created by the migration with `{}` settings, so every setting is its default) or `sandbox` (one per user, `owner_id` unique and cascading). A check keeps "team has no owner, a sandbox has one".
- **URLs name a workspace as `$ws`:** the team's slug (`team` by default, a setting from Task 49) or the literal `sandbox`, which always means the caller's own. Nobody can name someone else's sandbox.
- **Members are the identity** everywhere: assignee, reporter, actor, project member, star, watcher. `tl_member.user_id` is nullable: a sandbox's placeholder teammates have none, and deleting an account sets it to null while `display_name` keeps the name history shows. Guests are never team members.
- **Settings are jsonb with defaults in code** (`workspaceSettings`, `projectSettings`): a row stores only what was changed, `.parse()` fills the rest, and a new setting needs no migration. Defaults: projects created by admins only, team visibility, members may join, Sunday–Friday working days, the week from Sunday, Asia/Kathmandu, a 07:00 digest, 30 days of trash, 14 days on the done column, high team quotas.

## Access (0204)

Every app function runs `requireTasklineUser` → `withTasklineServices` (signed in, guests included; `context.user` has `isGuest` and the RBAC `permissions`). Every service then calls **one resolver** before anything else:

- `resolveWorkspace(db, user, ws)` → `{ workspace, settings, member, sandboxOwner, admin, canCreateProject }`
- `resolveProject(db, user, ws, key)` → the above plus `{ project, projectRole, can: { view, comment, edit, manage, logTime } }`
- `assertCan(access, "edit" | "comment" | "manage" | "logTime")`

| Caller | Team-visible project | Private project |
| --- | --- | --- |
| Account not on the team, or a guest | not found | not found |
| Team viewer | view, comment | not found unless a project member (then their project role) |
| Team member | view, comment, edit; may join if the settings allow | not found unless a project member |
| Project lead | everything, project settings included | same |
| `taskline:read` / `taskline:manage` | read only / lead-equivalent | read only / lead-equivalent |
| Deactivated member | not found (history kept) | not found |
| Sandbox owner | lead on everything in their own sandbox | n/a |

- **What the caller can't see is NOT_FOUND** (as the apps, 0187): someone else's data is simply not there. **What they can see but not do is FORBIDDEN**, with a reason the UI shows ("You can see this project but not change it", "This project is archived").
- The highest of the caller's levels wins: their project role, their team role on a team-visible project, and their `taskline:` permission.
- **Archived projects** read only, for everyone; a lead (or `taskline:manage`) keeps `manage` to restore them.
- **Creating projects:** a sandbox owner always; in the team, `taskline:manage`, or every team `member` when `projectCreation` is `members`.
- **Ids from the browser are checked against the resolved project:** an assignee must be an active member of the workspace, a status and a parent task must be the project's, a label the project's or the workspace's. Anything else is NOT_FOUND.
- **RBAC:** `taskline: [read, manage, configure, time]` in the catalog (inside taskline markers). Any of them opens `/admin` (`canEnterAdmin`); the team role is not an RBAC permission. Admin functions (Task 49 on) follow the CRUD standard: `requirePermission("taskline:…")` → `withServices` → `withAudit`.

## Writes, history and freshness (0205)

Every app write is one transaction: `resolveProject` → the change → `recordActivity(tx, access, …)` → `bumpRev(tx, projectId)` (then notifications from Task 50 and automations from Task 56).

- **`tl_activity` is the app's history,** for members: a task's timeline, a project's feed. App data never goes in the admin audit log (0186); admin-area writes go in both. The actor is the caller's member row; an admin acting through `taskline:manage` without one is recorded with `actor_id` null and `data.via = "admin"`. `data` is short JSON (`ActivityData`): `{ field, from, to }` per changed field of a task, ids and names otherwise. Entries of one change share their time.
- **`rev`** (bigint on the project) goes up with every change to the project or its tasks. Open pages poll it (Task 48) and refetch when it moved.
- **`version`** (an integer on the workspace, the project and the task) goes up only when a form saves: a task's title and description (`updateTask`), the project form (`updateProject`), the settings (Task 49). `saveVersioned` checks and bumps it in the UPDATE's own WHERE; a stale save is a CONFLICT with the `stale` reason, which forms turn into "reload" (`StaleVersionAlert`). Everything else (status, position, assignee, priority, dates, labels, parent, checklist) is a last-write-wins patch that leaves the version alone, so moving a card never makes someone's open description stale.
- `bumpRev` and `nextTaskNumber` set `updated_at` to itself, so Drizzle's `$onUpdate` doesn't move it: bookkeeping isn't an edit.

## Projects, workflow and tasks

- **A project key** is 2–6 of `A-Z0-9`, a letter first (the schema upper-cases what's typed; a check constraint backs it), unique per workspace, and never changes. Task references are `KEY-12`. Deleting a project (Task 49) must keep its key from being reused.
- **A new project** gets five statuses in the creator's language (Backlog, To do, In progress, Done, Canceled: one per category), its creator as lead (`lead_id` and a `lead` project member), and a `project.created` entry.
- **Statuses** have a category (`backlog`, `unstarted`, `started`, `completed`, `canceled`), a colour, an order key (`position`, fractional, compared with `COLLATE "C"`) and an optional WIP limit (shown, not enforced). Changing a status's category closes or reopens its tasks. Deleting one moves its tasks, trashed ones too, to the end of `moveTo` (a CONFLICT on the `moveTo` field without it); a project keeps at least one.
- **Labels** belong to a project (its lead's) or to the workspace (the admin's, Task 49); a name is unique per scope in any case (two partial unique indexes on `lower(name)`).
- **Task numbers** come from the project's `task_seq`, incremented by an UPDATE that holds the project's row lock until the transaction ends, so concurrent creates never collide (the unique index on (project, number) is the backstop).
- **`completed_at`** is set when a task enters a `completed` or `canceled` status, kept when it moves between closed ones, and cleared when it reopens.
- **Subtasks** nest three levels at most (`MAX_TASK_DEPTH` 2: epic, story, subtask), in the same project, never under themselves or their own subtasks.
- **The trash:** trashing a task trashes its subtasks that aren't there yet, at the same instant; restoring brings back the ones trashed with it. A subtask restored while its parent is still in the trash comes back as a top-level task. A trashed task can't be changed (CONFLICT) until it's restored. Trashed tasks stay out of lists and quotas; the daily cron purges them after the retention (Task 50).
- **Creating and being assigned make you a watcher** (Task 50 notifies watchers).

## Quotas

Counted under `lockQuota(tx, scope)` (`src/server/db/quota.ts`, 0206), inside the write's transaction:

| Limit | Sandbox | Team |
| --- | --- | --- |
| Projects | 5 | `settings.quotas.projects` (500) |
| Tasks outside the trash | 1,000 | `settings.quotas.tasks` (200,000) |
| Statuses per project | 20 | `settings.quotas.statusesPerProject` (50) |
| Time entries | 500 | `settings.quotas.timeEntries` (Task 53) |

## The sandbox (0203)

- **Seed** (`seedSandbox`, the `GUEST_DATA` entry `taskline`, `// @taskline`): a guest who starts gets a sandbox in their language with three placeholder teammates (Asha, Bikash, Sita), the project `WEB` with its labels and ten tasks (two subtasks, a checklist, due dates around today). An account can start one with `startTasklineSandbox`; a second call returns the first.
- **Claim** (`claimSandbox`, run by `claimGuest` when the guest signs up or in): an account without a sandbox takes the guest's over (its member row becomes the account's, with the account's name). An account that has one gets the guest's projects, teammates, labels and history moved into it: a project whose key is taken gets a suffix (`WEB` → `WEB2`, shortened to six characters), workspace labels merge by name, and every reference to the guest's member becomes the account's. Quotas don't apply. The guest's workspace is then deleted.
- **Cleanup:** the guest's sandbox goes with the guest (`owner_id` cascades), on the daily `/api/cron/guests`.
- **Each module adds to the seed and the claim** (11.6): its rows in both languages, and whatever references a member.

## Dev data

`pnpm db:seed-taskline --password …` (or `DEMO_PASSWORD`) writes a demo team on any database: five accounts (`asha@`, `bikash@`, `sita@`, `nabin@` and the viewer `priya@taskline.example.com`), every admin as a member, three projects (`WEB`, `APP`, and the private `OPS`) and sixty tasks. `pnpm dev:local` runs it on a fresh local database, with the e2e password. It's plain SQL (Node runs it without the app's aliases) and safe to run again: accounts and members are kept, projects are written only while the team has none.

## Adding to Taskline

1. Tables in `src/server/db/schema/taskline/`, one migration (`pnpm db:generate`).
2. A repository (plain reads and writes) and a service that calls the resolver first, writes in one transaction, records activity and bumps the rev.
3. Inputs in `features/taskline/schema.ts` (always `ws`, then `key` or `ref`); functions in `src/functions/taskline/` with `requireTasklineUser, withTasklineServices`, listed in the guard test's `TASKLINE_FUNCTIONS`.
4. The function's operation in `OPERATIONS` of `tests/server/taskline-access.test.ts` with what it needs (`read`, `edit`, `manage`): the matrix then checks it for every caller.
5. The sandbox's seed and claim, the messages in both languages, and a section of this guide.

## Pitfalls already solved

- **`$onUpdate` on bookkeeping:** an UPDATE through Drizzle moves `updated_at`. `bumpRev` and `nextTaskNumber` set it to itself; use them rather than a plain `update(tlProject)`.
- **Versions aren't `updated_at`:** Taskline's forms compare the integer `version`, not `updated_at` (0122 elsewhere), because last-write-wins patches change `updated_at` constantly.
- **A team reset in tests:** `env.reset()` truncates every table, the migration's team row included. Tests call `ensureTeamWorkspace(db)` in their seed.
- **Activity order within a change:** entries of one transaction share `now()`; order them by kind, not by time, when it matters.
- **Unused functions before the pages:** knip lists `src/functions/taskline/*.ts` as entries until Task 47's pages call them (remove the entry then, in `knip.json` and strip-demo's `knipEntries`).
