import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest doesn't expose `globals: true`, so Testing Library's own
// auto-cleanup detection (which looks for a global `afterEach`) never
// fires. Without this, every render in a component test file stays
// mounted in the DOM for the rest of that file, so later tests can match
// a previous test's leftover elements instead of their own.
afterEach(() => {
  if (typeof document !== "undefined") {
    cleanup();
  }
});
