import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import {
	createKanbanBoard,
	deleteKanbanBoard,
	getKanbanBoard,
	listKanbanBoards,
	renameKanbanBoard,
} from "@/functions/apps/kanban";

/**
 * Kanban's reads and its board-level writes (decision 0188). Keys carry the user's id,
 * so another account signing in on the same tab never sees cached boards. A board's
 * columns and cards are TanStack DB collections over the board query
 * (./collections.ts); the boards list and a board's name use plain Query mutations.
 */
export const kanbanKeys = {
	all: ["apps", "kanban"] as const,
	user: (userId: string) => [...kanbanKeys.all, userId] as const,
	boards: (userId: string) => [...kanbanKeys.user(userId), "boards"] as const,
	board: (userId: string, boardId: string) => [...kanbanKeys.user(userId), "board", boardId] as const,
};

export const kanbanBoardsQueryOptions = (userId: string) =>
	queryOptions({ queryKey: kanbanKeys.boards(userId), queryFn: () => listKanbanBoards() });

export const kanbanBoardQueryOptions = (userId: string, boardId: string) =>
	queryOptions({
		queryKey: kanbanKeys.board(userId, boardId),
		queryFn: () => getKanbanBoard({ data: { id: boardId } }),
	});

const refreshBoards = (queryClient: QueryClient, userId: string) =>
	queryClient.invalidateQueries({ queryKey: kanbanKeys.user(userId) });

export const createBoardMutation = (queryClient: QueryClient, userId: string) =>
	mutationOptions({
		mutationFn: (input: { id: string; name: string }) => createKanbanBoard({ data: input }),
		onSettled: () => refreshBoards(queryClient, userId),
	});

export const renameBoardMutation = (queryClient: QueryClient, userId: string) =>
	mutationOptions({
		mutationFn: (input: { id: string; name: string }) => renameKanbanBoard({ data: input }),
		onSettled: () => refreshBoards(queryClient, userId),
	});

export const deleteBoardMutation = (queryClient: QueryClient, userId: string) =>
	mutationOptions({
		mutationFn: (id: string) => deleteKanbanBoard({ data: { id } }),
		onSettled: () => refreshBoards(queryClient, userId),
	});
