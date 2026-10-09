import { queryOptions } from "@tanstack/react-query";
import { getExampleSnapshot, getExampleTask, listExampleTasks } from "@/functions/examples";
import type { ExampleTaskSearch } from "./schema";

export const exampleKeys = {
	all: ["examples"] as const,
	snapshot: () => [...exampleKeys.all, "snapshot"] as const,
	tasks: () => [...exampleKeys.all, "tasks"] as const,
	taskList: (search: ExampleTaskSearch) => [...exampleKeys.tasks(), "list", search] as const,
	task: (id: string) => [...exampleKeys.tasks(), "detail", id] as const,
};

/**
 * Loader + Query example. The loader awaits ensureQueryData on the server; the
 * result is dehydrated into the page, so the component's useSuspenseQuery reads
 * it from the cache: no request while hydrating, none until it's stale.
 */
export const exampleSnapshotQueryOptions = () =>
	queryOptions({
		queryKey: exampleKeys.snapshot(),
		queryFn: () => getExampleSnapshot(),
		staleTime: 60_000,
	});

export const exampleTasksQueryOptions = (search: ExampleTaskSearch) =>
	queryOptions({
		queryKey: exampleKeys.taskList(search),
		queryFn: () => listExampleTasks({ data: search }),
	});

export const exampleTaskQueryOptions = (id: string) =>
	queryOptions({
		queryKey: exampleKeys.task(id),
		queryFn: () => getExampleTask({ data: { id } }),
	});
