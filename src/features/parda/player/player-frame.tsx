import { type RefObject, useEffect } from "react";
import type { LabSandbox } from "../admin/schema";
import { acceptMessage } from "./adapters";
import type { PlayerAdapter, PlayerEvent } from "./adapters/types";

/** Never `allow-top-navigation`: a framed player can't send this page anywhere through a sandbox it asked for. */
const SANDBOX: Readonly<Record<Exclude<LabSandbox, "none">, string>> = {
	strict: "allow-scripts allow-same-origin",
	popups: "allow-scripts allow-same-origin allow-popups",
};

/**
 * A source's iframe and its messages (PLAN 12.5), through the source's adapter only.
 * A path plays on this app, so its messages come from the page's own origin.
 */
export function PlayerFrame({
	url,
	origins,
	adapter,
	sandbox,
	title,
	frameRef,
	onEvent,
}: {
	url: string;
	origins: ReadonlyArray<string>;
	adapter: PlayerAdapter;
	sandbox: LabSandbox;
	title: string;
	frameRef: RefObject<HTMLIFrameElement | null>;
	onEvent: (event: PlayerEvent) => void;
}) {
	useEffect(() => {
		const allowed = url.startsWith("/") ? [...origins, window.location.origin] : origins;
		const listen = (message: MessageEvent) => {
			const event = acceptMessage(message, {
				adapter,
				origins: allowed,
				frame: frameRef.current?.contentWindow ?? null,
			});
			if (event) onEvent(event);
		};
		window.addEventListener("message", listen);
		return () => window.removeEventListener("message", listen);
	}, [url, origins, adapter, frameRef, onEvent]);

	return (
		<iframe
			ref={frameRef}
			src={url}
			title={title}
			allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
			referrerPolicy="origin"
			{...(sandbox === "none" ? {} : { sandbox: SANDBOX[sandbox] })}
			className="aspect-video w-[min(100%,calc((100dvh-10rem)*16/9))] rounded-md border bg-black"
		/>
	);
}
