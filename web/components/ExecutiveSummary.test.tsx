import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExecutiveSummary } from "./ExecutiveSummary";

describe("ExecutiveSummary", () => {
  it("renders the six KPI tiles with real dataset-derived data, no coverage tile", () => {
    render(
      <ExecutiveSummary
        kpis={{
          overallAvgIndex: 97.5,
          itemsBenchmarked: 306,
          repricingCandidates: 12,
          tradeUpOpportunities: 7,
          topOverIndexed: [{ category: "Sandwiches", product_count: 10, countable_product_count: 8, avg_price_index: 134 }],
          topUnderIndexed: [{ category: "Tea", product_count: 5, countable_product_count: 4, avg_price_index: 72 }],
        }}
      />
    );

    expect(screen.getByText("97.5")).toBeInTheDocument();
    expect(screen.getByText("306")).toBeInTheDocument();
    expect(screen.getByText("Repricing Candidates")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Trade-Up Opportunities")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("134")).toBeInTheDocument();
    expect(screen.getByText("Sandwiches")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Tea")).toBeInTheDocument();
    expect(screen.queryByText(/Coverage/)).not.toBeInTheDocument();
  });
});
