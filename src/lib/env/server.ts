import "server-only";
import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().min(1).optional(),
);

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: optionalSecret,
  APP_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.url().default("http://localhost:3000"),
  ),
  ENABLE_DEVELOPMENT_SEED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  GOOGLE_MAPS_API_KEY: optionalSecret,
  AI_PROVIDER: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.enum(["openai"]).optional(),
  ),
  OPENAI_API_KEY: optionalSecret,
  GOOGLE_CLIENT_ID: optionalSecret,
  GOOGLE_CLIENT_SECRET: optionalSecret,
  MICROSOFT_CLIENT_ID: optionalSecret,
  MICROSOFT_CLIENT_SECRET: optionalSecret,
  CRON_SECRET: optionalSecret,
  ENCRYPTION_KEY: optionalSecret,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv = serverEnvSchema.parse({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  APP_URL: process.env.APP_URL,
  ENABLE_DEVELOPMENT_SEED: process.env.ENABLE_DEVELOPMENT_SEED,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
});
