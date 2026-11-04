import { BanIcon, PlusIcon } from "lucide-react";
import type { AdminCommand } from "@/features/admin/commands";
import { m } from "@/paraglide/messages";

/** Parda's actions in the command palette and on the dashboard (src/features/admin/commands.ts). */
export const pardaCommands: ReadonlyArray<AdminCommand> = [
	{
		id: "parda.source.new",
		label: m.command_parda_source_new,
		icon: PlusIcon,
		permission: "parda:configure",
		to: "/admin/parda/sources/new",
		keywords: m.command_parda_source_new_keywords,
	},
	{
		id: "parda.title.block",
		label: m.command_parda_title_block,
		icon: BanIcon,
		permission: "parda:moderate",
		to: "/admin/parda/titles/new",
		keywords: m.command_parda_title_block_keywords,
	},
];
