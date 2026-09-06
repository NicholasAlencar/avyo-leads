# VIO LEADS Product Experience Restructure

## Goal

Rebuild the complete presentation layer of VIO LEADS as a polished, dense, fast commercial-intelligence product. This is not a cosmetic reskin. The existing Next.js, Supabase, authentication, persistence, security, scoring, search, and CRM behavior remain the foundation, while navigation, page composition, interaction hierarchy, information density, and shared components are replaced.

The Vetra reference defines the visual qualities: confident typography, large radii, restrained borders, layered dark and light surfaces, electric-blue accents, generous negative space, clean grids, and editorial hierarchy. The implementation will be original and adapted to an internal CRM rather than copying Vetra code or marketing content.

## Experience Principles

1. Every screen answers three questions immediately: where am I, what requires attention, and what is the next useful action?
2. Operational screens prioritize density and speed; analytical screens prioritize hierarchy and interpretation.
3. Decoration never competes with commercial information.
4. No fake controls, placeholder charts, invented company data, or empty navigation.
5. The user can move between discovery, qualification, outreach, follow-up, and pipeline without losing context.

## Application Shell

Desktop uses a 248px midnight sidebar with the isolated AVYO wordmark, icon-led navigation, section labels, integration health, and compact user controls. The current numbered boxes are removed. The active destination uses a blue inset surface and a clear left indicator, not glow-heavy decoration.

The content area uses a warm-gray canvas and a slim sticky command bar. The command bar contains page context, global lead search, a primary “Novo lead” action, notifications when real data exists, and the user menu. On narrow screens the sidebar becomes an accessible drawer and the command bar keeps search and the primary action available.

## Brand Assets

The supplied brand board is only a source reference. Production uses separate transparent assets for the AVYO symbol and horizontal wordmark, derived locally from the supplied image and visually cleaned. The interface never displays the complete brand board or crops it at runtime.

The core palette is midnight navy, white, cool grays, electric blue, and cyan. Semantic success, warning, danger, and pipeline colors are distinct and accessible. Typography uses one modern sans-serif with tabular numerals for metrics.

## Shared Component Architecture

Create a small internal UI system rather than styling every screen independently:

- `AppShell`, `SidebarNav`, `CommandBar`, and `MobileNavigation` define navigation.
- `PageHeading` defines breadcrumb, eyebrow, title, description, and actions.
- `Surface`, `StatCard`, `InsightCard`, and `EmptyState` define content hierarchy.
- `Button`, `IconButton`, `Input`, `Select`, `Checkbox`, `Textarea`, `Badge`, and `Avatar` define interaction states.
- `DataTable`, `TableToolbar`, `FilterChip`, and `Pagination` define operational data views.
- `PipelineColumn` and `LeadCard` define the Kanban language.
- `Drawer`, `Tabs`, and `ActivityTimeline` define lead-detail workflows.

Icons come from a consistent SVG icon package. All controls have hover, active, focus, disabled, loading, empty, and error states where applicable.

## Dashboard

The dashboard becomes a commercial command center rather than a grid of equal white cards.

- A compact welcome/header row shows the selected period and primary action.
- The first band highlights pipeline value, qualified leads, conversion, and next meetings with trend context only when supported by real data.
- A large “Prioridades de hoje” surface lists the highest-value actions: hot leads to approach, overdue follow-ups, replies awaiting action, and upcoming meetings.
- A funnel/pipeline overview shows real counts and values by stage.
- “Abordar agora” presents up to five scored leads with reasons, best channel, owner, and immediate actions.
- Segment performance and recent activity occupy the lower grid.

Empty states explain what data is missing and link only to working actions.

## Leads Workspace

The leads page uses a professional table workspace:

- Persistent page heading and toolbar.
- Search, filters, sorting, result count, and view density in one coherent control row.
- Applied filters appear as removable chips.
- Sticky table header and first company column.
- Company cell combines name, segment, city, and small contact-presence indicators.
- Score, status, owner, opportunity reason, and last activity are visually scannable.
- Row click opens the lead; overflow actions expose only implemented actions.
- Pagination and selection remain available without overwhelming the default view.

## Find Companies

Discovery is reorganized into a guided two-panel workspace. The left rail contains location, segment, keyword, radius, minimum score, and contact-presence filters. The main area explains provider availability, runs the search, and renders reviewable results before persistence. Source, confidence, duplicate detection, and import status are visible. Missing API credentials produce a clear configuration state rather than simulated results.

## Pipeline

The pipeline becomes a horizontally scrollable CRM board with a sticky summary bar. Each column shows stage name, count, value, and aging. Cards show company, score, owner, estimated value, last activity, and overdue state. Stage changes continue using validated server behavior. Dense cards, subtle stage accents, and consistent height replace oversized decorative panels.

## Lead Detail

Lead detail becomes a persistent intelligence workspace:

- Header: company identity, score, stage, owner, favorite state, and primary outreach action.
- Main tabs: Visão geral, Inteligência, Contatos, Abordagens, Atividades, and Histórico. Tabs render only real content.
- Overview: company facts, opportunity rationale, recommended service, contacts, source evidence, and confidence.
- Intelligence: explainable score factors, hypotheses, public financial-structure finding, and research actions.
- Outreach: channel drafts with tone selection, source-backed personalization, copy/edit/review workflow, and contact logging.
- Context rail: next action, follow-up, tags, lists, privacy/opt-out, and notes.

On mobile, the rail moves below the main content and primary actions remain sticky.

## Follow-ups and Integrations

Follow-ups use an agenda divided into overdue, today, upcoming, and completed, with channel, lead, owner, and suggested action. Integrations use consistent provider cards showing configured, action required, unavailable, or not configured. No connect button is added until its backend flow exists.

## Responsiveness and Accessibility

The primary target is desktop at 1280–1600px, with complete usability down to 360px. Tables scroll horizontally; toolbar controls wrap intentionally; Kanban remains horizontally scrollable; drawers replace crowded multi-column layouts. All controls are keyboard-accessible, focus-visible, labeled, and contrast-compliant. Motion is subtle and disabled through reduced-motion preferences.

## Preservation and Migration Strategy

The restructuring is implemented from the outside inward:

1. Replace brand assets, tokens, icons, primitives, and the application shell.
2. Recompose dashboard, leads, pipeline, discovery, and lead detail using the new primitives.
3. Recompose follow-ups, integrations, forms, login, empty/error/loading states.
4. Remove obsolete presentation components only after every consumer is migrated.

Server components, queries, actions, validation, provider adapters, RLS, and migrations remain unchanged unless a proven UI requirement needs a narrowly scoped domain addition.

## Acceptance Criteria

- The complete brand board is absent from all runtime screens.
- The AVYO logo exists as clean transparent production assets.
- Sidebar numbering and generic promotional blocks are removed.
- Dashboard, leads, discovery, pipeline, lead detail, follow-ups, integrations, login, and create-lead use one coherent component system.
- Existing actions and persistence remain functional.
- No non-functional control or invented metric is introduced.
- Desktop and mobile layouts have no clipping, unusable overlays, or unreadable contrast.
- Unit tests, type checking, lint, and production build pass.
- Representative flows are visually inspected in the running application.
