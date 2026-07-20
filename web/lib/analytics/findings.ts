import type { ProductAnalytics } from "../data/types";

export interface FindingsGroups {
  overpriced: ProductAnalytics[];
  underpriced: ProductAnalytics[];
}

export function groupOutlierFindings(products: ProductAnalytics[]): FindingsGroups {
  return {
    overpriced: products
      .filter((p) => p.is_outlier && p.outlier_direction === "overpriced")
      .sort((a, b) => (b.price_index ?? 0) - (a.price_index ?? 0)),
    underpriced: products
      .filter((p) => p.is_outlier && p.outlier_direction === "underpriced")
      .sort((a, b) => (a.price_index ?? 0) - (b.price_index ?? 0)),
  };
}
