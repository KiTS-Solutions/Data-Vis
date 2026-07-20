"use client";

import { usePresenterMode } from "@/lib/presenter/PresenterModeContext";
import type { FindingsGroups } from "@/lib/analytics/findings";
import { formatDualCurrency } from "@/lib/format/currency";

export function FindingsRecommendations({
  findings,
  fxRate,
}: {
  findings: FindingsGroups;
  fxRate: number;
}) {
  const { showRecommendations } = usePresenterMode();
  if (!showRecommendations) return null;

  return (
    <section aria-label="Findings and Recommendations" className="space-y-6">
      <FindingsList
        title="Repricing Candidates (Overpriced)"
        items={findings.overpriced}
        fxRate={fxRate}
        accentClassName="text-red-600"
      />
      <FindingsList
        title="Trade-Up Opportunities (Underpriced)"
        items={findings.underpriced}
        fxRate={fxRate}
        accentClassName="text-violet-600"
      />
    </section>
  );
}

function FindingsList({
  title,
  items,
  fxRate,
  accentClassName,
}: {
  title: string;
  items: FindingsGroups["overpriced"];
  fxRate: number;
  accentClassName: string;
}) {
  return (
    <div>
      <h3 className={`font-display text-lg ${accentClassName}`}>{title}</h3>
      <ul className="mt-2 divide-y divide-ocean/10">
        {items.map((item) => (
          <li
            key={`${item.category}-${item.product}`}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span>
              {item.product} <span className="text-ocean/50">({item.category})</span>
            </span>
            <span>
              {item.own_price_lbp !== null ? formatDualCurrency(item.own_price_lbp, fxRate) : "—"} · index{" "}
              {item.price_index}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
