"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { DURATION_COUNT } from "@/lib/motion/tokens";

/** Matches --ease-professional's confident-deceleration feel for a numeric ramp. */
function easeProfessional(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts a number up from 0 to `value` once it scrolls into view, formatting
 * every intermediate frame with `format` so currency/units stay correct
 * throughout the animation rather than only at the end.
 */
export function CountUp({
  value,
  format,
  duration = DURATION_COUNT,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // No `amount` threshold: this must fire for anything already in the initial
  // viewport at load (e.g. the Executive Summary tiles), not just content
  // scrolled to later.
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  // Defaults to the real, correct value — never 0 — so a report exported to
  // PDF, printed, or captured before any scroll/observer event fires still
  // shows the right number instead of a frozen "0". The 0→value animation
  // only starts once we've confirmed it's actually going to play out.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (shouldReduceMotion || !isInView) return;

    let frame: number;
    const start = performance.now();

    // No separate `setDisplay(0)` up front — the first rAF callback fires
    // with `now` ~= `start`, so `t` ~= 0 and this already renders ~0. That
    // keeps the state update inside the (async) rAF callback rather than
    // synchronously in the effect body.
    function tick(now: number) {
      const t = Math.min((now - start) / (duration * 1000), 1);
      setDisplay(value * easeProfessional(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
