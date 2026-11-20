# Cadence — Product & Engineering Blueprint

An AI-powered to-do and personal productivity app for Android and iOS.
"Cadence" is a working name; it has not been checked for trademark or store availability.

## Documents

| #   | File                                                         | Contents                                                                                                       |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1   | [01-product-spec.md](01-product-spec.md)                     | Vision, principles, domain model, functional requirements, release scope                                       |
| 2   | [02-design-system.md](02-design-system.md)                   | Design tokens (light/dark), typography, motion, haptics, component specs, accessibility                        |
| 3   | [03-navigation-and-screens.md](03-navigation-and-screens.md) | Route map, all 45 screens, user flows                                                                          |
| 4   | [04-architecture.md](04-architecture.md)                     | Stack decisions and why, diagrams, folder structure, state, offline sync, notifications, security, performance |
| 5   | [05-database.md](05-database.md)                             | PostgreSQL schema, RLS, indexes, deletion behaviour, local SQLite mirror                                       |
| 6   | [06-api.md](06-api.md)                                       | Sync RPCs, Edge Function endpoints, error codes, rate limits, versioning                                       |
| 7   | [07-ai-system.md](07-ai-system.md)                           | AI gateway, providers, tools, proposals, validation, memory, cost tracking                                     |
| 8   | [08-quality.md](08-quality.md)                               | Test strategy, failure handling, observability, CI/CD, environment variables                                   |
| 9   | [09-implementation-plan.md](09-implementation-plan.md)       | Build phases in order, Definition of Done per module                                                           |
| –   | [design/preview.html](design/preview.html)                   | Visual reference: tokens and 17 key screens, light and dark. Open in a browser                                 |

## The decisions in one page

| Area            | Decision                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile          | React Native + Expo + TypeScript, Expo Router                                                                                           |
| Local data      | SQLite on device (expo-sqlite + Drizzle) is the UI's source of truth                                                                    |
| Sync            | Custom patch-based outbox sync over two Postgres RPCs; Realtime used only as a "something changed" signal                               |
| Backend         | Supabase: Postgres, Auth, Row Level Security, Storage, Realtime, Edge Functions, pg_cron                                                |
| AI              | One server-side AI gateway (Edge Function) with a provider-neutral interface, tool calling, structured output, fallback, usage metering |
| AI safety model | AI reads directly, but changes only via proposals the user approves                                                                     |
| Notifications   | Local scheduled notifications for reminders; server push for server-generated events and as a safety net for un-synced devices          |
| Capture         | Deterministic on-device natural-language parser first (works offline), LLM parse as an online upgrade                                   |
| Monorepo        | pnpm workspaces: `packages/mobile`, `packages/shared`, `supabase/`                                                                      |

Reasons and rejected alternatives are in `04-architecture.md` §2.

## Assumptions made (change these before build if wrong)

These were not stated in the brief. Each is a decision the rest of the blueprint depends on.

1. **Single-user product.** No shared projects or team collaboration in the initial release. The schema
   keeps `user_id` ownership on every row so sharing can be added later, but nothing is designed for it yet.
2. **Online required for AI**, sign-in and attachments upload. Everything else works offline.
3. **Supabase hosted** (not self-hosted), one project per environment (dev, staging, prod).
4. **English only** at launch; strings are externalised so localisation can follow.
5. **Phones first.** Tablets get a responsive two-pane layout on four screens (§ tablets in doc 3), not a
   separate design.
6. **Sign-in methods:** email + password, Sign in with Apple, Google.
7. **Monetisation** is designed (free tier with AI quota, Pro subscription) but ships after the initial release.
8. **Voice** means dictation into quick-add and the assistant. Spoken replies from the assistant are later.

## Release scope at a glance

- **R1 — initial release:** everything in sections 3A–3H of the brief, all 45 screens (Subscription screen
  shows plan and usage only), light/dark/system themes, offline sync, all ten AI capabilities.
- **R2:** subscriptions and purchase flow, Google/Apple calendar two-way sync, timeline (Gantt) view,
  time tracking and focus timer, spoken assistant replies, home-screen widgets.
- **R3:** shared projects and collaboration, web app, email-to-inbox, integrations API.

Every functional requirement in `01-product-spec.md` is tagged R1, R2 or R3.

## Accuracy notes

- Library names in this blueprint are real projects to the best of my knowledge, but **exact APIs,
  version compatibility, quotas and prices were not verified against current documentation** while
  writing. `04-architecture.md` §4.11 lists each item to confirm before depending on it.
- No LLM prices are stated anywhere. Price columns in `ai_models` must be filled from each provider's
  current pricing page.
- Colour contrast ratios quoted in `02-design-system.md` were computed with the WCAG 2.x formula.
- `design/preview.html` was written by hand and has not been checked in a browser.
