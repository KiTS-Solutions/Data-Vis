import { describe, it, expect } from "vitest";
import { formatPortionRange } from "./portion";

describe("formatPortionRange", () => {
  it("renders a single gram value when every priced item used the same portion", () => {
    expect(
      formatPortionRange({ brand: "Zaatar w Zeit", items_with_portion_data: 15, min_g: 360, max_g: 360, consistent: true })
    ).toBe("360g");
  });

  it("renders a min–max range when portion size varies by product", () => {
    expect(
      formatPortionRange({ brand: "Wooden Bakery", items_with_portion_data: 9, min_g: 235, max_g: 580, consistent: false })
    ).toBe("235–580g");
  });

  it("renders an em dash when no portion note was available for the brand", () => {
    expect(
      formatPortionRange({ brand: "The Koozspace", items_with_portion_data: 0, min_g: null, max_g: null, consistent: false })
    ).toBe("—");
  });
});
