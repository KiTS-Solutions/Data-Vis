import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PortionSizeComparison } from "./PortionSizeComparison";
import type { PortionSizeTable } from "@/lib/data/portionSizeTypes";

const table: PortionSizeTable = {
  meta: { client: "Stories" },
  rows: [
    { brand: "Stories", items_with_portion_data: 7, min_g: 320, max_g: 450, consistent: false },
    { brand: "Wooden Bakery", items_with_portion_data: 9, min_g: 235, max_g: 580, consistent: false },
    { brand: "Zaatar w Zeit", items_with_portion_data: 15, min_g: 360, max_g: 360, consistent: true },
    { brand: "Urban Fresh", items_with_portion_data: 5, min_g: 380, max_g: 500, consistent: false },
    { brand: "Pain D’or", items_with_portion_data: 7, min_g: 450, max_g: 600, consistent: false },
  ],
};

describe("PortionSizeComparison", () => {
  it("renders a row per brand with items-priced and portion-size columns", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByTestId("portion-size-comparison")).toBeInTheDocument();
    expect(screen.getByText("Items Priced")).toBeInTheDocument();
    expect(screen.getByText("Portion Size")).toBeInTheDocument();
    expect(screen.getByText("Stories")).toBeInTheDocument();
    expect(screen.getByText("Wooden Bakery")).toBeInTheDocument();
  });

  it("shows a single gram value for a brand priced at one size everywhere", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const row = screen.getByText("Zaatar w Zeit").closest("tr");
    expect(row).toHaveTextContent("360g");
    expect(row).not.toHaveTextContent("360–360g");
  });

  it("shows a min–max range for a brand whose portion size varies by product", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const row = screen.getByText("Wooden Bakery").closest("tr");
    expect(row).toHaveTextContent("235–580g");
  });

  it("shows a dash for a brand with no portion data at all", () => {
    const tableWithGap: PortionSizeTable = {
      meta: { client: "Stories" },
      rows: [...table.rows, { brand: "The Koozspace", items_with_portion_data: 0, min_g: null, max_g: null, consistent: false }],
    };
    render(<PortionSizeComparison table={tableWithGap} ownBrand="Stories" />);
    const row = screen.getByText("The Koozspace").closest("tr");
    expect(row).toHaveTextContent("—");
  });

  it("highlights the own-brand row", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const row = screen.getByText("Stories").closest("tr");
    const cell = row?.querySelector("td");
    expect(cell?.className).toContain("bg-ocean/5");
  });
});
