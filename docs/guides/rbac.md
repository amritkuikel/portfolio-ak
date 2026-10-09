# Roles and permissions (RBAC)

Who may do what, how it's enforced, and how to add a permission. Decisions 0094–0097 explain the choices.

## The model

| Piece | Where | Notes |
| --- | --- | --- |
| Permission catalog | `src/features/rbac/permissions.ts` | `"<resource>:<action>"`, e.g. `test-crud:publish`. Code, not data. |
| Labels | `src/features/rbac/labels.ts` | One message per resource and per permission (`Record<Permission, …>`: a missing label is a type error). |
| Admin | Better Auth `user.role = "admin"` | Every permission, always. Created with `pnpm db:seed-admin`; made or unmade on the Users page by another admin. |
| Baseline | system role `user` | Applies to every signed-in user. Empty by default. Edit it in the matrix. |
| Custom roles | `role`, `role_permission`, `user_role` tables | Created on the Roles page; permissions ticked in the matrix; assigned on the Users page. |

A user's permissions are: everything (admin), or the baseline plus their custom roles. Banned users have none. They are resolved from the database on every request (`getServerSession` → `permissionsForUser`) and carried in the `Session`.

## Enforcing a permission (all three layers)

1. **Server function:** the real protection:

   ```ts
   export const publishProject = createServerFn({ method: "POST" })
   	.middleware([requirePermission("projects:publish")])
   	.validator(zodInput(projectIdSchema))
   	.handler(({ data, context }) => service.publish(db, data.id, context.user.id));
   ```

   Add the function and its permission to `GUARDED_FUNCTIONS` in `tests/server/test-crud-functions.test.ts`. The test fails if a function skips the middleware or checks a different permission.

2. **Route:** so a direct visit gives the localized 403 page (a real 403 during SSR):

   ```ts
   // src/routes/_admin/admin/projects/route.tsx
   beforeLoad: ({ context }) => assertRoutePermission(context.session, "projects:read"), // from @/features/rbac/route-guard
   ```

3. **UI:** hide what the user can't use (a courtesy, never the protection):

   ```tsx
   <Can permission="projects:create"><NewProjectButton /></Can>
   const canPublish = useCan("projects:publish");
   ```

   Add the section to `src/features/admin/sections.ts` with its `permission`: the sidebar and the dashboard filter by it.

## Adding a permission or a resource

1. Add it to `PERMISSION_CATALOG`.
2. Add its label in `labels.ts` and the message in `messages/en.json` and `ne.json`.
3. Guard the server functions and routes as above.

The matrix shows the new permission at once. Admins have it automatically; everyone else gets it when an admin ticks it.

Removing a permission from the catalog makes stored grants of it inert: resolution filters unknown strings out.

## Rules (server-side, `src/server/rbac/service.ts`)

- The Admin role is fixed and only admins make or unmake admins.
- There is always at least one active admin.
- Nobody changes their own roles or bans themselves.
- A non-admin only grants, revokes, assigns or removes permissions they hold themselves, and can't touch an admin's roles or ban an admin.
- System roles can't be renamed or deleted, and role names are unique.

Each violation is a `ruleError` with a localized message (`fieldErrors._form`), shown by `errorMessage()`. The UI disables what the actor can't change, using the same rules (`UserRolesDialog`, `PermissionMatrix`).

## Pages

- `/admin/users` (`users:read`): filter by role or status. Edit roles needs `users:update`; ban/unban needs `users:ban`.
- `/admin/roles` (`roles:read`): create, rename or delete custom roles (`roles:manage`).
- `/admin/roles/permissions` (`roles:read`): the matrix. Editing needs `roles:manage`, and each change saves at once with rollback.

## Testing

- **`tests/server/rbac.test.ts`:** resolution, role management and every escalation or lockout rule, on PGlite.
- **`tests/server/auth-middleware.test.ts`:** `requirePermission` and the admin gate.
- **`tests/server/route-guards.test.ts`:** the `_admin` layout.
- **`tests/components/rbac/can.test.tsx`:** `<Can>`, `useCan` and the sidebar per permission.
- **`src/features/rbac/components/rbac.stories.tsx`:**
  - the matrix: save, rollback, manager limits and read-only;
  - the role dialog;
  - the user-roles dialog.
- **Live checks:** replay a captured server call from a session without the permission. Server-function errors come back as a serialized payload with HTTP 200 (`x-tss-serialized`), so assert the `FORBIDDEN` code in the body, and that the data didn't change.
