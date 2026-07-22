"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReportScorecard } from "@/lib/analytics/scorecard";
import { buildHeadline } from "@/lib/analytics/scorecard";
import { formatDualCurrency } from "@/lib/format/currency";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { DURATION_MICRO, EASE_PROFESSIONAL } from "@/lib/motion/tokens";

export function ExecutiveSummary({ scorecards, fxRate }: { scorecards: ReportScorecard[]; fxRate: number }) {
  return (
    <section aria-label="Executive Summary" className="space-y-6">
      <Reveal>
        <p className="font-display text-2xl text-ocean">{buildHeadline(scorecards)}</p>
      </Reveal>
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scorecards.map((s) => (
          <RevealItem key={s.reportLabel}>
            <ScorecardTile scorecard={s} fxRate={fxRate} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

function ScorecardTile({ scorecard, fxRate }: { scorecard: ReportScorecard; fxRate: number }) {
  const direction = scorecard.avgGapLbp === null
    ? null
    : scorecard.avgGapLbp > 0
      ? "above market"
      : scorecard.avgGapLbp < 0
        ? "below market"
        : "at par";
  const absGap = scorecard.avgGapLbp === null ? null : Math.abs(scorecard.avgGapLbp);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full border-t-2 border-brand/25 pt-3"
      whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.08)" }}
      transition={{ duration: DURATION_MICRO, ease: EASE_PROFESSIONAL }}
    >
      <p className="font-display text-lg text-ocean">{scorecard.reportLabel}</p>
      <p className="mt-1 text-sm text-ocean-muted">
        <CountUp value={scorecard.itemCount} format={(n) => Math.round(n).toLocaleString("en-US")} /> items benchmarked
      </p>
      {absGap === null ? (
        <p className="mt-2 font-display text-2xl text-ocean">—</p>
      ) : (
        <CountUp
          className="mt-2 block font-display text-2xl text-ocean"
          value={absGap}
          format={(n) => formatDualCurrency(n, fxRate)}
        />
      )}
      <p className="text-xs text-ocean-muted">average gap vs. market{direction ? ` — ${direction}` : ""}</p>
      <p className="mt-2 text-xs text-ocean-muted">
        {scorecard.overpricedCount} above market · {scorecard.underpricedCount} below market
      </p>
    </motion.div>
  );
}
