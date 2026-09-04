import { describe, expect, it } from "vitest";
import { brand } from "./brand";

describe("brand", () => {
  it("identifies the internal commercial intelligence product", () => {
    expect(brand).toEqual({
      name: "VIO LEADS",
      description: "Inteligência comercial interna da VIO",
    });
  });
});
