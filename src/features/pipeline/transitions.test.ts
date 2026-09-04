import { describe, expect, it } from "vitest";
import { canTransition, validateStageChange } from "./transitions";

describe("pipeline transitions", () => {
  it("permits a lost lead to return to analysis", () => {
    expect(canTransition("LOST", "ANALYZING")).toBe(true);
  });

  it("rejects skipping directly from new to client", () => {
    expect(canTransition("NEW", "CLIENT")).toBe(false);
  });

  it("rejects every unchanged stage as a no-op", () => {
    expect(() =>
      validateStageChange({ from: "PRIORITY", to: "PRIORITY", confirmed: true }),
    ).toThrow("já está");
  });

  it("requires explicit confirmation before moving a client to lost", () => {
    expect(() =>
      validateStageChange({ from: "CLIENT", to: "LOST", confirmed: false }),
    ).toThrow("confirmação");

    expect(() =>
      validateStageChange({ from: "CLIENT", to: "LOST", confirmed: true }),
    ).not.toThrow();
  });

  it("rejects transitions outside the defined workflow", () => {
    expect(() =>
      validateStageChange({ from: "NEW", to: "PROPOSAL", confirmed: true }),
    ).toThrow("não permitida");
  });
});
