import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useHotkeyLabel } from "@/hooks/use-hotkeys";
import { m } from "@/paraglide/messages";

/**
 * Every keyboard shortcut in Taskline (PLAN 11.6: shortcuts go through `useHotkeys`
 * and are listed here). `?` opens it. Later modules add their rows (the board's
 * moves, the task sheet).
 */
export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const palette = useHotkeyLabel("mod+k");
	const sidebar = useHotkeyLabel("mod+b");
	const rows = [
		{ keys: [palette], label: m.taskline_shortcut_palette() },
		{ keys: [sidebar], label: m.taskline_shortcut_sidebar() },
		{ keys: ["?"], label: m.taskline_shortcut_help() },
		{ keys: ["↑", "↓", "↵"], label: m.taskline_shortcut_palette_pick() },
		{ keys: ["Esc"], label: m.taskline_shortcut_close() },
	];
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md" data-testid="shortcuts-dialog">
				<DialogHeader>
					<DialogTitle>{m.taskline_shortcuts_title()}</DialogTitle>
					<DialogDescription>{m.taskline_shortcuts_description()}</DialogDescription>
				</DialogHeader>
				<dl className="flex flex-col divide-y text-body">
					{rows.map((row) => (
						<div key={row.label} className="flex items-center justify-between gap-4 py-2">
							<dt>{row.label}</dt>
							<dd className="flex shrink-0 gap-1">
								{row.keys.map((key) => (
									<Kbd key={key}>{key}</Kbd>
								))}
							</dd>
						</div>
					))}
				</dl>
			</DialogContent>
		</Dialog>
	);
}
