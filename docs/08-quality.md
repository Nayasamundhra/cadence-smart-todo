# 8. Quality, Operations and Production Readiness

## 8.1 Test strategy

| Layer                 | Tool                                                                                                                      | What is covered                                                                                                                                                                                                       | Gate                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Unit — shared domain  | Vitest (or Jest)                                                                                                          | Recurrence advance (both modes, end conditions, DST boundaries, month-end), streak maths (all schedule types, pauses), goal progress, Today/Overdue rules, due labels, fractional ordering helpers, filter evaluation | PR                                    |
| Unit — NL parser      | same                                                                                                                      | ≥ 150 phrases table-driven, fixed clock, multiple week starts                                                                                                                                                         | PR                                    |
| Unit — schemas        | same                                                                                                                      | Zod schemas accept/reject fixtures; table registry matches Drizzle schema and `sync_push` whitelist                                                                                                                   | PR                                    |
| Component             | Jest + React Native Testing Library                                                                                       | Primitives and domain components: render states, accessibility labels/roles, press/swipe handlers, both themes                                                                                                        | PR                                    |
| Repository / local DB | Jest with an in-memory or temp-file SQLite                                                                                | Each repository function writes the right rows and outbox mutations; coalescing; undo                                                                                                                                 | PR                                    |
| Sync engine           | Jest; server faked by an in-process implementation of the push/pull contract, plus a suite against local Supabase         | Scenarios in §8.2                                                                                                                                                                                                     | PR (fake), nightly (real)             |
| Database              | pgTAP via `supabase test db`                                                                                              | RLS isolation for every table, composite-FK ownership, constraints, `sync_push`/`sync_pull` behaviour table, triggers (subtask depth, new-user rows)                                                                  | PR                                    |
| API / Edge Functions  | Deno test against local Supabase, LLM providers mocked at the adapter boundary                                            | Auth (missing, expired, other user's ids), validation, idempotency replay, rate limit and quota responses, proposal lifecycle, SSE event order, jobs idempotency                                                      | PR                                    |
| AI gateway            | Deno test with a scripted fake provider                                                                                   | Retry, fallback, repair-on-invalid, tool loop limits, usage rows, semantic validators                                                                                                                                 | PR                                    |
| AI evals              | Eval runner against real providers                                                                                        | Doc 07 §7.13                                                                                                                                                                                                          | Nightly + before prompt/model changes |
| End-to-end            | Maestro on iOS simulator + Android emulator against a seeded local/staging backend                                        | Flows 1–10 from doc 03 §3.10                                                                                                                                                                                          | Nightly + release                     |
| Performance           | Scripted seed of 5,000 tasks; Maestro + platform profilers                                                                | NF-01, NF-02; sync of 1,000 queued mutations; cold start                                                                                                                                                              | Release                               |
| Security              | Secret scan (gitleaks or equivalent), dependency audit, RLS suite, manual checklist §8.6                                  | PR (automated), release (manual)                                                                                                                                                                                      |
| Accessibility         | Automated label/role assertions in component tests; manual VoiceOver + TalkBack pass on core flows; 200 % font-scale pass | Release                                                                                                                                                                                                               |

Coverage expectation: `shared/domain`, the NL parser, repositories and the sync engine ≥ 90 % lines;
no global percentage target elsewhere.

## 8.2 Sync test scenarios (each is a named test)

1. Offline create → edit → complete → reconnect: one row on server with final state.
2. Two devices edit different fields of one task offline: both edits survive.
3. Two devices edit the same field: later arrival wins on both after sync.
4. Device A deletes, device B edits offline: task stays deleted on both.
5. Both devices complete the same recurring occurrence offline: exactly one advance, one completion row.
6. Both devices log the same habit on the same day offline: one log row.
7. Push succeeds but the response is lost; retry: no duplicates (`duplicate` results).
8. App killed mid-push and mid-pull-apply: restart resumes; no lost or doubled mutations.
9. Server rejects a mutation (constraint): local row reverts to server state; user is told once.
10. Pull page arrives for a row with pending local edits: local intent is preserved until pushed.
11. Session expires while offline with a non-empty outbox: after re-auth, outbox drains.
12. 1,000 queued mutations: drains in batches; UI remains responsive.
13. Row committed inside the 2-second cursor overlap window is not missed.
14. Device offline > 60 days: full resync path; purged tombstones do not resurrect rows.
15. Sign out with pending changes: warning; "sign out anyway" wipes; other account's DB is separate.

## 8.3 Failure handling

| Situation                                       | Behaviour                                                                                                                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No network                                      | All local features work. `SyncIndicator` shows offline. AI, reports, notification list, attachment upload show an offline banner and disabled action. Nothing blocks or spins indefinitely            |
| Flaky network / timeouts                        | Requests time out (15 s default, AI per doc 07); sync retries with backoff; user-triggered calls show an inline retry                                                                                 |
| Expired access token                            | Supabase client refreshes automatically; on a 401 the API client refreshes and retries once                                                                                                           |
| Refresh token invalid / revoked                 | Keep local data, stop sync, show a non-dismissable banner "Sign in again to keep syncing" → re-auth for the same account resumes with the outbox intact; a different account gets a separate database |
| Duplicate requests (double tap, retry)          | Buttons disable while pending; idempotency keys on API calls; mutation ids on sync; deterministic ids for natural-key rows                                                                            |
| Invalid AI output                               | Repair → fallback → `422`; UI: "The assistant couldn't produce a usable answer. Try again." Manual path always offered. Nothing invalid reaches the database                                          |
| AI provider outage                              | Fallback provider; if all fail `503` with retry. Today's suggestion card and all manual features unaffected                                                                                           |
| AI quota exhausted                              | `402`; banner with usage and reset date; AI entry points show the same message instead of failing late                                                                                                |
| Notification permission denied                  | Never re-prompt automatically; banner with "Open Settings" in the Notifications center and reminder pickers; everything else works                                                                    |
| Speech / camera / photo permission denied       | Inline explanation at the point of use with "Open Settings"; typing and file picking remain                                                                                                           |
| Sync conflict                                   | Resolved automatically by the rules in doc 04 §4.5; only a rejected mutation is surfaced to the user                                                                                                  |
| Sync stuck (same mutation fails 10 times)       | Mutation is quarantined (kept, skipped) so later changes flow; Settings → Data shows "1 change couldn't sync" with details and "Discard"; Sentry event                                                |
| Local DB migration fails                        | Recovery screen: "Reset local data and resync" (requires sign-in; pending changes export to a debug file first)                                                                                       |
| Corrupt/unknown rows from server (schema drift) | Zod parse per row on pull; bad rows are skipped and reported, the page still applies                                                                                                                  |
| App version too old                             | `426` → blocking update screen; local data stays readable                                                                                                                                             |
| Render crash                                    | Per-tab error boundary with "Reload"; root boundary as last resort; Sentry report with breadcrumbs                                                                                                    |
| Native crash                                    | Sentry native crash report on next launch; outbox is durable so no data loss                                                                                                                          |
| Empty states                                    | Specified per screen in doc 03; every list has one                                                                                                                                                    |
| Attachment upload fails                         | Stays queued with retry/backoff; after 5 failures shows "Couldn't upload" with Retry on the thumbnail                                                                                                 |
| Clock skew on device                            | `server_updated_at` (server clock) drives sync ordering, not client time; "today" uses the device's time zone and clock by design                                                                     |
| Time zone change (travel)                       | Dates are calendar days; `due_at`/`remind_at` are recomputed for floating-time tasks when the device zone changes, then notifications rescheduled; profile time zone update is offered, not forced    |

## 8.4 Observability

- **Sentry** in the app (JS + native crashes, performance traces for cold start, screen load, sync
  cycle) and in Edge Functions (errors with `requestId`, `userId` hash, route). Release and environment
  tags; source maps uploaded by EAS build.
- **Structured logs** in functions: one JSON line per request `{ requestId, route, userIdHash, status,
durationMs, aiCapability?, provider?, model?, tokens?, costUsd?, errorCode? }`. No user content.
- **Product analytics (PostHog):** screen views and a small event list — `task_created` (source),
  `task_completed`, `quick_add_parsed` (fields recognised), `ai_request` (capability, outcome),
  `proposal_resolved` (applied/total, had destructive), `plan_applied`, `habit_logged`,
  `notification_opened` (type), `sync_error`. No titles or free text. Analytics opt-out in Settings.
- **AI cost dashboard:** SQL views over `ai_usage_events` — cost per day, per capability, per model,
  per active user; fallback rate; invalid-output rate; p50/p95 latency.
- **Alerts:** daily AI spend > 80 % of budget; fallback rate > 10 % over 15 min; `sync_push` rejected
  rate > 1 %; job failure; crash-free sessions < 99.5 %; push error rate > 5 %.

## 8.5 CI/CD

GitHub Actions.

| Workflow         | Trigger                                                     | Steps                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci`             | PR, push to main                                            | Install (pnpm, cached) → typecheck → lint → unit + component + repository + sync(fake) tests → start local Supabase → apply migrations → pgTAP → function tests → secret scan → dependency audit |
| `nightly`        | schedule                                                    | Sync suite against local Supabase, AI evals (budget-capped), Maestro E2E on both platforms                                                                                                       |
| `deploy-backend` | merge to main → staging; tag → production (manual approval) | `supabase db push` (migrations), deploy functions, set secrets from the environment's store, smoke test `/v1/health` and one authenticated call                                                  |
| `build-app`      | tag / manual                                                | EAS Build (profiles: development, preview, production) → EAS Submit to TestFlight / Play internal track                                                                                          |
| `ota`            | manual, JS-only changes                                     | EAS Update to the matching runtime version channel, staged rollout                                                                                                                               |

Rules: migrations are forward-only and backward-compatible with the previous app version (add columns
nullable/defaulted; never rename or drop in the same release as the code change). New synced columns
are added to the table registry, server whitelist and local schema in one PR. Environments: `dev`
(local Supabase), `staging`, `production`, each a separate Supabase project and app variant
(bundle id suffix), so test builds never touch production data.

## 8.6 Release checklist (security and store readiness)

- [ ] RLS suite green; no table without RLS (`select` from `pg_tables` check in CI).
- [ ] App bundle inspected for secrets (strings scan of the built JS bundle for known key prefixes).
- [ ] Service-role key used only in `jobs/` and gateway bookkeeping; grep-verified.
- [ ] Storage policies tested: user B cannot read user A's object path or signed URL after expiry.
- [ ] Rate limits and quotas exercised; daily budget breaker tested in staging.
- [ ] Injection eval suite green.
- [ ] Account deletion removes rows, storage objects, push tokens; export works.
- [ ] Privacy policy lists data collected, LLM providers, analytics, retention; in-app links work.
- [ ] Store requirements confirmed against current policies: account deletion in-app, Sign in with
      Apple, permission purpose strings (notifications, microphone, speech recognition, camera, photos),
      data safety / privacy nutrition forms, AI-generated content disclosure if required.
- [ ] Accessibility pass (screen readers, font scale, contrast test for swatches) recorded.
- [ ] Performance budgets (NF-01, NF-02) measured on a mid-range Android device and recorded.

## 8.7 Environment variables

**Mobile** (`app.config.ts` via EAS environment; all public by design, prefixed `EXPO_PUBLIC_`):

| Name                                                                   | Purpose                                    |
| ---------------------------------------------------------------------- | ------------------------------------------ |
| `EXPO_PUBLIC_ENV`                                                      | `development` \| `staging` \| `production` |
| `EXPO_PUBLIC_SUPABASE_URL`                                             | Supabase project URL                       |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`                                        | Anon (publishable) key                     |
| `EXPO_PUBLIC_API_BASE_URL`                                             | `<supabase url>/functions/v1/api`          |
| `EXPO_PUBLIC_SENTRY_DSN`                                               | Sentry DSN                                 |
| `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`                  | Analytics                                  |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google sign-in                             |

**Build-time only (EAS secrets, never in the bundle):** `SENTRY_AUTH_TOKEN`, `EXPO_TOKEN`, store
credentials managed by EAS.

**Edge Functions** (Supabase secrets):

| Name                                                                 | Purpose                                          |
| -------------------------------------------------------------------- | ------------------------------------------------ |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`     | Provided by the platform                         |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (or the second provider's key) | LLM providers                                    |
| `AI_DAILY_BUDGET_USD`                                                | Global spend breaker                             |
| `AI_LOG_PAYLOADS`                                                    | `false` in production                            |
| `CRON_SECRET`                                                        | Authenticates pg_cron → jobs                     |
| `EXPO_ACCESS_TOKEN`                                                  | Expo Push (if enhanced push security is enabled) |
| `SENTRY_DSN_FUNCTIONS`                                               | Function error reporting                         |
| `APP_MIN_VERSION`                                                    | Oldest supported app version                     |

**Database settings:** cron job URLs and the cron secret are stored with Supabase Vault (or the
platform's recommended mechanism), not hard-coded in migrations.

A committed `.env.example` lists every name with empty values; real `.env*` files are git-ignored.

## 8.8 Third-party services

| Service                                          | Used for                                           | Needed in R1 |
| ------------------------------------------------ | -------------------------------------------------- | ------------ |
| Supabase                                         | Database, auth, storage, realtime, functions, cron | Yes          |
| Expo EAS                                         | Builds, submissions, OTA updates, push delivery    | Yes          |
| Apple Developer, Google Play Console             | Distribution, APNs, FCM credentials                | Yes          |
| Two LLM providers                                | AI                                                 | Yes          |
| Sentry                                           | Errors, performance                                | Yes          |
| PostHog                                          | Product analytics, feature flags                   | Yes          |
| Google Cloud OAuth client, Apple Sign in service | Social sign-in                                     | Yes          |
| RevenueCat                                       | Subscriptions                                      | R2           |
| Google Calendar API                              | Calendar sync                                      | R2           |
