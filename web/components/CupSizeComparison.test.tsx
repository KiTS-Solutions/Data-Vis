import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CupSizeComparison } from "./CupSizeComparison";
import type { CupSizeTable } from "@/lib/data/cupSizeTypes";

const table: CupSizeTable = {
  meta: { client: "Stories" },
  sizes: ["S", "M", "L", "TO_GO", "DINE_IN"],
  rows: [
    { brand: "Pinkberry", S: "3-5", M: 8, L: 13, TO_GO: 25, DINE_IN: null },
    { brand: "Fro - U", S: 3.5, M: 5.3, L: 10, TO_GO: 20, DINE_IN: 4.3 },
    { brand: "Cremino", S: 5.75, M: null, L: 8.25, TO_GO: null, DINE_IN: null },
    { brand: "Stories", S: 12, M: 16, L: 20, TO_GO: null, DINE_IN: null },
  ],
};

describe("CupSizeComparison", () => {
  it("renders a row per size tier and a column per brand", () => {
    render(<CupSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByTestId("cup-size-comparison")).toBeInTheDocument();
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Dine In")).toBeInTheDocument();
    expect(screen.getByText("Stories")).toBeInTheDocument();
    expect(screen.getByText("Pinkberry")).toBeInTheDocument();
  });

  it("preserves a range value as-is instead of forcing a single number", () => {
    render(<CupSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByText("3-5 oz")).toBeInTheDocument();
  });

  it("shows a dash for a missing brand/size combination", () => {
    render(<CupSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows the own brand's numeric values", () => {
    render(<CupSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByText("12 oz")).toBeInTheDocument();
    expect(screen.getByText("16 oz")).toBeInTheDocument();
  });
});
