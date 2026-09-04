import { z } from "zod";
import { pipelineStages } from "@/features/pipeline/stages";
import type { LeadFilters } from "./types";

export type LeadSearchParams = Record<string, string | string[] | undefined>;

const sorts = [
  "score_desc",
  "opportunity_desc",
  "company_desc",
  "recent_desc",
  "digital_desc",
] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function trimmed(value: string | string[] | undefined, max = 120): string | undefined {
  const result = first(value)?.trim();
  return result && result.length <= max ? result : undefined;
}

export function parseLeadSearchParams(params: LeadSearchParams): LeadFilters {
  const stageValue = first(params.stage);
  const ownerValue = first(params.owner);
  const stateValue = first(params.state)?.trim().toUpperCase();
  const sortValue = first(params.sort);
  const pageValue = Number(first(params.page));
  const pageSizeValue = Number(first(params.pageSize));

  const stage = z.enum(pipelineStages).safeParse(stageValue);
  const owner = z.uuid().safeParse(ownerValue);
  const sort = z.enum(sorts).safeParse(sortValue);

  return {
    ...(trimmed(params.q) ? { query: trimmed(params.q) } : {}),
    ...(stage.success ? { stage: stage.data } : {}),
    ...(owner.success ? { ownerId: owner.data } : {}),
    ...(stateValue && /^[A-Z]{2}$/.test(stateValue) ? { stateCode: stateValue } : {}),
    ...(trimmed(params.city) ? { city: trimmed(params.city) } : {}),
    ...(trimmed(params.segment) ? { segment: trimmed(params.segment) } : {}),
    sort: sort.success ? sort.data : "score_desc",
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    pageSize:
      pageSizeValue === 50 || pageSizeValue === 100
        ? pageSizeValue
        : 25,
  };
}
