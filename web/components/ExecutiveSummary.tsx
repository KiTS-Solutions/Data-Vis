import type { ReportScorecard } from "@/lib/analytics/scorecard";
import { buildHeadline } from "@/lib/analytics/scorecard";
import { formatDualCurrency } from "@/lib/format/currency";

export function ExecutiveSummary({ scorecards, fxRate }: { scorecards: ReportScorecard[]; fxRate: number }) {
  return (
    <section aria-label="Executive Summary" className="space-y-6">
      <p className="font-display text-2xl text-ocean">{buildHeadline(scorecards)}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scorecards.map((s) => (
          <ScorecardTile key={s.reportLabel} scorecard={s} fxRate={fxRate} />
        ))}
      </div>
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
  const gapLabel = scorecard.avgGapLbp === null ? "—" : formatDualCurrency(Math.abs(scorecard.avgGapLbp), fxRate);

  return (
    <div className="border-t-2 border-ocean/15 pt-3">
      <p className="font-display text-lg text-ocean">{scorecard.reportLabel}</p>
      <p className="mt-1 text-sm text-ocean-muted">{scorecard.itemCount} items benchmarked</p>
      <p className="mt-2 font-display text-2xl text-ocean">{gapLabel}</p>
      <p className="text-xs text-ocean-muted">average gap vs. market{direction ? ` — ${direction}` : ""}</p>
      <p className="mt-2 text-xs text-ocean-muted">
        {scorecard.overpricedCount} above market · {scorecard.underpricedCount} below market
      </p>
    </div>
  );
}
