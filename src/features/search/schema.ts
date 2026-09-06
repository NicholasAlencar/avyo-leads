import { z } from "zod";

export const companySearchSchema = z.object({
  state: z.string().trim().min(2).max(40),
  city: z.string().trim().min(2).max(120),
  district: z.string().trim().max(120).optional().default(""),
  segment: z.string().trim().min(2).max(120),
  keyword: z.string().trim().max(120).optional().default(""),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
