import { describe, expect, it } from "vitest";
import { parseNoteInput, parseRelationId } from "./related-input";

describe("related lead inputs", () => {
  it("trims an internal note and preserves its text", () => {
    expect(parseNoteInput("  Priorizar contato com o sócio.  ")).toBe(
      "Priorizar contato com o sócio.",
    );
  });

  it("rejects empty and oversized notes", () => {
    expect(() => parseNoteInput(" ")).toThrow("nota");
    expect(() => parseNoteInput("a".repeat(5001))).toThrow("5.000");
  });

  it("accepts only UUID relation identifiers", () => {
    expect(parseRelationId("4a90b17c-76de-4854-93e7-e172a5952b91")).toBe(
      "4a90b17c-76de-4854-93e7-e172a5952b91",
    );
    expect(() => parseRelationId("other-organization-record")).toThrow("Identificador");
  });
});
