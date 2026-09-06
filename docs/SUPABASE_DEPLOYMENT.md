# Supabase deployment — 2026-09-06

User-selected dedicated project: `avyo-leads` (`cbbxgdgauwypyzeerclf`).

Applied the seven committed migrations to the initially empty project. Verified 27 public tables, all with RLS enabled. Migration versions were reconciled with repository filenames after the management API assigned deployment timestamps; SQL history was preserved.

Security advisor returned no warnings or errors. Its informational notice for `rate_limit_events` having no RLS policies is intentional: clients cannot access this internal table directly; the private budget function controls access.

Local `.env.local` contains the project URL and publishable key and remains Git-ignored. No secret/service-role key was obtained or exposed.

Auth has zero users. Access is not operational until named users are provisioned and assigned active organization membership. No default password, public administrator bootstrap, or fabricated user was created. Production hosting and provider credentials remain separate outstanding setup work.
