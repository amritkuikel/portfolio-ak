import { useLocation, useNavigate } from "@tanstack/react-router";
import { BookmarkIcon, CheckIcon, Trash2Icon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { m } from "@/paraglide/messages";

/**
 * Saved views: named search strings for one table. The URL is the list's state
 * (filters, sort, page size), so a view is its search string. Kept in this
 * browser's localStorage per table; a table with the user id would make them follow
 * the user across devices (docs/guides/recipes.md, "Saved views").
 */
export type SavedView = { name: string; search: string };

const storageKey = (tableId: string) => `views:${tableId}`;

const readViews = (tableId: string): SavedView[] => {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(tableId)) ?? "[]");
		return Array.isArray(parsed)
			? parsed.filter((view): view is SavedView => typeof view?.name === "string" && typeof view?.search === "string")
			: [];
	} catch {
		return [];
	}
};

const writeViews = (tableId: string, views: SavedView[]) => {
	try {
		localStorage.setItem(storageKey(tableId), JSON.stringify(views));
	} catch {
		// Storage can be unavailable (privacy mode): the views just aren't kept.
	}
};

export function SavedViewsMenu({ tableId }: { tableId: string }) {
	const { pathname, searchStr } = useLocation();
	const navigate = useNavigate();
	const inputId = useId();
	// Read after mount: the server has no localStorage, and the first render must match it.
	const [views, setViews] = useState<SavedView[]>([]);
	useEffect(() => setViews(readViews(tableId)), [tableId]);
	const [name, setName] = useState("");

	const update = (next: SavedView[]) => {
		setViews(next);
		writeViews(tableId, next);
	};
	const save = () => {
		const trimmed = name.trim();
		if (!trimmed) return;
		update([...views.filter((view) => view.name !== trimmed), { name: trimmed, search: searchStr }]);
		setName("");
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" data-testid="saved-views">
					<BookmarkIcon aria-hidden />
					{m.table_views()}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="flex w-72 flex-col gap-3" aria-label={m.table_views()}>
				{views.length > 0 ? (
					<ul className="-mx-1 flex flex-col">
						{views.map((view) => {
							const current = view.search === searchStr;
							return (
								<li key={view.name} className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="sm"
										className="min-w-0 flex-1 justify-start"
										aria-current={current || undefined}
										onClick={() => void navigate({ href: `${pathname}${view.search}` })}
									>
										<CheckIcon aria-hidden className={current ? "opacity-100" : "opacity-0"} />
										<span className="truncate">{view.name}</span>
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={m.table_view_forget({ name: view.name })}
										onClick={() => update(views.filter((each) => each.name !== view.name))}
									>
										<Trash2Icon aria-hidden />
									</Button>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="text-caption text-muted-foreground">{m.table_views_empty()}</p>
				)}
				<form
					method="post"
					className="flex flex-col gap-2 border-t pt-3"
					onSubmit={(event) => {
						event.preventDefault();
						save();
					}}
				>
					<label htmlFor={inputId} className="font-medium text-caption">
						{m.table_view_name()}
					</label>
					<div className="flex gap-2">
						<Input id={inputId} value={name} maxLength={60} onChange={(event) => setName(event.target.value)} />
						<Button type="submit" variant="secondary" disabled={!name.trim()}>
							{m.table_view_save()}
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
}
