"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { EASE_PROFESSIONAL_GSAP } from "@/lib/motion/tokens";

/**
 * The brand-green title underline, drawn left-to-right once on first load.
 * GSAP (not Framer Motion) because this is the one true "SVG path draw"
 * effect on the page — reserved for that per the agreed tech split.
 */
export function AccentUnderline({ className }: { className?: string }) {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const length = line.getTotalLength();
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(line, { strokeDashoffset: 0, duration: 0.8, delay: 0.2, ease: EASE_PROFESSIONAL_GSAP });
  }, []);

  return (
    <svg className={className} width="64" height="4" viewBox="0 0 64 4" aria-hidden="true">
      <line
        ref={lineRef}
        x1="2"
        y1="2"
        x2="62"
        y2="2"
        stroke="var(--color-brand)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
