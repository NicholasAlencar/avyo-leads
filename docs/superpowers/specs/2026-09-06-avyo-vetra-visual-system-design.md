# AVYO Vetra-Inspired Visual System

## Objective

Redesign the authenticated VIO LEADS product with the visual language and layout principles of the Vetra reference while preserving every working commercial workflow. The result remains an internal sales-intelligence application, not a marketing landing page and not a copy of Vetra branding or content.

## Brand Direction

The AVYO brand board supplied by the user is the sole identity reference. The product uses electric blue, cyan, midnight navy, white, and cool neutral grays. The AVYO symbol and wordmark replace the temporary VIO letter badge. The supplied board is stored as an original brand reference; production placements use non-destructive crops so the source artwork is not altered.

Core tokens:

- Midnight: `#030A18`
- Navy: `#07152D`
- Electric blue: `#075BFF`
- Cyan: `#08C8F8`
- Surface: `#FFFFFF`
- Canvas: `#F5F7FB`
- Text: `#081122`
- Muted text: `#667085`
- Border: `#E5EAF2`
- Success, warning, and danger retain accessible semantic colors and never rely on color alone.

## Product Shell

Desktop uses a fixed dark navy sidebar and a light workspace. The sidebar contains the AVYO horizontal mark, grouped navigation, compact icons, active-item blue glow, integration status, and the current user. Mobile replaces the fixed sidebar with a compact top navigation without removing functionality.

The header provides page context, global search, quick-create action, notifications, and user menu. Content uses a wide grid, generous spacing, 20–24px card radii, subtle borders, restrained shadows, and blue gradient accents inspired by the Vetra reference.

## Component System

Shared components provide one visual contract across the app:

- `AvyoLogo`: horizontal, symbol-only, light, and dark variants through non-destructive cropping.
- `PageHeader`: eyebrow, title, description, and actions.
- `MetricCard`: value, comparison, icon, optional sparkline, and loading/empty states.
- `Panel`: standard card shell with header and optional action.
- `StatusBadge`: accessible pipeline, score, and integration states.
- `DataTable`: sticky header, compact density, hover state, selection, sort, filters, pagination, and empty state.
- `FormField`: unified labels, help, validation, focus, and disabled styling.
- `PrimaryButton`, `SecondaryButton`, and `DangerButton`: consistent interaction states.

No decorative control may be rendered without a working action.

## Screen Treatment

### Login

Split composition: a dark AVYO brand environment using the supplied image on the left and a focused white authentication card on the right. Small screens prioritize the form and retain a compact brand header.

### Dashboard

Vetra-like analytical composition with a strong overview row, commercial metric cards, an “Abordar agora” priority panel, funnel summary, segment performance, and upcoming activities. Existing live Supabase data remains the source.

### Leads

Premium operational table with toolbar, filters, saved-view-ready layout, score emphasis, compact contact indicators, status badges, next-action space, and bulk-selection affordance only where real actions exist.

### Find Companies

A guided search workspace with prominent filter panel, provider state, transparent source labeling, result cards, and review-before-import. Missing credentials remain explicitly labeled as unconfigured.

### Pipeline

Wide Kanban layout with visually distinct stages, compact lead cards, score and value hierarchy, responsible owner, last activity, and overdue cues. Existing validated stage transitions remain authoritative.

### Lead Detail

Two-column intelligence workspace: company evidence, score explanation, research, outreach drafts, and timeline in the primary column; stage, owner, follow-up, privacy, tags, lists, and notes in the contextual rail.

### Follow-ups and Integrations

Follow-ups use an agenda-like list grouped by urgency. Integrations use provider cards with configured, unavailable, and action-required states. No fake connection action is introduced.

## Data and Behavior Preservation

The redesign changes presentation and shared composition only. Supabase schema, RLS, authentication, provider contracts, server actions, audit logs, scoring rules, and persistence semantics remain intact unless a visual requirement exposes a genuine missing domain capability. Such capabilities must be implemented separately with migrations and authorization review.

## Accessibility and Responsiveness

All interactive controls have visible focus, labels, keyboard access, sufficient contrast, and at least 44px touch targets where practical. Tables preserve horizontal scrolling on small screens. Layouts are desktop-first but remain usable from 360px upward. Motion is subtle and respects reduced-motion preferences.

## Asset Handling

The supplied AVYO image is copied into `public/brand` during implementation. It must not be uploaded to third parties. CSS object positioning provides the required logo variants without generating or fabricating new identity artwork. Optimized derivatives may be added only if produced from the supplied source and visually verified.

## Verification

Implementation is accepted when the login, dashboard, leads, search, pipeline, lead detail, follow-ups, and integrations screens use the new system; existing actions remain functional; no fake control is added; TypeScript, lint, and production build pass; and representative desktop and mobile screenshots show no clipping or unreadable contrast.
