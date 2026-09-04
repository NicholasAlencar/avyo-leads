import { describe, expect, it } from "vitest";
import { mapAuthError } from "./auth-result";

describe("mapAuthError", () => {
  it("maps invalid credentials without exposing provider details", () => {
    expect(mapAuthError({ code: "invalid_credentials", message: "provider detail" })).toBe(
      "E-mail ou senha inválidos.",
    );
  });

  it("maps missing configuration to an actionable safe message", () => {
    expect(mapAuthError({ code: "not_configured", message: "secret name" })).toBe(
      "Integração não configurada.",
    );
  });

  it("hides unexpected authentication errors", () => {
    expect(mapAuthError(new Error("sensitive upstream response"))).toBe(
      "Não foi possível entrar. Tente novamente.",
    );
  });
});
