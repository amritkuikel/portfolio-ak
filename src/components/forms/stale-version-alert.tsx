import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

/**
 * Shown above a form whose save was refused because someone else changed the
 * record first (a stale CONFLICT, src/lib/concurrency.ts). Nothing was saved;
 * "Reload" fetches the latest version and resets the form to it.
 */
export function StaleVersionAlert({ onReload }: { onReload: () => Promise<unknown> }) {
	const [reloading, setReloading] = useState(false);
	const reload = async () => {
		setReloading(true);
		try {
			await onReload();
		} finally {
			setReloading(false);
		}
	};
	return (
		<div
			role="alert"
			data-testid="stale-version-alert"
			className="flex flex-col items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4"
		>
			<div className="flex flex-col gap-1">
				<p className="font-medium text-destructive">{m.form_stale_title()}</p>
				<p className="text-sm">{m.form_stale_description()}</p>
			</div>
			<Button type="button" variant="outline" size="sm" onClick={reload} disabled={reloading}>
				<RefreshCwIcon className={reloading ? "animate-spin" : undefined} aria-hidden />
				{m.form_stale_reload()}
			</Button>
		</div>
	);
}
