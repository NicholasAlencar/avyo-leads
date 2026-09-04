import { describe, expect, it } from "vitest";
import { getProviderStatuses } from "./provider-status";

describe("getProviderStatuses", () => {
  it("reports Supabase as unconfigured when its publishable key is absent", () => {
    const statuses = getProviderStatuses({
      NEXT_PUBLIC_SUPABASE_URL: "https://vio-leads.supabase.co",
    });

    expect(statuses.find((item) => item.kind === "supabase")).toEqual({
      kind: "supabase",
      label: "Supabase",
      configured: false,
      missing: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    });
  });

  it("reports every missing Gmail OAuth variable", () => {
    const statuses = getProviderStatuses({ GOOGLE_CLIENT_ID: "client-id" });

    expect(statuses.find((item) => item.kind === "gmail")).toEqual({
      kind: "gmail",
      label: "Gmail / Google Workspace",
      configured: false,
      missing: ["GOOGLE_CLIENT_SECRET"],
    });
  });

  it("requires the selected AI provider secret", () => {
    const statuses = getProviderStatuses({ AI_PROVIDER: "openai" });

    expect(statuses.find((item) => item.kind === "ai")).toEqual({
      kind: "ai",
      label: "Inteligência artificial",
      configured: false,
      missing: ["OPENAI_API_KEY"],
    });
  });

  it("does not report an unsupported AI adapter as configured", () => {
    const statuses = getProviderStatuses({
      AI_PROVIDER: "unsupported",
      OPENAI_API_KEY: "provider-key",
    });

    expect(statuses.find((item) => item.kind === "ai")).toMatchObject({
      configured: false,
      missing: ["AI_PROVIDER"],
    });
  });

  it("treats whitespace-only credentials as absent", () => {
    const statuses = getProviderStatuses({ GOOGLE_MAPS_API_KEY: "   " });

    expect(statuses.find((item) => item.kind === "google_places")?.configured).toBe(false);
  });

  it("reports configured providers only when all required values exist", () => {
    const statuses = getProviderStatuses({
      NEXT_PUBLIC_SUPABASE_URL: "https://vio-leads.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      GOOGLE_MAPS_API_KEY: "maps-key",
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "openai-key",
      GOOGLE_CLIENT_ID: "google-client",
      GOOGLE_CLIENT_SECRET: "google-secret",
      MICROSOFT_CLIENT_ID: "microsoft-client",
      MICROSOFT_CLIENT_SECRET: "microsoft-secret",
    });

    expect(statuses).toHaveLength(5);
    expect(statuses.every((item) => item.configured)).toBe(true);
  });
});
