import type { PortionSizeTable } from "@/lib/data/portionSizeTypes";

const TIER_LABELS: Record<"PRICED_G" | "ALSO_AVAILABLE_G", string> = {
  PRICED_G: "Priced Portion",
  ALSO_AVAILABLE_G: "Also Available At",
};

const STANDARD_PORTION_G = 400;

function formatGrams(value: number | string | null): string {
  if (value === null) return "—";
  return `${value}g`;
}

export function PortionSizeComparison({ table, ownBrand }: { table: PortionSizeTable; ownBrand: string }) {
  return (
    <div aria-label="Portion Size Comparison" data-testid="portion-size-comparison">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="p-1 text-left font-normal text-ocean-muted">Brand</th>
              {table.sizes.map((tier) => (
                <th key={tier} className="p-1 text-center font-normal text-ocean-muted">
                  {TIER_LABELS[tier]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => {
              const pricedBelowStandard =
                typeof row.PRICED_G === "number" && row.PRICED_G < STANDARD_PORTION_G;
              return (
                <tr key={row.brand}>
                  <th
                    scope="row"
                    className={`p-1 text-left font-normal ${row.brand === ownBrand ? "font-semibold text-ocean" : "text-ocean-muted"}`}
                  >
                    {row.brand}
                  </th>
                  {table.sizes.map((tier) => (
                    <td
                      key={tier}
                      className={`p-1.5 text-center tabular-nums ${row.brand === ownBrand ? "bg-ocean/5 font-semibold ring-2 ring-ocean/40" : ""} ${
                        tier === "PRICED_G" && pricedBelowStandard
                          ? "rounded bg-amber-100 font-semibold text-amber-800"
                          : ""
                      }`}
                      title={
                        tier === "PRICED_G" && pricedBelowStandard
                          ? `Priced at ${row.PRICED_G}g, below the ${STANDARD_PORTION_G}g standard portion used for comparison`
                          : undefined
                      }
                    >
                      {formatGrams(row[tier])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
