import { loadReport } from "@/lib/data/loadReport";
import { filterReportByCategories } from "@/lib/data/filterReport";
import { withBasePath } from "@/lib/basePath";
import { formatReportPeriod } from "@/lib/format/date";
import { cleanDisplayFileName } from "@/lib/format/filename";
import { computeReportScorecard } from "@/lib/analytics/scorecard";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { ReportSection } from "@/components/ReportSection";
import { CategoriesInProgress } from "@/components/CategoriesInProgress";
import { Explain } from "@/components/Explain";
import { PresenterModeToggle } from "@/components/PresenterModeToggle";
import { ContextBar } from "@/components/ContextBar";
import { Methodology } from "@/components/Methodology";
import { Section } from "@/components/Section";
import { PresenterModeProvider } from "@/lib/presenter/PresenterModeContext";

const PENDING_CATEGORIES = [
  "Milkshakes",
  "Protein Shakes",
  "Salads",
  "Sandwiches",
  "Pizza",
  "Wraps",
  "Gluten Free",
  "Luxury Toppings",
  "Plat Du Jour",
];

// "Main Menu" isn't a real menu category — split it into the same groupings
// the client's own source spreadsheet uses (adjacent category-header blocks
// in raw-data/Product Pricing Comparison March 2026 (1).xlsx): a beverage
// block, a Croissants+Pastries block, and Shakes on its own.
const DRINKS_CATEGORIES = [
  "Black Coffee", "Brewed Coffee", "Mixed Hot Beverages", "Blended Drinks",
  "Mixed Cold Beverages", "TEA", "Signature", "Soft Drinks & Juices",
  "Retail Coffee Beans", "Shots", "Add - Ons",
];
const BAKERY_CATEGORIES = ["Croissants", "Pastries"];
const SHAKES_CATEGORIES = ["Shakes"];

export default function Home() {
  const mainReport = loadReport("stories-pricing-2026-03");
  const frozenYogurtReport = loadReport("stories-frozen-yogurt-2026-07");
  const nonDairyReport = loadReport("stories-non-dairy-2026-07");

  const drinksReport = filterReportByCategories(mainReport, DRINKS_CATEGORIES);
  const bakeryReport = filterReportByCategories(mainReport, BAKERY_CATEGORIES);
  const shakesReport = filterReportByCategories(mainReport, SHAKES_CATEGORIES);

  const scorecards = [
    computeReportScorecard(drinksReport, "Drinks"),
    computeReportScorecard(bakeryReport, "Bakery"),
    computeReportScorecard(shakesReport, "Shakes"),
    computeReportScorecard(frozenYogurtReport, "Frozen Yogurt Bar"),
    computeReportScorecard(nonDairyReport, "Non-Dairy Menu"),
  ];

  return (
    <PresenterModeProvider>
      {/* Cover */}
      <div className="border-b border-ocean/10 bg-white px-6 pb-10 pt-8">
        <div className="mx-auto flex max-w-6xl items-start justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath("/ruya-logo.jpg")} alt="Ru'ya 360" className="h-9 w-auto" />
            <span className="h-6 w-px bg-ocean/15" aria-hidden="true" />
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-display text-white"
              style={{ backgroundColor: "#1f4d3d" }}
              aria-hidden="true"
            >
              S
            </span>
            <span className="font-display text-lg text-ocean">Stories</span>
          </div>
          <PresenterModeToggle />
        </div>
        <div className="mx-auto mt-10 max-w-6xl">
          <p className="text-xs uppercase tracking-widest text-ocean-muted">Pricing Strategy Advisory</p>
          <h1 className="mt-2 font-display text-4xl text-ocean sm:text-5xl">Stories Pricing Benchmark</h1>
          <span className="mt-2 block h-1 w-16 rounded-full bg-lime-dust" aria-hidden="true" />
          <Explain>
            <p className="mt-3 max-w-2xl text-sm text-ocean-muted">
              A full-menu competitive price positioning analysis for {mainReport.meta.client}, broken out by
              category group — each benchmarked against its own set of competitors.
            </p>
          </Explain>
        </div>
      </div>

      <ContextBar meta={mainReport.meta} />

      <main className="mx-auto max-w-6xl px-6">
        <Section title="Executive Summary" first>
          <ExecutiveSummary scorecards={scorecards} fxRate={mainReport.meta.fx_usd_rate} />
        </Section>

        <Section title="Methodology & Data Sources">
          <Explain>
            <Methodology meta={mainReport.meta} warnings={mainReport.data_quality_warnings} />
          </Explain>
        </Section>

        <ReportSection title="Drinks" report={drinksReport} />
        <ReportSection title="Bakery" report={bakeryReport} />
        <ReportSection title="Shakes" report={shakesReport} />
        <ReportSection title="Frozen Yogurt Bar" report={frozenYogurtReport} />
        <ReportSection title="Non-Dairy Menu" report={nonDairyReport} />

        <Section title="Categories In Progress" last>
          <Explain>
            <p className="mb-5 max-w-2xl text-sm text-ocean-muted">
              These categories are moving to their own dedicated competitor comparison — shown here once{" "}
              {mainReport.meta.client} provides that data.
            </p>
          </Explain>
          <CategoriesInProgress categories={PENDING_CATEGORIES} />
        </Section>
      </main>

      <footer className="mt-4 border-t border-ocean/10 bg-ocean/5 px-6 py-6 text-xs text-ocean-muted">
        <div className="mx-auto max-w-6xl">
          <p>Confidential — prepared for {mainReport.meta.client} by Ru&apos;ya 360. Not for external distribution.</p>
          <p className="mt-1">
            Report period: {formatReportPeriod(mainReport.meta.report_date)} · Source:{" "}
            {mainReport.meta.generated_from ? cleanDisplayFileName(mainReport.meta.generated_from) : "internal pricing data"}.
          </p>
        </div>
      </footer>
    </PresenterModeProvider>
  );
}
