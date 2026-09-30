/**
 * Component-test setup (runs for every file; only acts under jsdom).
 * - jest-dom matchers (toBeInTheDocument, toHaveAttribute, …)
 * - unmount rendered trees between tests
 * - browser APIs that Radix UI and cmdk use but jsdom doesn't implement
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
}
