import type { PricingReport } from "./types";

/**
 * Slices one loaded PricingReport down to only the given categories, keeping
 * everything else (meta, competitors, FX rate) identical — so the result can
 * be passed anywhere a full PricingReport is expected (ReportSection,
 * computeReportScorecard) to display a category subset as its own section,
 * without a separate pipeline run or duplicated data.
 */
export function filterReportByCategories(report: PricingReport, categories: string[]): PricingReport {
  const categorySet = new Set(categories);
  return {
    ...report,
    products: report.products.filter((p) => categorySet.has(p.category)),
    categories: report.categories.filter((c) => categorySet.has(c.category)),
    data_quality_warnings: report.data_quality_warnings.filter((w) => categorySet.has(w.category)),
  };
}
