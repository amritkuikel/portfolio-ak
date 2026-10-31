import { useNavigate, useRouterState } from "@tanstack/react-router";
import { FolderKanbanIcon, HouseIcon, KeyboardIcon, LanguagesIcon, LogOutIcon, PlusIcon, UserIcon } from "lucide-react";
import { THEME_ICONS, THEME_LABELS } from "@/components/layout/theme";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { useAuthNavigation } from "@/features/auth/use-auth-actions";
import { useTheme } from "@/lib/stores/hooks";
import { THEMES } from "@/lib/stores/preferences";
import { m } from "@/paraglide/messages";
import { getLocale, type Locale, locales, localizeHref } from "@/paraglide/runtime";
import { TASKLINE_PATHS, tasklineLinks } from "../links";
import type { TasklineNav } from "../types";
import { ProjectDot, WORKSPACE_ICONS } from "./taskline-sidebar";

const LANGUAGE_NAMES: Record<Locale, () => string> = { en: m.language_en, ne: m.language_ne };

/**
 * Taskline's command palette (cmdk, Ctrl/⌘ K): every project the caller may see, the
 * pages to go to, the actions they may take (a new project where they may create
 * one, the shortcuts), theme, language and sign out. Routes and server functions
 * check again.
 */
export function TasklinePalette({
	nav,
	open,
	onOpenChange,
	onOpenShortcuts,
	guest,
}: {
	nav: TasklineNav;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onOpenShortcuts: () => void;
	/** A guest has no account page. */
	guest: boolean;
}) {
	const navigate = useNavigate();
	const { setTheme } = useTheme();
	const { signOut } = useAuthNavigation({ signedOutTo: TASKLINE_PATHS.landing });
	const href = useRouterState({ select: (state) => state.location.href });
	const several = nav.workspaces.length > 1;
	const run = (action: () => void) => {
		onOpenChange(false);
		action();
	};
	/** Closes the palette, then navigates (each call site builds its typed link). */
	const go = (navigation: () => Promise<void>) => run(() => void navigation());

	return (
		<CommandDialog
			open={open}
			onOpenChange={onOpenChange}
			title={m.command_title()}
			description={m.command_description()}
			className="top-[18%] translate-y-0 sm:max-w-xl"
		>
			<CommandInput placeholder={m.taskline_palette_placeholder()} data-testid="command-input" />
			<CommandList>
				<CommandEmpty>{m.command_empty()}</CommandEmpty>
				{nav.projects.length > 0 ? (
					<CommandGroup heading={m.taskline_palette_projects()}>
						{nav.projects.map((project) => (
							<CommandItem
								key={project.id}
								value={`project ${project.ws} ${project.key}`}
								keywords={[project.name, project.key]}
								onSelect={() => go(() => navigate(tasklineLinks.project(project.ws, project.key)))}
							>
								<ProjectDot project={project} />
								<span className="truncate">{project.name}</span>
								<span className="ms-auto font-mono text-caption text-muted-foreground">
									{several
										? `${project.key} · ${nav.workspaces.find((w) => w.segment === project.ws)?.name ?? ""}`
										: project.key}
								</span>
							</CommandItem>
						))}
					</CommandGroup>
				) : null}
				<CommandGroup heading={m.command_group_pages()}>
					<CommandItem
						value="go home"
						keywords={[m.taskline_nav_home()]}
						onSelect={() => go(() => navigate(tasklineLinks.home()))}
					>
						<HouseIcon aria-hidden />
						<span>{m.taskline_nav_home()}</span>
					</CommandItem>
					{nav.workspaces.map((workspace) => {
						const Icon = several ? WORKSPACE_ICONS[workspace.kind] : FolderKanbanIcon;
						const label = several
							? m.taskline_palette_projects_of({ workspace: workspace.name })
							: m.taskline_nav_projects();
						return (
							<CommandItem
								key={workspace.id}
								value={`go projects ${workspace.segment}`}
								keywords={[label]}
								onSelect={() => go(() => navigate(tasklineLinks.projects(workspace.segment)))}
							>
								<Icon aria-hidden />
								<span>{label}</span>
							</CommandItem>
						);
					})}
					{guest ? null : (
						<CommandItem
							value="go account"
							keywords={[m.nav_account()]}
							onSelect={() => go(() => navigate(tasklineLinks.account()))}
						>
							<UserIcon aria-hidden />
							<span>{m.nav_account()}</span>
						</CommandItem>
					)}
				</CommandGroup>
				<CommandGroup heading={m.command_group_actions()}>
					{nav.workspaces
						.filter((workspace) => workspace.canCreateProject)
						.map((workspace) => (
							<CommandItem
								key={workspace.id}
								value={`new project ${workspace.segment}`}
								keywords={[m.taskline_project_new(), m.taskline_palette_new_project_keywords()]}
								onSelect={() =>
									go(() => navigate({ ...tasklineLinks.projects(workspace.segment), search: { create: 1 } }))
								}
							>
								<PlusIcon aria-hidden />
								<span>
									{several
										? m.taskline_palette_new_project_in({ workspace: workspace.name })
										: m.taskline_project_new()}
								</span>
							</CommandItem>
						))}
					<CommandItem
						value="shortcuts"
						keywords={[m.taskline_shortcuts_title()]}
						onSelect={() => run(onOpenShortcuts)}
					>
						<KeyboardIcon aria-hidden />
						<span>{m.taskline_shortcuts_title()}</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading={m.command_group_preferences()}>
					{THEMES.map((theme) => {
						const Icon = THEME_ICONS[theme];
						return (
							<CommandItem
								key={theme}
								value={`theme ${theme}`}
								keywords={[m.theme_label(), THEME_LABELS[theme]()]}
								onSelect={() => run(() => setTheme(theme))}
							>
								<Icon aria-hidden />
								<span>{m.command_theme({ theme: THEME_LABELS[theme]() })}</span>
							</CommandItem>
						);
					})}
					{locales
						.filter((locale) => locale !== getLocale())
						.map((locale) => (
							<CommandItem
								key={locale}
								value={`language ${locale}`}
								keywords={[m.language_switcher_label(), LANGUAGE_NAMES[locale]()]}
								// A full load: the new language is rendered by the server (like the language switcher).
								onSelect={() => run(() => window.location.assign(localizeHref(href, { locale })))}
							>
								<LanguagesIcon aria-hidden />
								<span>{m.command_language({ language: LANGUAGE_NAMES[locale]() })}</span>
							</CommandItem>
						))}
					<CommandItem value="sign-out" keywords={[m.nav_logout()]} onSelect={() => run(() => void signOut())}>
						<LogOutIcon aria-hidden />
						<span>{m.nav_logout()}</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
