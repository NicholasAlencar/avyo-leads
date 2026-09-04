import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./public";

describe("parsePublicEnv", () => {
  it("accepts an entirely unconfigured local environment", () => {
    expect(parsePublicEnv({})).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
    });
  });

  it("rejects a malformed configured Supabase URL", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toThrow("Configuração pública inválida");
  });

  it("returns a valid configured Supabase environment", () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://vio-leads.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://vio-leads.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });
  });
});
