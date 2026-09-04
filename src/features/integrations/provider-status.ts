import type { ProviderKind, ProviderStatus } from "@/lib/providers/provider";

type Environment = Record<string, string | undefined>;

interface ProviderDefinition {
  kind: ProviderKind;
  label: string;
  required: (env: Environment) => string[];
}

function hasValue(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function missingVariables(env: Environment, keys: string[]): string[] {
  return keys.filter((key) => !hasValue(env[key]));
}

const providers: ProviderDefinition[] = [
  {
    kind: "supabase",
    label: "Supabase",
    required: (env) =>
      missingVariables(env, [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ]),
  },
  {
    kind: "google_places",
    label: "Google Places / Maps",
    required: (env) => missingVariables(env, ["GOOGLE_MAPS_API_KEY"]),
  },
  {
    kind: "ai",
    label: "Inteligência artificial",
    required: (env) => {
      if (env.AI_PROVIDER?.trim() !== "openai") {
        return ["AI_PROVIDER"];
      }

      return missingVariables(env, ["OPENAI_API_KEY"]);
    },
  },
  {
    kind: "gmail",
    label: "Gmail / Google Workspace",
    required: (env) =>
      missingVariables(env, ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]),
  },
  {
    kind: "microsoft",
    label: "Outlook / Microsoft 365",
    required: (env) =>
      missingVariables(env, ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"]),
  },
];

export function getProviderStatuses(env: Environment): ProviderStatus[] {
  return providers.map(({ kind, label, required }) => {
    const missing = required(env);

    return {
      kind,
      label,
      configured: missing.length === 0,
      missing,
    };
  });
}
