import { z } from "zod";
import { isOrderKey } from "@/lib/fractional-index";
import { isoDate, optionalText, required } from "@/lib/validation";
import { KANBAN_LABELS } from "./types";

/**
 * Kanban's inputs (decision 0188), checked on the server (and by the board's forms).
 * Ids come from the browser (`crypto.randomUUID()`), so an optimistic row and the
 * saved one share their key; positions are order keys the browser computed.
 */
const id = z.uuid();
const position = z.string().refine(isOrderKey);

export const BOARD_NAME_MAX = 80;
export const COLUMN_NAME_MAX = 40;
export const CARD_TITLE_MAX = 200;
export const CARD_DESCRIPTION_MAX = 4000;
export const CHECKLIST_MAX = 30;

export const boardName = () => required({ max: BOARD_NAME_MAX });
export const columnName = () => required({ max: COLUMN_NAME_MAX });
export const cardTitle = () => required({ max: CARD_TITLE_MAX });

export const boardIdInput = z.strictObject({ id });
export const createBoardInput = z.strictObject({ id, name: boardName() });
export const renameBoardInput = z.strictObject({ id, name: boardName() });

export const createColumnInput = z.strictObject({ id, boardId: id, name: columnName(), position });
export const updateColumnInput = z.strictObject({ id, name: columnName().optional(), position: position.optional() });
export const deleteColumnInput = z.strictObject({ id });

export const checklistItem = z.strictObject({ id, text: required({ max: CARD_TITLE_MAX }), done: z.boolean() });

export const createCardInput = z.strictObject({ id, boardId: id, columnId: id, title: cardTitle(), position });
export const updateCardInput = z.strictObject({
	id,
	title: cardTitle().optional(),
	description: optionalText({ max: CARD_DESCRIPTION_MAX }).optional(),
	labels: z
		.array(z.enum(KANBAN_LABELS))
		.max(KANBAN_LABELS.length)
		.refine((labels) => new Set(labels).size === labels.length)
		.optional(),
	dueOn: isoDate().nullable().optional(),
	checklist: z.array(checklistItem).max(CHECKLIST_MAX).optional(),
	columnId: id.optional(),
	position: position.optional(),
});
export const deleteCardInput = z.strictObject({ id });

export type CreateBoardInput = z.infer<typeof createBoardInput>;
export type CreateColumnInput = z.infer<typeof createColumnInput>;
export type UpdateColumnInput = z.infer<typeof updateColumnInput>;
export type CreateCardInput = z.infer<typeof createCardInput>;
export type UpdateCardInput = z.infer<typeof updateCardInput>;
/** The fields of a card an edit can change (what the board's collection sends). */
export type CardChanges = Omit<UpdateCardInput, "id">;
