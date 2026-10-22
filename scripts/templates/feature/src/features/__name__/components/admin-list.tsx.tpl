import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTable, DataTableSkeleton, type RowAction } from "@/components/data-table";
import { useConfirm } from "@/components/dialogs/confirm";
import { errorMessage } from "@/components/errors/error-page";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchFilter } from "@/components/filters/filters";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { useCan } from "@/features/rbac/can";
import { delete__Pascal__ } from "@/functions/__name__";
import { formatNumber } from "@/lib/i18n/intl";
import { useListPage } from "@/hooks/use-list-page";
import { m } from "@/paraglide/messages";
import { __camel__ListQueryOptions, invalidate__Pascal__Lists } from "../queries";
import { __UPPER___TABLE_ID, type __Pascal__ListItem, type __Pascal__Search } from "../schema";
import { __camel__Columns } from "./columns";

/** Needs __name__:create (the server checks again). */
function NewButton() {
	if (!useCan("__name__:create")) return null;
	return (
		<Button asChild>
			<Link to="/admin/__name__/new">
				<PlusIcon aria-hidden />
				{m.__snake___new()}
			</Link>
		</Button>
	);
}

/**
 * The admin list page (/admin/__name__): search, the table with row and bulk
 * delete, pagination. The route file only loads the data and passes the search in.
 */
export function __Pascal__AdminList({ search }: { search: __Pascal__Search }) {
	const queryClient = useQueryClient();
	const { page, busy, pagination } = useListPage({
		tableId: __UPPER___TABLE_ID,
		search,
		query: __camel__ListQueryOptions,
	});
	const canDelete = useCan("__name__:delete");
	const confirm = useConfirm();

	const remove = useMutation({
		mutationFn: (ids: string[]) => delete__Pascal__({ data: { ids } }),
		onSuccess: async (_result, ids) => {
			await invalidate__Pascal__Lists(queryClient);
			toast.success(
				ids.length === 1 ? m.__snake___toast_deleted() : m.__snake___toast_bulk_deleted({ count: formatNumber(ids.length) }),
			);
		},
		onError: (error) => toast.error(m.__snake___toast_failed(), { description: errorMessage(error) }),
	});

	/** One row (named in the dialog) or a selection; `done` clears the selection once confirmed. */
	const deleteItems = async (ids: string[], title?: string, done?: () => void) => {
		const single = ids.length === 1 && title !== undefined;
		const confirmed = await confirm({
			destructive: true,
			title: single ? m.__snake___delete_title() : m.__snake___bulk_delete_title({ count: formatNumber(ids.length) }),
			description: single ? m.__snake___delete_body({ title }) : m.__snake___bulk_delete_body(),
			confirmLabel: m.__snake___confirm_delete(),
		});
		if (!confirmed) return;
		done?.();
		remove.mutate(ids);
	};

	// Each action names its permission: users without it never see it (the server checks again).
	const rowActions = (row: __Pascal__ListItem): RowAction[] => [
		{
			id: "edit",
			label: m.__snake___edit(),
			permission: "__name__:update",
			render: (label) => (
				<Link to="/admin/__name__/$id" params={{ id: row.id }}>
					{label}
				</Link>
			),
		},
		{
			id: "delete",
			label: m.__snake___delete(),
			permission: "__name__:delete",
			destructive: true,
			separated: true,
			onSelect: () => void deleteItems([row.id], row.title),
		},
	];

	const filtered = search.q !== "";

	return (
		<Page width="admin">
			<PageHeader title={m.__snake___title()} description={m.__snake___description()} actions={<NewButton />} />

			{page && pagination ? (
				<>
					<DataTable
						tableId={__UPPER___TABLE_ID}
						rows={page.items}
						columns={__camel__Columns}
						getRowId={(row) => row.id}
						getRowLabel={(row) => row.title}
						sort={search.sort}
						busy={busy || remove.isPending}
						data-testid="__name__-table"
						toolbar={
							<FilterBar values={search} preserve={["sort", "pageSize"]}>
								<SearchFilter
									label={m.__snake___search_label()}
									value={search.q}
									placeholder={m.__snake___search_placeholder()}
								/>
							</FilterBar>
						}
						exportName="__name__"
						bulkActions={
							canDelete
								? ({ ids, clear }) => (
										<Button variant="destructive" size="sm" onClick={() => void deleteItems(ids, undefined, clear)}>
											{m.__snake___delete_selected()}
										</Button>
									)
								: undefined
						}
						rowActions={rowActions}
						empty={
							<EmptyState
								variant={filtered ? "no-matches" : "empty"}
								description={filtered ? m.__snake___empty_filtered() : m.__snake___empty()}
								primaryAction={filtered ? <ClearFiltersButton clearAll={{ q: undefined }} /> : <NewButton />}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={2} rows={8} />
			)}

		</Page>
	);
}
