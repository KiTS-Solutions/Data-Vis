"use client";

import { usePresenterMode } from "@/lib/presenter/PresenterModeContext";

export function PresenterModeToggle() {
  const { showRecommendations, toggle } = usePresenterMode();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-ocean/20 px-4 py-1.5 text-sm text-ocean"
    >
      {showRecommendations ? "Hide Recommendations" : "Show Recommendations"}
    </button>
  );
}
