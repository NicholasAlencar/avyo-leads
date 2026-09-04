import type { PipelineStage } from "@/features/pipeline/stages";

export interface LeadMutationInput {
  companyName: string;
  normalizedName: string;
  legalName?: string;
  tradingName?: string;
  segment?: string;
  category?: string;
  description?: string;
  cnpj?: string;
  normalizedCnpj?: string;
  stateCode?: string;
  city?: string;
  district?: string;
  addressLine?: string;
  postalCode?: string;
  phone?: string;
  normalizedPhone?: string;
  whatsapp?: string;
  email?: string;
  websiteUrl?: string;
  normalizedDomain?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  potentialValue?: number;
}

export interface LeadSummary {
  id: string;
  companyName: string;
  segment: string | null;
  city: string | null;
  stateCode: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  pipelineStage: PipelineStage;
  ownerId: string | null;
  ownerName: string | null;
  score: number | null;
  opportunityReason: string | null;
  lastActivityAt: string | null;
  createdAt: string;
}

export interface LeadDetail extends LeadSummary {
  legalName: string | null;
  tradingName: string | null;
  category: string | null;
  description: string | null;
  cnpj: string | null;
  district: string | null;
  addressLine: string | null;
  postalCode: string | null;
  whatsapp: string | null;
  googleMapsUrl: string | null;
  googlePlaceId: string | null;
  potentialValue: number | null;
  isFavorite: boolean;
  optedOutAt: string | null;
  discardedAt: string | null;
}

export interface LeadFilters {
  query?: string;
  stage?: PipelineStage;
  ownerId?: string;
  stateCode?: string;
  city?: string;
  segment?: string;
  sort: "score_desc" | "opportunity_desc" | "company_desc" | "recent_desc" | "digital_desc";
  page: number;
  pageSize: 25 | 50 | 100;
}
