export type PortionSizeTier = "PRICED_G" | "ALSO_AVAILABLE_G";

export interface PortionSizeRow {
  brand: string;
  PRICED_G: number | string | null;
  ALSO_AVAILABLE_G: number | string | null;
}

export interface PortionSizeTable {
  meta: { client: string; generated_from?: string };
  sizes: PortionSizeTier[];
  rows: PortionSizeRow[];
}
