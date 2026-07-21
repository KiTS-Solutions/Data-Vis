"use client";

import { usePresenterMode } from "@/lib/presenter/PresenterModeContext";
import type { FindingsGroups } from "@/lib/analytics/findings";
import type { ProductAnalytics } from "@/lib/data/types";
import { formatDualCurrency, formatLbp } from "@/lib/format/currency";

const MAX_SHOWN = 8;

export function FindingsRecommendations({
  findings,
  fxRate,
}: {
  findings: FindingsGroups;
  fxRate: number;
}) {
  const { showRecommendations } = usePresenterMode();
  if (!showRecommendations) return null;

  const totalOutliers = findings.overpriced.length + findings.underpriced.length;

  return (
    <section aria-label="Findings and Recommendations" className="space-y-8">
      <p className="text-sm text-ocean/60">
        {totalOutliers} item{totalOutliers === 1 ? "" : "s"} deviate 15% or more from the competitive average
        (medium/high comparability only). Ranked by how far each sits from market.
      </p>
      <FindingsList
        title="Repricing Candidates — Priced Above Market"
        items={findings.overpriced}
        fxRate={fxRate}
        accentClassName="text-red-600"
        recommendation={(item) => {
          const gap = item.own_price_lbp !== null && item.competitor_avg_lbp !== null
            ? item.own_price_lbp - item.competitor_avg_lbp
            : null;
          return gap !== null
            ? `${formatLbp(gap)} above the competitor average — a candidate for a price review.`
            : "Above the competitor average — a candidate for a price review.";
        }}
      />
      <FindingsList
        title="Trade-Up Opportunities — Priced Below Market"
        items={findings.underpriced}
        fxRate={fxRate}
        accentClassName="text-violet-600"
        recommendation={(item) => {
          const gap = item.own_price_lbp !== null && item.competitor_avg_lbp !== null
            ? item.competitor_avg_lbp - item.own_price_lbp
            : null;
          return gap !== null
            ? `${formatLbp(gap)} below the competitor average — room to raise toward market, or a deliberate value/traffic driver.`
            : "Below the competitor average — room to raise toward market, or a deliberate value driver.";
        }}
      />
    </section>
  );
}

function FindingsList({
  title,
  items,
  fxRate,
  accentClassName,
  recommendation,
}: {
  title: string;
  items: ProductAnalytics[];
  fxRate: number;
  accentClassName: string;
  recommendation: (item: ProductAnalytics) => string;
}) {
  const shown = items.slice(0, MAX_SHOWN);
  const remaining = items.length - shown.length;

  return (
    <div>
      <h3 className={`font-display text-lg ${accentClassName}`}>
        {title} <span className="text-sm font-normal text-ocean/40">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ocean/50">None found.</p>
      ) : (
        <ol className="mt-2 divide-y divide-ocean/10">
          {shown.map((item, i) => (
            <li key={`${item.category}-${item.product}`} className="py-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <span>
                  <span className="text-ocean/40">{i + 1}.</span>{" "}
                  <span className="font-medium text-ocean">{item.product}</span>{" "}
                  <span className="text-ocean/50">({item.category})</span>
                </span>
                <span className="whitespace-nowrap text-ocean/70">
                  {item.own_price_lbp !== null ? formatDualCurrency(item.own_price_lbp, fxRate) : "—"} · index{" "}
                  {item.price_index}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ocean/50">{recommendation(item)}</p>
            </li>
          ))}
        </ol>
      )}
      {remaining > 0 && (
        <p className="mt-2 text-xs text-ocean/40">
          +{remaining} more — filter &quot;Outliers only&quot; in the Full Data Explorer below to see the rest.
        </p>
      )}
    </div>
  );
}
