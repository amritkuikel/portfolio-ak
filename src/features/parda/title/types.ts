import type { HubSlide } from "../home/types";

/** The title page's data until Task 63 adds the rest: the facts a billboard slide has, with the whole overview. */
export type TitlePageData = { configured: false } | { configured: true; imageBase: string; title: HubSlide };
