import { describe, expect, it } from "vitest";
import {
	boardLayout,
	cardDrop,
	cardPlace,
	cardStep,
	columnDrop,
	columnStep,
	endPosition,
} from "@/features/apps/kanban/moves";
import type { KanbanCard, KanbanColumn } from "@/features/apps/kanban/types";

/** Kanban's moves (decision 0188): each one is a single new position, computed the same way for pointer and keys. */
const column = (id: string, position: string): KanbanColumn => ({ id, boardId: "b", name: id.toUpperCase(), position });
const card = (id: string, columnId: string, position: string): KanbanCard => ({
	id,
	boardId: "b",
	columnId,
	title: id,
	description: "",
	labels: [],
	dueOn: null,
	checklist: [],
	position,
});

// Given out of order on purpose: the layout sorts.
const columns = [column("doing", "a1"), column("todo", "a0"), column("done", "a2")];
const cards = [card("b", "todo", "a1"), card("a", "todo", "a0"), card("c", "todo", "a2"), card("x", "doing", "a0")];
const layout = boardLayout(columns, cards);
const titles = (columnId: string, list: ReadonlyArray<KanbanCard>) =>
	boardLayout(columns, list)
		.cards.get(columnId)
		?.map((each) => each.id);

/** The board's cards after applying a move to one of them. */
const apply = (id: string, move: { columnId: string; position: string } | null) =>
	cards.map((each) => (each.id === id && move ? { ...each, ...move } : each));

describe("boardLayout", () => {
	it("orders columns and each column's cards by position", () => {
		expect(layout.columns.map((each) => each.id)).toEqual(["todo", "doing", "done"]);
		expect(layout.cards.get("todo")?.map((each) => each.id)).toEqual(["a", "b", "c"]);
		expect(layout.cards.get("done")).toEqual([]);
	});
});

describe("card moves", () => {
	it("moves a card up and down its column", () => {
		const down = cardStep(layout, "a", "down");
		expect(titles("todo", apply("a", down))).toEqual(["b", "a", "c"]);
		const up = cardStep(layout, "c", "up");
		expect(titles("todo", apply("c", up))).toEqual(["a", "c", "b"]);
		expect(cardStep(layout, "a", "up")).toBeNull();
		expect(cardStep(layout, "c", "down")).toBeNull();
	});

	it("moves a card into the next column at the same height, or its end", () => {
		const right = cardStep(layout, "b", "right");
		expect(right?.columnId).toBe("doing");
		expect(titles("doing", apply("b", right))).toEqual(["x", "b"]);
		const intoEmpty = cardStep(boardLayout(columns, apply("x", { columnId: "doing", position: "a0" })), "x", "right");
		expect(intoEmpty?.columnId).toBe("done");
		expect(cardStep(layout, "a", "left")).toBeNull();
	});

	it("drops a card at an index of any column", () => {
		const drop = cardDrop(layout, "c", "todo", 0);
		expect(titles("todo", apply("c", drop))).toEqual(["c", "a", "b"]);
		const across = cardDrop(layout, "a", "doing", 1);
		expect(titles("doing", apply("a", across))).toEqual(["x", "a"]);
		// Its own place: nothing to do.
		expect(cardDrop(layout, "b", "todo", 1)).toBeNull();
	});

	it("says where a moved card lands, for the announcement", () => {
		const move = cardStep(layout, "b", "right");
		if (!move) throw new Error("no move");
		const place = cardPlace(layout, "b", move);
		expect(place.column?.id).toBe("doing");
		expect(place.index).toBe(1);
		expect(place.total).toBe(2);
	});

	it("puts a new card after the last one", () => {
		expect(endPosition(layout.cards.get("todo") ?? [])).toBe("a3");
		expect(endPosition([])).toBe("a0");
	});
});

describe("column moves", () => {
	it("moves a column left and right", () => {
		const right = columnStep(layout, "todo", "right");
		expect(right && right > "a1" && right < "a2").toBe(true);
		const left = columnStep(layout, "done", "left");
		expect(left && left > "a0" && left < "a1").toBe(true);
		expect(columnStep(layout, "todo", "left")).toBeNull();
		expect(columnStep(layout, "done", "right")).toBeNull();
	});

	it("drops a column at an index", () => {
		expect(columnDrop(layout, "done", 0)).toBe("Zz");
		expect(columnDrop(layout, "todo", 0)).toBeNull();
	});
});
