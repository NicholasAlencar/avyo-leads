export type ProviderKind =
  | "supabase"
  | "google_places"
  | "ai"
  | "gmail"
  | "microsoft";

export type ProviderErrorCode =
  | "not_configured"
  | "invalid_request"
  | "rate_limited"
  | "provider_unavailable";

export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ProviderErrorCode; message: string };

export interface ProviderStatus {
  kind: ProviderKind;
  label: string;
  configured: boolean;
  missing: string[];
}

export interface Provider<TInput, TOutput> {
  readonly kind: ProviderKind;
  getStatus(): ProviderStatus;
  execute(input: TInput): Promise<ProviderResult<TOutput>>;
}
