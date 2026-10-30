import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { KANBAN_QUOTAS } from "@/features/apps/kanban/types";
import { isAppError } from "@/lib/errors";
import { generateKeysBetween } from "@/lib/fractional-index";
import * as repo from "@/server/apps/kanban/repository";
import * as kanban from "@/server/apps/kanban/service";
import type { AppServices } from "@/server/apps/ownership";
import * as schema from "@/server/db/schema";
import { createTestDb } from "../utils/test-db";

/**
 * Kanban (decision 0188) on PGlite: every call sees and changes only its caller's rows
 * (user A can't read or move user B's cards), moves write one row, quotas hold, and a
 * guest's sample board and claim work.
 */
let env: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
	env = await createTestDb("admin-1", (db) =>
		db.insert(schema.user).values([
			{ id: "alice", name: "Alice", email: "alice@example.com" },
			{ id: "bob", name: "Bob", email: "bob@example.com" },
			{ id: "guest-1", name: "Guest", email: "g1@anonymous.placeholder.invalid", isAnonymous: true },
		]),
	);
}, 60_000);
afterAll(() => env.close());
beforeEach(() => env.reset());

const as = (id: string, isGuest = false): AppServices => ({ db: env.db, user: { id, isGuest } });
const alice = () => as("alice");
const bob = () => as("bob");

const code = async (promise: Promise<unknown>) => {
	try {
		await promise;
		return "ok";
	} catch (error) {
		return isAppError(error) ? error.code : "thrown";
	}
};

/** Alice's board with its three default columns and two cards in the first. */
async function aliceBoard() {
	const summary = await kanban.createBoard(alice(), { id: crypto.randomUUID(), name: "Launch" });
	const board = await kanban.getBoard(alice(), summary.id);
	const [todo, doing] = board.columns;
	if (!todo || !doing) throw new Error("default columns missing");
	const [first, second] = generateKeysBetween(null, null, 2);
	const one = await kanban.createCard(alice(), {
		id: crypto.randomUUID(),
		boardId: board.id,
		columnId: todo.id,
		title: "One",
		position: first ?? "a0",
	});
	const two = await kanban.createCard(alice(), {
		id: crypto.randomUUID(),
		boardId: board.id,
		columnId: todo.id,
		title: "Two",
		position: second ?? "a1",
	});
	return { board, todo, doing, one, two };
}

describe("Kanban ownership", () => {
	it("starts a board with three columns, in order", async () => {
		const { board } = await aliceBoard();
		const read = await kanban.getBoard(alice(), board.id);
		expect(read.columns.map((column) => column.name)).toEqual(["To do", "Doing", "Done"]);
		expect(read.cards.map((card) => card.title)).toEqual(["One", "Two"]);
		expect(read.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		const { boards } = await kanban.listBoards(alice());
		expect(boards).toEqual([expect.objectContaining({ id: board.id, name: "Launch", columns: 3, cards: 2 })]);
	});

	it("never shows one user's boards to another", async () => {
		const { board } = await aliceBoard();
		expect((await kanban.listBoards(bob())).boards).toEqual([]);
		expect(await code(kanban.getBoard(bob(), board.id))).toBe("NOT_FOUND");
	});

	it("refuses every change to someone else's rows as not found", async () => {
		const { board, todo, doing, one } = await aliceBoard();
		expect(await code(kanban.updateCard(bob(), { id: one.id, columnId: doing.id, position: "a5" }))).toBe("NOT_FOUND");
		expect(await code(kanban.updateCard(bob(), { id: one.id, title: "Mine now" }))).toBe("NOT_FOUND");
		expect(await code(kanban.deleteCard(bob(), one.id))).toBe("NOT_FOUND");
		expect(await code(kanban.updateColumn(bob(), { id: todo.id, name: "Mine" }))).toBe("NOT_FOUND");
		expect(await code(kanban.deleteColumn(bob(), todo.id))).toBe("NOT_FOUND");
		expect(await code(kanban.renameBoard(bob(), { id: board.id, name: "Mine" }))).toBe("NOT_FOUND");
		expect(await code(kanban.deleteBoard(bob(), board.id))).toBe("NOT_FOUND");
		expect(
			await code(
				kanban.createCard(bob(), {
					id: crypto.randomUUID(),
					boardId: board.id,
					columnId: todo.id,
					title: "Planted",
					position: "a9",
				}),
			),
		).toBe("NOT_FOUND");
		expect(
			await code(
				kanban.createColumn(bob(), { id: crypto.randomUUID(), boardId: board.id, name: "Planted", position: "a9" }),
			),
		).toBe("NOT_FOUND");
		// Nothing changed.
		const read = await kanban.getBoard(alice(), board.id);
		expect(read.name).toBe("Launch");
		expect(read.cards.map((card) => [card.title, card.columnId])).toEqual([
			["One", todo.id],
			["Two", todo.id],
		]);
	});

	it("won't move one's own card into someone else's column", async () => {
		const { doing } = await aliceBoard();
		const mine = await kanban.createBoard(bob(), { id: crypto.randomUUID(), name: "Bob's" });
		const bobBoard = await kanban.getBoard(bob(), mine.id);
		const column = bobBoard.columns[0];
		if (!column) throw new Error("no column");
		const card = await kanban.createCard(bob(), {
			id: crypto.randomUUID(),
			boardId: mine.id,
			columnId: column.id,
			title: "Bob's card",
			position: "a0",
		});
		expect(await code(kanban.updateCard(bob(), { id: card.id, columnId: doing.id, position: "a0" }))).toBe("NOT_FOUND");
	});
});

describe("Kanban moves", () => {
	it("moves a card by writing its column and position", async () => {
		const { board, doing, one, two } = await aliceBoard();
		const moved = await kanban.updateCard(alice(), { id: two.id, columnId: doing.id, position: "a0" });
		expect(moved).toMatchObject({ id: two.id, columnId: doing.id, position: "a0" });
		// Within a column: before the first card.
		await kanban.updateCard(alice(), { id: one.id, columnId: doing.id, position: "Zz" });
		const read = await kanban.getBoard(alice(), board.id);
		expect(read.cards.filter((card) => card.columnId === doing.id).map((card) => card.title)).toEqual(["One", "Two"]);
	});

	it("orders by code unit, not the database's collation", async () => {
		const { board, todo } = await aliceBoard();
		// "a0V" sorts between "a0" and "a1"; a locale collation could put "Zz" after "a0".
		await kanban.createCard(alice(), {
			id: crypto.randomUUID(),
			boardId: board.id,
			columnId: todo.id,
			title: "Middle",
			position: "a0V",
		});
		await kanban.createCard(alice(), {
			id: crypto.randomUUID(),
			boardId: board.id,
			columnId: todo.id,
			title: "First",
			position: "Zz",
		});
		const read = await kanban.getBoard(alice(), board.id);
		expect(read.cards.map((card) => card.title)).toEqual(["First", "One", "Middle", "Two"]);
	});

	it("refuses a card in a column of another board", async () => {
		const { one } = await aliceBoard();
		const other = await kanban.createBoard(alice(), { id: crypto.randomUUID(), name: "Other" });
		const column = (await kanban.getBoard(alice(), other.id)).columns[0];
		if (!column) throw new Error("no column");
		expect(await code(kanban.updateCard(alice(), { id: one.id, columnId: column.id, position: "a0" }))).toBe(
			"NOT_FOUND",
		);
	});

	it("deletes a column with its cards, and a board with everything on it", async () => {
		const { board, todo } = await aliceBoard();
		await kanban.deleteColumn(alice(), todo.id);
		expect((await kanban.getBoard(alice(), board.id)).cards).toEqual([]);
		await kanban.deleteBoard(alice(), board.id);
		expect(await env.db.select().from(schema.kanbanColumn)).toEqual([]);
	});
});

describe("Kanban quotas", () => {
	it(`allows ${KANBAN_QUOTAS.boards} boards`, async () => {
		for (let index = 0; index < KANBAN_QUOTAS.boards; index++) {
			await kanban.createBoard(alice(), { id: crypto.randomUUID(), name: `Board ${index}` });
		}
		expect(await code(kanban.createBoard(alice(), { id: crypto.randomUUID(), name: "One too many" }))).toBe("CONFLICT");
		// Another user isn't affected.
		expect(await code(kanban.createBoard(bob(), { id: crypto.randomUUID(), name: "Bob's" }))).toBe("ok");
	});

	it(`allows ${KANBAN_QUOTAS.cards} cards per user`, async () => {
		const { board, todo } = await aliceBoard();
		const keys = generateKeysBetween("a1", null, KANBAN_QUOTAS.cards - 2);
		await env.db.transaction((tx) =>
			repo.insertCards(
				tx,
				"alice",
				keys.map((position) => ({ boardId: board.id, columnId: todo.id, title: "Bulk", position })),
			),
		);
		const extra = { id: crypto.randomUUID(), boardId: board.id, columnId: todo.id, title: "Over", position: "Zz" };
		expect(await code(kanban.createCard(alice(), extra))).toBe("CONFLICT");
	});

	it(`allows ${KANBAN_QUOTAS.columnsPerBoard} columns on a board`, async () => {
		const { board } = await aliceBoard();
		const keys = generateKeysBetween("a2", null, KANBAN_QUOTAS.columnsPerBoard - 3);
		for (const position of keys) {
			await kanban.createColumn(alice(), { id: crypto.randomUUID(), boardId: board.id, name: "More", position });
		}
		const extra = { id: crypto.randomUUID(), boardId: board.id, name: "Over", position: "z0" };
		expect(await code(kanban.createColumn(alice(), extra))).toBe("CONFLICT");
	});
});

describe("Kanban for guests", () => {
	it("seeds a sample board in the guest's language", async () => {
		await env.db.transaction((tx) => kanban.seedKanban(tx, "guest-1", "ne"));
		const { boards } = await kanban.listBoards(as("guest-1", true));
		expect(boards).toHaveLength(1);
		const board = await kanban.getBoard(as("guest-1", true), boards[0]?.id ?? "");
		expect(board.name).toBe("सुरुवात");
		expect(board.columns.map((column) => column.name)).toEqual(["गर्नुपर्ने", "गर्दै", "सकियो"]);
		expect(board.cards.length).toBeGreaterThanOrEqual(4);
		expect(board.cards.some((card) => card.checklist.length > 0)).toBe(true);
	});

	it("moves every row to an account on claim", async () => {
		await env.db.transaction((tx) => kanban.seedKanban(tx, "guest-1", "en"));
		await env.db.transaction((tx) => kanban.claimKanban(tx, "guest-1", "bob"));
		expect((await kanban.listBoards(as("guest-1", true))).boards).toEqual([]);
		const { boards } = await kanban.listBoards(bob());
		expect(boards.map((board) => board.name)).toEqual(["Getting started"]);
		const board = await kanban.getBoard(bob(), boards[0]?.id ?? "");
		expect(board.cards.length).toBeGreaterThan(0);
	});

	it("counts usage by accounts and guests", async () => {
		await aliceBoard();
		await env.db.transaction((tx) => kanban.seedKanban(tx, "guest-1", "en"));
		const usage = await kanban.kanbanUsage(env.db);
		expect(usage.accounts).toBe(1);
		expect(usage.guests).toBe(1);
		expect(usage.rows.boards).toBe(2);
		expect(usage.rows.cards).toBeGreaterThan(2);
	});
});
