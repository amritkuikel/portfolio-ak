import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, within } from "storybook/test";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { KanbanCard, KanbanColumn } from "../types";
import { Board } from "./board";
import CardSheet from "./card-sheet";

const column = (id: string, name: string, position: string): KanbanColumn => ({ id, boardId: "b", name, position });
const card = (
	id: string,
	title: string,
	columnId: string,
	position: string,
	extra: Partial<KanbanCard> = {},
): KanbanCard => ({
	id,
	boardId: "b",
	columnId,
	title,
	description: "",
	labels: [],
	dueOn: null,
	checklist: [],
	position,
	...extra,
});

const COLUMNS = [column("todo", "To do", "a0"), column("doing", "Doing", "a1"), column("done", "Done", "a2")];
const CARDS = [
	card("plan", "Plan the release", "todo", "a0", { labels: ["blue"], description: "Scope and dates." }),
	card("copy", "Write the announcement", "todo", "a1", { dueOn: "2026-10-01", labels: ["red", "amber"] }),
	card("build", "Build the board", "doing", "a0", {
		checklist: [
			{ id: "c1", text: "Columns", done: true },
			{ id: "c2", text: "Cards", done: false },
		],
	}),
	card("ship", "Ship the guest sessions", "done", "a0", { labels: ["green"] }),
];

/** The board with its moves applied to local state, as the page applies them to its collections. */
function LiveBoard({ onAddCard }: { onAddCard: (column: KanbanColumn, title: string) => void }) {
	const [columns, setColumns] = useState(COLUMNS);
	const [cards, setCards] = useState(CARDS);
	return (
		<Board
			columns={columns}
			cards={cards}
			today="2026-10-29"
			onMoveCard={(moved, move) =>
				setCards((all) => all.map((each) => (each.id === moved.id ? { ...each, ...move } : each)))
			}
			onMoveColumn={(moved, position) =>
				setColumns((all) => all.map((each) => (each.id === moved.id ? { ...each, position } : each)))
			}
			onAddCard={onAddCard}
			onOpenCard={fn()}
			onRenameColumn={fn()}
			onDeleteColumn={fn()}
			onAddColumn={fn()}
		/>
	);
}

const meta = {
	title: "Apps/Kanban",
	component: LiveBoard,
	args: { onAddCard: fn() },
} satisfies Meta<typeof LiveBoard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Labels, an overdue date, a checklist's progress and a description marker. */
export const BoardView: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getAllByTestId("kanban-column")).toHaveLength(3);
		await expect(
			canvas.getByText(m.kanban_checklist_progress({ done: formatNumber(1), total: formatNumber(2) })),
		).toBeVisible();
	},
};

/** Alt + → on a card's handle moves it into the next column, and says so. */
export const KeyboardMove: Story = {
	play: async ({ canvas, userEvent }) => {
		canvas.getByRole("button", { name: m.kanban_move_card({ card: "Plan the release" }) }).focus();
		await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
		const doing = canvas.getAllByTestId("kanban-column")[1];
		if (!doing) throw new Error("no column");
		await expect(within(doing).getByText("Plan the release")).toBeVisible();
		await expect(canvas.getByTestId("kanban-announcement")).toHaveTextContent("Plan the release");
	},
};

/** The inline form under a column adds a card. */
export const AddCard: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const [todo] = canvas.getAllByTestId("kanban-column");
		if (!todo) throw new Error("no column");
		await userEvent.click(within(todo).getByTestId("kanban-add-card-open"));
		await userEvent.type(within(todo).getByRole("textbox"), "Another card{Enter}");
		await expect(args.onAddCard).toHaveBeenCalledWith(expect.objectContaining({ id: "todo" }), "Another card");
	},
};

/** Editing a card: title, description, labels, due date, checklist. */
export const EditCard: StoryObj<typeof CardSheet> = {
	render: (args) => <CardSheet {...args} />,
	args: {
		card: CARDS[2] ?? card("x", "x", "todo", "a0"),
		onSave: fn(async () => undefined),
		onDelete: fn(),
		onClose: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const sheet = within(canvasElement.ownerDocument.body);
		await expect(await sheet.findByTestId("kanban-card-sheet")).toBeVisible();
		await expect(sheet.getByLabelText(m.kanban_card_title())).toHaveValue("Build the board");
		await expect(args.onSave).not.toHaveBeenCalled();
	},
};
