import { cn } from "../../lib/cn";
import { ScreenArt } from "../primitives/screen-art";

/** Case study screens: generated stand-ins for screenshots, each with its caption. */
export function Gallery({ seed, captions }: { seed: string; captions: ReadonlyArray<string> }) {
	return (
		<ul className="grid grid-cols-1 gap-(--pf-gutter) md:grid-cols-2">
			{captions.map((caption, screen) => (
				<li key={caption} className={cn(captions.length % 2 === 1 && screen === 0 && "md:col-span-2")}>
					<figure className="flex flex-col gap-3">
						<ScreenArt seed={seed} screen={screen} />
						<figcaption className="pf-label text-pf-stone">{caption}</figcaption>
					</figure>
				</li>
			))}
		</ul>
	);
}
