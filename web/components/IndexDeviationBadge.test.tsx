import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { IndexDeviationBadge } from "./IndexDeviationBadge";

describe("IndexDeviationBadge", () => {
  it("renders a red up-arrow with the deviation percent when index is above 100", () => {
    render(<IndexDeviationBadge value={120} />);
    expect(screen.getByText("▲ 20%")).toBeInTheDocument();
  });

  it("renders a violet down-arrow with the deviation percent when index is below 100", () => {
    render(<IndexDeviationBadge value={80} />);
    expect(screen.getByText("▼ 20%")).toBeInTheDocument();
  });

  it("renders a neutral 'at par' label when index is exactly 100", () => {
    render(<IndexDeviationBadge value={100} />);
    expect(screen.getByText("at par")).toBeInTheDocument();
  });

  it("renders nothing when value is null", () => {
    const { container } = render(<IndexDeviationBadge value={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("omits the inline semantic color when inheritColor is set", () => {
    render(<IndexDeviationBadge value={120} inheritColor />);
    const el = screen.getByText("▲ 20%");
    expect(el.style.color).toBe("");
  });
});
