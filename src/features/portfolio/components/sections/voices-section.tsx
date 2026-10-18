import { m } from "@/paraglide/messages";
import type { Testimonial } from "../../types";
import { Chapter } from "../primitives/chapter";
import { Reveal } from "../primitives/reveal";

function Attribution({ testimonial }: { testimonial: Testimonial }) {
	return (
		<figcaption className="mt-6 flex flex-col gap-1">
			<span className="font-medium">{testimonial.name}</span>
			<span className="pf-label text-pf-stone">
				{testimonial.role}, {testimonial.company}
			</span>
		</figcaption>
	);
}

/** Chapter six: one pull quote set huge, the rest in a quieter row. */
export function VoicesSection({ testimonials, index }: { testimonials: ReadonlyArray<Testimonial>; index?: number }) {
	const [lead, ...rest] = testimonials;
	if (!lead) return null;
	return (
		<Chapter id="voices" index={index} label={m.portfolio_chapter_voices()} title={m.portfolio_voices_heading()}>
			<Reveal as="figure" className="pf-grid gap-y-6">
				<span aria-hidden className="pf-display col-span-4 text-pf-mega text-pf-crimson leading-none md:col-span-1">
					“
				</span>
				<div className="col-span-4 md:col-span-10">
					<blockquote className="pf-quote text-[clamp(1.75rem,1rem+2.6vw,3.75rem)] leading-[1.15]">
						<p>{lead.quote}</p>
					</blockquote>
					<Attribution testimonial={lead} />
				</div>
			</Reveal>
			{rest.length > 0 ? (
				<ul className="mt-[clamp(4rem,8vw,7rem)] grid grid-cols-1 gap-x-(--pf-gutter) gap-y-12 md:grid-cols-3">
					{rest.map((testimonial) => (
						<Reveal as="li" key={testimonial.id} className="border-pf-line border-t pt-6">
							<figure>
								<blockquote className="text-pf-lead">
									<p>“{testimonial.quote}”</p>
								</blockquote>
								<Attribution testimonial={testimonial} />
							</figure>
						</Reveal>
					))}
				</ul>
			) : null}
		</Chapter>
	);
}
