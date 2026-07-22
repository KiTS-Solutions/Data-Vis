"use client";

import { usePresenterMode } from "@/lib/presenter/PresenterModeContext";

export function PresenterModeToggle() {
  const { showExplanations, toggle } = usePresenterMode();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-ocean/20 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm text-ocean"
    >
      {showExplanations ? "Hide Explanations" : "Show Explanations"}
    </button>
  );
}
