export type GramSizeTier = "S" | "M" | "L" | "FAMILY";

export interface GramSizeRow {
  brand: string;
  S: number | string | null;
  M: number | string | null;
  L: number | string | null;
  FAMILY: number | string | null;
}

export interface GramSizeTable {
  meta: { client: string; generated_from?: string };
  sizes: GramSizeTier[];
  rows: GramSizeRow[];
}
