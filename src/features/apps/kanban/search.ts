import { z } from "zod";

/** The board page's path: a board id (UUID) or no match at all. */
export const kanbanBoardParamsSchema = z.object({ boardId: z.uuid() });
