import { describe, it, expect } from "vitest";
import { formatReportPeriod } from "./date";

describe("formatReportPeriod", () => {
  it("formats an ISO date as an unambiguous Month Year, dropping the fabricated day", () => {
    expect(formatReportPeriod("2026-03-01")).toBe("March 2026");
  });

  it("returns the original string unchanged if it doesn't match ISO date shape", () => {
    expect(formatReportPeriod("March 2026")).toBe("March 2026");
  });
});
