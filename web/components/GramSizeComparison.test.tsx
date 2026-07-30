import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GramSizeComparison } from "./GramSizeComparison";
import type { GramSizeTable } from "@/lib/data/gramSizeTypes";

const table: GramSizeTable = {
  meta: { client: "Stories" },
  sizes: ["S", "M", "L", "FAMILY"],
  rows: [
    { brand: "Pinkberry", S: 140, M: 230, L: 370, FAMILY: 707 },
    { brand: "Fro - U", S: 100, M: 150, L: 220, FAMILY: null },
    { brand: "Cremino", S: 170, M: null, L: 244, FAMILY: null },
    { brand: "Stories", S: 355, M: 473, L: 591, FAMILY: null },
  ],
};

describe("GramSizeComparison", () => {
  it("renders a row per size tier and a column per brand", () => {
    render(<GramSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByTestId("gram-size-comparison")).toBeInTheDocument();
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Family")).toBeInTheDocument();
    expect(screen.getByText("Stories")).toBeInTheDocument();
    expect(screen.getByText("Pinkberry")).toBeInTheDocument();
  });

  it("formats a numeric value with a g suffix", () => {
    render(<GramSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByText("140 g")).toBeInTheDocument();
    expect(screen.getByText("707 g")).toBeInTheDocument();
  });

  it("shows a dash for a missing brand/size combination", () => {
    render(<GramSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows the own brand's numeric values", () => {
    render(<GramSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByText("355 g")).toBeInTheDocument();
    expect(screen.getByText("473 g")).toBeInTheDocument();
    expect(screen.getByText("591 g")).toBeInTheDocument();
  });
});
