import type { PortionSizeRow } from "@/lib/data/portionSizeTypes";

/**
 * Formats a brand's portion-size disclosure row as a single reader-facing
 * string: a single gram value when every priced item for that brand used
 * the same portion, a min–max range when it varies by product, or an em
 * dash when no per-product portion note was available at all.
 */
export function formatPortionRange(row: PortionSizeRow): string {
  if (row.items_with_portion_data === 0 || row.min_g === null || row.max_g === null) {
    return "—";
  }
  if (row.consistent) {
    return `${row.min_g}g`;
  }
  return `${row.min_g}–${row.max_g}g`;
}
