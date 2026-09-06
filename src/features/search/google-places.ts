import "server-only";
import { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import type { ProviderResult } from "@/lib/providers/provider";

export interface CompanySearchInput {
  state: string;
  city: string;
  district?: string;
  segment: string;
  keyword?: string;
  limit: number;
}

export interface CompanySearchResult {
  placeId: string;
  companyName: string;
  category: string | null;
  address: string | null;
  city: string | null;
  stateCode: string | null;
  phone: string | null;
  websiteUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string | null;
}

const responseSchema = z.object({
  places: z.array(z.object({
    id: z.string(),
    displayName: z.object({ text: z.string() }),
    primaryTypeDisplayName: z.object({ text: z.string() }).optional(),
    formattedAddress: z.string().optional(),
    addressComponents: z.array(z.object({ longText: z.string(), shortText: z.string(), types: z.array(z.string()) })).optional(),
    nationalPhoneNumber: z.string().optional(),
    websiteUri: z.string().optional(),
    rating: z.number().optional(),
    userRatingCount: z.number().int().optional(),
    googleMapsUri: z.string().optional(),
  })).default([]),
});

function addressPart(parts: z.infer<typeof responseSchema>["places"][number]["addressComponents"], type: string, short = false) {
  const part = parts?.find((item) => item.types.includes(type));
  return part ? (short ? part.shortText : part.longText) : null;
}

export async function searchGooglePlaces(input: CompanySearchInput): Promise<ProviderResult<CompanySearchResult[]>> {
  if (!serverEnv.GOOGLE_MAPS_API_KEY) {
    return { ok: false, code: "not_configured", message: "Integração Google Places não configurada." };
  }

  const location = [input.district, input.city, input.state, "Brasil"].filter(Boolean).join(", ");
  const textQuery = [input.segment, input.keyword, "em", location].filter(Boolean).join(" ");
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": serverEnv.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.addressComponents,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri",
      },
      body: JSON.stringify({ textQuery, languageCode: "pt-BR", regionCode: "BR", pageSize: input.limit }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status === 429) return { ok: false, code: "rate_limited", message: "Limite do Google Places atingido. Tente novamente em instantes." };
    if (!response.ok) return { ok: false, code: "provider_unavailable", message: "O Google Places não respondeu à busca." };
    const parsed = responseSchema.parse(await response.json());
    return {
      ok: true,
      data: parsed.places.map((place) => ({
        placeId: place.id,
        companyName: place.displayName.text,
        category: place.primaryTypeDisplayName?.text ?? null,
        address: place.formattedAddress ?? null,
        city: addressPart(place.addressComponents, "administrative_area_level_2"),
        stateCode: addressPart(place.addressComponents, "administrative_area_level_1", true),
        phone: place.nationalPhoneNumber ?? null,
        websiteUrl: place.websiteUri ?? null,
        rating: place.rating ?? null,
        reviewCount: place.userRatingCount ?? null,
        googleMapsUrl: place.googleMapsUri ?? null,
      })),
    };
  } catch {
    return { ok: false, code: "provider_unavailable", message: "Não foi possível consultar o Google Places agora." };
  }
}
