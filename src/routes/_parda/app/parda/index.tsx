import { createFileRoute } from "@tanstack/react-router";
import { pardaHead } from "@/features/parda/brand";
import { PardaHome } from "@/features/parda/home/parda-home";

/** /app/parda: Parda's home. Task 62 brings its billboard and rails, and makes it indexable. */
export const Route = createFileRoute("/_parda/app/parda/")({
	head: () => pardaHead(),
	component: PardaHome,
});
