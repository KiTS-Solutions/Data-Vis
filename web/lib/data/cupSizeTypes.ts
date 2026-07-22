export type CupSizeTier = "S" | "M" | "L" | "TO_GO" | "DINE_IN";

export interface CupSizeRow {
  brand: string;
  S: number | string | null;
  M: number | string | null;
  L: number | string | null;
  TO_GO: number | string | null;
  DINE_IN: number | string | null;
}

export interface CupSizeTable {
  meta: { client: string; generated_from?: string };
  sizes: CupSizeTier[];
  rows: CupSizeRow[];
}
