import type { PortionSizeTable } from "@/lib/data/portionSizeTypes";
import { formatPortionRange } from "@/lib/format/portion";

export function PortionSizeComparison({ table, ownBrand }: { table: PortionSizeTable; ownBrand: string }) {
  return (
    <div aria-label="Portion Size Comparison" data-testid="portion-size-comparison">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="p-1 text-left font-normal text-ocean-muted">Brand</th>
              <th className="p-1 text-center font-normal text-ocean-muted">Items Disclosed</th>
              <th className="p-1 text-center font-normal text-ocean-muted">Portion Size</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.brand}>
                <th
                  scope="row"
                  className={`p-1 text-left font-normal ${row.brand === ownBrand ? "font-semibold text-ocean" : "text-ocean-muted"}`}
                >
                  {row.brand}
                </th>
                <td
                  className={`p-1.5 text-center tabular-nums ${row.brand === ownBrand ? "bg-ocean/5 font-semibold ring-2 ring-ocean/40" : ""}`}
                >
                  {row.items_with_portion_data || "—"}
                </td>
                <td
                  className={`p-1.5 text-center tabular-nums ${row.brand === ownBrand ? "bg-ocean/5 font-semibold ring-2 ring-ocean/40" : ""} ${
                    row.consistent && row.items_with_portion_data > 0 ? "rounded bg-ocean/10 font-semibold" : ""
                  }`}
                  title={
                    row.consistent && row.items_with_portion_data > 0
                      ? `Every priced item for ${row.brand} used the same ${row.min_g}g portion`
                      : undefined
                  }
                >
                  {formatPortionRange(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
