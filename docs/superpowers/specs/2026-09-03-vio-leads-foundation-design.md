# VIO LEADS — Foundation and Architecture Design

Date: 2026-09-03

Status: Approved for planning

Repository: `https://github.com/NicholasAlencar/avyo-leads.git`

## 1. Context

VIO LEADS is an internal commercial-intelligence application for a three-person team selling financial consulting. It must help the team find public business information, enrich and prioritize companies, explain why each company may be a commercial opportunity, prepare personalized outreach, and track the relationship through client conversion.

The official repository was empty when inspected on 2026-09-03. There was no existing application, dependency manifest, executable command, commit history, or architecture to preserve. The foundation therefore starts in the official repository while preserving its Git metadata and remote.

## 2. Product principles

1. The product is a commercial-intelligence system, not a generic CRM.
2. Prioritization quality is more important than result volume.
3. Every enriched claim keeps its source, URL, collection time, and confidence.
4. Estimates and hypotheses are labelled as such.
5. The system never claims that a company has financial problems.
6. No integration fabricates results when credentials are missing.
7. Outreach always follows generate, review, approve, then send.
8. Only public business information, official APIs, and authorized integrations may be used.
9. The application follows privacy-by-design and minimizes personal data.
10. Existing working behavior must remain protected by automated tests as the system grows.

## 3. Delivery decomposition

The full product is divided into six independently testable releases. Each release must leave the application in a usable state.

### Release 1 — Foundation and CRM

- Next.js application foundation and design system
- Supabase schema, migrations, authentication, and row-level security
- Internal users and organization membership
- Dashboard backed by persisted data
- Lead table, lead details, notes, tags, lists, ownership, and activity history
- Complete pipeline stage movement
- Audit trail and contact suppression
- Integration status page with honest configured/not-configured states

### Release 2 — Company search

- Google Places/Maps provider
- State, city, district, segment, keyword, radius, and result-limit filters
- Capability filters based only on collected data
- Natural-language query parsing into reviewed structured filters
- Strong deduplication and persisted search results

### Release 3 — Enrichment

- Official-site analysis within permitted public access
- Consolidated contacts and public social links
- Source provenance and confidence levels
- Research jobs, retries, and failure visibility
- Public financial-leadership signals without asserting absence

### Release 4 — Intelligence

- Explainable VIO Lead Score
- Commercial summary, opportunity signals, hypothetical pains, and recommended services
- Email, WhatsApp, and LinkedIn message generation
- Source-backed personalization and unsupported-claim rejection

### Release 5 — Outreach and follow-up

- Gmail/Google Workspace and Microsoft 365 provider adapters
- Review and explicit approval before sending
- Email event history
- Follow-up cadence and message suggestions
- Pipeline automation limited to deterministic, user-visible rules

### Release 6 — Analytics and learning preparation

- Funnel and revenue metrics
- Response, meeting, closing, and conversion rates
- Performance by segment and responsible user
- Historical feature/outcome recording for future score calibration
- No autonomous model retraining or opaque decisions

## 4. Architecture decision

The application will be a modular monolith built with Next.js App Router, React, strict TypeScript, Tailwind CSS, and shadcn/ui. PostgreSQL, authentication, and row-level authorization will use Supabase.

This shape fits the initial team size while preserving explicit domain boundaries. It avoids the operational burden of a separate API and worker service until measured workload requires them. Long-running operations use persisted jobs and protected execution endpoints, allowing a worker to be extracted later without changing the domain contracts.

### 4.1 Application boundaries

Routes and presentation live under `src/app`. Reusable UI lives under `src/components`. Business logic lives under feature modules in `src/features`. Shared infrastructure and provider contracts live under `src/lib`.

Proposed top-level structure:

```text
src/
  app/
    (auth)/
    (app)/
    api/
  components/
    ui/
    layout/
  features/
    auth/
    dashboard/
    leads/
    pipeline/
    searches/
    enrichment/
    scoring/
    outreach/
    followups/
    analytics/
    integrations/
  lib/
    providers/
    supabase/
    validation/
    security/
    observability/
supabase/
  migrations/
  seed.sql
tests/
  e2e/
```

Server Components perform authenticated reads by default. Server Actions handle UI-bound mutations. Route Handlers are reserved for provider callbacks, webhooks, job execution, and endpoints that require a stable HTTP contract. Client Components are used only for interaction that needs browser state.

### 4.2 Domain service rules

- Pages do not call third-party APIs directly.
- UI components do not contain scoring, deduplication, permission, or provider logic.
- Mutations validate input and authorization on the server even when the form validates in the browser.
- Domain functions accept explicit dependencies so tests can use deterministic adapters.
- Provider-specific payloads are mapped at adapter boundaries and do not leak into domain entities.
- Server-only modules guard secrets and privileged clients from client bundles.

## 5. Identity and authorization

Supabase Auth provides email/password authentication with cookie-based SSR sessions. Public self-sign-up is disabled for the internal launch; users are invited or provisioned by an administrator.

### 5.1 Roles

- `admin`: manages users, integrations, all leads, and organization settings.
- `manager`: manages leads, assignments, pipeline, lists, searches, and reporting.
- `member`: works assigned or organization-visible leads and records activity.

Authorization data is stored in application tables and trusted app metadata where needed. User-editable metadata is never used for authorization.

### 5.2 Tenant model

Every business record belongs to an `organization_id`. Initial deployment uses one VIO organization, but the schema does not hard-code a single tenant. Access requires an active row in `organization_members` for the authenticated user.

### 5.3 Row-level security

RLS is enabled on every table in an exposed schema. Policies check authenticated organization membership and, where required, the member role. Update policies define both `USING` and `WITH CHECK`. Privileged functions are placed in a non-exposed schema, pin their `search_path`, verify `auth.uid()`, and have public execution revoked.

The browser receives only the Supabase project URL and publishable key. Secret and service-role keys remain server-only and are used only for narrow administrative operations.

## 6. Data model

All mutable tables contain `created_at`, `updated_at`, and the relevant actor identifiers. UUIDs are used for primary keys. Human-visible identifiers may be added separately when useful.

### 6.1 Identity

- `organizations`: VIO workspace configuration.
- `profiles`: display name and application profile linked to `auth.users`.
- `organization_members`: organization membership, role, status, and invitation metadata.

### 6.2 Lead core

- `leads`: canonical company record, pipeline stage, owner, location, business identifiers, public channels, potential value, closed revenue, opt-out state, and normalized deduplication fields.
- `lead_contacts`: business contacts and limited public professional contact details, with provenance and contact restrictions.
- `lead_sources`: evidence records containing source type, source URL, fetched timestamp, confidence, raw reference metadata, and the supported field or claim.
- `lead_research`: versioned consolidated research summaries and structured findings.
- `lead_scores`: immutable score versions with total, classification, model/rule version, and calculation timestamp.
- `lead_score_factors`: positive or negative factor contribution, evidence link, explanation, and confidence.

### 6.3 Organization and workflow

- `lead_notes`: internal notes with author and timestamps.
- `tags` and `lead_tags`: organization-scoped tags and assignments.
- `lists` and `lead_lists`: saved lead groupings.
- `activities`: append-oriented timeline of finds, edits, assignments, stage changes, contacts, responses, meetings, proposals, and outcomes.
- `opportunities`: potential value, proposal value, closed revenue, probability, and commercial dates.
- `followups`: due date, status, cadence position, owner, and suggested message reference.

### 6.4 Outreach and integrations

- `outreach_messages`: channel, tone, recipient, subject/body, evidence used, generation status, review state, approval actor/time, send state, provider reference, and error details.
- `email_accounts`: encrypted provider connection references and non-secret display metadata.
- `email_events`: provider delivery, bounce, reply, and status events.
- `integration_connections`: provider type, adapter, configuration state, capabilities, and last check. Secret values are stored outside exposed columns.
- `processing_jobs`: durable work items for search, enrichment, analysis, generation, and synchronization with retry and error state.

### 6.5 Search, governance, and privacy

- `searches`: original query, structured filters, owner, provider, and execution status.
- `search_results`: provider result, match decision, deduplication outcome, and created lead reference.
- `contact_suppressions`: organization/company/channel/address restrictions and opt-out reason.
- `audit_logs`: append-only security and business mutation record with actor, action, entity, before/after metadata, request ID, and timestamp.
- `rate_limit_events`: server-controlled rate-limit buckets for protected actions where platform-native limiting is unavailable.

### 6.6 Pipeline stages

The canonical values are:

```text
NEW
ANALYZING
PRIORITY
CONTACT_PREPARED
CONTACTED
RESPONDED
MEETING_SCHEDULED
PROPOSAL
NEGOTIATION
CLIENT
LOST
```

Transitions are recorded as activities and audit events. A stage change never deletes historical state.

## 7. Provider architecture

The provider layer exposes stable internal contracts:

```text
SearchProvider
MapsProvider
WebsiteProvider
SocialProvider
AIProvider
EmailProvider
```

Every provider exposes a capability/configuration check and returns typed results containing provenance. Missing credentials produce a typed `not_configured` result. Authentication failures, quotas, transient errors, rejected inputs, and provider outages are distinct error categories.

### 7.1 Planned adapters

- Google Places API for company search and map details.
- Official company website fetcher that respects public access, robots directives, size/time limits, and safe-network rules.
- Social adapters only for public or authorized LinkedIn and Instagram data obtainable through permitted APIs or user-provided public references.
- Configurable AI adapter, initially compatible with OpenAI, with schema-validated structured output.
- Gmail/Google Workspace and Microsoft Graph email adapters using OAuth and explicit user approval.

No provider bypasses authentication, CAPTCHA, rate limits, or platform restrictions.

## 8. Search, deduplication, and enrichment flow

1. User submits structured filters or a natural-language query.
2. Natural-language parsing produces editable structured filters; it does not immediately launch a paid search.
3. Server validates permissions, limits, and provider configuration.
4. Search execution is persisted before external calls begin.
5. Provider results retain provider IDs and source metadata.
6. Deduplication compares Google Place ID and CNPJ first, then normalized domain and phone, then address and name similarity.
7. Strong matches attach new evidence to the canonical lead. Ambiguous matches are flagged for review rather than silently merged.
8. Enrichment runs as durable jobs with bounded retries.
9. Each accepted claim is linked to evidence and confidence.
10. The UI exposes partial results and failures honestly.

## 9. Explainable scoring

VIO Lead Score ranges from 0 to 100 and estimates potential fit for financial consulting. It does not estimate financial distress.

The first model is deterministic and versioned. Factor groups include operational complexity, multiunit presence, growth signals, digital traction, revenue-channel complexity, team scale, B2B operation, likely ticket, and absence of publicly identified financial leadership. Lack of public evidence is phrased as “Nenhuma estrutura financeira identificada publicamente.”

Each score stores:

- model/rules version;
- total and classification;
- individual weighted factors;
- evidence for each factor;
- confidence and calculation date;
- an explanatory conclusion using hypothesis language.

Score bands are 80–100 very hot, 65–79 hot, 50–64 promising, 30–49 monitor, and 0–29 low priority.

## 10. AI safeguards

AI consumes a curated evidence bundle rather than unrestricted raw records. Outputs use schemas and must distinguish facts, estimates, and hypotheses. Generated outreach must cite at least one evidence record internally. If no safe personalization fact exists, the generator reports insufficient evidence instead of inventing one.

AI-generated content remains a draft. Sending requires a recorded user approval action after review. Prompt, provider, model identifier, evidence IDs, and generation timestamp are retained for auditability without storing secret credentials.

## 11. Dashboard and UX

The interface is a desktop-first internal application with responsive behavior. It uses a compact sidebar, information-dense tables, fast filters, visible integration health, and few-click actions.

The dashboard derives metrics from persisted leads, activities, messages, opportunities, and outcomes. “Abordar agora” ranks eligible leads by current score, freshness, ownership, suppression state, and recent activity. It never displays seeded production-like companies unless the development environment explicitly enables documented seed data.

Empty states explain the next real action. Unconfigured integrations have disabled dependent actions and a configuration path. No inactive button, empty navigation tab, or in-memory-only business operation is accepted.

## 12. Metrics

Definitions are centralized and tested:

- leads found and qualified;
- contacts made;
- replies and positive replies;
- meetings, proposals, negotiations, and clients;
- potential value and closed revenue;
- response, meeting, closing, and end-to-end conversion rates;
- performance by segment and responsible member.

Rates define their numerator, denominator, time window, and zero-denominator behavior. Historical score versions and outcomes support future calibration without changing decisions autonomously.

## 13. Error handling and observability

- User-facing errors are actionable and omit secrets or provider payloads.
- Each request and background job receives a correlation ID.
- External failures record provider, category, retryability, attempt count, and sanitized details.
- Retries use bounded exponential backoff only for transient errors.
- Validation, authorization, provider, quota, and unexpected failures are distinguishable.
- Audit logs cover authentication-sensitive and business-critical mutations.
- Production logging is structured; local development keeps readable logs.

## 14. Security and LGPD

- Authentication and server-side authorization protect every application route and mutation.
- RLS provides database-level tenant isolation.
- Inputs are schema-validated and bounded.
- Provider URLs and website enrichment are protected against SSRF, private-network access, oversized responses, and unsafe redirects.
- API and job endpoints are rate-limited and require appropriate credentials.
- OAuth tokens and provider secrets are encrypted or retained in managed secret storage.
- Logs redact credentials, message tokens, and unnecessary personal data.
- Contact suppression is checked before drafting approval and again before sending.
- Future deletion workflows can remove or anonymize records while retaining the minimum legally necessary audit trail.
- HTTPS is mandatory in production.

## 15. Environment variables

The initial environment contract is:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
APP_URL
GOOGLE_MAPS_API_KEY
AI_PROVIDER
OPENAI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
CRON_SECRET
ENCRYPTION_KEY
```

The committed `.env.example` documents which release uses each variable. Startup validation separates required foundation variables from optional provider variables so the application can run while accurately reporting unconfigured integrations.

## 16. External dependencies

### Runtime

- Next.js, React, and TypeScript
- Supabase JavaScript and SSR clients
- Tailwind CSS and shadcn/ui primitives
- Zod for boundary validation
- React Hook Form for interactive forms where native server forms are insufficient
- TanStack Table for the lead grid
- A small icon library used by shadcn/ui

### Development and verification

- ESLint and Prettier-compatible formatting
- Vitest and Testing Library for unit and component behavior
- Playwright for critical authenticated flows
- Supabase CLI for local migrations, generated database types, and database tests

Package versions and lockfiles are pinned at implementation time. New dependencies require a concrete feature or verification need.

## 17. Testing strategy

Implementation follows test-driven development for domain behavior.

- Unit tests: score bands, score factors, deduplication normalization/matching, metrics, transition rules, validation, provider errors, and message evidence rules.
- Database tests: constraints, RLS isolation, permissions, audit behavior, and important SQL functions.
- Component tests: filters, forms, tables, empty states, integration status, and confirmation flows.
- Integration tests: authenticated server mutations and provider adapters at their boundaries.
- End-to-end tests: login, create/import lead, move pipeline stage, assign owner, add note/tag/list, record contact, schedule follow-up, and suppress contact.
- Build checks: type checking, linting, production build, migration reset, and generated-type consistency.

Provider contract fixtures contain clearly labelled test data and never appear as runtime search results.

## 18. Commit strategy

Work is committed in reviewable increments:

1. architecture specification;
2. implementation plan;
3. application and test foundation;
4. database schema, RLS, and database tests;
5. authentication and application shell;
6. lead domain and CRM workflow;
7. dashboard and integration status;
8. verification and operational documentation.

Later releases follow the same pattern: tests and contracts, minimal implementation, UI integration, verification, and documentation.

## 19. Acceptance criteria for Release 1

Release 1 is complete only when:

1. A configured developer can start the application from documented commands.
2. An unauthenticated visitor is redirected to login.
3. An invited active member can sign in and access only their organization.
4. Lead, ownership, stage, notes, tags, lists, activities, opportunities, follow-ups, and suppression changes persist across reloads.
5. Every critical mutation is authorized, validated, and audited.
6. Pipeline transitions retain history.
7. Dashboard metrics are calculated from stored records and have tested definitions.
8. Unconfigured providers are clearly shown and dependent actions cannot claim success.
9. RLS tests prove cross-organization isolation.
10. Unit, database, component, end-to-end, lint, type-check, and production-build verification commands pass.

## 20. Deferred decisions

The following choices are intentionally deferred until their release because making them now would create unused infrastructure:

- production hosting vendor;
- background worker extraction;
- paid queue or rate-limit service;
- primary AI vendor;
- secondary company-data providers;
- exact Gmail and Microsoft OAuth application registrations;
- score-weight calibration based on real conversion data.

Their domain interfaces and data records are defined now so these choices do not require redesigning the CRM foundation.
