export interface PortionSizeRow {
  brand: string;
  items_with_portion_data: number;
  min_g: number | null;
  max_g: number | null;
  consistent: boolean;
}

export interface PortionSizeTable {
  meta: { client: string; generated_from?: string };
  rows: PortionSizeRow[];
}
