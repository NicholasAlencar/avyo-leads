import { describe, expect, it } from "vitest";
import { calculateRates } from "./metrics";
describe("commercial rates", () => {
  it("returns zero for empty denominators", () => {
    expect(calculateRates({ found: 0, contacted: 0, replies: 0, meetings: 0, clients: 0 })).toEqual({ responseRate: 0, meetingRate: 0, closingRate: 0, conversionRate: 0 });
  });
  it("uses explicit funnel denominators", () => {
    expect(calculateRates({ found: 100, contacted: 40, replies: 10, meetings: 5, clients: 2 })).toEqual({ responseRate: 25, meetingRate: 12.5, closingRate: 40, conversionRate: 2 });
  });
});
