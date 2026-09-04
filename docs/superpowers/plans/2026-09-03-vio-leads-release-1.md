# VIO LEADS Release 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a secure, persistent VIO LEADS foundation with internal authentication, organization-scoped CRM, pipeline, dashboard, follow-ups, suppression, audit history, and honest integration status.

**Architecture:** Build a modular Next.js App Router application backed by Supabase Auth and PostgreSQL. Keep domain rules in framework-independent feature modules, use authenticated server reads and server actions for business mutations, and protect every exposed table with organization-aware RLS.

**Tech Stack:** Next.js 16.3.4, React 19.2.8, strict TypeScript 5.9.x, Tailwind CSS 4.3.3, shadcn/ui, Supabase JS 2.115.0, Supabase SSR 0.12.5, Zod 4.5.4, TanStack Table 9.2.4, Vitest 5.0.0, Testing Library, and Playwright 1.62.1.

**Spec:** `docs/superpowers/specs/2026-09-03-vio-leads-foundation-design.md`

## Global Constraints

- Use only public business information, official APIs, and authorized integrations.
- Never fabricate lead, provider, email, score, or analytics data.
- Missing credentials must produce `INTEGRAÇÃO NÃO CONFIGURADA` and disable the dependent action.
- All persisted business rows belong to an organization and all exposed tables use RLS.
- Never use user-editable Supabase metadata for authorization.
- Never expose `SUPABASE_SECRET_KEY`, OAuth secrets, `CRON_SECRET`, or `ENCRYPTION_KEY` to the browser.
- Outreach remains draft-only in Release 1 and no message can be sent automatically.
- Contact suppression is enforced before any future sending path.
- Preserve immutable activity, score-version, and audit history.
- Production copy uses Brazilian Portuguese and treats inferred information as an estimate or hypothesis.
- Run every relevant test, lint, type-check, production build, and database verification before a completion claim.
- Docker and the Supabase CLI were absent during planning; SQL execution requires Docker Desktop or a configured Supabase project and must never be replaced with an in-memory production path.

## Planned File Map

```text
package.json                         pinned scripts and dependencies
package-lock.json                    reproducible dependency graph
.env.example                        documented public and server-only variables
.gitignore                          generated files and local secrets
next.config.ts                      security headers and Next.js configuration
vitest.config.ts                    unit/component test configuration
playwright.config.ts                browser test configuration
proxy.ts                            Supabase cookie refresh and route protection support
src/app/                            App Router routes and layouts
src/components/                     shared UI primitives and application shell
src/features/auth/                  login actions and identity helpers
src/features/leads/                 lead rules, queries, actions, table, and detail UI
src/features/pipeline/              pipeline stages, transitions, and board
src/features/dashboard/             metric definitions, queries, and dashboard UI
src/features/followups/             follow-up rules and actions
src/features/integrations/          capability/configuration registry and status UI
src/features/privacy/               suppression rules and actions
src/lib/env/                        validated public and server environment access
src/lib/providers/                  provider contracts and not-configured behavior
src/lib/supabase/                   browser/server/admin clients and generated types
src/lib/security/                   authorization, rate limiting, and audit helpers
supabase/migrations/                schema, indexes, RLS, grants, and audit triggers
supabase/tests/                      pgTAP authorization and persistence tests
tests/e2e/                           critical browser workflows
```

---

### Task 1: Application and test foundation

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.gitignore`
- Create: `eslint.config.mjs`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/lib/brand.ts`
- Test: `src/lib/brand.test.ts`

**Interfaces:**
- Produces: `brand: { name: "VIO LEADS"; description: string }`
- Produces: npm scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:run`, and `test:e2e`

- [ ] **Step 1: Write the failing brand test**

```ts
import { describe, expect, it } from "vitest";
import { brand } from "./brand";

describe("brand", () => {
  it("identifies the internal commercial intelligence product", () => {
    expect(brand).toEqual({
      name: "VIO LEADS",
      description: "Inteligência comercial interna da VIO",
    });
  });
});
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `npm test -- --run src/lib/brand.test.ts`

Expected: FAIL because `src/lib/brand.ts` does not exist.

- [ ] **Step 3: Create the pinned project foundation**

Create `package.json` with Node `>=24`, exact runtime versions listed in the plan header, exact resolved development versions, and the scripts below:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Install with `npm install --save-exact` so `package-lock.json` is authoritative. Configure `src/app/page.tsx` as a minimal server-rendered entry page and add this production implementation:

```ts
export const brand = {
  name: "VIO LEADS",
  description: "Inteligência comercial interna da VIO",
} as const;
```

- [ ] **Step 4: Add baseline security headers**

Configure `next.config.ts` with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `X-Frame-Options: DENY`. Do not add a permissive Content Security Policy before required Supabase and OAuth origins are known.

- [ ] **Step 5: Verify the foundation**

Run: `npm run test:run && npm run lint && npm run typecheck && npm run build`

Expected: brand test passes and every command exits 0.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore eslint.config.mjs next.config.ts tsconfig.json postcss.config.mjs vitest.config.ts src
git commit -m "chore: establish VIO Leads application foundation"
```

---

### Task 2: Validated environment and provider capability contracts

**Files:**
- Create: `.env.example`
- Create: `src/lib/env/public.ts`
- Create: `src/lib/env/server.ts`
- Create: `src/lib/providers/provider.ts`
- Create: `src/features/integrations/provider-status.ts`
- Test: `src/features/integrations/provider-status.test.ts`

**Interfaces:**
- Produces: `ProviderKind = "supabase" | "google_places" | "ai" | "gmail" | "microsoft"`
- Produces: `ProviderStatus = { kind: ProviderKind; configured: boolean; label: string; missing: string[] }`
- Produces: `getProviderStatuses(env: Record<string, string | undefined>): ProviderStatus[]`
- Produces: `ProviderResult<T> = { ok: true; data: T } | { ok: false; code: "not_configured" | "invalid_request" | "rate_limited" | "provider_unavailable"; message: string }`

- [ ] **Step 1: Write failing provider-status tests**

```ts
import { describe, expect, it } from "vitest";
import { getProviderStatuses } from "./provider-status";

describe("getProviderStatuses", () => {
  it("reports Supabase as unconfigured when either public value is absent", () => {
    const result = getProviderStatuses({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" });
    expect(result.find((item) => item.kind === "supabase")).toMatchObject({
      configured: false,
      missing: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    });
  });

  it("requires both OAuth values for Gmail", () => {
    const result = getProviderStatuses({ GOOGLE_CLIENT_ID: "client" });
    expect(result.find((item) => item.kind === "gmail")?.configured).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- --run src/features/integrations/provider-status.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement environment parsing and deterministic capability checks**

Use Zod schemas that accept absent optional-provider values but reject malformed configured values. `src/lib/env/server.ts` begins with `import "server-only"`. Provider status checks must inspect only presence and format, never perform network calls during rendering.

```ts
export type ProviderResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: "not_configured" | "invalid_request" | "rate_limited" | "provider_unavailable";
      message: string;
    };
```

- [ ] **Step 4: Document the environment contract**

Create `.env.example` with all variables from the design spec, empty values, and comments marking browser-safe versus server-only variables. Add `ENABLE_DEVELOPMENT_SEED=false`; seed content must never run when it is false.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run && npm run typecheck && npm run lint`

```bash
git add .env.example src/lib/env src/lib/providers src/features/integrations
git commit -m "feat: add validated provider configuration"
```

---

### Task 3: Supabase schema, constraints, and generated types

**Files:**
- Create with CLI, then rename before editing: `supabase/migrations/20260903000100_foundation_schema.sql`
- Create: `supabase/seed.sql`
- Create after database startup: `src/lib/supabase/database.types.ts`
- Test: `supabase/tests/001_schema_test.sql`

**Interfaces:**
- Produces: database enums `organization_role`, `membership_status`, `pipeline_stage`, `confidence_level`, `activity_type`, `message_channel`, `message_status`, `followup_status`, `integration_state`, `job_status`
- Produces: all Release 1 tables defined by the approved spec
- Produces: `public.set_updated_at()` trigger function
- Produces: unique indexes for normalized lead domain, phone, CNPJ, and Google Place ID within an organization

- [ ] **Step 1: Install and inspect the Supabase CLI**

Run: `npm install --save-dev --save-exact supabase && npx supabase --help && npx supabase migration new --help`

Expected: the local CLI help exits 0. Do not guess CLI flags.

- [ ] **Step 2: Create the migration through the CLI**

Run: `npx supabase init` followed by `npx supabase migration new foundation_schema`. Rename the empty generated migration to `supabase/migrations/20260903000100_foundation_schema.sql` before adding SQL so the plan has a deterministic path while the file is still created through the CLI.

Edit the exact path printed by the second command. Create extensions and custom application functions only in permitted application schemas; do not create custom objects in `auth`, `storage`, or `realtime`.

- [ ] **Step 3: Write the failing pgTAP schema test**

```sql
begin;
select plan(8);
select has_table('public', 'organizations');
select has_table('public', 'organization_members');
select has_table('public', 'leads');
select has_table('public', 'activities');
select has_table('public', 'audit_logs');
select col_is_pk('public', 'leads', 'id');
select col_not_null('public', 'leads', 'organization_id');
select col_not_null('public', 'leads', 'pipeline_stage');
select * from finish();
rollback;
```

- [ ] **Step 4: Run the schema test and verify failure**

When Docker Desktop is available, run `npx supabase start`, inspect `npx supabase test --help`, then execute the documented database-test command.

Expected: FAIL before the migration contains the Release 1 schema. If Docker remains unavailable, record the blocked command and continue only with static SQL review; do not claim database verification.

- [ ] **Step 5: Implement the full Release 1 schema**

Create the following tables with UUID primary keys, `organization_id` foreign keys, timestamps, validation checks, and indexes:

```text
organizations, profiles, organization_members,
leads, lead_contacts, lead_sources, lead_research,
lead_scores, lead_score_factors, lead_notes,
tags, lead_tags, lists, lead_lists,
activities, opportunities, followups,
outreach_messages, email_accounts, email_events,
integration_connections, processing_jobs,
searches, search_results, contact_suppressions,
rate_limit_events, audit_logs
```

`leads.pipeline_stage` defaults to `NEW`. `lead_sources` requires `source`, `source_url`, `fetched_at`, and `confidence`. `outreach_messages` keeps generation, review, approval, and send states separate. `audit_logs` and `activities` do not cascade-delete with leads.

- [ ] **Step 6: Add normalized deduplication indexes**

Use partial unique indexes scoped to `organization_id` for non-null `google_place_id` and normalized CNPJ. Add non-unique indexes for normalized domain, phone, address, name, pipeline stage, owner, next follow-up date, and created date. Ambiguous name/address matches remain application-reviewed and are not unique constraints.

- [ ] **Step 7: Keep seed data honest**

`supabase/seed.sql` may create only deterministic test identities or configuration needed by local tests. It must not insert realistic companies, scores, messages, revenue, or analytics. Development sample records are permitted only through a separately documented command guarded by `ENABLE_DEVELOPMENT_SEED=true`.

- [ ] **Step 8: Verify migration and generate types**

With a local database: run `npx supabase db reset`, the database-test command discovered from help, and `npx supabase gen types typescript --local` to update `src/lib/supabase/database.types.ts`.

Expected: migration reset and 8 pgTAP assertions pass.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json supabase src/lib/supabase/database.types.ts
git commit -m "feat: define the VIO Leads database schema"
```

---

### Task 4: Organization-aware RLS and audit protection

**Files:**
- Create with CLI, then rename before editing: `supabase/migrations/20260903000200_authorization_and_audit.sql`
- Test: `supabase/tests/002_rls_test.sql`
- Test: `supabase/tests/003_audit_test.sql`

**Interfaces:**
- Produces: `private.is_organization_member(target_organization_id uuid): boolean`
- Produces: `private.has_organization_role(target_organization_id uuid, allowed_roles organization_role[]): boolean`
- Produces: organization-member CRUD policies and admin-only configuration policies
- Produces: append-only audit protection

- [ ] **Step 1: Create the migration with the CLI**

Run: `npx supabase migration new authorization_and_audit`. Rename the empty generated migration to `supabase/migrations/20260903000200_authorization_and_audit.sql` before adding SQL, then edit that file.

- [ ] **Step 2: Write failing cross-organization pgTAP tests**

Create two organizations and two authenticated test users. Set request JWT claims for user A and assert that user A can select organization A's lead but receives zero rows for organization B's lead. Assert that a member cannot update `integration_connections` and an admin can.

```sql
select results_eq(
  $$ select count(*)::bigint from public.leads $$,
  array[1::bigint],
  'member sees only leads in an active membership organization'
);
```

- [ ] **Step 3: Run tests and verify unauthorized visibility fails**

Run the database-test command discovered from `npx supabase test --help`.

Expected: FAIL because RLS policies are absent.

- [ ] **Step 4: Implement RLS and grants**

Enable RLS on every public table. Membership helpers live in `private`, use a pinned empty `search_path`, verify `(select auth.uid())`, and revoke execute from `public` and `anon`. Grant only the required helper execution to `authenticated`. Policies specify `TO authenticated`; update policies include both `USING` and `WITH CHECK`.

- [ ] **Step 5: Protect audit history**

Allow authenticated organization members to read their audit records. Insertions occur through narrow server mutations or a guarded trigger. No authenticated policy permits update or delete of audit rows.

- [ ] **Step 6: Run advisors and tests**

Run the advisor command discovered from `npx supabase db --help`, or use the Supabase project advisor when connected. Run all pgTAP tests and `npx supabase migration list --local`.

Expected: no security advisor findings attributable to these migrations; schema, RLS, and audit tests pass.

- [ ] **Step 7: Commit**

```bash
git add supabase
git commit -m "feat: enforce organization access with RLS"
```

---

### Task 5: Supabase clients and internal login

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `proxy.ts`
- Create: `src/features/auth/actions.ts`
- Create: `src/features/auth/auth-result.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/login-form.tsx`
- Test: `src/features/auth/auth-result.test.ts`
- Test: `src/app/(auth)/login/login-form.test.tsx`

**Interfaces:**
- Produces: `createBrowserSupabaseClient()`
- Produces: `createServerSupabaseClient()`
- Produces: `createAdminSupabaseClient()` in a server-only module
- Produces: `loginAction(previousState: LoginState, formData: FormData): Promise<LoginState>`
- Produces: `LoginState = { status: "idle" | "error"; message?: string }`

- [ ] **Step 1: Write failing auth result tests**

Test that invalid credentials map to `E-mail ou senha inválidos.` and unconfigured Supabase maps to `Integração não configurada.` without exposing provider errors.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- --run src/features/auth/auth-result.test.ts`

Expected: FAIL because the mapping module does not exist.

- [ ] **Step 3: Implement SSR clients and cookie refresh**

Use `@supabase/ssr` browser and server clients. Read cookies on the server and write refreshed cookies only in supported mutation/proxy contexts. `admin.ts` begins with `import "server-only"` and throws a typed configuration error when the secret key is absent.

- [ ] **Step 4: Implement login with configuration-aware UI**

Validate email and password with Zod in the server action. Call password sign-in only after configuration validation. Redirect authenticated members to `/dashboard`. Render the form disabled with `INTEGRAÇÃO NÃO CONFIGURADA` when Supabase public configuration is absent.

- [ ] **Step 5: Verify auth UI behavior**

Run focused unit/component tests, then `npm run test:run && npm run typecheck && npm run lint && npm run build`.

Expected: error mapping and disabled unconfigured form tests pass; build exits 0.

- [ ] **Step 6: Commit**

```bash
git add proxy.ts src/lib/supabase src/features/auth src/app/(auth)
git commit -m "feat: add secure internal authentication"
```

---

### Task 6: Authenticated application shell and integration status

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/app-header.tsx`
- Create: `src/components/ui/integration-state.tsx`
- Create: `src/app/(app)/configuracoes/integracoes/page.tsx`
- Create: `src/features/auth/require-member.ts`
- Test: `src/features/auth/require-member.test.ts`
- Test: `src/components/ui/integration-state.test.tsx`

**Interfaces:**
- Produces: `requireMember(): Promise<CurrentMember>`
- Produces: `CurrentMember = { userId: string; organizationId: string; role: "admin" | "manager" | "member"; name: string }`
- Consumes: `getProviderStatuses()` from Task 2

- [ ] **Step 1: Write failing membership and status tests**

Test that absent sessions redirect to `/login`, inactive memberships deny access, and unconfigured provider cards render the exact text `INTEGRAÇÃO NÃO CONFIGURADA`.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- --run src/features/auth/require-member.test.ts src/components/ui/integration-state.test.tsx`

Expected: FAIL because shell and membership modules do not exist.

- [ ] **Step 3: Implement membership guard and shell**

`requireMember` calls `auth.getUser()`, queries an active membership, and returns the explicit organization context. It never accepts organization ID or role from untrusted form data. The shell includes Dashboard, Leads, Pipeline, Follow-ups, and Integrações navigation.

- [ ] **Step 4: Implement honest provider status cards**

Cards show configured capability, missing variable names for administrators, and disabled action controls for unavailable providers. Do not add setup buttons unless they navigate to a real implemented route.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`

```bash
git add src/app/(app) src/components src/features/auth
git commit -m "feat: add authenticated application shell"
```

---

### Task 7: Lead domain rules, persistence, and audit trail

**Files:**
- Create: `src/features/leads/types.ts`
- Create: `src/features/leads/schema.ts`
- Create: `src/features/leads/repository.ts`
- Create: `src/features/leads/actions.ts`
- Create: `src/features/pipeline/stages.ts`
- Create: `src/features/pipeline/transitions.ts`
- Create: `src/lib/security/audit.ts`
- Test: `src/features/leads/schema.test.ts`
- Test: `src/features/pipeline/transitions.test.ts`

**Interfaces:**
- Produces: `LeadSummary`, `LeadDetail`, `LeadFilters`, and `LeadMutationInput`
- Produces: `parseLeadInput(value: unknown): LeadMutationInput`
- Produces: `canTransition(from: PipelineStage, to: PipelineStage): boolean`
- Produces: `validateStageChange(input: { from: PipelineStage; to: PipelineStage; confirmed: boolean }): void`
- Produces: organization-bound `listLeads`, `getLead`, `createLead`, `updateLead`, `assignLead`, and `changeLeadStage`

- [ ] **Step 1: Write failing validation and transition tests**

```ts
it("rejects a lead without company name", () => {
  expect(() => parseLeadInput({ companyName: " " })).toThrow();
});

it("permits a lost lead to return to analysis", () => {
  expect(canTransition("LOST", "ANALYZING")).toBe(true);
});
```

Also test through `validateStageChange` that `CLIENT` can move to `LOST` only with `confirmed: true`, and every unchanged-stage request is rejected as a no-op.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --run src/features/leads/schema.test.ts src/features/pipeline/transitions.test.ts`

Expected: FAIL because domain modules do not exist.

- [ ] **Step 3: Implement domain rules**

Keep pipeline labels and transitions in one exhaustive map. Validate company name, email, URLs, state code, monetary values, and optional public identifiers. Normalize domain, phone, CNPJ, and company name on the server.

- [ ] **Step 4: Implement organization-bound repository functions**

Every function requires `CurrentMember`; it never accepts a caller-supplied organization ID. Reads select only required columns. Mutations write the business row, an `activities` row, and an `audit_logs` row through one database transaction/RPC where atomicity is required.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run && npm run typecheck && npm run lint`

```bash
git add src/features/leads src/features/pipeline src/lib/security
git commit -m "feat: add audited lead domain operations"
```

---

### Task 8: Functional lead table and creation flow

**Files:**
- Create: `src/app/(app)/leads/page.tsx`
- Create: `src/app/(app)/leads/novo/page.tsx`
- Create: `src/features/leads/components/lead-table.tsx`
- Create: `src/features/leads/components/lead-filters.tsx`
- Create: `src/features/leads/components/lead-form.tsx`
- Create: `src/features/leads/search-params.ts`
- Test: `src/features/leads/search-params.test.ts`
- Test: `src/features/leads/components/lead-table.test.tsx`

**Interfaces:**
- Produces: `parseLeadSearchParams(params): LeadFilters`
- Consumes: `listLeads`, `createLead`, and `LeadSummary` from Task 7

- [ ] **Step 1: Write failing filter parsing tests**

Test query, stage, owner, state, city, segment, sort, page, and page-size parsing. Invalid sort values fall back to `score_desc`; page size is restricted to 25, 50, or 100.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --run src/features/leads/search-params.test.ts`

Expected: FAIL because parser does not exist.

- [ ] **Step 3: Implement URL-backed filters and server pagination**

Filters serialize to the URL so reload and sharing preserve state. The server query applies organization scope, search, exact filters, ordering, offset, and count. Columns are Score, Empresa, Segmento, Cidade, Contato, Site, Instagram, LinkedIn, Motivo, Responsável, Status, and Última atividade.

- [ ] **Step 4: Implement selection and create flow**

Selection supports the visible page only in Release 1. Bulk actions are limited to real implemented assignment, stage, tag, and list actions; otherwise no bulk-action control is rendered. The create form persists a lead and redirects to its detail route.

- [ ] **Step 5: Verify accessibility and behavior**

Test keyboard-accessible sorting, filter labels, empty state, selected-row count, and pagination. Run the complete unit suite, type-check, lint, and build.

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/leads src/features/leads
git commit -m "feat: add persistent lead table and creation"
```

---

### Task 9: Lead detail, notes, tags, lists, ownership, and privacy

**Files:**
- Create: `src/app/(app)/leads/[leadId]/page.tsx`
- Create: `src/features/leads/components/lead-overview.tsx`
- Create: `src/features/leads/components/lead-timeline.tsx`
- Create: `src/features/leads/components/lead-relations.tsx`
- Create: `src/features/leads/related-actions.ts`
- Create: `src/features/privacy/suppression.ts`
- Create: `src/features/privacy/actions.ts`
- Test: `src/features/privacy/suppression.test.ts`
- Test: `src/features/leads/related-actions.test.ts`

**Interfaces:**
- Produces: `isContactAllowed(lead, suppressions, channel, address?): ContactDecision`
- Produces: audited actions `addLeadNote`, `assignLeadOwner`, `addLeadTag`, `addLeadToList`, `suppressLeadContact`, and `restoreLeadContact`
- Consumes: `getLead` and `CurrentMember`

- [ ] **Step 1: Write failing suppression tests**

```ts
it("blocks every channel for a company-wide opt-out", () => {
  expect(isContactAllowed(lead, [{ scope: "company" }], "email")).toEqual({
    allowed: false,
    reason: "Contato bloqueado por opt-out da empresa.",
  });
});
```

Also test channel-only and address-specific suppressions.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- --run src/features/privacy/suppression.test.ts src/features/leads/related-actions.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement related-record actions**

Validate every identifier, load the organization context from the authenticated member, use idempotent junction-table inserts, and append activity/audit records. Notes preserve author and timestamp. Owner assignment requires the target user to be an active member of the same organization.

- [ ] **Step 4: Implement detail UI**

Render company facts, source and confidence indicators, current pipeline stage, owner, contacts, notes, tags, lists, timeline, and privacy state. Do not render AI, source, score, message, or social facts when no persisted records exist; show a clear empty state instead.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`

```bash
git add src/app/(app)/leads/[leadId] src/features/leads src/features/privacy
git commit -m "feat: add complete lead workspace"
```

---

### Task 10: Pipeline and follow-up workflow

**Files:**
- Create: `src/app/(app)/pipeline/page.tsx`
- Create: `src/features/pipeline/components/pipeline-board.tsx`
- Create: `src/features/pipeline/actions.ts`
- Create: `src/app/(app)/follow-ups/page.tsx`
- Create: `src/features/followups/schema.ts`
- Create: `src/features/followups/actions.ts`
- Create: `src/features/followups/components/followup-list.tsx`
- Test: `src/features/followups/schema.test.ts`
- Test: `src/features/pipeline/components/pipeline-board.test.tsx`

**Interfaces:**
- Produces: `parseFollowupInput(value): FollowupInput`
- Produces: `createFollowup`, `completeFollowup`, `cancelFollowup`, and audited `moveLead`
- Consumes: pipeline transition rules from Task 7

- [ ] **Step 1: Write failing follow-up tests**

Test that due dates require an explicit timezone-aware ISO timestamp, owners must be active organization members, completion requires an existing pending follow-up, and cadence position cannot be negative.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --run src/features/followups/schema.test.ts`

Expected: FAIL because schema does not exist.

- [ ] **Step 3: Implement pipeline movement**

Use accessible move menus as the baseline interaction. Drag-and-drop may enhance the board only if keyboard controls invoke the same audited server action. Optimistic UI must roll back and display a server error when persistence fails.

- [ ] **Step 4: Implement follow-up persistence**

Creating, completing, and cancelling a follow-up persists status and timestamps and appends activity/audit records. Release 1 stores cadence metadata but does not auto-send or auto-create future messages.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`

```bash
git add src/app/(app)/pipeline src/app/(app)/follow-ups src/features/pipeline src/features/followups
git commit -m "feat: add pipeline and follow-up workflow"
```

---

### Task 11: Dashboard metrics and “Abordar agora”

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/features/dashboard/metrics.ts`
- Create: `src/features/dashboard/query.ts`
- Create: `src/features/dashboard/components/metric-card.tsx`
- Create: `src/features/dashboard/components/approach-now.tsx`
- Test: `src/features/dashboard/metrics.test.ts`
- Test: `src/features/dashboard/components/approach-now.test.tsx`

**Interfaces:**
- Produces: `calculateRates(counts: FunnelCounts): FunnelRates`
- Produces: `getDashboard(member: CurrentMember, range: DateRange): Promise<DashboardData>`
- Produces: `rankApproachNow(leads, now): ApproachCandidate[]`

- [ ] **Step 1: Write failing metric tests**

```ts
it("returns zero instead of NaN when a denominator is zero", () => {
  expect(calculateRates({ contacted: 0, replies: 0, meetings: 0, clients: 0 })).toMatchObject({
    responseRate: 0,
    meetingRate: 0,
    closingRate: 0,
  });
});
```

Test exact numerator and denominator definitions and verify suppressed, lost, recently contacted, and unscored leads are excluded from “Abordar agora”.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --run src/features/dashboard/metrics.test.ts src/features/dashboard/components/approach-now.test.tsx`

Expected: FAIL because dashboard modules do not exist.

- [ ] **Step 3: Implement persisted metrics**

Calculate leads found/new/hot/contacted, replies, positive replies, meetings, proposals, clients, potential value, closed revenue, response rate, meeting rate, closing rate, and end-to-end conversion for the selected period. Segment performance uses the same definitions.

- [ ] **Step 4: Implement “Abordar agora” ranking**

Rank only non-suppressed leads with a persisted score and no conflicting recent activity. Display the score, persisted score-factor reasons, and available real actions. Until Release 4 creates scores, the section honestly shows that no scored leads are available.

- [ ] **Step 5: Verify and commit**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`

```bash
git add src/app/(app)/dashboard src/features/dashboard
git commit -m "feat: add commercial dashboard metrics"
```

---

### Task 12: Rate limiting and protected mutation boundaries

**Files:**
- Create: `src/lib/security/rate-limit.ts`
- Create: `src/lib/security/action-context.ts`
- Modify: `src/features/leads/actions.ts`
- Modify: `src/features/pipeline/actions.ts`
- Modify: `src/features/followups/actions.ts`
- Modify: `src/features/privacy/actions.ts`
- Test: `src/lib/security/rate-limit.test.ts`
- Test: `src/lib/security/action-context.test.ts`

**Interfaces:**
- Produces: `consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>`
- Produces: `getActionContext(): Promise<{ member: CurrentMember; requestId: string }>`

- [ ] **Step 1: Write failing fixed-window behavior tests**

Test first-request allowance, exact-limit allowance, next-request rejection, independent users, independent action names, and new-window reset. The test adapter uses an injected clock and repository; production uses the organization-scoped database table.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- --run src/lib/security/rate-limit.test.ts src/lib/security/action-context.test.ts`

Expected: FAIL because security modules do not exist.

- [ ] **Step 3: Implement atomic server-side limiting**

Use a database function or transaction that increments a `(organization_id, user_id, action, window_start)` bucket atomically. The browser cannot provide its own bucket identity. Return a retry-after duration without exposing internal errors.

- [ ] **Step 4: Apply shared action context**

All Release 1 server mutations obtain member identity, organization, request ID, and rate-limit state from `getActionContext`. Keep read-only navigation outside mutation limits.

- [ ] **Step 5: Verify and commit**

Run the complete unit and database test suites, type-check, lint, and build.

```bash
git add src/lib/security src/features/leads/actions.ts src/features/pipeline/actions.ts src/features/followups/actions.ts src/features/privacy/actions.ts supabase
git commit -m "feat: protect CRM mutation boundaries"
```

---

### Task 13: Critical end-to-end flows and operational documentation

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/unconfigured-login.spec.ts`
- Create: `tests/e2e/crm-flow.spec.ts`
- Create: `README.md`
- Create: `docs/operations/local-development.md`
- Create: `docs/operations/supabase-setup.md`
- Create: `docs/operations/integration-status.md`

**Interfaces:**
- Produces: documented commands for setup, environment validation, development, tests, build, database reset, and first-user invitation
- Consumes: all Release 1 user flows

- [ ] **Step 1: Write and run the unconfigured-login E2E test**

```ts
test("shows an honest Supabase configuration state", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("INTEGRAÇÃO NÃO CONFIGURADA")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeDisabled();
});
```

Run: `npm run test:e2e -- tests/e2e/unconfigured-login.spec.ts`

Expected before UI completion: FAIL. Expected after Task 5: PASS.

- [ ] **Step 2: Write the authenticated CRM flow**

Using a dedicated local test user and organization, verify login, lead creation, reload persistence, owner assignment, stage movement, note, tag, list, follow-up, and contact suppression. Assert the timeline records each mutation. The test is skipped with an explicit prerequisite message only when neither a local nor test Supabase environment is configured.

- [ ] **Step 3: Document reproducible setup**

README links to the architecture spec and this plan, documents Node 24+, `npm ci`, `.env.local`, `npm run dev`, and verification commands. Supabase setup documents CLI discovery, migration reset, generated types, first organization, user invitation, and role assignment without placing secrets in commands or committed files.

- [ ] **Step 4: Run final verification**

Run fresh commands:

```bash
npm ci
npm run test:run
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

When database infrastructure is available, additionally run migration reset, all pgTAP tests, migration listing, type generation, and Supabase security advisors. Compare `git diff --exit-code src/lib/supabase/database.types.ts` after generation.

Expected: every available command exits 0; any database or authenticated E2E command blocked by missing external infrastructure is reported as blocked and is not described as passing.

- [ ] **Step 5: Verify Release 1 acceptance criteria manually**

Check all ten acceptance criteria in the approved design against fresh command output and persisted database behavior. Record remaining external-configuration requirements in `README.md`, not as simulated features.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests README.md docs/operations
git commit -m "test: verify VIO Leads release one workflows"
```

---

## Release 1 Completion Gate

Before Release 2 begins, verify:

1. The working tree contains only intended changes.
2. The full unit/component suite passes from a clean dependency install.
3. ESLint, TypeScript, and the production build exit 0.
4. Database migrations reset cleanly and RLS tests prove cross-organization isolation when database infrastructure is available.
5. The configured authenticated E2E CRM workflow persists changes across reloads.
6. The unconfigured environment shows no fake data and no successful fake actions.
7. Every commit is focused and its message describes the completed behavior.
8. The README identifies external credentials still required for Releases 2–5.

Only after this gate should planning begin for Google Places search and deduplication behavior in Release 2.
