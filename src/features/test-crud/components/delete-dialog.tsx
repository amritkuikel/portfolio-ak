import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatNumber } from "@/lib/intl";
import { m } from "@/paraglide/messages";

/** What the user asked to delete: one item (named) or a selection. */
export type DeleteRequest = { ids: string[]; title?: string };

/** Confirmation before a delete; destructive action is never the default focus. */
export function DeleteDialog({
	request,
	onCancel,
	onConfirm,
}: {
	request: DeleteRequest | null;
	onCancel: () => void;
	onConfirm: (request: DeleteRequest) => void;
}) {
	const single = request?.ids.length === 1 && request.title !== undefined;
	return (
		<AlertDialog open={request !== null} onOpenChange={(open) => !open && onCancel()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{single
							? m.test_crud_delete_title()
							: m.test_crud_bulk_delete_title({ count: formatNumber(request?.ids.length ?? 0) })}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{single ? m.test_crud_delete_body({ title: request?.title ?? "" }) : m.test_crud_bulk_delete_body()}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{m.test_crud_cancel()}</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						data-testid="confirm-delete"
						onClick={() => request && onConfirm(request)}
					>
						{m.test_crud_confirm_delete()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
