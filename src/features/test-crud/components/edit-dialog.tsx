import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";
import { errorMessage } from "@/components/errors/error-page";
import { useCloseOverlay } from "@/components/navigation/use-close-overlay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { testCrudDetailQueryOptions } from "../queries";
import { TestCrudForm, testCrudFormKey } from "./test-crud-form";

const CLOSE = { edit: undefined };

/**
 * The dialog for `?edit=<id>` (opened by EditItemLink, a masked route; see
 * masked-links.tsx). The item loads when the dialog opens.
 */
export function TestCrudEditDialog({ id }: { id: string }) {
	const close = useCloseOverlay(CLOSE);
	const { data: item, error } = useQuery(testCrudDetailQueryOptions(id));
	return (
		<Dialog open onOpenChange={(open) => !open && close()}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" data-testid="edit-dialog">
				<DialogHeader>
					<DialogTitle>{m.test_crud_edit_title()}</DialogTitle>
					<DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<span>{item?.title ?? m.test_crud_loading_item()}</span>
						<Link
							to="/admin/test-crud/$id"
							params={{ id }}
							className="inline-flex items-center gap-1 underline underline-offset-4"
						>
							{m.test_crud_open_full_page()}
							<ExternalLinkIcon className="size-3.5" aria-hidden />
						</Link>
					</DialogDescription>
				</DialogHeader>
				{item ? (
					// Another item, or a reloaded newer version, gets fresh form defaults.
					<TestCrudForm
						key={testCrudFormKey(item)}
						item={item}
						onSaved={close}
						onCancel={close}
						className="max-w-none"
					/>
				) : error ? (
					<div className="flex flex-col items-start gap-3">
						<p className="text-destructive text-sm" role="alert">
							{errorMessage(error)}
						</p>
						<Button variant="outline" onClick={close}>
							{m.common_cancel()}
						</Button>
					</div>
				) : (
					<output className="flex flex-col gap-4" aria-busy="true">
						<span className="sr-only">{m.test_crud_loading_item()}</span>
						{Array.from({ length: 4 }, (_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows have no identity.
							<span key={index} className="block h-9 w-full animate-pulse rounded-md bg-muted" />
						))}
					</output>
				)}
			</DialogContent>
		</Dialog>
	);
}
