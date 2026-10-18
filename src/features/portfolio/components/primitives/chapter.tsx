import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Display } from "./display";
import { Eyebrow } from "./eyebrow";

type ChapterProps = {
	/** Section id (anchor) and the base of its heading id. */
	id: string;
	/** Chapter number in the story; omit outside the home page's sequence. */
	index?: number | undefined;
	label: string;
	title?: ReactNode;
	/** Supporting text beside the title on wide screens. */
	aside?: ReactNode;
	/** "inverse": the other palette (an ink band on paper). */
	tone?: "default" | "inverse";
	className?: string | undefined;
	children: ReactNode;
};

/**
 * One chapter of the story: a full-width section with an eyebrow, an optional
 * display heading and generous vertical rhythm. The heading (or the eyebrow
 * when there's no title) names the section for assistive technology.
 */
export function Chapter({ id, index, label, title, aside, tone = "default", className, children }: ChapterProps) {
	const labelId = `${id}-label`;
	const titleId = `${id}-title`;
	return (
		<section
			id={id}
			aria-labelledby={title ? titleId : labelId}
			className={cn("pf-section scroll-mt-(--pf-header-h)", tone === "inverse" && "pf-inverse", className)}
		>
			<div className="pf-container">
				<header className="pf-grid mb-[clamp(3rem,7vw,6rem)] gap-y-6">
					<Eyebrow index={index} id={labelId} className="col-span-4 md:col-span-12">
						{label}
					</Eyebrow>
					{title ? (
						<Display id={titleId} size="h2" className={cn("col-span-4", aside ? "md:col-span-7" : "md:col-span-10")}>
							{title}
						</Display>
					) : null}
					{aside ? (
						<div className="col-span-4 self-end text-pf-body text-pf-ink-2 md:col-span-4 md:col-start-9">{aside}</div>
					) : null}
				</header>
				{children}
			</div>
		</section>
	);
}
