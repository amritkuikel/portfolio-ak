import { ScriptOnce } from "@tanstack/react-router";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/stores/hooks";
import { THEMES, type ThemePreference } from "@/lib/stores/preferences";
import { m } from "@/paraglide/messages";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Attributes for <html>. An explicit "dark" choice is rendered by the server
 * (from the cookie), so it is dark from the first byte. "system" can only be
 * resolved in the browser: SystemThemeScript does that before first paint.
 */
export const themeHtmlProps = (theme: ThemePreference) => ({
	className: theme === "dark" ? "dark" : undefined,
	"data-theme": theme,
});

/**
 * Inline, render-blocking script in <head> (TanStack Router's ScriptOnce: emitted
 * only in the SSR HTML, removes itself, picks up the CSP nonce). For "system" it
 * adds .dark before the body paints when the OS is in dark mode, so there is no
 * light flash. <html> has suppressHydrationWarning because this class is added
 * before React hydrates.
 */
export function SystemThemeScript() {
	return (
		<ScriptOnce>
			{`(function(){var d=document.documentElement;if(d.dataset.theme==="system"&&window.matchMedia("${DARK_QUERY}").matches)d.classList.add("dark")})()`}
		</ScriptOnce>
	);
}

/** Keeps <html class="dark"> in sync with the preference and, for "system", with OS changes. */
export function ThemeSync() {
	const { theme } = useTheme();
	// Layout effect: React clears className when leaving "dark"; re-apply before paint.
	useLayoutEffect(() => {
		const root = document.documentElement;
		const media = window.matchMedia(DARK_QUERY);
		const apply = () => root.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
		apply();
		if (theme !== "system") return;
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, [theme]);
	return null;
}

const ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon } as const;
const LABELS: Record<ThemePreference, () => string> = {
	light: m.theme_light,
	dark: m.theme_dark,
	system: m.theme_system,
};

const isTheme = (value: string): value is ThemePreference => (THEMES as ReadonlyArray<string>).includes(value);

/** Light / dark / system picker for the header. */
export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const Icon = ICONS[theme];
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={`${m.theme_label()}: ${LABELS[theme]()}`}
					data-testid="theme-toggle"
				>
					<Icon aria-hidden />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{m.theme_label()}</DropdownMenuLabel>
				<DropdownMenuRadioGroup value={theme} onValueChange={(value) => isTheme(value) && setTheme(value)}>
					{THEMES.map((option) => {
						const OptionIcon = ICONS[option];
						return (
							<DropdownMenuRadioItem key={option} value={option}>
								<OptionIcon aria-hidden />
								{LABELS[option]()}
							</DropdownMenuRadioItem>
						);
					})}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
