import { describe, it, expect } from "vitest";
import { filterReportByCategories } from "./filterReport";
import type { PricingReport } from "./types";

function report(): PricingReport {
  return {
    meta: {
      client: "Stories",
      report_date: "2026-07-22",
      currency: "LBP",
      fx_usd_rate: 89600,
      fx_rate_date: "2026-07-20",
      fx_source: "test",
      own_brand: "Stories",
      competitors: ["Espresso Lab"],
    },
    products: [
      { category: "Croissants", product: "Cheese Croissant", prices_lbp: {}, portion_notes: {}, own_price_lbp: 400000, competitor_avg_lbp: null, price_index: null, comparability: "low", tier: null, is_outlier: false, outlier_direction: null },
      { category: "Black Coffee", product: "Americano", prices_lbp: {}, portion_notes: {}, own_price_lbp: 300000, competitor_avg_lbp: null, price_index: null, comparability: "low", tier: null, is_outlier: false, outlier_direction: null },
    ],
    categories: [
      { category: "Croissants", product_count: 1, countable_product_count: 0, avg_price_index: null },
      { category: "Black Coffee", product_count: 1, countable_product_count: 0, avg_price_index: null },
    ],
    data_quality_warnings: [
      { category: "Croissants", product: "Cheese Croissant", brand: "Stories", conflicting_prices_lbp: [1, 2] },
    ],
    unparseable_price_warnings: [
      { category: "Croissants", product: "Cheese Croissant", brand: "Espresso Lab", raw_value: "8000,00" },
      { category: "Black Coffee", product: "Americano", brand: "Espresso Lab", raw_value: "n/a" },
    ],
  };
}

describe("filterReportByCategories", () => {
  it("keeps only products, categories, and warnings in the given category set", () => {
    const filtered = filterReportByCategories(report(), ["Croissants"]);
    expect(filtered.products.map((p) => p.product)).toEqual(["Cheese Croissant"]);
    expect(filtered.categories.map((c) => c.category)).toEqual(["Croissants"]);
    expect(filtered.data_quality_warnings).toHaveLength(1);
    expect(filtered.unparseable_price_warnings).toHaveLength(1);
    expect(filtered.unparseable_price_warnings[0].product).toBe("Cheese Croissant");
  });

  it("leaves meta untouched", () => {
    const filtered = filterReportByCategories(report(), ["Black Coffee"]);
    expect(filtered.meta).toEqual(report().meta);
  });
});
