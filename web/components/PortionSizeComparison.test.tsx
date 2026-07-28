import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PortionSizeComparison } from "./PortionSizeComparison";
import type { PortionSizeTable } from "@/lib/data/portionSizeTypes";

const table: PortionSizeTable = {
  meta: { client: "Stories" },
  sizes: ["PRICED_G", "ALSO_AVAILABLE_G"],
  rows: [
    { brand: "Stories", PRICED_G: null, ALSO_AVAILABLE_G: null },
    { brand: "Wooden Bakery", PRICED_G: 200, ALSO_AVAILABLE_G: null },
    { brand: "Zaatar w Zeit", PRICED_G: 200, ALSO_AVAILABLE_G: 400 },
    { brand: "Casper & Gambini", PRICED_G: 400, ALSO_AVAILABLE_G: null },
    { brand: "The Koozspace", PRICED_G: 400, ALSO_AVAILABLE_G: null },
    { brand: "Pain D’or", PRICED_G: "500-600", ALSO_AVAILABLE_G: null },
  ],
};

describe("PortionSizeComparison", () => {
  it("renders a row per brand and a column per tier", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getByTestId("portion-size-comparison")).toBeInTheDocument();
    expect(screen.getByText("Priced Portion")).toBeInTheDocument();
    expect(screen.getByText("Also Available At")).toBeInTheDocument();
    expect(screen.getByText("Stories")).toBeInTheDocument();
    expect(screen.getByText("Wooden Bakery")).toBeInTheDocument();
  });

  it("shows a dash for a brand with no gram data specified", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows Zaatar w Zeit's alternate 400g size alongside its 200g priced portion", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const row = screen.getByText("Zaatar w Zeit").closest("tr");
    expect(row).not.toBeNull();
    expect(row).toHaveTextContent("200g");
    expect(row).toHaveTextContent("400g");
  });

  it("flags Wooden Bakery and Zaatar w Zeit as priced below the 400g standard", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const wbCell = screen.getByText("Wooden Bakery").closest("tr")?.querySelector("td");
    const zwzCell = screen.getByText("Zaatar w Zeit").closest("tr")?.querySelector("td");
    expect(wbCell?.className).toContain("bg-amber-100");
    expect(zwzCell?.className).toContain("bg-amber-100");
  });

  it("does not flag brands priced at the 400g standard", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const cgCell = screen.getByText("Casper & Gambini").closest("tr")?.querySelector("td");
    expect(cgCell?.className).not.toContain("bg-amber-100");
  });

  it("renders Pain D'or's ranged portion note without flagging it as below standard", () => {
    render(<PortionSizeComparison table={table} ownBrand="Stories" />);
    const row = screen.getByText("Pain D’or").closest("tr");
    expect(row).toHaveTextContent("500-600g");
    const cell = row?.querySelector("td");
    expect(cell?.className).not.toContain("bg-amber-100");
  });
});
