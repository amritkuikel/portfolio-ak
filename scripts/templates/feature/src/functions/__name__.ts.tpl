import { createServerFn } from "@tanstack/react-start";
import {
	type __Pascal__Detail,
	type __Pascal__Page,
	__camel__IdSchema,
	__camel__IdsSchema,
	__camel__InputSchema,
	__camel__ListInputSchema,
	__camel__UpdateSchema,
} from "@/features/__name__/schema";
import { zodInput } from "@/lib/fn-input";
import { requirePermission } from "@/middleware/auth";
import { auditActorFrom } from "@/server/audit/actor";
import { db } from "@/server/db/client";
import { list__Pascal__ as listRows } from "@/server/__name__/repository";
import {
	create__Pascal__Item,
	delete__Pascal__Items,
	get__Pascal__OrThrow,
	update__Pascal__Item,
} from "@/server/__name__/service";

/**
 * __Title__ admin server functions. Every one runs requirePermission first and
 * validates its input with the shared schema; the work is in src/server/__name__.
 */

export const list__Pascal__ = createServerFn({ method: "GET" })
	.middleware([requirePermission("__name__:read")])
	.validator(zodInput(__camel__ListInputSchema))
	.handler(({ data }): Promise<__Pascal__Page> => listRows(db, data));

export const get__Pascal__ = createServerFn({ method: "GET" })
	.middleware([requirePermission("__name__:read")])
	.validator(zodInput(__camel__IdSchema))
	.handler(({ data }): Promise<__Pascal__Detail> => get__Pascal__OrThrow(db, data.id));

export const create__Pascal__ = createServerFn({ method: "POST" })
	.middleware([requirePermission("__name__:create")])
	.validator(zodInput(__camel__InputSchema))
	.handler(({ data, context }): Promise<__Pascal__Detail> => create__Pascal__Item(db, data, context.user.id));

export const update__Pascal__ = createServerFn({ method: "POST" })
	.middleware([requirePermission("__name__:update")])
	.validator(zodInput(__camel__UpdateSchema))
	.handler(({ data }): Promise<__Pascal__Detail> => update__Pascal__Item(db, data));

/** Deletes one or many (bulk delete). Missing ids are ignored; returns how many were deleted. */
export const delete__Pascal__ = createServerFn({ method: "POST" })
	.middleware([requirePermission("__name__:delete")])
	.validator(zodInput(__camel__IdsSchema))
	.handler(
		({ data, context }): Promise<{ deleted: number }> => delete__Pascal__Items(db, data.ids, auditActorFrom(context)),
	);
