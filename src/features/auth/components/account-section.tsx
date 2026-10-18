import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** A form's outcome message on the account page. */
export type Status = { tone: "error" | "success"; text: string } | undefined;

/** One card of the account page, with an h2 title (and an anchor id when it's linked to). */
export function AccountSection({
	id,
	title,
	description,
	children,
}: {
	id?: string;
	title: string;
	description?: string | undefined;
	children: ReactNode;
}) {
	return (
		<Card id={id} className="scroll-mt-20">
			<CardHeader>
				<CardTitle>
					<h2>{title}</h2>
				</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="flex flex-col gap-4">{children}</CardContent>
		</Card>
	);
}
