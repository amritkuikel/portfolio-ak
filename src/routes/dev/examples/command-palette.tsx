import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";
import { ADMIN_SECTIONS, type AdminSection } from "@/features/admin/sections";
import { Demo, ExamplePage } from "@/features/dev/examples/example-page";
import { usePermissions } from "@/features/rbac/can";
import { staticCrumb } from "@/lib/breadcrumbs";
import { privateHead } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/**
 * Recipe: an admin command palette (cmdk) and view transitions
 * (docs/guides/conventions.md, "Command palette and view transitions").
 *
 * - Ctrl/⌘ K opens it from anywhere on the page.
 * - It lists only the admin sections the user holds the permission for, like
 *   the sidebar; each route and server function still checks on its own.
 * - Picking one navigates with `viewTransition: true`: the browser cross-fades
 *   the old and new page (where supported; reduced motion turns it off, app.css).
 *
 * To ship it, render <AdminCommandPalette /> in AdminLayout, or set the
 * router's `defaultViewTransition` for every navigation.
 */
export const Route = createFileRoute("/dev/examples/command-palette")({
	staticData: { breadcrumb: staticCrumb(m.examples_palette_title) },
	head: () => privateHead(m.examples_palette_title()),
	component: CommandPaletteExample,
});

function CommandPaletteExample() {
	const [open, setOpen] = useState(false);
	return (
		<ExamplePage slug="command-palette">
			<Demo title={m.examples_palette_title()} note={m.examples_palette_note()}>
				<div className="flex flex-wrap items-center gap-3">
					<Button variant="outline" onClick={() => setOpen(true)} data-testid="open-palette">
						{m.examples_palette_open()}
					</Button>
					<span className="text-muted-foreground text-sm">{m.examples_palette_shortcut()}</span>
				</div>
				<AdminCommandPalette open={open} onOpenChange={setOpen} />
			</Demo>
		</ExamplePage>
	);
}

function AdminCommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const navigate = useNavigate();
	const permissions = usePermissions();
	const sections = ADMIN_SECTIONS.filter((section) => permissions.includes(section.permission));

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				onOpenChange(!open);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, onOpenChange]);

	const go = (to: AdminSection["to"]) => {
		onOpenChange(false);
		void navigate({ to, viewTransition: true });
	};

	return (
		<CommandDialog
			open={open}
			onOpenChange={onOpenChange}
			title={m.examples_palette_title()}
			description={m.examples_palette_dialog_description()}
		>
			<CommandInput placeholder={m.examples_palette_placeholder()} />
			<CommandList>
				<CommandEmpty>{sections.length > 0 ? m.examples_palette_empty() : m.examples_palette_none()}</CommandEmpty>
				{sections.length > 0 ? (
					<CommandGroup heading={m.examples_palette_group()}>
						{sections.map((section) => (
							<CommandItem key={section.to} value={section.label()} onSelect={() => go(section.to)}>
								<section.icon aria-hidden />
								<span>{section.label()}</span>
								<CommandShortcut className="font-mono tracking-normal">{section.to}</CommandShortcut>
							</CommandItem>
						))}
					</CommandGroup>
				) : null}
			</CommandList>
		</CommandDialog>
	);
}
