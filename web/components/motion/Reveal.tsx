"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION_REVEAL, EASE_PROFESSIONAL } from "@/lib/motion/tokens";

/**
 * Fade/slide-up on scroll entry, once. Used on its own for single elements,
 * or as the parent of RevealItem for a staggered group (see ExecutiveSummary).
 *
 * `initial`/`whileInView` stay identical regardless of reduced-motion
 * preference — only `transition.duration` collapses to 0. useReducedMotion()
 * reads window.matchMedia, which doesn't exist during SSR (always resolves
 * false there); if it were also allowed to change the *initial* style values,
 * a client with the OS reduced-motion setting on would compute a different
 * opacity/transform than the server-rendered HTML and hit a React hydration
 * mismatch — which React does not patch up, potentially leaving content
 * stuck invisible. Keeping initial/animate values constant and only gating
 * duration sidesteps that entirely.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: shouldReduceMotion ? 0 : DURATION_REVEAL,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE_PROFESSIONAL,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Wraps a group of RevealItem children; cascades their entrance by 80ms each. */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: shouldReduceMotion ? 0 : DURATION_REVEAL, ease: EASE_PROFESSIONAL },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
