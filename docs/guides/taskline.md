# Taskline

Taskline is the project management app at `/app/taskline` (Part 5 of [PLAN.md](../PLAN.md), section 11): one team that the admin runs from `/admin`, and a private sandbox per user so visitors can try it. It grew from Kanban (0188), which it replaced in Task 48 (0210).

**Status:** Task 46 built the foundation: the tables, the access resolver, the activity log, the services and server functions for workspaces, projects, statuses, labels and tasks, the sandbox's seed and claim, and the demo team. Task 47 added the standalone shell and the first pages: the landing, sign-in and sign-up, the account page, Home, the project directory and a first project overview (0208). Task 48 added the project's views (overview, board, list), the task (a sheet over the views and a page of its own), the lead's settings and rev polling, and moved Kanban's boards in (0209–0211). Task 49 made the admin real: `/admin/taskline` runs the team's projects, members, invitations, workflows and settings, and shows its numbers and history (0212, 0213). Task 50 added the conversation (comments with `@` mentions, watchers, files), the notifications with the inbox and "My settings", Taskline's emails and the daily job (0214). Task 51 added the calendar, My work, saved views, search and the CSV import (0215). Each later task adds a section here.

## Where things are

Taskline is its own strip-demo layer, `taskline`, independent of `apps` (`pnpm strip-demo --keep-taskline` keeps it).

| Piece | Path |
| --- | --- |
| Shared shapes and inputs | `src/features/taskline/`: `types.ts` (constants, DTOs; no imports, the schema reads it), `settings.ts` (`workspaceSettings`, `projectSettings`), `schema.ts` (every function's input), `search.ts` (URL contracts) |
| Routes | `src/routes/_taskline/route.tsx` (the section: brand, title, public 404), `…/app/taskline/{index,sign-in,sign-up}.tsx` (public frame), `…/app/taskline/_shell/` (the signed-in shell: `home`, `account`, `inbox`, `settings`, `$ws/projects`, `$ws/search`, `$ws/p/$key/{index,board,list,calendar,settings/*}`, `$ws/t/$ref`), `src/routes/_taskline/apps/kanban/` (Kanban's old addresses: redirects); the admin's in `src/routes/_admin/admin/taskline/` |
| Pages and the shell | `src/features/taskline/`: `brand.ts`, `links.ts`, `colors.ts`, `labels.ts`, `queries.ts`, `filters.ts`, `freshness.ts`, `shell/` (frames, sidebar, palette, shortcuts, mark, "New task"), `landing/`, `auth/`, `home/`, `projects/` (directory, project layout, overview, filter bar), `board/` (moves, collection, board), `list/` (the list, `import-dialog.tsx`), `calendar/` (`grid.ts`: weeks and My work's groups; the calendar and its page), `find/` (the search page), `saved-views.ts` (a project view's saved views as the menu's store), `import.ts` (the CSV import's mapping and preview), `task/` (panel, sheet, page, masked link, activity sentences, `conversation.tsx`: comments, files, watching; `uploads.ts`), `inbox/` (the inbox, "My settings"), `notifications.ts` (a notification as a sentence, the kinds' labels), `settings/` (the lead's), `admin/` (the admin's pages: `overview/`, `projects/`, `members/`, `workflows/`, `settings/`, `activity/`, with their `search.ts`, `schema.ts`, `keys.ts`, `queries.ts`, `labels.ts`, `commands.ts`) |
| Manifest and icons | `src/server/taskline/manifest.ts`, the Nitro route `src/server/routes/taskline-manifest.ts` (`vite.config.ts`), `public/taskline/` |
| Tables | `src/server/db/schema/taskline/{workspace,project,task,collab,views}.ts` (`collab`: `tl_comment`, `tl_notification`, migration `0020_taskline_collab`; `views`: `tl_saved_view`, `tl_import`, migration `0021_taskline_views`), migration `0016_taskline` (which also inserts the team workspace); `0017_kanban_to_taskline` (Kanban's data, 0210) and `0018_drop_kanban` |
| Access | `src/server/taskline/access.ts`: `resolveWorkspace`, `resolveProject`, `assertCan` |
| History and freshness | `src/server/taskline/activity.ts` (`recordActivity`), `rev.ts` (`bumpRev`, `nextTaskNumber`, `saveVersioned`), `rules.ts` (quotas, shared errors, rich text) |
| Services | `src/server/taskline/{workspace,projects,workflow,tasks,home,collab,views,search}/{repository,service}.ts`; `tasks/import.ts` (the CSV import); `notify/` (`produce.ts`, `deliver.ts`, `inbox.ts`); `cron.ts` (the daily job, `src/server/routes/cron-taskline.ts`); `sandbox.ts` (seed, claim, the `GUEST_DATA` entry); `admin/` (`team.ts`, `overview.ts`, `projects.ts`, `members.ts`, `invitations.ts`, `settings.ts`, `activity.ts`) |
| Functions | `src/functions/taskline/{home,workspaces,projects,workflow,tasks,collab,inbox,find}.ts` (app; `find`: search, saved views, the import); `src/functions/taskline-admin/{overview,projects,members,settings,activity}.ts` (admin) |
| Middleware | `src/middleware/taskline.ts`: `requireTasklineUser`, `withTasklineServices` |
| Demo team | `scripts/lib/taskline-seed.ts`, `pnpm db:seed-taskline` |
| Tests | `tests/server/taskline-access.test.ts` (the matrix, Home and the navigation), `taskline.test.ts` (the rules), `taskline-views.test.ts` (list, bulk, purge, feed, rev, finding by id), `taskline-kanban-migration.test.ts`, `taskline-seed.test.ts`, `taskline-admin.test.ts` (the admin's services), `taskline-collab.test.ts` (comments, mentions, files, notifications, email, the daily job, the inbox), `taskline-find.test.ts` (search, saved views, the import); `tests/unit/taskline-{moves,calendar,import}.test.ts`; `tests/components/taskline/` (the shell, the board and the calendar by keyboard); `e2e/flows/taskline.spec.ts`; stories in `shell/`, `board/`, `calendar/`, `task/` and `admin/` (data in `.storybook/mocks/taskline.ts`, function stand-ins in `.storybook/mocks/functions/taskline/` and `taskline-admin/`) |

Shared files mark Taskline's code with `taskline:start`/`taskline:end` or a trailing `// @taskline`: the schema index, the permission catalog and its labels, `GUEST_DATA`, the guard test, `scripts/lib/local-db.ts`, the e2e harness's seed and page list, the route-SEO test, the sitemap, `vite.config.ts` (the manifest routes), the `/apps` gallery's featured card, the admin's groups, sections and commands, the audit actions and targets and their labels, the email templates and Better Auth's session hook (`src/server/auth/auth.ts`), the upload scopes (`features/attachments/constants.ts`), `vercel.json`'s cron (strip-demo's `crons`). `src/lib/fractional-index.ts` is Taskline's alone since Kanban went (Task 48), so strip-demo's `SHARED` list is empty.

## The shell (0208)

Taskline is a product of its own inside the app: nothing of the site's, the apps' or the admin's chrome.

- **Two frames.** Visitors see the public frame (`TasklinePublicFrame`: the wordmark, language, theme, sign in and sign up) on the landing, and `TasklineAuthFrame` on `/sign-in` and `/sign-up`. Everyone signed in, guests included, gets `TasklineShell` under `_shell`: the sidebar (wordmark, the workspace switcher when they have both the team and a sandbox, Home, Projects, Search, starred and recent projects, the user), the topbar (breadcrumbs, search, language, theme; the user on phones, where the sidebar is a sheet), the palette (Ctrl/⌘ K: every project, the pages, a new project where allowed, preferences), the shortcuts (`?`), the guest banner, `ConfirmProvider` and `DbScope`.
- **The brand** is `TASKLINE_BRAND` on `_taskline`'s `staticData` (`src/lib/section-brand.ts`): the root puts `emerald` on `<html data-accent>` (so portalled menus and dialogs match) and links `public/taskline/`'s icons and the Taskline manifest. Titles are `tasklineTitle(page)` ("Page · Taskline"); the landing uses `seo({ siteName: TASKLINE_NAME })`. The name is a constant, the same in every language.
- **Links** go through `links.ts` (`tasklineLinks`, `TASKLINE_PATHS`): renaming the app is a move of `src/routes/_taskline/app/taskline` and that file.
- **Who goes where:** a signed-in visitor to the landing goes to Home; a visitor to any shell page goes to Taskline's sign-in with `?redirect=`, and back afterwards. Sign-up sends the verification link to `/verify-email?redirect=…`, whose "Continue" returns to Taskline. A guest's "account" is sign-up; signing out lands on the landing.
- **404s and errors stay in the frame:** the layouts' `notFoundComponent`s render their frame (they replace the layout), and `SectionHome` makes the error and 404 pages' home link go to Taskline. An unknown or hidden workspace or project is a 404 from `loadDetailOr404`.
- **Pages:** Home (the caller's open tasks in every workspace, soonest due first; recent projects; "Start a sandbox" for an account without one, and for an account with no workspace at all, "Ask an admin to add you"); the project directory (`?view=list`, `?archived=1`, stars, `?create=1` opens "New project" for those allowed, with a key suggested from the name); a first project overview (description, progress by status, members); the account page's sections.
- **Data:** the shell's `getTasklineNav` (the workspaces with `canCreateProject`, every visible active project, the starred ones, the recent ones) and Home's `listMyTasklineTasks` resolve each of the caller's workspaces and keep what they may see. "Recent" is where the caller last recorded activity, topped up with recently changed projects. Query keys carry the user's id (`tasklineKeys`), and every write refreshes everything under it.

## The project's views (0211)

A project page is a layout (`$ws/p/$key/route.tsx`): the header (name, key, visibility, archived or read-only, the people, "Join" for a team member who may join) and the view tabs (Overview, Board, List, and Settings for those who may run it) around the view. It owns the page's `<main>`, loads the project's tasks, statuses, labels and members once (`listTasklineTasks`) for every view, and its breadcrumb is the key from the URL, which the overview renames to the project's name.

- **Overview:** the description, progress by status category and per status, the people, and the project's feed (`listTasklineProjectActivity`: the latest 30 entries with the task each is about, as sentences from `task/activity.tsx`).
- **The filters** (`projects/task-filters.tsx`; the URL params `taskFilterParams` in `search.ts`): text or reference, status, assignee (`me`, `none` or a member), label, priority, type, due (overdue, this week, none). One `<FilterBar>`, so they work without JavaScript, with a chip per filter. The board applies them to the tasks it has (`filters.ts`); the list sends them to the server, whose SQL (`listWhere`) means the same.
- **Board** (Kanban's, 0188): a column per status over a TanStack DB collection of the layout's query (`board/collections.ts`); moves and quick adds show at once and are put back if the save fails. A column over its WIP limit says so (shown, not enforced). Closed tasks leave after the done-column window (the project's `doneColumnDays`, else the workspace's 14), with a count of those hidden. `?swimlanes=assignee|priority` adds a row per assignee (unassigned last) or priority (urgent first); a task moves within its lane, and one added in a lane gets the lane's assignee or priority. A card shows the ref, type, priority, assignee, labels, the due date (overdue in the danger colour, and said), and subtask and checklist progress. Readers get no handles.
- **List:** a `DataTable` on the list contract (`taskList` in `search.ts`: sort, page and page size in the URL; `listTasklineTaskPage` pages it), board order by default. `?group=status|assignee` makes the server sort by the group first, and `DataTable`'s `groupOf` draws a heading row per group (each its own `<tbody>`). Editors get inline status, assignee and priority and bulk changes (`bulkUpdateTasklineTasks`: one change to up to 100 tasks, an entry each, one rev); everyone gets CSV export and saved views.
- **The task** (`task/task-panel.tsx`): the fields (status, assignee, priority, type, labels, dates: each change saves at once, last write wins), the title and description (TipTap, loaded lazily, saved against the version they started from: a stale save offers "Reload"), subtasks (quick add, progress), the checklist and the history. From the board and the list it opens as a sheet (`?task=WEB-12`, a masked route): the address bar, a reload, a new tab and no JavaScript give its page, `/$ws/t/WEB-12`.
- **"New task"** in the sidebar: a title in one of the caller's projects (the current one first), then the task's page.

## Finding things (0215)

- **Calendar** (`$ws/p/$key/calendar`, a view tab): a month (`?mode=month`) or a week (`week`) of the project's tasks by due date (`?by=due`) or start date (`start`), from `?date=` (omitted: today), with the project's filters. It reads the board's collection, so a reschedule shows at once and is put back if refused (saved with `patchTask`). Weeks start on the workspace's week start; its days off are shaded; days outside the month are dimmed. Open tasks without the date are in "No date" beside it. A task's handle moves it: drag it to a day (or to "No date" to clear it), dnd-kit's keyboard drag, or **Alt + ← →** (a day) and **Alt + ↑ ↓** (a week) at once; an undated task is scheduled on the day shown. Each move is announced and the focus follows the task. Readers get no handles. The grid (`calendar/grid.ts`) is pure: weeks, months, steps and My work's groups.
- **My work** (Home): open tasks assigned to the caller or watched by them in every workspace (`?show=assigned`, `watching`: watched and assigned to someone else, `all`), grouped overdue, today, the rest of this week, later and no date (`MyTasks.today` and `weekEnd`, by the first workspace's calendar).
- **Saved views** (the "Views" menu on the list, the board and the calendar): a view's search string (without `page` and `task`), the member's own or shared with the project. Anyone with a member row who may see the project saves; an editor may tick "Share"; saving a name again replaces it; 50 per member and project. The author deletes theirs, the lead a shared one. An admin reading through `taskline:read` sees the shared ones and can't save. No activity, no `rev`: views aren't project data. `useSavedViews` turns them into the `SavedViewsStore` that `DataTable`'s `savedViews` and `SavedViewsMenu` take.
- **Search** (`$ws/search?q=`, the sidebar's Search and the palette): every word must start a word of a task's title or description (a prefix tsquery over the `search` tsvector; title matches rank first), open tasks before closed ones, never the trash, in the projects the caller may see, archived included. An exact reference (`WEB-12`, any case) of a task they may see goes straight to it. The page's form submits on Enter only. The palette searches every workspace of the caller's as they type (two characters at least) and offers "Search every task for …".
- **CSV import** (the list's "Import CSV", editors): a file or pasted text (`CsvSourcePicker`, shared with Expenses), the columns guessed from the header (title required; description, status, assignee, priority as 0–4 or its name, type, labels split on `,` `;` `|`, start, due, in the date format chosen), a preview checked by the server's schema that names what matches nothing, then one import of the valid rows, once per idempotency key. Up to 1,000 rows, 10 imports an hour, within the task quota. Names are matched without case (unmatched: the first open status, nobody, no label); each task gets `task.created` (`imported: true`), its creator and assignee watch it, and nobody is notified.
- **Sandbox:** Asha's shared list view "Due this week"; the claim moves the guest's views (their member becomes the account's) and import keys.

## The conversation and notifications (0214)

- **Comments** (the task's Comments tab): rich text with files, by members who may comment (a viewer may; an admin reading or managing through RBAC without a member row may not). Authors edit their own (marked "edited"); the author or the project's lead deletes (soft: `deleted_at`, its files removed). 30 comments per member per ten minutes. Each leaves `comment.added` or `comment.deleted` in the history and moves the `rev`.
- **Mentions:** typing `@` in a comment suggests the workspace's active members (`RichTextField`'s `mentions`; `rich-text-mentions.tsx`). The node is `<span data-type="mention" data-id="…">`, the only `<span>` the sanitizer keeps; the server reads the ids from the sanitized HTML and keeps (in `tl_comment.mentions`) those of members who may see the task. A placeholder can be mentioned; they're never told.
- **Watchers:** creating, being assigned or commenting makes you a watcher; anyone with a member row can watch or stop (the bell in the task's header). Watchers hear about comments and status changes.
- **Files** on a task (its Files section, editors add and remove) and on comments: images and PDFs, uploaded straight to Cloudinary through Taskline's functions (`TASKLINE_UPLOADS`, 60 an hour per member), linked as attachments with `entity_type` `tl_task` or `tl_comment`. Without Cloudinary the task says uploads aren't set up.
- **Notifications** (`notify/produce.ts`, in the change's transaction): assigned, mentioned, a comment or a status change on a watched task, added to a project (from the app's services), due tomorrow and overdue (from the daily job). Never the actor; only members with an account who may see the project; one per person per change. Each kind has a mode: the member's (`/settings`, "My settings", saved on every member row of theirs, with their email language) over the team's (`/admin/taskline/settings`). `off` writes nothing; the others go in the inbox, and `email` on the row says how they're emailed: `instant` (assigned and mentioned by default), `digest`, or `none` (guests).
- **The inbox** (`/inbox`, `?filter=all`, `?page=`): the caller's notifications in every workspace they still belong to, newest first, as sentences from the snapshot in `data` (so they read after a rename); opening one marks it read; read and unread each, or all read. The sidebar's Inbox shows the unread count, polled every minute.
- **Email** (`notify/deliver.ts`, signed Taskline, in the member's email language): after the commit, the service hands the instant ids to `services.deliver` (`waitUntil` in production): one `taskline-notification` email per recipient and task. Within five minutes of an email about the same task, new rows wait for the digest (coalescing). The daily `taskline-digest` lists each person's unread rows not yet emailed.
- **The daily job** (`GET /api/cron/taskline`, `cron.ts`, 07:00 in Kathmandu): due and overdue notices, the digests, the trash past retention (with subtasks and files), invitations a month past their date. Each step is idempotent; running it twice changes nothing.

## The lead's settings

`$ws/p/$key/settings/{general,members,workflow,labels,trash}`, for whoever may run the project (its lead, `taskline:manage`, a sandbox's owner); anyone else who can see it gets the FORBIDDEN page.

- **General:** the project form (versioned) with the done-column days, its state and health, and archiving.
- **Members:** the workspace's active members, added with a role; roles changed; members removed (their history stays).
- **Workflow:** statuses renamed, recoloured, given a category and a WIP limit, reordered with up and down, deleted once their tasks move to another.
- **Labels:** the project's; the workspace's are listed (the admin's, Task 49).
- **Trash:** restore a task with its subtasks, or delete it for good (`purgeTasklineTask`: its subtasks, labels, watchers, comments, files and history go, a `task.deleted` entry names it, and its number isn't handed out again).

## Freshness (0209)

No websockets: an open project page polls `getTasklineProjectRev` every 10 s while the tab is visible, and on focus (`useProjectFreshness`, `freshness.ts`). When the rev is past the one the page read, everything of the project is read again (the board's collection follows its query). The caller's own writes refresh everything under their key at once.

## Kanban, moved in (0210)

Migration `0017_kanban_to_taskline` gave each Kanban owner (guests too) a sandbox (or used the one they had) with their member row; made each board a project with the same id (keys `KB1`, `KB2`… in creation order, skipping keys taken); each column a status with the same id and order (the first "not started", the last "completed", the rest "started"; a board without columns got "To do"); and each card a task with the same id (numbered by creation, its plain description as escaped HTML, colour labels as project labels named after the colour, checklist and due date kept, closed when in the completed status). The owner leads and watches them. Portfolio projects whose `app_slug` was `kanban` now say `taskline`, and a case study whose "App" field says `taskline` links to Taskline's landing (`case-study/taskline-link.tsx`, in the taskline layer: Taskline isn't an `/apps` app). `0018_drop_kanban` dropped Kanban's tables.

`/apps/kanban` redirects to the landing (301). `/apps/kanban/<id>` asks `locateTasklineProject` and sends whoever may see that project to its board (301), and anyone else to Taskline (a temporary redirect: signing in may change the answer).

## Workspaces and members (0203, 0207)

- **One team, many sandboxes.** `tl_workspace.kind` is `team` (exactly one, a partial unique index; created by the migration with `{}` settings, so every setting is its default) or `sandbox` (one per user, `owner_id` unique and cascading). A check keeps "team has no owner, a sandbox has one".
- **URLs name a workspace as `$ws`:** the team's slug (`team` by default; the admin's settings change it) or the literal `sandbox`, which always means the caller's own. Nobody can name someone else's sandbox.
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

- **A project key** is 2–6 of `A-Z0-9`, a letter first (the schema upper-cases what's typed; a check constraint backs it), unique per workspace, and never changes. Task references are `KEY-12`. A deleted project's key is retired (`tl_retired_key`) and refused for every new project (0213).
- **A new project** gets the workspace's starting statuses: the admin's (`defaultStatuses`), or five in the creator's language (Backlog, To do, In progress, Done, Canceled: one per category); its creator as lead (an admin creating one in `/admin` picks the lead, or none) (`lead_id` and a `lead` project member), and a `project.created` entry.
- **Statuses** have a category (`backlog`, `unstarted`, `started`, `completed`, `canceled`), a colour, an order key (`position`, fractional, compared with `COLLATE "C"`) and an optional WIP limit (shown, not enforced). Changing a status's category closes or reopens its tasks. Deleting one moves its tasks, trashed ones too, to the end of `moveTo` (a CONFLICT on the `moveTo` field without it); a project keeps at least one.
- **Task types** offered are the workspace's `taskTypes` (all four by default): the tasks service refuses one turned off (a field error on `type`), a task keeps one it already has, and the panel lists only the offered ones plus the task's own.
- **Labels** belong to a project (its lead's) or to the workspace (the admin's, under Workflows: every project sees them, and a change moves every open project's `rev`); a name is unique per scope in any case (two partial unique indexes on `lower(name)`).
- **Task numbers** come from the project's `task_seq`, incremented by an UPDATE that holds the project's row lock until the transaction ends, so concurrent creates never collide (the unique index on (project, number) is the backstop).
- **`completed_at`** is set when a task enters a `completed` or `canceled` status, kept when it moves between closed ones, and cleared when it reopens.
- **Subtasks** nest three levels at most (`MAX_TASK_DEPTH` 2: epic, story, subtask), in the same project, never under themselves or their own subtasks.
- **The trash:** trashing a task trashes its subtasks that aren't there yet, at the same instant; restoring brings back the ones trashed with it. A subtask restored while its parent is still in the trash comes back as a top-level task. A trashed task can't be changed (CONFLICT) until it's restored. Trashed tasks stay out of lists and quotas; the daily job purges them after the retention.
- **Creating, being assigned and commenting make you a watcher**; watchers hear about comments and status changes.

## The admin (0212, 0213)

`/admin/taskline` is the admin's view of the team (the sidebar group "Taskline"; `taskline:read` opens it, `manage` changes projects, members and invitations, `configure` the workflows and settings).

- **How it writes:** functions in `src/functions/taskline-admin/` (`requirePermission` → `withServices`), services in `src/server/taskline/admin/`, each change audited with `withAudit`. A project change calls the app's own service inside that transaction, as the admin seen as a Taskline caller (`appServices(tx, actor)`: `taskline:manage` is lead-equivalent), so the app's rules, activity and `rev` apply. Activity the admin causes with no member row of theirs is recorded `via: "admin"`.
- **Overview:** active projects, open and overdue tasks, done this week (weeks from the workspace's week start, days in its time zone), created against completed over twelve weeks, each project's health, the people, and the sandboxes as counts only.
- **Projects:** every team project (private ones too) on the list contract; "New project" (key checked while typing, a lead picked or none, the workspace's starting statuses); a page per project with tabs as routes: details (the versioned project form, status and health at once, "Make lead"), members, workflow and labels (shown; edited in Taskline's lead settings, one editor each). Archive and restore, export (JSON: everything; CSV: the tasks), and delete by typing the key, which retires it.
- **Members:** the team with each one's role, title, weekly capacity and open (and overdue) tasks. "Add people" searches accounts not on the team (never guests); deactivating moves their open tasks to another member or leaves them unassigned and ends their access (a 404); reactivating brings them back.
- **Invitations** (their own page, a tab beside Members): by email, with a team role and optionally a project. The `taskline-invite` email, signed Taskline, links to Taskline's sign-up with the project as `?redirect=`. The first session of a verified account with that address joins (Better Auth's `session.create.after` hook calls `acceptOnSignIn`); expired and revoked ones do nothing; resend restarts the seven days; one open invitation per address. Sending is rate limited per admin (30 an hour).
- **Workflows:** the statuses new projects start with (in order, at least one open and one completed; "built-in" goes back to the five in the creator's language), the task types offered, and the workspace labels.
- **Settings:** the workspace's name and slug (the reserved segments are refused), who creates projects, default visibility, whether members may join, done-column and trash days, working days, week start, time zone, digest hour, the notification defaults per kind (Task 50) and the quotas (never below what exists). Saved against the workspace's `version`. Notifications the admin's changes cause (a member added to a project, a reassignment) are emailed in the digest: the admin's services run inside `withAudit`'s transaction, with no deliverer.
- **Activity:** the team's `tl_activity`, newest first, filtered by project, actor, kind and days, as the app's sentences. The admin's own changes are in the audit log.

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
- **The conversation** (Task 50): on the second task, Asha's note on the scope, her mention of the owner and Sita's reply; the owner's inbox holds that mention and an assignment (never emailed). The claim moves the guest's notifications to the account, and remaps comment authors, mentions and notification actors with the other member references.
- **Each module adds to the seed and the claim** (11.6): its rows in both languages, and whatever references a member.

## Dev data

`pnpm db:seed-taskline --password …` (or `DEMO_PASSWORD`) writes a demo team on any database: five accounts (`asha@`, `bikash@`, `sita@`, `nabin@` and the viewer `priya@taskline.example.com`), every admin as a member, three projects (`WEB`, `APP`, and the private `OPS`) and sixty tasks. `pnpm dev:local` runs it on a fresh local database, with the e2e password. It's plain SQL (Node runs it without the app's aliases) and safe to run again: accounts and members are kept, projects are written only while the team has none.

## Adding to Taskline

1. Tables in `src/server/db/schema/taskline/`, one migration (`pnpm db:generate`).
2. A repository (plain reads and writes) and a service that calls the resolver first, writes in one transaction, records activity, bumps the rev and, when someone should hear, calls `produce` in the transaction and hands the ids it returns to `services.deliver` after the commit.
3. Inputs in `features/taskline/schema.ts` (always `ws`, then `key` or `ref`); functions in `src/functions/taskline/` with `requireTasklineUser, withTasklineServices`, listed in the guard test's `TASKLINE_FUNCTIONS`.
4. The function's operation in `OPERATIONS` of `tests/server/taskline-access.test.ts` with what it needs (`read`, `edit`, `manage`): the matrix then checks it for every caller.
5. The sandbox's seed and claim, the messages in both languages, and a section of this guide.

## Pitfalls already solved

- **`$onUpdate` on bookkeeping:** an UPDATE through Drizzle moves `updated_at`. `bumpRev` and `nextTaskNumber` set it to itself; use them rather than a plain `update(tlProject)`.
- **Versions aren't `updated_at`:** Taskline's forms compare the integer `version`, not `updated_at` (0122 elsewhere), because last-write-wins patches change `updated_at` constantly.
- **A team reset in tests:** `env.reset()` truncates every table, the migration's team row included. Tests call `ensureTeamWorkspace(db)` in their seed.
- **Activity order within a change:** entries of one transaction share `now()`; order them by kind, not by time, when it matters.
- **The admin through the app's services:** an admin service passes its transaction to an app service (`appServices(tx, actor)`); the app service's own `db.transaction` is then a savepoint, so the audit row and the change commit together.
- **Server field errors use the form's field names:** the settings form's fields are flat (`timeZone`, `projects`), so the service keys its refusals that way, not by the input's path (`settings.timeZone`), or they land in the summary instead of under the field.
- **Unused functions before the pages:** while a module's functions have no page yet, knip can take its file as an entry (`knip.json` and strip-demo's `knipEntries`). Remove the entry once every function is called (Task 48 removed Task 46's).
- **`exists()` around raw SQL:** Drizzle's `exists(sql\`select …\`)` doesn't add the parentheses Postgres needs. Write `sql\`exists (select …)\``.
- **Lanes repeat the statuses:** with swimlanes every lane has a "To do" column, so a column's region is named after its lane too (axe's landmark-unique).
- **A reader's card isn't a sortable:** without a handle, dnd-kit makes the whole card a `role="button"` with links inside (axe's aria-allowed-role); the board attaches the sortable's ref for editors only.
- **Columns are droppables, not sortables:** dnd-kit's optimistic sorting moves an item only over another sortable, so a drop on an empty column arrives as its `target`; `onDragEnd` puts the task at that column's end.
- **A layout's crumb from its loader, under a child that 404s:** the browser hydrates the layout's match without its loader data, so a crumb the server rendered is missing in the browser (React #418). Take such a label from `params` (the `$ws` crumb), as `src/lib/breadcrumbs.ts` explains.
- **A section's accent belongs on `<html>`:** a `data-accent` on the shell's root misses portalled menus and dialogs and the tokens `:root` derives from `--primary`. Use `staticData.brand`.
- **A popup from inside a modal dialog mounts inside it:** Radix makes everything outside an open modal inert, so the mention list, mounted on `<body>` by Tiptap's `props.mount`, couldn't be clicked in the task sheet. `mentionExtension` appends it to the editor's nearest `[role="dialog"]` first, then lets `mount` position it.
- **Admin writes don't email at once:** an app service called from an admin service runs inside `withAudit`'s transaction, which commits after it returns; a deliverer called there would read uncommitted rows. `appServices` passes none, and those notifications go in the digest.
- **A layer's helpers inside another layer's markers:** `todayInZone`, `addDays` and the month helpers sat inside `apps:start`/`apps:end` in `lib/i18n/date-only.ts`, so `strip-demo --keep-taskline` would have removed what Taskline imports. A helper two layers use is core (no markers).
- **A search box that searches as you type jumps too soon:** with exact references redirecting, typing `WEB-1` on the way to `WEB-12` would open WEB-1. The search page's form searches only when submitted; the palette, which only lists, searches as you type.
- **A pointer click on a drag handle starts a drag:** in jsdom, dnd-kit's drag needs `IntersectionObserver`; tests focus a handle (`.focus()`) before pressing Alt + an arrow, as the board's do.
- **Route definitions are in every page's JavaScript** (0151): Taskline's eleven routes of Task 47 cost 3.2 kB gzip of entry, the thirteen of Task 48 2.7 kB. Keep heads, guards and loaders small; components, queries and DB are split out. A shift in Rolldown's chunks can also move the count (0211: clsx has a code-splitting group of its own).
