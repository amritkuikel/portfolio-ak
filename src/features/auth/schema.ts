import { z } from "zod";

/** One of the signed-in user's sessions, by id (the account page's "Sign out" on a device). */
export const sessionIdSchema = z.object({ id: z.string().min(1).max(100) });
