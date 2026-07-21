import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReportSection } from "./ReportSection";
import { PresenterModeProvider } from "@/lib/presenter/PresenterModeContext";
import type { PricingReport } from "@/lib/data/types";

function buildReport(): PricingReport {
  return {
    meta: {
      client: "Stories",
      report_date: "2026-07-22",
      currency: "LBP",
      fx_usd_rate: 89600,
      fx_rate_date: "2026-07-20",
      fx_source: "test",
      own_brand: "Stories",
      competitors: ["Pinkberry"],
    },
    products: [
      {
        category: "Frozen Yogurt",
        product: "Original Yogurt SMALL",
        prices_lbp: { Stories: 500000, Pinkberry: 450000 },
        own_price_lbp: 500000,
        competitor_avg_lbp: 450000,
        price_index: 111.1,
        comparability: "high",
        tier: "Core",
        is_outlier: false,
        outlier_direction: null,
      },
    ],
    categories: [
      { category: "Frozen Yogurt", product_count: 1, countable_product_count: 1, avg_price_index: 111.1 },
    ],
    data_quality_warnings: [],
  };
}

describe("ReportSection", () => {
  it("renders the group title and all five sub-views", () => {
    render(
      <PresenterModeProvider>
        <ReportSection title="Frozen Yogurt Bar" report={buildReport()} />
      </PresenterModeProvider>
    );

    expect(screen.getByRole("heading", { level: 2, name: "Frozen Yogurt Bar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Competitive Landscape at a Glance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Category Positioning" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Price Positioning Map" })).toBeInTheDocument();
    expect(screen.getByText("Findings & Recommendations")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Full Data Explorer" })).toBeInTheDocument();
    expect(screen.getByTestId("category-brand-heatmap")).toBeInTheDocument();
  });
});
