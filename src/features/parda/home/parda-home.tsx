import { Link } from "@tanstack/react-router";
import { MAIN_CONTENT } from "@/components/layout/skip-link";
import { m } from "@/paraglide/messages";
import { PARDA_NAME } from "../brand";
import { pardaLinks } from "../links";

/**
 * /app/parda until Task 62 brings the billboard and the rails: an unlit screen between
 * the masks, with one line of subtitle. Private until then (the layout's noindex).
 */
export function PardaHome() {
	return (
		<main {...MAIN_CONTENT} className="flex flex-1 flex-col outline-none" data-testid="parda-home">
			<div className="relative aspect-[2/3] w-full bg-pd-ground-2 sm:aspect-[2.39/1]">
				<p className="pd-scrim absolute inset-x-0 bottom-0 flex h-[5.5rem] items-center justify-center px-6 text-center text-pd-sub text-pd-subtitle">
					{m.pd_home_soon()}
				</p>
			</div>
			<div className="flex flex-col gap-4 bg-pd-mask px-4 pt-6 pb-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
				<div className="flex flex-col gap-2">
					<h1 lang="en" className="pd-display text-pd-title">
						{PARDA_NAME}
					</h1>
					<p className="max-w-prose text-pd-muted">{m.pd_description()}</p>
				</div>
				<Link
					{...pardaLinks.about()}
					className="self-start text-sm underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:self-auto"
				>
					{m.pd_home_about()}
				</Link>
			</div>
		</main>
	);
}
