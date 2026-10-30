import { compareOrderKeys, keyBetweenNeighbours } from "@/lib/fractional-index";
import type { KanbanCard, KanbanColumn } from "./types";

/**
 * Where a card or column goes, as the one row a move changes (decision 0188): a card
 * gets a column and a position, a column a position. Pure, so the board (pointer and
 * keyboard) and the tests compute moves the same way.
 */
export type CardMove = { columnId: string; position: string };

export type BoardLayout = {
	columns: ReadonlyArray<KanbanColumn>;
	/** Each column's cards, in order (every column has an entry). */
	cards: ReadonlyMap<string, ReadonlyArray<KanbanCard>>;
};

const byPosition = <T extends { position: string; id: string }>(a: T, b: T) =>
	compareOrderKeys(a.position, b.position) || compareOrderKeys(a.id, b.id);

/** Columns in order, each with its cards in order (cards of an unknown column are left out). */
export function boardLayout(columns: ReadonlyArray<KanbanColumn>, cards: ReadonlyArray<KanbanCard>): BoardLayout {
	const ordered = [...columns].sort(byPosition);
	const grouped = new Map<string, KanbanCard[]>(ordered.map((column) => [column.id, []]));
	for (const card of cards) grouped.get(card.columnId)?.push(card);
	for (const list of grouped.values()) list.sort(byPosition);
	return { columns: ordered, cards: grouped };
}

/** The position for something placed at `index` among `siblings` (which don't include it). */
const positionAt = (siblings: ReadonlyArray<{ position: string }>, index: number) =>
	keyBetweenNeighbours(siblings[index - 1]?.position, siblings[index]?.position);

const locateCard = (layout: BoardLayout, cardId: string) => {
	for (const [columnIndex, column] of layout.columns.entries()) {
		const cards = layout.cards.get(column.id) ?? [];
		const index = cards.findIndex((card) => card.id === cardId);
		if (index >= 0) return { columnIndex, column, cards, index };
	}
	return null;
};

/**
 * A card dropped at `index` of `columnId` (the index among that column's cards once the
 * card has left its old place). Null when nothing changes.
 */
export function cardDrop(layout: BoardLayout, cardId: string, columnId: string, index: number): CardMove | null {
	const from = locateCard(layout, cardId);
	if (!from) return null;
	const siblings = (layout.cards.get(columnId) ?? []).filter((card) => card.id !== cardId);
	const at = Math.max(0, Math.min(index, siblings.length));
	if (columnId === from.column.id && at === from.index) return null;
	return { columnId, position: positionAt(siblings, at) };
}

export type Direction = "up" | "down" | "left" | "right";

/**
 * A keyboard move: one place up or down in its column, or into the next column to the
 * left or right at the same height (or its end). Null at an edge.
 */
export function cardStep(layout: BoardLayout, cardId: string, direction: Direction): CardMove | null {
	const from = locateCard(layout, cardId);
	if (!from) return null;
	if (direction === "up" || direction === "down") {
		const to = from.index + (direction === "up" ? -1 : 1);
		if (to < 0 || to >= from.cards.length) return null;
		return cardDrop(layout, cardId, from.column.id, to);
	}
	const target = layout.columns[from.columnIndex + (direction === "left" ? -1 : 1)];
	if (!target) return null;
	return cardDrop(layout, cardId, target.id, from.index);
}

/** Where a card lands once a move is applied: its column and index (for announcements). */
export function cardPlace(layout: BoardLayout, cardId: string, move: CardMove) {
	const siblings = (layout.cards.get(move.columnId) ?? []).filter((card) => card.id !== cardId);
	const index = siblings.filter((card) => compareOrderKeys(card.position, move.position) < 0).length;
	const column = layout.columns.find((each) => each.id === move.columnId);
	return { column, index, total: siblings.length + 1 };
}

/** A column dropped at `index` (among the others). Null when nothing changes. */
export function columnDrop(layout: BoardLayout, columnId: string, index: number): string | null {
	const from = layout.columns.findIndex((column) => column.id === columnId);
	if (from < 0) return null;
	const siblings = layout.columns.filter((column) => column.id !== columnId);
	const at = Math.max(0, Math.min(index, siblings.length));
	if (at === from) return null;
	return positionAt(siblings, at);
}

/** A keyboard move of a column one place left or right. Null at an edge. */
export function columnStep(layout: BoardLayout, columnId: string, direction: "left" | "right"): string | null {
	const from = layout.columns.findIndex((column) => column.id === columnId);
	if (from < 0) return null;
	const to = from + (direction === "left" ? -1 : 1);
	if (to < 0 || to >= layout.columns.length) return null;
	return columnDrop(layout, columnId, to);
}

/** The position of a new card at the end of a column, or a new column at the end of the board. */
export const endPosition = (siblings: ReadonlyArray<{ position: string }>) => positionAt(siblings, siblings.length);
