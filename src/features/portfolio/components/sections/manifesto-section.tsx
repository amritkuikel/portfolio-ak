import { m } from "@/paraglide/messages";
import type { Profile } from "../../types";
import { Chapter } from "../primitives/chapter";
import { SplitWords } from "../primitives/split-words";

/** Chapter one: the beliefs, inking in word by word as the reader scrolls. */
export function ManifestoSection({ profile }: { profile: Pick<Profile, "manifesto" | "name"> }) {
	return (
		<Chapter id="manifesto" index={1} label={m.portfolio_chapter_manifesto()} className="border-pf-line border-t">
			<div className="pf-grid gap-y-10">
				<p className="pf-display col-span-4 text-[clamp(1.75rem,0.9rem+3.2vw,4.25rem)] leading-[1.12] md:col-span-10 md:col-start-2">
					<SplitWords text={profile.manifesto} />
				</p>
				<p className="pf-label col-span-4 text-pf-stone md:col-span-6 md:col-start-2">— {profile.name}</p>
			</div>
		</Chapter>
	);
}
