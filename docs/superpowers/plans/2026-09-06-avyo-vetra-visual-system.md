# AVYO Vetra-Inspired Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved AVYO/Vetra-inspired design to every current VIO LEADS workflow without altering persistence or authorization behavior.

**Architecture:** Introduce brand primitives and CSS tokens at the shared layout layer, then migrate authentication, navigation, dashboards, operational tables, pipeline, lead workspace, follow-ups, search, and integrations. Existing server components and actions remain the behavioral source of truth.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase.

**Spec:** `docs/superpowers/specs/2026-09-06-avyo-vetra-visual-system-design.md`

## Global Constraints

- Preserve all working server actions, RLS behavior, routes, and database semantics.
- Use the supplied AVYO brand board locally; never upload it to third parties.
- Add no non-functional controls.
- Support desktop and 360px mobile layouts with visible keyboard focus.

---

### Task 1: Brand assets and tokens

**Files:** Create `public/brand/avyo-brand-board.png`, `src/components/ui/avyo-logo.tsx`; modify `src/app/globals.css`.

**Interfaces:** Produces `AvyoLogo({variant,className})` and global AVYO design tokens consumed by every page.

- [ ] Copy the supplied brand board into the local public asset directory.
- [ ] Add an `AvyoLogo` component that uses non-destructive crops for dark, light, and symbol variants.
- [ ] Add color, radius, shadow, typography, focus, and reduced-motion tokens.
- [ ] Run `npm run typecheck` and commit `feat: add AVYO visual foundations`.

### Task 2: Product shell and authentication

**Files:** Modify `src/components/layout/app-sidebar.tsx`, `src/components/layout/app-header.tsx`, `src/app/(app)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/login/login-form.tsx`.

**Interfaces:** Consumes `AvyoLogo`; preserves `loginAction`, `logoutAction`, and route destinations.

- [ ] Replace the temporary badge with AVYO identity and grouped navigation.
- [ ] Apply the dark sidebar, light workspace, compact header, and mobile layout.
- [ ] Build the split AVYO login composition using the supplied image.
- [ ] Verify `/login` and an authenticated layout render, then commit `feat: redesign AVYO application shell`.

### Task 3: Shared operational surfaces

**Files:** Modify dashboard, lead table/filter, pipeline board/stage control, lead detail components, follow-up components, search page, and integrations page.

**Interfaces:** Presentation-only changes around existing props and server actions.

- [ ] Standardize page headers, panels, metric cards, badges, tables, forms, and empty states.
- [ ] Apply score, urgency, pipeline, source-confidence, and provider-status visual hierarchy.
- [ ] Preserve every form action, link, filter parameter, and database query.
- [ ] Run focused component checks and commit `feat: apply AVYO design to commercial workflows`.

### Task 4: Responsive and production verification

**Files:** Modify only components with verified clipping or accessibility defects.

**Interfaces:** No new business behavior.

- [ ] Inspect login, dashboard, leads, search, pipeline, lead detail, follow-ups, and integrations at desktop width.
- [ ] Inspect representative pages at 360px and fix navigation, tables, and action wrapping.
- [ ] Run `npm run typecheck`, `npm run lint`, and `npm run build` once.
- [ ] Commit fixes as `fix: polish AVYO responsive experience` and push `main`.
