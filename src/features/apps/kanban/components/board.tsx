import { Accessibility, type DragEndEvent, type DragStartEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
	CalendarIcon,
	GripVerticalIcon,
	ListChecksIcon,
	MoreHorizontalIcon,
	PencilIcon,
	PlusIcon,
	TextIcon,
	Trash2Icon,
} from "lucide-react";
import { type FormEvent, type KeyboardEvent, type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatDate, formatNumber } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import {
	type BoardLayout,
	boardLayout,
	type CardMove,
	cardDrop,
	cardPlace,
	cardStep,
	columnDrop,
	columnStep,
	type Direction,
} from "../moves";
import { CARD_TITLE_MAX, COLUMN_NAME_MAX } from "../schema";
import type { KanbanCard, KanbanColumn, KanbanLabel } from "../types";

/**
 * The Kanban board (decision 0188): columns side by side, cards in them, all
 * reorderable. Three ways to move a card or a column, from its handle:
 * - drag it with a pointer;
 * - keyboard drag (dnd-kit's keyboard sensor): Space picks it up, the arrows move it,
 *   Space drops, Escape cancels;
 * - Alt + arrows moves it at once: a card up and down its column or into the next one,
 *   a column left and right.
 * Every move is announced in the page's language. The board only reports moves
 * (`onMoveCard`, `onMoveColumn`); the page applies them (optimistically) and saves.
 */
export type BoardProps = {
	columns: ReadonlyArray<KanbanColumn>;
	cards: ReadonlyArray<KanbanCard>;
	onMoveCard: (card: KanbanCard, move: CardMove) => void;
	onMoveColumn: (column: KanbanColumn, position: string) => void;
	onAddCard: (column: KanbanColumn, title: string) => void;
	onOpenCard: (card: KanbanCard) => void;
	onRenameColumn: (column: KanbanColumn) => void;
	onDeleteColumn: (column: KanbanColumn) => void;
	onAddColumn: (name: string) => void;
	/** Today in the app's time zone (YYYY-MM-DD), for overdue cards; from the server, so both renders agree. */
	today: string;
};

const STEP_KEYS: Record<string, Direction> = {
	ArrowUp: "up",
	ArrowDown: "down",
	ArrowLeft: "left",
	ArrowRight: "right",
};

export function Board(props: BoardProps) {
	const { columns, cards, onMoveCard, onMoveColumn } = props;
	const layout = boardLayout(columns, cards);
	const [announcement, setAnnouncement] = useState("");
	const boardLabelId = useId();

	const cardById = (id: unknown) => cards.find((card) => card.id === id);
	const columnById = (id: unknown) => layout.columns.find((column) => column.id === id);
	const total = (n: number) => formatNumber(n);

	const moveCard = (card: KanbanCard, move: CardMove) => {
		const place = cardPlace(layout, card.id, move);
		onMoveCard(card, move);
		setAnnouncement(
			m.kanban_card_moved({
				card: card.title,
				column: place.column?.name ?? "",
				position: formatNumber(place.index + 1),
				total: total(place.total),
			}),
		);
	};

	const moveColumn = (column: KanbanColumn, position: string) => {
		const index = layout.columns.filter((each) => each.id !== column.id && each.position < position).length;
		onMoveColumn(column, position);
		setAnnouncement(
			m.kanban_column_moved({
				column: column.name,
				position: formatNumber(index + 1),
				total: total(layout.columns.length),
			}),
		);
	};

	const stepCard = (card: KanbanCard, direction: Direction) => {
		const move = cardStep(layout, card.id, direction);
		if (move) moveCard(card, move);
	};

	const stepColumn = (column: KanbanColumn, direction: "left" | "right") => {
		const position = columnStep(layout, column.id, direction);
		if (position) moveColumn(column, position);
	};

	const describe = (source: { id: unknown; type?: unknown } | null) => {
		if (!source) return "";
		return source.type === "column" ? (columnById(source.id)?.name ?? "") : (cardById(source.id)?.title ?? "");
	};

	return (
		<DragDropProvider
			plugins={(defaults) => [
				...defaults,
				Accessibility.configure({
					screenReaderInstructions: { draggable: m.kanban_drag_instructions() },
					announcements: {
						dragstart: ({ operation: { source } }: DragStartEvent) =>
							source ? m.kanban_picked({ item: describe(source) }) : undefined,
						dragover: () => undefined,
						dragend: ({ operation: { source }, canceled }: DragEndEvent) =>
							source && canceled ? m.sortable_canceled({ item: describe(source) }) : undefined,
					},
				}),
			]}
			onDragEnd={({ operation: { source }, canceled }) => {
				if (canceled || !source || !isSortable(source)) return;
				if (source.type === "column") {
					const column = columnById(source.id);
					const position = column ? columnDrop(layout, column.id, source.index) : null;
					if (column && position) moveColumn(column, position);
					return;
				}
				const card = cardById(source.id);
				const group = typeof source.group === "string" ? source.group : null;
				if (!card || !group) return;
				const move = cardDrop(layout, card.id, group, source.index);
				if (move) moveCard(card, move);
			}}
		>
			<h2 id={boardLabelId} className="sr-only">
				{m.kanban_columns_label()}
			</h2>
			{/* A focusable scroll region: the board scrolls sideways on narrow screens. */}
			<section
				aria-labelledby={boardLabelId}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard (axe scrollable-region-focusable).
				tabIndex={0}
				className="relative -mx-4 overflow-x-auto px-4 pb-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:mx-0 sm:px-0"
				data-testid="kanban-board"
			>
				<ol className="flex items-start gap-3">
					{layout.columns.map((column, index) => (
						<BoardColumn
							key={column.id}
							column={column}
							index={index}
							layout={layout}
							props={props}
							onStepCard={stepCard}
							onStepColumn={stepColumn}
						/>
					))}
					<li className="w-72 shrink-0">
						<AddColumn onAdd={props.onAddColumn} />
					</li>
				</ol>
			</section>
			<p className="sr-only" aria-live="polite" data-testid="kanban-announcement">
				{announcement}
			</p>
		</DragDropProvider>
	);
}

function BoardColumn({
	column,
	index,
	layout,
	props,
	onStepCard,
	onStepColumn,
}: {
	column: KanbanColumn;
	index: number;
	layout: BoardLayout;
	props: BoardProps;
	onStepCard: (card: KanbanCard, direction: Direction) => void;
	onStepColumn: (column: KanbanColumn, direction: "left" | "right") => void;
}) {
	// A column takes cards too, so a card can be dropped into an empty one.
	const { ref, handleRef, isDragging } = useSortable({
		id: column.id,
		index,
		type: "column",
		accept: ["card", "column"],
		// CollisionPriority.Low (@dnd-kit/abstract): a card over a card wins over the column.
		collisionPriority: 1,
	});
	const cards = layout.cards.get(column.id) ?? [];
	const headingId = useId();

	const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
		event.preventDefault();
		onStepColumn(column, event.key === "ArrowLeft" ? "left" : "right");
	};

	return (
		<li
			ref={ref}
			className={cn("w-72 shrink-0 rounded-lg border bg-surface-1", isDragging && "opacity-70 shadow-lg")}
			data-testid="kanban-column"
		>
			<section aria-labelledby={headingId} className="flex flex-col gap-2 p-2">
				<header className="flex items-center gap-1">
					<button
						ref={handleRef}
						type="button"
						aria-label={m.kanban_move_column({ column: column.name })}
						aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
						onKeyDown={onKeyDown}
						className={HANDLE}
						data-testid="kanban-column-handle"
					>
						<GripVerticalIcon className="size-4" aria-hidden />
					</button>
					<h3 id={headingId} className="min-w-0 flex-1 truncate font-medium text-body">
						{column.name}
					</h3>
					<span className="rounded-full bg-surface-2 px-2 text-caption text-muted-foreground tabular-nums">
						<span className="sr-only">{m.kanban_column_count_label()} </span>
						{formatNumber(cards.length)}
					</span>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-7">
								<MoreHorizontalIcon aria-hidden />
								<span className="sr-only">{m.kanban_column_menu({ column: column.name })}</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => props.onRenameColumn(column)}>
								<PencilIcon aria-hidden />
								{m.kanban_rename_column()}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onSelect={() => props.onDeleteColumn(column)}>
								<Trash2Icon aria-hidden />
								{m.kanban_delete_column()}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>
				<ol className="flex min-h-10 flex-col gap-2">
					{cards.map((card, cardIndex) => (
						<BoardCard
							key={card.id}
							card={card}
							index={cardIndex}
							columnId={column.id}
							today={props.today}
							onOpen={props.onOpenCard}
							onStep={onStepCard}
						/>
					))}
				</ol>
				<AddCard column={column} onAdd={props.onAddCard} />
			</section>
		</li>
	);
}

const HANDLE =
	"flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing";

/** The labels' colours (a dot) and names (always written: colour alone doesn't say it). */
const LABEL_DOT: Record<KanbanLabel, string> = {
	red: "bg-red-500",
	amber: "bg-amber-500",
	green: "bg-emerald-500",
	blue: "bg-sky-500",
	violet: "bg-violet-500",
};

export const labelName = (label: KanbanLabel): string =>
	({
		red: m.kanban_label_red,
		amber: m.kanban_label_amber,
		green: m.kanban_label_green,
		blue: m.kanban_label_blue,
		violet: m.kanban_label_violet,
	})[label]();

export function LabelChip({ label }: { label: KanbanLabel }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full border px-1.5 text-caption text-muted-foreground">
			<span className={cn("size-2 rounded-full", LABEL_DOT[label])} aria-hidden />
			{labelName(label)}
		</span>
	);
}

function BoardCard({
	card,
	index,
	columnId,
	today,
	onOpen,
	onStep,
}: {
	card: KanbanCard;
	index: number;
	columnId: string;
	today: string;
	onOpen: (card: KanbanCard) => void;
	onStep: (card: KanbanCard, direction: Direction) => void;
}) {
	const { ref, handleRef, isDragging } = useSortable({
		id: card.id,
		index,
		group: columnId,
		type: "card",
		accept: "card",
	});
	const done = card.checklist.filter((item) => item.done).length;
	const overdue = card.dueOn !== null && card.dueOn < today;

	const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const direction = STEP_KEYS[event.key];
		if (!event.altKey || !direction) return;
		event.preventDefault();
		onStep(card, direction);
	};

	return (
		<li
			ref={ref}
			className={cn(
				"flex flex-col gap-1.5 rounded-md border bg-background p-2 shadow-xs",
				isDragging && "z-10 opacity-80 shadow-lg",
			)}
			data-testid="kanban-card"
		>
			<div className="flex items-start gap-1">
				<button
					ref={handleRef}
					type="button"
					aria-label={m.kanban_move_card({ card: card.title })}
					aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
					onKeyDown={onKeyDown}
					className={HANDLE}
					data-testid="kanban-card-handle"
				>
					<GripVerticalIcon className="size-4" aria-hidden />
				</button>
				<button
					type="button"
					onClick={() => onOpen(card)}
					className="min-w-0 flex-1 rounded-sm py-1 text-start text-body outline-none wrap-anywhere hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
					data-testid="kanban-card-open"
				>
					{card.title}
				</button>
			</div>
			{card.labels.length > 0 || card.dueOn || card.checklist.length > 0 || card.description ? (
				<div className="flex flex-wrap items-center gap-1.5 ps-8">
					{card.labels.map((label) => (
						<LabelChip key={label} label={label} />
					))}
					{card.dueOn ? (
						<span
							className={cn(
								"inline-flex items-center gap-1 text-caption",
								overdue ? "font-medium text-danger" : "text-muted-foreground",
							)}
						>
							<CalendarIcon className="size-3.5" aria-hidden />
							<span className="sr-only">{overdue ? m.kanban_overdue() : m.kanban_due()} </span>
							{formatDate(isoDateInstant(card.dueOn), { dateStyle: "medium" })}
						</span>
					) : null}
					{card.checklist.length > 0 ? (
						<span className="inline-flex items-center gap-1 text-caption text-muted-foreground tabular-nums">
							<ListChecksIcon className="size-3.5" aria-hidden />
							{m.kanban_checklist_progress({ done: formatNumber(done), total: formatNumber(card.checklist.length) })}
						</span>
					) : null}
					{card.description ? (
						<span className="inline-flex text-muted-foreground">
							<TextIcon className="size-3.5" aria-hidden />
							<span className="sr-only">{m.kanban_has_description()}</span>
						</span>
					) : null}
				</div>
			) : null}
		</li>
	);
}

function InlineAdd({
	label,
	placeholder,
	maxLength,
	onAdd,
	testId,
	children,
}: {
	label: string;
	placeholder: string;
	maxLength: number;
	onAdd: (value: string) => void;
	testId: string;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const inputId = useId();
	if (!open) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="justify-start text-muted-foreground"
				onClick={() => setOpen(true)}
				data-testid={`${testId}-open`}
			>
				<PlusIcon aria-hidden />
				{children}
			</Button>
		);
	}
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const value = String(new FormData(form).get("value") ?? "").trim();
		if (!value) return;
		onAdd(value);
		form.reset();
	};
	return (
		<form method="post" onSubmit={onSubmit} className="flex flex-col gap-2" data-testid={testId}>
			<label htmlFor={inputId} className="sr-only">
				{label}
			</label>
			<Input
				id={inputId}
				name="value"
				placeholder={placeholder}
				maxLength={maxLength}
				autoComplete="off"
				// The field was just opened by the button the user pressed.
				autoFocus
				onKeyDown={(event) => {
					if (event.key === "Escape") setOpen(false);
				}}
			/>
			<div className="flex gap-2">
				<Button type="submit" size="sm">
					{m.kanban_add()}
				</Button>
				<Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
					{m.common_cancel()}
				</Button>
			</div>
		</form>
	);
}

function AddCard({ column, onAdd }: { column: KanbanColumn; onAdd: (column: KanbanColumn, title: string) => void }) {
	return (
		<InlineAdd
			label={m.kanban_new_card_label({ column: column.name })}
			placeholder={m.kanban_new_card_placeholder()}
			maxLength={CARD_TITLE_MAX}
			onAdd={(title) => onAdd(column, title)}
			testId="kanban-add-card"
		>
			{m.kanban_add_card()}
		</InlineAdd>
	);
}

function AddColumn({ onAdd }: { onAdd: (name: string) => void }) {
	return (
		<div className="flex flex-col rounded-lg border border-dashed p-2">
			<InlineAdd
				label={m.kanban_new_column_label()}
				placeholder={m.kanban_new_column_placeholder()}
				maxLength={COLUMN_NAME_MAX}
				onAdd={onAdd}
				testId="kanban-add-column"
			>
				{m.kanban_add_column()}
			</InlineAdd>
		</div>
	);
}
