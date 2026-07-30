import type { DataQualityWarning, ReportMeta, UnparseablePriceWarning } from "@/lib/data/types";
import { formatLbp } from "@/lib/format/currency";
import { formatReportPeriod, formatFullDate } from "@/lib/format/date";

const DEFINITIONS: Array<{ term: string; definition: string }> = [
  {
    term: "Price Index",
    definition:
      "Own price ÷ competitor-only average × 100. 100 = priced exactly at the competitive market average. Above 100 = priced above market; below 100 = priced below market. The competitor average deliberately excludes the client's own price, so it's a true external benchmark.",
  },
  {
    term: "Comparability",
    definition:
      "How many competitors had a price for that exact item: High = 3 or more, Medium = 2, Low = 0 or 1. Low-comparability items are shown in the Data Explorer for completeness but excluded from category averages and outlier flags — one or two data points aren't a reliable market read.",
  },
  {
    term: "Tier",
    definition:
      "Value / Core / Premium — where an item sits within its own category's price distribution (bottom quartile, middle, top quartile), based on the client's own prices only.",
  },
  {
    term: "Outlier",
    definition:
      "An item whose Price Index deviates 15 points or more from 100 (i.e. more than 15% above or below the competitive average), and has Medium or High comparability. Flagged as a repricing candidate (overpriced) or trade-up opportunity (underpriced).",
  },
];

type SourcedWarning = DataQualityWarning & { source: string };
type SourcedUnparseableWarning = UnparseablePriceWarning & { source: string };

function fxDateSentence(fxRateDate: string, reportDate: string, reportPeriod: string): string {
  if (fxRateDate > reportDate) {
    return `Note the FX rate date falls after the report period (${reportPeriod}) — it reflects a later refresh of the exchange rate than when prices were originally collected.`;
  }
  if (fxRateDate < reportDate) {
    return `Note the FX rate date falls before the report period (${reportPeriod}) — it reflects the rate as of when this analysis was compiled, ahead of the report's publication.`;
  }
  return `The FX rate date falls within the report period (${reportPeriod}).`;
}

export function Methodology({
  meta,
  warnings,
  unparseablePriceWarnings = [],
}: {
  meta: ReportMeta;
  warnings: SourcedWarning[];
  unparseablePriceWarnings?: SourcedUnparseableWarning[];
}) {
  return (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="mb-2 font-display text-base text-ocean">Where this data comes from</h3>
        <p className="text-ocean-muted">
          Every price in this report is taken directly from {meta.client}&apos;s own pricing spreadsheets — no
          prices were estimated, interpolated, or invented. The Price Index, Comparability, Tier, and Outlier
          fields below are calculated from those raw prices using the fixed formulas defined here; they are not
          separate data sources. The one exception is the USD equivalent shown alongside LBP prices, which uses
          an external exchange rate — {meta.fx_usd_rate.toLocaleString("en-US")} LBP/USD as of{" "}
          {formatFullDate(meta.fx_rate_date)}, sourced from {meta.fx_source} — since the spreadsheets themselves
          contain no currency conversion. {fxDateSentence(meta.fx_rate_date, meta.report_date, formatReportPeriod(meta.report_date))}{" "}
          The Lebanese Lira has been broadly stable against the dollar throughout, so the effect on USD figures is
          minimal.
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-display text-base text-ocean">Definitions</h3>
        <dl className="space-y-3">
          {DEFINITIONS.map((d) => (
            <div key={d.term}>
              <dt className="font-semibold text-ocean">{d.term}</dt>
              <dd className="text-ocean-muted">{d.definition}</dd>
            </div>
          ))}
        </dl>
      </div>

      {(warnings.length > 0 || unparseablePriceWarnings.length > 0) && (
        <div>
          <h3 className="mb-2 font-display text-base text-ocean">Data quality notes</h3>

          {warnings.length > 0 && (
            <>
              <p className="mb-2 text-ocean-muted">
                The source data had {warnings.length} row{warnings.length === 1 ? "" : "s"} with a duplicate
                product entry carrying conflicting prices for the same brand. The most recent value in the sheet
                was kept; the earlier value is disclosed here rather than silently discarded.
              </p>
              <ul className="space-y-1 text-ocean-muted">
                {warnings.map((w, i) => (
                  <li key={i}>
                    <strong className="text-ocean">
                      {w.product} ({w.category})
                    </strong>{" "}
                    — {w.source}, {w.brand}: conflicting prices{" "}
                    {w.conflicting_prices_lbp.map((p) => formatLbp(p)).join(" vs. ")}
                  </li>
                ))}
              </ul>
            </>
          )}

          {unparseablePriceWarnings.length > 0 && (
            <>
              <p className={`mb-2 text-ocean-muted ${warnings.length > 0 ? "mt-4" : ""}`}>
                The source data also had {unparseablePriceWarnings.length} price cell
                {unparseablePriceWarnings.length === 1 ? "" : "s"} that couldn&apos;t be read as a number. The
                raw value is shown as-is below rather than guessed at, and is excluded from every calculation on
                this page.
              </p>
              <ul className="space-y-1 text-ocean-muted">
                {unparseablePriceWarnings.map((w, i) => (
                  <li key={i}>
                    <strong className="text-ocean">
                      {w.product} ({w.category})
                    </strong>{" "}
                    — {w.source}, {w.brand}: raw value &quot;{w.raw_value}&quot;
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
