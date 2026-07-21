import type { CategoryRollup, PricingReport } from "../data/types";

export interface SummaryKpis {
  overallAvgIndex: number | null;
  itemsBenchmarked: number;
  repricingCandidates: number;
  tradeUpOpportunities: number;
  topOverIndexed: CategoryRollup[];
  topUnderIndexed: CategoryRollup[];
}

export function computeSummaryKpis(report: PricingReport): SummaryKpis {
  const withIndex = report.categories.filter(
    (c): c is CategoryRollup & { avg_price_index: number } => c.avg_price_index !== null
  );

  const overallAvgIndex = withIndex.length
    ? Math.round((withIndex.reduce((sum, c) => sum + c.avg_price_index, 0) / withIndex.length) * 10) / 10
    : null;

  const itemsBenchmarked = report.products.filter((p) => p.own_price_lbp !== null).length;

  const repricingCandidates = report.products.filter(
    (p) => p.is_outlier && p.outlier_direction === "overpriced"
  ).length;
  const tradeUpOpportunities = report.products.filter(
    (p) => p.is_outlier && p.outlier_direction === "underpriced"
  ).length;

  const sortedDescending = [...withIndex].sort((a, b) => b.avg_price_index - a.avg_price_index);
  const sortedAscending = [...withIndex].sort((a, b) => a.avg_price_index - b.avg_price_index);

  return {
    overallAvgIndex,
    itemsBenchmarked,
    repricingCandidates,
    tradeUpOpportunities,
    topOverIndexed: sortedDescending.slice(0, 3),
    topUnderIndexed: sortedAscending.slice(0, 3),
  };
}
