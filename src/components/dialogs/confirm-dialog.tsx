import type { ReactNode } from "react";
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
import { m } from "@/paraglide/messages";

export type ConfirmDialogProps = {
	open: boolean;
	title: ReactNode;
	description: ReactNode;
	/** Label of the confirming button (default "Confirm"). */
	confirmLabel?: string;
	cancelLabel?: string;
	/** Destructive actions get the red button. Focus always starts on Cancel. */
	destructive?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

/**
 * "Are you sure?" before an action that can't be undone. Controlled: the page
 * keeps what's pending (e.g. the rows to delete) and opens the dialog for it.
 */
export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel,
	cancelLabel,
	destructive = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel ?? m.common_cancel()}</AlertDialogCancel>
					<AlertDialogAction
						variant={destructive ? "destructive" : "default"}
						data-testid="confirm-action"
						onClick={onConfirm}
					>
						{confirmLabel ?? m.common_confirm()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
