// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Board } from "@/features/apps/kanban/components/board";
import type { KanbanCard, KanbanColumn } from "@/features/apps/kanban/types";

/**
 * The Kanban board from the keyboard (decision 0188): Alt + arrows on a card's handle
 * move it within its column and across columns, on a column's handle reorder columns;
 * every move is announced. The board reports moves; this harness applies them, as the
 * page does through its collections.
 */
const column = (id: string, name: string, position: string): KanbanColumn => ({ id, boardId: "b", name, position });
const card = (id: string, title: string, columnId: string, position: string): KanbanCard => ({
	id,
	boardId: "b",
	columnId,
	title,
	description: "",
	labels: [],
	dueOn: null,
	checklist: [],
	position,
});

function Harness({ onAddCard = vi.fn() }: { onAddCard?: (column: KanbanColumn, title: string) => void }) {
	const [columns, setColumns] = useState([column("todo", "To do", "a0"), column("doing", "Doing", "a1")]);
	const [cards, setCards] = useState([
		card("plan", "Plan", "todo", "a0"),
		card("build", "Build", "todo", "a1"),
		card("ship", "Ship", "doing", "a0"),
	]);
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
			onOpenCard={vi.fn()}
			onRenameColumn={vi.fn()}
			onDeleteColumn={vi.fn()}
			onAddColumn={vi.fn()}
		/>
	);
}

/** Each column's name and its cards' titles, in the order shown. */
const board = () =>
	screen.getAllByTestId("kanban-column").map((element) => [
		within(element).getByRole("heading").textContent,
		within(element)
			.queryAllByTestId("kanban-card-open")
			.map((button) => button.textContent),
	]);

describe("Kanban board, from the keyboard", () => {
	it("moves a card down its column and into the next one, announcing each move", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		screen.getByRole("button", { name: "Move card Plan" }).focus();
		await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
		expect(board()).toEqual([
			["To do", ["Build", "Plan"]],
			["Doing", ["Ship"]],
		]);
		expect(screen.getByTestId("kanban-announcement")).toHaveTextContent("Plan moved to To do, position 2 of 2.");

		screen.getByRole("button", { name: "Move card Plan" }).focus();
		await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
		expect(board()).toEqual([
			["To do", ["Build"]],
			["Doing", ["Ship", "Plan"]],
		]);
		expect(screen.getByTestId("kanban-announcement")).toHaveTextContent("Plan moved to Doing, position 2 of 2.");
	});

	it("does nothing at an edge", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		screen.getByRole("button", { name: "Move card Plan" }).focus();
		await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
		await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");
		expect(board()).toEqual([
			["To do", ["Plan", "Build"]],
			["Doing", ["Ship"]],
		]);
	});

	it("reorders columns with Alt + left and right on a column's handle", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		screen.getByRole("button", { name: "Move column Doing" }).focus();
		await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");
		expect(board().map(([name]) => name)).toEqual(["Doing", "To do"]);
		expect(screen.getByTestId("kanban-announcement")).toHaveTextContent("Column Doing moved to position 1 of 2.");
	});

	it("adds a card from a column's inline form", async () => {
		const user = userEvent.setup();
		const onAddCard = vi.fn();
		render(<Harness onAddCard={onAddCard} />);
		const [todo] = screen.getAllByTestId("kanban-column");
		if (!todo) throw new Error("no column");
		await user.click(within(todo).getByRole("button", { name: "Add a card" }));
		await user.type(within(todo).getByRole("textbox", { name: "New card in To do" }), "Test{Enter}");
		expect(onAddCard).toHaveBeenCalledWith(expect.objectContaining({ id: "todo" }), "Test");
	});
});
