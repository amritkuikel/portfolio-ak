import { createLink } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowUpRightIcon } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";

const ICONS = {
	right: ArrowRightIcon,
	left: ArrowLeftIcon,
	down: ArrowDownIcon,
	up: ArrowUpIcon,
	external: ArrowUpRightIcon,
} as const;

export type ArrowDirection = keyof typeof ICONS;

type ArrowAnchorProps = ComponentPropsWithRef<"a"> & {
	direction?: ArrowDirection;
	/** "large": display-size call to action. */
	size?: "default" | "large";
};

/** A plain anchor with an arrow that nudges on hover. Use ArrowLink for app routes. */
export function ArrowAnchor({
	direction = "right",
	size = "default",
	className,
	children,
	...props
}: ArrowAnchorProps) {
	const Icon = ICONS[direction];
	const leading = direction === "left";
	return (
		<a
			{...props}
			className={cn(
				"pf-focus group/arrow inline-flex items-center gap-3 font-medium text-pf-ink",
				size === "large" ? "pf-display text-pf-h3" : "text-pf-body",
				className,
			)}
		>
			{leading ? (
				<Icon
					aria-hidden
					className="size-[1em] shrink-0 transition-transform duration-(--pf-dur-2) ease-(--pf-ease-out) group-hover/arrow:-translate-x-1"
				/>
			) : null}
			<span className="pf-link">{children}</span>
			{leading ? null : (
				<Icon
					aria-hidden
					className={cn(
						"size-[1em] shrink-0 text-pf-accent transition-transform duration-(--pf-dur-2) ease-(--pf-ease-out)",
						direction === "right" && "group-hover/arrow:translate-x-1",
						direction === "down" && "group-hover/arrow:translate-y-1",
						direction === "up" && "group-hover/arrow:-translate-y-1",
						direction === "external" && "group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5",
					)}
				/>
			)}
		</a>
	);
}

/** A router Link styled as an arrow call to action (typed `to`, `params`, `search`). */
export const ArrowLink = createLink(ArrowAnchor);
