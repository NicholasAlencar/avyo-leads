import { describe, expect, it } from "vitest";
import { parseLoginCredentials } from "./credentials";

describe("parseLoginCredentials", () => {
  it("normalizes a valid email without changing the password", () => {
    expect(
      parseLoginCredentials({ email: "  USER@Example.com ", password: " secret value " }),
    ).toEqual({ email: "user@example.com", password: " secret value " });
  });

  it("rejects malformed email input", () => {
    expect(() => parseLoginCredentials({ email: "invalid", password: "secret" })).toThrow(
      "Informe um e-mail válido.",
    );
  });

  it("rejects an empty password", () => {
    expect(() => parseLoginCredentials({ email: "user@example.com", password: "" })).toThrow(
      "Informe sua senha.",
    );
  });
});
