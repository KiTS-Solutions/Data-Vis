import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Methodology } from "./Methodology";
import type { ReportMeta, DataQualityWarning, UnparseablePriceWarning } from "@/lib/data/types";

type SourcedWarning = DataQualityWarning & { source: string };
type SourcedUnparseableWarning = UnparseablePriceWarning & { source: string };

const meta: ReportMeta = {
  client: "Stories",
  report_date: "2026-03-01",
  currency: "LBP",
  fx_usd_rate: 89600,
  fx_rate_date: "2026-07-20",
  fx_source: "lira-rate.com",
  own_brand: "Stories",
  competitors: ["Espresso Lab"],
  generated_from: "raw-data/Pricing.xlsx",
};

describe("Methodology", () => {
  it("explains the price index formula and data provenance", () => {
    render(<Methodology meta={meta} warnings={[]} />);
    expect(screen.getByText(/no prices were estimated, interpolated, or invented/)).toBeInTheDocument();
    expect(screen.getByText("Price Index")).toBeInTheDocument();
    expect(screen.getByText(/competitor-only average/)).toBeInTheDocument();
  });

  it("surfaces data quality warnings when present, tagged with their source report", () => {
    const warnings: SourcedWarning[] = [
      {
        category: "Pastries",
        product: "CHOCOLATE ÉCLAIR",
        brand: "Espresso Lab",
        conflicting_prices_lbp: [500000, 400000],
        source: "Main Menu",
      },
    ];
    render(<Methodology meta={meta} warnings={warnings} />);
    expect(screen.getByText(/CHOCOLATE ÉCLAIR/)).toBeInTheDocument();
    expect(screen.getByText(/Main Menu, Espresso Lab/)).toBeInTheDocument();
    expect(screen.getByText(/500,000 LBP vs\. 400,000 LBP/)).toBeInTheDocument();
  });

  it("aggregates warning counts across multiple source reports", () => {
    const warnings: SourcedWarning[] = [
      { category: "Pastries", product: "CHOCOLATE ÉCLAIR", brand: "Espresso Lab", conflicting_prices_lbp: [500000, 400000], source: "Main Menu" },
      { category: "Blended Drinks", product: "Chocolate Cream Frap", brand: "Stories", conflicting_prices_lbp: [700000, 800000], source: "Non-Dairy Menu" },
    ];
    render(<Methodology meta={meta} warnings={warnings} />);
    expect(screen.getByText(/had 2 rows/)).toBeInTheDocument();
    expect(screen.getByText(/Non-Dairy Menu, Stories/)).toBeInTheDocument();
  });

  it("omits the data quality section when there are no warnings", () => {
    render(<Methodology meta={meta} warnings={[]} />);
    expect(screen.queryByText("Data quality notes")).not.toBeInTheDocument();
  });

  it("surfaces unparseable-price warnings, tagged with their source report", () => {
    const unparseablePriceWarnings: SourcedUnparseableWarning[] = [
      {
        category: "Blended Drinks",
        product: "White Mocha Cream Frap MEDIUM",
        brand: "Espresso Lab",
        raw_value: "8000,00",
        source: "Non-Dairy Menu",
      },
    ];
    render(<Methodology meta={meta} warnings={[]} unparseablePriceWarnings={unparseablePriceWarnings} />);
    expect(screen.getByText("Data quality notes")).toBeInTheDocument();
    expect(screen.getByText(/White Mocha Cream Frap MEDIUM/)).toBeInTheDocument();
    expect(screen.getByText(/Non-Dairy Menu, Espresso Lab: raw value "8000,00"/)).toBeInTheDocument();
  });

  it("shows both warning kinds together when both are present", () => {
    const warnings: SourcedWarning[] = [
      { category: "Pastries", product: "CHOCOLATE ÉCLAIR", brand: "Espresso Lab", conflicting_prices_lbp: [500000, 400000], source: "Main Menu" },
    ];
    const unparseablePriceWarnings: SourcedUnparseableWarning[] = [
      { category: "Blended Drinks", product: "White Mocha Cream Frap MEDIUM", brand: "Espresso Lab", raw_value: "8000,00", source: "Non-Dairy Menu" },
    ];
    render(<Methodology meta={meta} warnings={warnings} unparseablePriceWarnings={unparseablePriceWarnings} />);
    expect(screen.getByText(/CHOCOLATE ÉCLAIR/)).toBeInTheDocument();
    expect(screen.getByText(/White Mocha Cream Frap MEDIUM/)).toBeInTheDocument();
  });

  it("states the FX rate date falls after the report period when it does", () => {
    // meta: fx_rate_date 2026-07-20 is after report_date 2026-03-01
    render(<Methodology meta={meta} warnings={[]} />);
    expect(screen.getByText(/FX rate date falls after the report period/)).toBeInTheDocument();
  });

  it("states the FX rate date falls before the report period when it does", () => {
    const laterReportMeta: ReportMeta = { ...meta, report_date: "2026-07-30", fx_rate_date: "2026-07-20" };
    render(<Methodology meta={laterReportMeta} warnings={[]} />);
    expect(screen.getByText(/FX rate date falls before the report period/)).toBeInTheDocument();
  });

  it("attributes prices to the client's spreadsheets generically, not one named file", () => {
    render(<Methodology meta={meta} warnings={[]} />);
    expect(screen.getByText(/pricing spreadsheets/)).toBeInTheDocument();
  });
});
