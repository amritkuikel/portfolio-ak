import { createServerFn } from "@tanstack/react-start";
import {
	boardIdInput,
	createBoardInput,
	createCardInput,
	createColumnInput,
	deleteCardInput,
	deleteColumnInput,
	renameBoardInput,
	updateCardInput,
	updateColumnInput,
} from "@/features/apps/kanban/schema";
import type {
	KanbanBoard,
	KanbanBoardList,
	KanbanBoardSummary,
	KanbanCard,
	KanbanColumn,
} from "@/features/apps/kanban/types";
import { zodInput } from "@/functions/_lib/validator";
import { requireAppUser, withAppServices } from "@/middleware/apps";
import * as kanban from "@/server/apps/kanban/service";

/**
 * Kanban (/apps/kanban, decision 0188): any signed-in user, guests included
 * (`requireAppUser`), each acting on their own rows only; the input validated with
 * the shared schema, then one call into the service.
 */

export const listKanbanBoards = createServerFn({ method: "GET" })
	.middleware([requireAppUser, withAppServices])
	.handler(({ context }): Promise<KanbanBoardList> => kanban.listBoards(context));

export const getKanbanBoard = createServerFn({ method: "GET" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(boardIdInput))
	.handler(({ data, context }): Promise<KanbanBoard> => kanban.getBoard(context, data.id));

export const createKanbanBoard = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(createBoardInput))
	.handler(({ data, context }): Promise<KanbanBoardSummary> => kanban.createBoard(context, data));

export const renameKanbanBoard = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(renameBoardInput))
	.handler(({ data, context }): Promise<void> => kanban.renameBoard(context, data));

export const deleteKanbanBoard = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(boardIdInput))
	.handler(({ data, context }): Promise<void> => kanban.deleteBoard(context, data.id));

export const createKanbanColumn = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(createColumnInput))
	.handler(({ data, context }): Promise<KanbanColumn> => kanban.createColumn(context, data));

export const updateKanbanColumn = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(updateColumnInput))
	.handler(({ data, context }): Promise<KanbanColumn> => kanban.updateColumn(context, data));

export const deleteKanbanColumn = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(deleteColumnInput))
	.handler(({ data, context }): Promise<void> => kanban.deleteColumn(context, data.id));

export const createKanbanCard = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(createCardInput))
	.handler(({ data, context }): Promise<KanbanCard> => kanban.createCard(context, data));

export const updateKanbanCard = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(updateCardInput))
	.handler(({ data, context }): Promise<KanbanCard> => kanban.updateCard(context, data));

export const deleteKanbanCard = createServerFn({ method: "POST" })
	.middleware([requireAppUser, withAppServices])
	.validator(zodInput(deleteCardInput))
	.handler(({ data, context }): Promise<void> => kanban.deleteCard(context, data.id));
