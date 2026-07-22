import { describe, it, expect } from "vitest";
import { buildCategoryBrandHeatmap, heatmapBin } from "./heatmap";
import type { CategoryRollup, ProductAnalytics } from "../data/types";

function product(overrides: Partial<ProductAnalytics>): ProductAnalytics {
  return {
    category: "Hot",
    product: "Item",
    prices_lbp: {},
    own_price_lbp: null,
    competitor_avg_lbp: null,
    price_index: null,
    comparability: "low",
    tier: null,
    is_outlier: false,
    outlier_direction: null,
    ...overrides,
  };
}

describe("buildCategoryBrandHeatmap", () => {
  it("reads the own brand's index directly from the category rollup, matching Category Positioning byte-for-byte", () => {
    const products = [
      product({
        product: "A",
        prices_lbp: { Stories: 300000, "Espresso Lab": 380000, Starbucks: 420000 },
      }),
    ];
    const categories: CategoryRollup[] = [
      { category: "Hot", product_count: 1, countable_product_count: 1, avg_price_index: 87.5 },
    ];

    const heatmap = buildCategoryBrandHeatmap(products, ["Stories", "Espresso Lab", "Starbucks"], "Stories", categories);
    const storiesCell = heatmap[0].cells.find((c) => c.brand === "Stories");

    // Must be the exact rollup value, not recomputed from per-product
    // fields — recomputing in JS with Math.round can differ from Python's
    // round() by 0.1 at boundary cases, which would defeat this fix.
    expect(storiesCell?.indexValue).toBe(87.5);
    expect(storiesCell?.status).toBe("priced");
  });

  it("marks the own brand as no-peer when the rollup has no countable index, even though it has a price", () => {
    const products = [product({ category: "Hot", product: "A", prices_lbp: { Stories: 300000 } })];
    const categories: CategoryRollup[] = [
      { category: "Hot", product_count: 1, countable_product_count: 0, avg_price_index: null },
    ];

    const heatmap = buildCategoryBrandHeatmap(products, ["Stories"], "Stories", categories);
    const storiesCell = heatmap[0].cells.find((c) => c.brand === "Stories");
    expect(storiesCell?.indexValue).toBeNull();
    expect(storiesCell?.status).toBe("no-peer");
    expect(storiesCell?.avgPriceLbp).toBe(300000);
  });

  it("generalizes the same per-item formula to a non-own brand, using every OTHER priced brand as peers", () => {
    const products = [
      product({
        product: "A",
        prices_lbp: { Stories: 300000, "Espresso Lab": 400000, Starbucks: 400000 },
      }),
    ];

    const heatmap = buildCategoryBrandHeatmap(products, ["Stories", "Espresso Lab", "Starbucks"], "Stories", []);
    // Espresso Lab: 400000 / avg(Stories=300000, Starbucks=400000)=350000 * 100 = 114.3
    const espressoCell = heatmap[0].cells.find((c) => c.brand === "Espresso Lab");
    expect(espressoCell?.indexValue).toBe(114.3);
    expect(espressoCell?.status).toBe("priced");
  });

  it("excludes items with fewer than 2 other brands priced from a non-own brand's index average", () => {
    const products = [
      product({
        product: "A",
        prices_lbp: { Stories: 300000, "Espresso Lab": 400000, Starbucks: 400000 }, // 2 peers for Espresso Lab
      }),
      product({
        product: "B",
        prices_lbp: { "Espresso Lab": 500000 }, // 0 peers for Espresso Lab — excluded
      }),
    ];

    const heatmap = buildCategoryBrandHeatmap(products, ["Stories", "Espresso Lab", "Starbucks"], "Stories", []);
    const espressoCell = heatmap[0].cells.find((c) => c.brand === "Espresso Lab");
    // Only item A counts (2 peers); item B (0 peers) is excluded, average price still includes both.
    expect(espressoCell?.indexValue).toBe(114.3);
    expect(espressoCell?.avgPriceLbp).toBe(450000); // (400000 + 500000) / 2
    expect(espressoCell?.productCount).toBe(2);
  });

  it("marks a brand with no price data in that category as not-priced", () => {
    const products = [product({ product: "A", prices_lbp: { Stories: 300000 } })];

    const heatmap = buildCategoryBrandHeatmap(products, ["Stories", "Espresso Lab"], "Stories", []);
    const cell = heatmap[0].cells.find((c) => c.brand === "Espresso Lab");
    expect(cell?.indexValue).toBeNull();
    expect(cell?.avgPriceLbp).toBeNull();
    expect(cell?.status).toBe("not-priced");
  });

  it("marks a brand that HAS a price but no comparable peer per item as no-peer, not not-priced", () => {
    const products = [
      product({ category: "Frozen Yogurt", product: "A", prices_lbp: { Stories: 250000 } }),
    ];

    const heatmap = buildCategoryBrandHeatmap(products, ["Stories", "Espresso Lab"], "Stories", []);
    const storiesCell = heatmap[0].cells.find((c) => c.brand === "Stories");
    expect(storiesCell?.status).toBe("no-peer");
    expect(storiesCell?.indexValue).toBeNull();
    // The real price must still be surfaced — a bare dash made the client's
    // own priced category look empty.
    expect(storiesCell?.avgPriceLbp).toBe(250000);
  });
});

describe("heatmapBin", () => {
  it("bins null as no-data", () => {
    expect(heatmapBin(null)).toBe("no-data");
  });

  it("bins deviations into the five ranges", () => {
    expect(heatmapBin(80)).toBe("strong-below"); // -20
    expect(heatmapBin(92)).toBe("below"); // -8
    expect(heatmapBin(100)).toBe("at-par"); // 0
    expect(heatmapBin(108)).toBe("above"); // +8
    expect(heatmapBin(120)).toBe("strong-above"); // +20
  });

  it("treats the ±5 boundary as at-par, not the adjacent bin", () => {
    expect(heatmapBin(104.9)).toBe("at-par");
    expect(heatmapBin(95.1)).toBe("at-par");
  });
});
