import type { ProseBlock } from "../types";

/** Typical silent reading speed for screen text, in words per minute. */
const WORDS_PER_MINUTE = 220;

const blockText = (block: ProseBlock): string => {
	switch (block.kind) {
		case "list":
			return block.items.join(" ");
		case "code":
			return block.code;
		default:
			return block.text;
	}
};

/** Whole minutes to read an article body, at least one. */
export const readingMinutes = (body: ReadonlyArray<ProseBlock>): number => {
	const words = body
		.map(blockText)
		.join(" ")
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};
