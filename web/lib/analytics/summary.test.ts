import { describe, it, expect } from "vitest";
import { computeSummaryKpis } from "./summary";
import type { PricingReport, ProductAnalytics } from "../data/types";

function product(overrides: Partial<ProductAnalytics> = {}): ProductAnalytics {
  return {
    category: "Hot",
    product: "Item",
    prices_lbp: {},
    own_price_lbp: 100000,
    competitor_avg_lbp: 100000,
    price_index: 100,
    comparability: "high",
    tier: "Core",
    is_outlier: false,
    outlier_direction: null,
    ...overrides,
  };
}

function buildReport(products: ProductAnalytics[]): PricingReport {
  return {
    meta: {
      client: "Stories",
      report_date: "2026-03-01",
      currency: "LBP",
      fx_usd_rate: 89600,
      fx_rate_date: "2026-07-20",
      fx_source: "test",
      own_brand: "Stories",
      competitors: ["Espresso Lab"],
    },
    products,
    categories: [
      { category: "Hot", product_count: 2, countable_product_count: 2, avg_price_index: 120 },
      { category: "Cold", product_count: 1, countable_product_count: 1, avg_price_index: 80 },
    ],
    data_quality_warnings: [],
  };
}

describe("computeSummaryKpis", () => {
  it("computes overall average index across categories", () => {
    const kpis = computeSummaryKpis(buildReport([product(), product(), product()]));
    expect(kpis.overallAvgIndex).toBe(100);
  });

  it("counts items benchmarked as products with an own price, regardless of comparability", () => {
    const products = [
      product({ own_price_lbp: 100000 }),
      product({ own_price_lbp: 200000 }),
      product({ own_price_lbp: null }),
    ];
    expect(computeSummaryKpis(buildReport(products)).itemsBenchmarked).toBe(2);
  });

  it("counts repricing candidates and trade-up opportunities from outlier flags", () => {
    const products = [
      product({ is_outlier: true, outlier_direction: "overpriced" }),
      product({ is_outlier: true, outlier_direction: "overpriced" }),
      product({ is_outlier: true, outlier_direction: "underpriced" }),
      product({ is_outlier: false, outlier_direction: null }),
    ];
    const kpis = computeSummaryKpis(buildReport(products));
    expect(kpis.repricingCandidates).toBe(2);
    expect(kpis.tradeUpOpportunities).toBe(1);
  });

  it("ranks top over- and under-indexed categories", () => {
    const kpis = computeSummaryKpis(buildReport([product(), product(), product()]));
    expect(kpis.topOverIndexed[0].category).toBe("Hot");
    expect(kpis.topUnderIndexed[0].category).toBe("Cold");
  });
});
