import { z } from "zod";

/**
 * Taskline's URL contracts (route files import these, never the form schemas, 0194).
 * Never strict: links carry utm tags.
 */

/** The project directory: cards or a list, the archived projects, and the create dialog (the palette opens it). */
export const projectsSearch = z.object({
	view: z.enum(["cards", "list"]).optional().catch(undefined),
	archived: z.literal(1).optional().catch(undefined),
	create: z.literal(1).optional().catch(undefined),
});
