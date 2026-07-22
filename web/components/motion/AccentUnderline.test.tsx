import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AccentUnderline } from "./AccentUnderline";

describe("AccentUnderline", () => {
  it("renders without invoking SVG geometry APIs jsdom doesn't implement", () => {
    // Under prefers-reduced-motion (mocked true in vitest.setup.ts), the GSAP
    // draw effect bails out before calling line.getTotalLength(), which jsdom
    // doesn't implement — this test would throw if that guard were removed.
    const { container } = render(<AccentUnderline />);
    expect(container.querySelector("svg line")).toBeInTheDocument();
  });
});
