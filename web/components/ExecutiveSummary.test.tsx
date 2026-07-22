import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExecutiveSummary } from "./ExecutiveSummary";

// The item count is rendered by <CountUp>, a nested <span>, so the sentence
// is split across elements — getByText's default matcher only looks at an
// element's own direct text-node children, not text through a child element.
// Match on full textContent instead, per Testing Library's guidance for text
// split across elements.
const withText = (text: string) => (_: string, element: Element | null) => element?.textContent === text;

describe("ExecutiveSummary", () => {
  it("renders a plain-language headline and one scorecard tile per report", () => {
    render(
      <ExecutiveSummary
        fxRate={89600}
        scorecards={[
          { reportLabel: "Main Menu", itemCount: 120, avgGapLbp: 45000, overpricedCount: 8, underpricedCount: 3 },
          { reportLabel: "Frozen Yogurt Bar", itemCount: 30, avgGapLbp: -20000, overpricedCount: 1, underpricedCount: 5 },
        ]}
      />
    );

    expect(screen.getByText("Priced above market in Main Menu; below market in Frozen Yogurt Bar.")).toBeInTheDocument();
    expect(screen.getByText("Main Menu")).toBeInTheDocument();
    expect(screen.getByText(withText("120 items benchmarked"))).toBeInTheDocument();
    expect(screen.getByText("Frozen Yogurt Bar")).toBeInTheDocument();
    expect(screen.getByText(withText("30 items benchmarked"))).toBeInTheDocument();
    expect(screen.getByText("20,000 LBP ($0.22)")).toBeInTheDocument();
    expect(screen.getByText(/average gap vs\. market — below market/)).toBeInTheDocument();
    expect(screen.getByText("8 above market · 3 below market")).toBeInTheDocument();
  });

  it("shows an em-dash when a report has no comparable priced items", () => {
    render(
      <ExecutiveSummary
        fxRate={89600}
        scorecards={[{ reportLabel: "Empty Group", itemCount: 0, avgGapLbp: null, overpricedCount: 0, underpricedCount: 0 }]}
      />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
