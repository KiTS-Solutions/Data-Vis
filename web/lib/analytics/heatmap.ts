import type { CategoryRollup, ProductAnalytics } from "../data/types";

export type CellStatus = "priced" | "not-priced" | "no-peer";

export interface HeatmapCell {
  brand: string;
  indexValue: number | null; // this brand's avg price ÷ every OTHER priced brand's avg price in this category × 100
  avgPriceLbp: number | null;
  productCount: number;
  /**
   * "priced" = has both a price and enough comparable peers to compute an index.
   * "not-priced" = this brand has no priced item in this category at all —
   *   genuine data sparsity in the source spreadsheet.
   * "no-peer" = this brand DOES have a price here, but not enough OTHER
   *   brands priced the same items (fewer than 2, per item) to compute a
   *   reliable index. Distinct from "not-priced" because there IS a real
   *   number (avgPriceLbp) to show.
   */
  status: CellStatus;
}

export interface HeatmapRow {
  category: string;
  cells: HeatmapCell[];
}

/**
 * Uses the SAME per-item index formula as the pipeline's own Price Index
 * (own price ÷ that item's OTHER-brands-only average × 100, averaged across
 * items with at least 2 other brands priced). For the report's own_brand,
 * the category-level number is read DIRECTLY from `categories` (the same
 * pre-computed avg_price_index Category Positioning shows) rather than
 * recomputed from per-product price_index fields — recomputing in JS with
 * Math.round produced a 0.1-point mismatch against Python's round() at
 * rounding-boundary cases, which would have defeated the point of this fix.
 * For every other brand the identical per-item formula is generalized with
 * that brand as "own" and every other priced brand (from prices_lbp) as
 * "peers" — there's no pre-computed rollup for competitors, so this is
 * computed here, but using the exact same formula and comparability rule.
 *
 * An earlier version computed a category-level average-of-brand-averages
 * instead (unfiltered by comparability, no per-item matching) — a different,
 * undocumented calculation that produced numbers diverging from Category
 * Positioning by up to 25 points on real data for the same category. This
 * replaces that with one consistent methodology used everywhere on the site.
 */
export function buildCategoryBrandHeatmap(
  products: ProductAnalytics[],
  brands: string[],
  ownBrand: string,
  categories: CategoryRollup[]
): HeatmapRow[] {
  const byCategory = new Map<string, ProductAnalytics[]>();
  for (const p of products) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  const rollupByCategory = new Map(categories.map((c) => [c.category, c]));

  return Array.from(byCategory.entries()).map(([category, categoryProducts]) => {
    const cells: HeatmapCell[] = brands.map((brand) => {
      const priced = categoryProducts.filter((p) => p.prices_lbp[brand] !== undefined);

      if (priced.length === 0) {
        return { brand, indexValue: null, avgPriceLbp: null, productCount: 0, status: "not-priced" };
      }

      const avgPriceLbp = Math.round(
        priced.reduce((sum, p) => sum + p.prices_lbp[brand], 0) / priced.length
      );

      if (brand === ownBrand) {
        const indexValue = rollupByCategory.get(category)?.avg_price_index ?? null;
        return {
          brand,
          indexValue,
          avgPriceLbp,
          productCount: priced.length,
          status: indexValue === null ? "no-peer" : "priced",
        };
      }

      const indexable = priced.filter(
        (p) => Object.keys(p.prices_lbp).filter((b) => b !== brand).length >= 2
      );

      if (indexable.length === 0) {
        return { brand, indexValue: null, avgPriceLbp, productCount: priced.length, status: "no-peer" };
      }

      const perItemIndices = indexable.map((p) => {
        const otherPrices = Object.entries(p.prices_lbp)
          .filter(([b]) => b !== brand)
          .map(([, price]) => price);
        const otherAvg = otherPrices.reduce((sum, v) => sum + v, 0) / otherPrices.length;
        return (p.prices_lbp[brand] / otherAvg) * 100;
      });

      const indexValue =
        Math.round((perItemIndices.reduce((sum, v) => sum + v, 0) / perItemIndices.length) * 10) / 10;

      return { brand, indexValue, avgPriceLbp, productCount: priced.length, status: "priced" };
    });
    return { category, cells };
  });
}

export type HeatmapBin = "strong-below" | "below" | "at-par" | "above" | "strong-above" | "no-data";

export function heatmapBin(indexValue: number | null): HeatmapBin {
  if (indexValue === null) return "no-data";
  const deviation = indexValue - 100;
  if (deviation <= -15) return "strong-below";
  if (deviation < -5) return "below";
  if (deviation < 5) return "at-par";
  if (deviation < 15) return "above";
  return "strong-above";
}
