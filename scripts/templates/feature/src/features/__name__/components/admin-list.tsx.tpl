import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumnsMenu, DataTableSkeleton } from "@/components/data-table";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { errorMessage } from "@/components/errors/error-page";
import { ClearFiltersButton } from "@/components/filters/active-filters";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchFilter } from "@/components/filters/filters";
import { Pagination } from "@/components/navigation/pagination";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCan } from "@/features/rbac/can";
import { delete__Pascal__ } from "@/functions/__name__";
import { formatNumber } from "@/lib/i18n/intl";
import { useListPage } from "@/hooks/use-list-page";
import { m } from "@/paraglide/messages";
import { __camel__ListQueryOptions, invalidate__Pascal__Lists } from "../queries";
import { __UPPER___TABLE_ID, type __Pascal__Search } from "../schema";
import { __camel__Columns } from "./columns";

/** What the user asked to delete: one row (named in the dialog) or a selection. */
type DeleteRequest = { ids: string[]; title?: string; done?: () => void };

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
	const canUpdate = useCan("__name__:update");
	const canDelete = useCan("__name__:delete");
	const [pendingDelete, setPendingDelete] = useState<DeleteRequest | null>(null);

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

	const confirmDelete = () => {
		if (!pendingDelete) return;
		pendingDelete.done?.();
		remove.mutate(pendingDelete.ids);
		setPendingDelete(null);
	};

	const filtered = search.q !== "";
	const single = pendingDelete?.ids.length === 1 && pendingDelete.title !== undefined;

	return (
		<Page width="admin">
			<PageHeader title={m.__snake___title()} description={m.__snake___description()} actions={<NewButton />} />

			<div className="flex flex-wrap items-end justify-between gap-3">
				<FilterBar values={search} preserve={["sort", "pageSize"]}>
					<SearchFilter label={m.__snake___search_label()} value={search.q} placeholder={m.__snake___search_placeholder()} />
				</FilterBar>
				<DataTableColumnsMenu tableId={__UPPER___TABLE_ID} columns={__camel__Columns} />
			</div>

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
						bulkActions={
							canDelete
								? ({ ids, clear }) => (
										<Button variant="destructive" size="sm" onClick={() => setPendingDelete({ ids, done: clear })}>
											{m.__snake___delete_selected()}
										</Button>
									)
								: undefined
						}
						rowActions={
							canUpdate || canDelete
								? (row) => (
										<>
											{canUpdate ? (
												<DropdownMenuItem asChild>
													<Link to="/admin/__name__/$id" params={{ id: row.id }}>
														{m.__snake___edit()}
													</Link>
												</DropdownMenuItem>
											) : null}
											{canDelete ? (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant="destructive"
														onSelect={() => setPendingDelete({ ids: [row.id], title: row.title })}
													>
														{m.__snake___delete()}
													</DropdownMenuItem>
												</>
											) : null}
										</>
									)
								: undefined
						}
						empty={
							<EmptyState
								description={filtered ? m.__snake___empty_filtered() : m.__snake___empty()}
								action={filtered ? <ClearFiltersButton clearAll={{ q: undefined }} /> : <NewButton />}
							/>
						}
					/>
					<Pagination {...pagination} />
				</>
			) : (
				<DataTableSkeleton columns={2} rows={8} />
			)}

			<ConfirmDialog
				open={pendingDelete !== null}
				destructive
				title={
					single
						? m.__snake___delete_title()
						: m.__snake___bulk_delete_title({ count: formatNumber(pendingDelete?.ids.length ?? 0) })
				}
				description={single ? m.__snake___delete_body({ title: pendingDelete?.title ?? "" }) : m.__snake___bulk_delete_body()}
				confirmLabel={m.__snake___confirm_delete()}
				onConfirm={confirmDelete}
				onCancel={() => setPendingDelete(null)}
			/>
		</Page>
	);
}
