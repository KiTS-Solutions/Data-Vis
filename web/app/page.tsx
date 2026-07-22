import { loadReport } from "@/lib/data/loadReport";
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

export default function Home() {
  const mainReport = loadReport("stories-pricing-2026-03");
  const frozenYogurtReport = loadReport("stories-frozen-yogurt-2026-07");
  const nonDairyReport = loadReport("stories-non-dairy-2026-07");

  const scorecards = [
    computeReportScorecard(mainReport, "Main Menu"),
    computeReportScorecard(frozenYogurtReport, "Frozen Yogurt Bar"),
    computeReportScorecard(nonDairyReport, "Non-Dairy Menu"),
  ];

  return (
    <PresenterModeProvider>
      {/* Cover */}
      <div className="border-b border-ocean/10 bg-white px-6 pb-10 pt-8">
        <div className="mx-auto flex max-w-6xl items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/ruya-logo.jpg")} alt="Ru'ya 360" className="h-9 w-auto" />
          <PresenterModeToggle />
        </div>
        <div className="mx-auto mt-10 max-w-6xl">
          <p className="text-xs uppercase tracking-widest text-ocean-muted">Pricing Strategy Advisory</p>
          <h1 className="mt-2 font-display text-4xl text-ocean sm:text-5xl">Stories Pricing Benchmark</h1>
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

        <ReportSection title="Main Menu" report={mainReport} />
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
