import type { PostRecord } from "../../schema";
import { crdtsWithoutThePhd } from "./crdts-without-the-phd";
import { designingForTwoScripts } from "./designing-for-two-scripts";
import { postgresIsEnough } from "./postgres-is-enough";
import { serverRenderEverything } from "./server-render-everything";
import { shippingForSlowNetworks } from "./shipping-for-slow-networks";
import { theUrlIsTheState } from "./the-url-is-the-state";

/** One file per article; the source sorts them by date. */
export const posts: PostRecord[] = [
	serverRenderEverything,
	crdtsWithoutThePhd,
	designingForTwoScripts,
	theUrlIsTheState,
	postgresIsEnough,
	shippingForSlowNetworks,
];
