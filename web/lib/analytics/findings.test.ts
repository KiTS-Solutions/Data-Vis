import { describe, it, expect } from "vitest";
import { groupOutlierFindings } from "./findings";
import type { ProductAnalytics } from "../data/types";

function product(overrides: Partial<ProductAnalytics>): ProductAnalytics {
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

describe("groupOutlierFindings", () => {
  it("splits outliers into overpriced (desc) and underpriced (asc), ignoring non-outliers", () => {
    const products = [
      product({ product: "A", price_index: 130, is_outlier: true, outlier_direction: "overpriced" }),
      product({ product: "B", price_index: 118, is_outlier: true, outlier_direction: "overpriced" }),
      product({ product: "C", price_index: 70, is_outlier: true, outlier_direction: "underpriced" }),
      product({ product: "D", price_index: 105, is_outlier: false, outlier_direction: null }),
    ];

    const { overpriced, underpriced } = groupOutlierFindings(products);

    expect(overpriced.map((p) => p.product)).toEqual(["A", "B"]);
    expect(underpriced.map((p) => p.product)).toEqual(["C"]);
  });
});
