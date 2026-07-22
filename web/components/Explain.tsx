"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePresenterMode } from "@/lib/presenter/PresenterModeContext";

export function Explain({ children }: { children: ReactNode }) {
  const { showExplanations } = usePresenterMode();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!showExplanations) setRevealed(false);
  }, [showExplanations]);

  if (showExplanations || revealed) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      aria-label="Show explanation"
      className="flex h-6 w-6 items-center justify-center rounded-full border border-ocean/20 text-xs text-ocean"
    >
      ?
    </button>
  );
}
