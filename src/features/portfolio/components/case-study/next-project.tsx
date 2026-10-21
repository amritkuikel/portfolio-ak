import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { m } from "@/paraglide/messages";
import type { ProjectDetail } from "../../types";
import { CoverArt } from "../primitives/cover-art";
import { CoverFrame } from "../primitives/cover-frame";
import { Eyebrow } from "../primitives/eyebrow";

/** The exit of a case study: the next project as one large link, its cover ready to morph. */
export function NextProject({ next }: { next: ProjectDetail["next"] }) {
	return (
		<nav aria-label={m.portfolio_case_next()} className="pf-inverse">
			<Link
				to="/work/$slug"
				params={{ slug: next.slug }}
				viewTransition
				className="pf-focus group/next block py-[clamp(5rem,10vw,9rem)]"
			>
				<div className="pf-container pf-grid items-end gap-y-10">
					<div className="col-span-4 md:col-span-7">
						<Eyebrow>{m.portfolio_case_next()}</Eyebrow>
						<p className="pf-display mt-6 flex items-center gap-[0.2em] text-pf-hero transition-colors duration-(--pf-dur-2) group-hover/next:text-pf-accent">
							{next.title}
							<ArrowRightIcon
								aria-hidden
								className="size-[0.5em] shrink-0 transition-transform duration-(--pf-dur-2) group-hover/next:translate-x-[0.1em]"
							/>
						</p>
						<p className="pf-label mt-6 text-pf-stone">{next.client}</p>
					</div>
					<div className="col-span-4 md:col-span-4 md:col-start-9">
						<CoverFrame transitionSlug={next.slug} aspect="landscape" zoom>
							<CoverArt seed={next.slug} motif={next.cover.motif} glyph={next.cover.glyph} />
						</CoverFrame>
					</div>
				</div>
			</Link>
		</nav>
	);
}
