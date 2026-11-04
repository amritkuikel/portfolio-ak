import { Link, Outlet } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/errors/not-found-page";
import { SectionHome } from "@/components/errors/section-home";
import { m } from "@/paraglide/messages";
import { pardaLinks } from "../links";
import { PardaFrame } from "./parda-frame";

/** Built at render time, so the label is in the request's language. */
const home = () => <Link {...pardaLinks.home()}>{m.pd_go_home()}</Link>;

/** The `_parda` layout's component: every page in Parda's frame, and errors lead back to Parda's home. */
export function PardaSection() {
	return (
		<SectionHome link={home()}>
			<PardaFrame>
				<Outlet />
			</PardaFrame>
		</SectionHome>
	);
}

/** Parda's 404 (a layout's notFoundComponent replaces the layout, so it brings the frame). */
export function PardaNotFound() {
	return (
		<SectionHome link={home()}>
			<PardaFrame>
				<NotFoundPage />
			</PardaFrame>
		</SectionHome>
	);
}
