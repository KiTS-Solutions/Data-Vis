import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom implements neither API. Framer Motion's useReducedMotion/whileInView
// hooks call both unconditionally, so without these, importing any animated
// component throws in every test that renders it.
//
// prefers-reduced-motion reports `matches: true` on purpose: tests then
// exercise the same static/instant fallback real users get when they've
// enabled it at the OS level, so assertions can check rendered text/values
// synchronously instead of racing a real animation.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (!window.IntersectionObserver) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}
