# VIO LEADS Product Experience Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the complete VIO LEADS presentation layer with an original premium commercial-intelligence experience while preserving all existing Next.js, Supabase, security, persistence, and provider behavior.

**Architecture:** Build a focused internal component system first, then recompose the application shell and each product workspace around it. Server components continue to fetch data and pass plain view models; client components own only local interaction, and existing server actions remain authoritative for mutations.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, Supabase, Lucide React, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-06-vio-leads-product-experience-restructure.md`

## Global Constraints

- Preserve existing Supabase schema, RLS, authentication, server actions, queries, scoring, audit, and provider contracts.
- Do not render invented metrics, fake data, empty tabs, or controls without working behavior.
- Use the supplied AVYO brand board only as a local source for clean transparent production assets.
- Make the product fully usable from 360px upward and prioritize 1280–1600px desktop layouts.
- Preserve Portuguese product copy and the VIO LEADS product name under the AVYO identity.

---

### Task 1: Brand Assets and UI Foundation

**Files:**
- Create: `public/brand/avyo-mark.png`
- Create: `public/brand/avyo-wordmark-light.png`
- Create: `public/brand/avyo-wordmark-dark.png`
- Create: `src/components/ui/icons.tsx`
- Create: `src/components/ui/primitives.tsx`
- Create: `src/components/ui/primitives.test.tsx`
- Modify: `src/components/ui/avyo-logo.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`

**Interfaces:**
- Produces: `AvyoLogo({ variant: "light" | "dark" | "symbol"; className?: string })` backed by transparent image files.
- Produces: `Button`, `IconButton`, `Surface`, `Badge`, `Avatar`, `EmptyState`, and `PageHeading` reusable components.

- [ ] Extract the AVYO mark and wordmarks from the supplied local brand board into transparent files, remove runtime background-position cropping, and visually inspect all three assets.
- [ ] Add `lucide-react` and export the exact icon set used by navigation and screen actions through `icons.tsx`.
- [ ] Write component tests proving button variants, accessible icon labels, headings, and empty-state actions render correctly.
- [ ] Run `npm run test:run -- src/components/ui/primitives.test.tsx` and confirm the tests fail before the primitives exist.
- [ ] Implement the primitives with typed props, focus-visible states, disabled states, and restrained AVYO styling.
- [ ] Replace global CSS with semantic canvas, surface, text, border, radius, elevation, motion, and responsive tokens.
- [ ] Run the focused tests and `npm run typecheck`.
- [ ] Commit with `feat: build AVYO product design system`.

### Task 2: New Application Shell and Sidebar

**Files:**
- Create: `src/components/layout/navigation.ts`
- Create: `src/components/layout/sidebar-nav.tsx`
- Create: `src/components/layout/sidebar-nav.test.tsx`
- Create: `src/components/layout/mobile-navigation.tsx`
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/layout/app-header.tsx`
- Modify: `src/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `AvyoLogo`, `Button`, `IconButton`, `Avatar`, and shared icons from Task 1.
- Produces: a server-rendered `AppSidebar`, client `SidebarNav`, responsive `MobileNavigation`, and sticky `AppHeader`.

- [ ] Write tests proving the navigation contains working links for dashboard, leads, discovery, pipeline, follow-ups, and integrations; contains no numbered markers or promotional card; and exposes the active path accessibly.
- [ ] Run the sidebar test and confirm failure against the old numbered sidebar.
- [ ] Define one navigation model with labels, routes, section names, and Lucide icon components.
- [ ] Build the new desktop sidebar with transparent AVYO logo, grouped links, active-route state, integration status entry, and user section.
- [ ] Build the mobile navigation drawer with the same navigation model and keyboard-accessible dismissal.
- [ ] Recompose the header as a command bar with page context, working lead-search form, working `Novo lead` link, and account menu/logout.
- [ ] Update authenticated layout spacing for the 248px sidebar and mobile header.
- [ ] Run focused tests, typecheck, and visually inspect `/dashboard` at desktop and mobile widths.
- [ ] Commit with `feat: replace application shell and navigation`.

### Task 3: Dashboard Command Center

**Files:**
- Create: `src/features/dashboard/components/dashboard-overview.tsx`
- Create: `src/features/dashboard/components/dashboard-overview.test.tsx`
- Create: `src/features/dashboard/components/metric-card.tsx`
- Create: `src/features/dashboard/components/priority-list.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: existing `DashboardData`, `FunnelCounts`, and `calculateRates` without changing query semantics.
- Produces: `DashboardOverview({ data, days })` with real metrics, priorities, approach leads, funnel, and segment performance.

- [ ] Write tests for real metric labels, correct empty states, absence of invented trend percentages, and approach-lead links.
- [ ] Run the focused test and confirm failure before the new dashboard composition exists.
- [ ] Build the hero metrics band with four primary metrics and compact secondary metrics using real values only.
- [ ] Build priorities from available `approach` data and explicit empty states for missing activity categories.
- [ ] Build a real stage/funnel summary from existing counts without decorative fake charts.
- [ ] Recompose “Abordar agora” and segment performance into responsive editorial surfaces.
- [ ] Run focused tests, typecheck, and inspect populated and empty dashboard states.
- [ ] Commit with `feat: rebuild commercial dashboard experience`.

### Task 4: Leads Data Workspace

**Files:**
- Create: `src/features/leads/components/lead-score-badge.tsx`
- Create: `src/features/leads/components/contact-presence.tsx`
- Create: `src/features/leads/components/leads-toolbar.tsx`
- Modify: `src/features/leads/components/lead-filters.tsx`
- Modify: `src/features/leads/components/lead-table.tsx`
- Modify: `src/features/leads/components/lead-table.test.tsx`
- Modify: `src/app/(app)/leads/page.tsx`
- Modify: `src/app/(app)/leads/novo/page.tsx`

**Interfaces:**
- Consumes: existing `LeadSummary[]`, search parameters, sorting links, and create-lead action.
- Produces: compact accessible lead rows, score semantics, contact-presence indicators, applied-filter chips, and responsive pagination.

- [ ] Extend table tests to cover score classification, contact indicators, selection state, accessible external links, and the no-results action.
- [ ] Run the focused test and record expected failures.
- [ ] Build score and contact primitives with text/ARIA equivalents rather than color-only meaning.
- [ ] Recompose filters into a toolbar and collapsible advanced filter surface while retaining existing URL parameters.
- [ ] Rebuild the table with a sticky header, sticky company column, compact combined cells, score/status/owner hierarchy, and row detail navigation.
- [ ] Restyle pagination and create-lead form with shared primitives and intentional mobile wrapping.
- [ ] Run focused tests, typecheck, and inspect `/leads` at desktop and 360px.
- [ ] Commit with `feat: rebuild leads operations workspace`.

### Task 5: CRM Pipeline Board

**Files:**
- Create: `src/features/pipeline/components/pipeline-column.tsx`
- Create: `src/features/pipeline/components/pipeline-lead-card.tsx`
- Modify: `src/features/pipeline/components/pipeline-board.tsx`
- Modify: `src/features/pipeline/components/pipeline-board.test.tsx`
- Modify: `src/features/pipeline/components/stage-control.tsx`
- Modify: `src/app/(app)/pipeline/page.tsx`

**Interfaces:**
- Consumes: existing `LeadSummary[]`, `pipelineStages`, `pipelineLabels`, and stage-change action.
- Produces: horizontally scrollable pipeline columns with counts, semantic stage accents, dense cards, and accessible stage movement.

- [ ] Extend pipeline tests to cover every stage, empty columns, score output, owner output, and stage control labels.
- [ ] Run the focused tests and confirm failure before new card/column components exist.
- [ ] Build compact lead cards and columns with stable widths, count headers, status accent, and useful metadata.
- [ ] Recompose the pipeline page with a sticky summary bar and responsive horizontal scrolling.
- [ ] Restyle the stage control without changing transition validation or server mutations.
- [ ] Run pipeline tests, typecheck, and visually inspect dense and empty boards.
- [ ] Commit with `feat: rebuild professional CRM pipeline`.

### Task 6: Discovery and Lead Intelligence Workspace

**Files:**
- Modify: `src/app/(app)/encontrar/page.tsx`
- Modify: `src/app/(app)/leads/[leadId]/page.tsx`
- Modify: `src/features/leads/components/lead-overview.tsx`
- Modify: `src/features/leads/components/lead-relations.tsx`
- Modify: `src/features/leads/components/lead-timeline.tsx`
- Modify: `src/features/intelligence/components.tsx`
- Modify: `src/components/ui/integration-state.tsx`
- Modify: `src/components/ui/integration-state.test.tsx`

**Interfaces:**
- Consumes: existing Google Places provider state, search action, lead workspace query data, relation actions, intelligence actions, and outreach actions.
- Produces: two-panel discovery experience and tabbed lead intelligence workspace with source-backed information only.

- [ ] Extend integration-state tests for configured, unconfigured, and unavailable presentation.
- [ ] Run focused tests and confirm failures for the new visible state copy and structure.
- [ ] Recompose discovery into sticky filters plus results/provider workspace, preserving every existing form field and action.
- [ ] Recompose lead header, overview, intelligence, relations, outreach, and activity into clear tabs or anchored sections, rendering only available real modules.
- [ ] Build the contextual rail for stage, owner, follow-up, notes, tags, lists, and privacy actions.
- [ ] Ensure every personalized claim retains visible source and confidence context.
- [ ] Run focused tests, typecheck, and inspect discovery and one lead detail at desktop/mobile widths.
- [ ] Commit with `feat: rebuild discovery and lead intelligence workspaces`.

### Task 7: Follow-ups, Integrations, Login, and State Polish

**Files:**
- Modify: `src/app/(app)/follow-ups/page.tsx`
- Modify: `src/features/followups/components/followup-list.tsx`
- Modify: `src/features/followups/components/followup-form.tsx`
- Modify: `src/app/(app)/configuracoes/integracoes/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/login/login-form.tsx`

**Interfaces:**
- Consumes: existing follow-up actions, provider-status data, and login action.
- Produces: agenda-style follow-ups, premium provider cards, and a clean responsive AVYO authentication screen.

- [ ] Add tests for follow-up urgency grouping using deterministic dates and for login accessible error/loading states.
- [ ] Run focused tests and confirm expected failures.
- [ ] Recompose follow-ups into overdue, today, upcoming, and completed sections without fabricating activities.
- [ ] Rebuild integrations cards with consistent configured/action-required/unavailable states and no fake connection controls.
- [ ] Replace the login brand-board panel with isolated AVYO assets and a focused authentication composition.
- [ ] Run focused tests, typecheck, and visually inspect follow-ups, integrations, and login.
- [ ] Commit with `feat: complete AVYO product experience`.

### Task 8: Responsive, Accessibility, and Production Verification

**Files:**
- Modify: only files with verified responsive, contrast, focus, or overflow defects.

**Interfaces:**
- Consumes: all presentation components from Tasks 1–7.
- Produces: production-ready responsive and accessible UI without changing domain behavior.

- [ ] Run `npm run test:run` and fix only reproducible failures.
- [ ] Run `npm run typecheck` and resolve all errors.
- [ ] Run `npm run lint` and resolve all errors.
- [ ] Run `npm run build` and confirm every application route compiles.
- [ ] Inspect login, dashboard, leads, discovery, pipeline, lead detail, follow-ups, integrations, and create lead at desktop width.
- [ ] Inspect login, dashboard, leads, pipeline, and lead detail at 360px; fix verified clipping, wrapping, focus, and navigation defects.
- [ ] Run `git diff --check` and the complete verification suite again after visual fixes.
- [ ] Commit with `fix: polish responsive AVYO product experience` and push `main`.
