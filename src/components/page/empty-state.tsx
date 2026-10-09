import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * What a list shows when it has nothing to show: an optional icon, a short
 * message and the next useful action ("Create the first item", "Clear filters").
 */
export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
	...props
}: {
	icon?: LucideIcon;
	title?: ReactNode;
	description: ReactNode;
	action?: ReactNode;
	className?: string;
	"data-testid"?: string;
}) {
	return (
		<div
			className={cn("flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center", className)}
			{...props}
		>
			{Icon ? <Icon className="size-8 text-muted-foreground" aria-hidden /> : null}
			{title ? <p className="font-medium">{title}</p> : null}
			<p className="max-w-md text-muted-foreground">{description}</p>
			{action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
		</div>
	);
}
