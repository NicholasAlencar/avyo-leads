import { describe, expect, it } from "vitest";
import { parseFollowupInput } from "./schema";

const valid = {
  leadId: "4a90b17c-76de-4854-93e7-e172a5952b91",
  ownerId: "69e6fc24-5310-4a0d-a43b-22a557fb3820",
  dueAt: "2026-09-06T10:00:00-03:00",
  cadencePosition: 0,
};

describe("parseFollowupInput", () => {
  it("accepts an explicit timezone-aware due date", () => {
    expect(parseFollowupInput(valid)).toMatchObject(valid);
  });

  it("rejects a timestamp without timezone", () => {
    expect(() => parseFollowupInput({ ...valid, dueAt: "2026-09-06T10:00:00" })).toThrow("fuso");
  });

  it("rejects invalid owners and negative cadence positions", () => {
    expect(() => parseFollowupInput({ ...valid, ownerId: "invalid" })).toThrow("Responsável");
    expect(() => parseFollowupInput({ ...valid, cadencePosition: -1 })).toThrow("cadência");
  });
});
