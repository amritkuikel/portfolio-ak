import { PauseIcon, PlayIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { m } from "@/paraglide/messages";
import { cn } from "../../lib/cn";

type MarqueeProps = {
	items: ReadonlyArray<string>;
	/** Names the list for screen readers. */
	label: string;
	className?: string | undefined;
};

function MarqueeList({ items, label }: { items: ReadonlyArray<string>; label?: string }) {
	// The labelled copy is the list; the unlabelled second copy is only there to fill the loop.
	return (
		<ul aria-label={label} aria-hidden={label ? undefined : "true"} className="flex shrink-0 items-center">
			{items.map((item) => (
				<Fragment key={item}>
					<li className="px-[0.35em]">{item}</li>
					<li aria-hidden className="px-[0.35em]">
						<span className="inline-block size-[0.28em] rotate-45 bg-pf-crimson align-middle" />
					</li>
				</Fragment>
			))}
		</ul>
	);
}

/**
 * An endlessly sliding row of words, in pure CSS (portfolio.css, .pf-marquee).
 * Two copies of the list sit side by side and the track slides by one copy; the
 * second is hidden from assistive technology. It pauses on hover and with the
 * button (WCAG 2.2.2), and doesn't move at all with reduced motion.
 */
export function Marquee({ items, label, className }: MarqueeProps) {
	const [paused, setPaused] = useState(false);
	return (
		<div className={cn("relative", className)}>
			<div className="pf-marquee" data-paused={paused || undefined}>
				<div className="pf-marquee-track pf-display bg-pf-paper text-pf-h2 leading-[1.15]">
					<MarqueeList items={items} label={label} />
					<MarqueeList items={items} />
				</div>
			</div>
			<button
				type="button"
				onClick={() => setPaused((value) => !value)}
				aria-pressed={paused}
				className="pf-focus pf-label mt-4 inline-flex items-center gap-2 text-pf-ink-2 hover:text-pf-ink motion-reduce:hidden"
			>
				{paused ? <PlayIcon aria-hidden className="size-3.5" /> : <PauseIcon aria-hidden className="size-3.5" />}
				{m.portfolio_marquee_pause()}
			</button>
		</div>
	);
}
