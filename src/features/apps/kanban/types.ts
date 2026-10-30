/**
 * Kanban's shapes, shared by the tables, the server and the board (decision 0188).
 * Positions are fractional order keys (src/lib/fractional-index.ts).
 */
export type ChecklistItem = { id: string; text: string; done: boolean };

export type KanbanBoardSummary = {
	id: string;
	name: string;
	columns: number;
	cards: number;
	updatedAt: string;
};

/** The boards page: the user's boards and when the server read them (for "updated 3 minutes ago"). */
export type KanbanBoardList = { boards: KanbanBoardSummary[]; now: string };

export type KanbanColumn = { id: string; boardId: string; name: string; position: string };

export type KanbanCard = {
	id: string;
	boardId: string;
	columnId: string;
	title: string;
	description: string;
	labels: KanbanLabel[];
	/** A calendar day (YYYY-MM-DD) or null. */
	dueOn: string | null;
	checklist: ChecklistItem[];
	position: string;
};

/** One board with everything on it: what the board page loads (and its collections start from). */
export type KanbanBoard = {
	id: string;
	name: string;
	columns: KanbanColumn[];
	cards: KanbanCard[];
	/** The server's calendar day when it was read (the app's time zone): what "overdue" compares with. */
	today: string;
};

/** Per-user limits (decision 0188): checked by the service before each create. */
export const KANBAN_QUOTAS = { boards: 20, cards: 500, columnsPerBoard: 12 } as const;

/** The label colours a card can carry (their names are the labels' values). */
export const KANBAN_LABELS = ["red", "amber", "green", "blue", "violet"] as const;
export type KanbanLabel = (typeof KANBAN_LABELS)[number];

export const isKanbanLabel = (value: string): value is KanbanLabel => KANBAN_LABELS.some((label) => label === value);
