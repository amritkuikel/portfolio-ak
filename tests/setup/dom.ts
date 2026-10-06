/**
 * Component-test setup (runs for every file; only acts under jsdom).
 * - jest-dom matchers (toBeInTheDocument, toHaveAttribute, …)
 * - unmount rendered trees between tests
 * - browser APIs that Radix UI, cmdk and input-otp use but jsdom doesn't implement
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (typeof window !== "undefined") {
	afterEach(() => cleanup());

	class ResizeObserverStub {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	globalThis.ResizeObserver ??= ResizeObserverStub;

	const proto = window.HTMLElement.prototype;
	proto.scrollIntoView ??= () => {};
	proto.hasPointerCapture ??= () => false;
	proto.setPointerCapture ??= () => {};
	proto.releasePointerCapture ??= () => {};
	// input-otp probes for password-manager badges at a point next to the input.
	document.elementFromPoint ??= () => null;
	// ProseMirror (Tiptap) measures the selection to scroll it into view.
	const emptyRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
	Range.prototype.getClientRects ??= emptyRects;
	Range.prototype.getBoundingClientRect ??= () => new DOMRect();
}
