import "@tanstack/react-start/server-only";
import type { Locale } from "@/paraglide/runtime";
import { APP_SERVERS } from "@/server/apps/registry"; // @apps
import type { Tx } from "@/server/db/types";

/**
 * What owns rows a guest can make (decision 0186): each showcase app. A new guest
 * gets every owner's sample rows; a guest who signs up or in hands every owner's rows
 * to the account. Both run in one transaction with the rest of the claim or start.
 */
export type GuestData = {
	/** Its name in logs ("kanban"). */
	slug: string;
	/** Sample rows for a new guest, in the language they started in. */
	seedGuestData: (tx: Tx, userId: string, locale: Locale) => Promise<void>;
	/** Moves every row of `fromUserId` (a guest) to `toUserId` (an account). */
	claim: (tx: Tx, fromUserId: string, toUserId: string) => Promise<void>;
};

export const GUEST_DATA: ReadonlyArray<GuestData> = [
	...APP_SERVERS, // @apps
];
