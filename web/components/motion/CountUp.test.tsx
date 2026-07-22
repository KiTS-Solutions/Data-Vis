import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CountUp } from "./CountUp";

describe("CountUp", () => {
  it("renders the final formatted value immediately under prefers-reduced-motion", () => {
    // vitest.setup.ts mocks matchMedia to report prefers-reduced-motion: reduce,
    // so this exercises the same static fallback real reduced-motion users get.
    render(<CountUp value={45000} format={(n) => `${Math.round(n).toLocaleString("en-US")} LBP`} />);
    expect(screen.getByText("45,000 LBP")).toBeInTheDocument();
  });

  it("renders zero correctly, not a falsy blank", () => {
    render(<CountUp value={0} format={(n) => `${n} items`} />);
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("applies the given className to the rendered span", () => {
    render(<CountUp value={10} format={(n) => `${n}`} className="text-2xl" />);
    expect(screen.getByText("10")).toHaveClass("text-2xl");
  });
});
