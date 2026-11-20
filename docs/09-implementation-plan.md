# 9. Implementation Plan and Handoff

Written for the implementing agent (Claude Sonnet in Claude Code) and whoever supervises it.

## 9.1 How to work

1. Build phases in order. Each phase ends with its Definition of Done (DoD); run every check and report
   the real result. Do not start the next phase with a failing DoD unless the user agrees.
2. Before using any library API, read its current documentation (doc 04 §4.11). If a named library is
   unmaintained or incompatible, stop and propose a replacement rather than working around it silently.
3. Keep `CLAUDE.md` → Commands up to date as scripts are added.
4. One PR-sized change at a time: schema → shared types → repository → UI → tests.
5. Anything the blueprint leaves open that affects users or data: ask. Small internal choices
   (file names inside a feature, helper signatures): decide and move on.
6. Never weaken a rule in `CLAUDE.md` to make a test pass.

**Global DoD (applies to every phase):** the phase's features work on **both Android and iOS**, checked
on the Android phone and in the iOS Simulator using the cloud setup in doc 04 §4.12 (Maestro flows green
on both, iOS screenshots reviewed), with any platform difference handled as that section specifies.
Items the simulator cannot prove are listed in the phase report as "not yet verified on a real iPhone"; typecheck, lint and all existing tests pass; new logic has
tests at the layer doc 08 §8.1 assigns; screens use tokens only, work in light and dark, have empty /
error / offline states where applicable and accessibility labels; no new secret in the repo; docs
updated if behaviour deviates from the blueprint (with the reason).

## 9.2 Phases (R1)

### Phase 0 — Foundations

Monorepo (pnpm, TS project references), Expo app with Expo Router skeleton and the five tabs as
placeholders, `packages/shared`, local Supabase (`supabase init`), ESLint (with import-boundary rules),
Prettier, test runners, GitHub Actions `ci`, env handling with `.env.example`, Sentry + PostHog wired
behind an env switch, EAS project and build profiles (including an iOS simulator profile); GitHub Actions macOS job that
builds or downloads the iOS simulator build, boots a simulator, runs a Maestro smoke flow and uploads
screenshots.
**DoD:** app boots on the Android phone and in the iOS Simulator on the macOS CI runner, showing five
empty tabs (screenshot artifact from the iOS job); `ci` green; a
deliberate thrown error appears in Sentry (dev project); commands documented.

### Phase 1 — Design system

Tokens, `ThemeProvider` (system/light/dark, persisted), fonts, all primitives from doc 02 §2.6,
`/_dev/gallery` route showing every primitive in every state.
**DoD:** gallery renders all primitives in both themes; swatch contrast test exists and passes (adjust
swatch values if needed and record the change in doc 02); component tests assert roles/labels; font
scale 200 % checked on the gallery.

### Phase 2 — Data layer and core tasks (local only)

Postgres migrations for all R1 tables with RLS and pgTAP isolation tests; shared Zod schemas and table
registry; Drizzle local schema + migrations; repositories for tasks, subtasks, tags, categories,
projects, sections, workspaces, reminders, comments, completions; `shared/domain` (recurrence, Today
rules, due labels); domain components (`TaskRow`, pickers); screens 9–17 except AI entry points; quick
add with the on-device parser; swipe actions, bulk mode, undo; drag-reorder spike and decision.
**DoD:** with no network and no account (dev bypass), a user can create, edit, complete, reopen,
duplicate, archive, delete and reorder tasks and subtasks, set recurrence and see correct next
occurrences; parser table tests pass; pgTAP green; repository tests cover every function; 5,000-task
seed scrolls smoothly (subjective check now, measured in Phase 10).

### Phase 3 — Auth, onboarding, sync

Screens 1–8; Supabase Auth (email, Apple, Google); session storage; per-user DB files;
`sync_push`/`sync_pull` SQL; `SyncEngine`; Realtime signal; `SyncIndicator`; Settings → Data; sign-out
and recovery paths.
**DoD:** all 15 scenarios in doc 08 §8.2 pass (fake server in CI, real local Supabase in the nightly
suite); two simulators signed into one account converge within seconds; airplane-mode flow 10 passes
in Maestro; auth error cases handled (wrong password, unverified email, expired session offline).
If the custom engine cannot pass the scenarios, stop and raise the PowerSync fallback (doc 04 §4.2).

### Phase 4 — Organisation

Browse tab, screens 18–22 and 24; workspaces switcher; project list/board views with drag across
sections; categories and tags management; search (FTS or fallback) and filter sheet; saved views;
smart lists.
**DoD:** project progress matches counts; board drag works with the accessibility alternative; a saved
view persists and syncs; search returns results from titles, notes and comments in under 100 ms on the
5,000-task seed (target).

### Phase 5 — Calendar and time blocking

Screen 23 in month/week/day; time blocks repository; drag to create/move/resize; unscheduled drawer;
recurring occurrence expansion; conflict detection; `getBusyIntervals`.
**DoD:** blocks created by drag persist and sync; conflicts are flagged; recurring tasks appear on
future dates without creating rows; DST-boundary week renders correctly (test).

### Phase 6 — Notifications

Local scheduler with diffing and the pending cap; notification categories and actions; push token
registration; `push_devices`; server push helper; jobs: safety net, push receipts; screens 39 and 43;
permission flows.
**DoD:** a reminder fires at the right time with the app killed (manual test on the Android phone and
on the borrowed real iPhone, see doc 04 §4.12 — simulators are not sufficient here); Complete action completes the task; changing
a due time reschedules; denied permission shows banners and nothing crashes; safety-net job unit test
proves no push goes to an already-synced device.

### Phase 7 — Habits and goals

Screens 31–36; streak and progress logic in `shared/domain`; habit reminders in the scheduler; goal ↔
task linking; progress snapshots job.
**DoD:** streak tests cover every schedule type, pauses and retroactive logging; two devices logging
the same day converge to one log; goal progress matches the rules in G-04.

### Phase 8 — Analytics and reports

Screen 37 computed on device; chart library decision and themed chart components (load the charting
guidance available to the agent before writing chart code); jobs: `user-hourly` rollup, weekly report
(templated summary for now); screen 38.
**DoD:** dashboard numbers equal SQL fixtures in tests; dashboard works offline; weekly report job is
idempotent; charts expose text summaries to screen readers.

### Phase 9 — AI

In this order, each usable before the next starts:

1. Gateway core: provider interface, two adapters, router, retry/fallback, usage logging, policy
   (enabled, rate limit, quota, budget), fake provider for tests.
2. `parse_task` + quick-add "Parse with AI" chip; voice input.
3. Proposal model: operations schema, server validation, `ai-proposals` apply/undo on device,
   screen 30.
4. `breakdown` (screen 27), `plan_day` (26), `schedule` (28), `prioritize` (Today ordering hint).
5. Chat: SSE endpoint, tools, context builder, conversations, memories; screens 25 and 44.
6. `insights` (29), `goal_recommendations`, AI weekly summary, suggestion detectors + Today card.
7. Eval suites.
   **DoD:** gateway tests prove retry, fallback, repair and limits; no code path lets the server write
   user task data on behalf of the model (grep + test); every AI screen has offline, quota and AI-off
   states; eval suites meet doc 07 §7.13 thresholds; injection suite green; flows 3–6 pass in Maestro
   against a scripted fake provider; real-provider smoke test passes in staging.

### Phase 10 — Settings, hardening, release

Screens 40–42, 45; export and account deletion; attachments upload queue (if not already complete);
tablet layouts (doc 03 §3.9); performance measurement and fixes; accessibility pass; release checklist
(doc 08 §8.6); store assets and submission builds.
**DoD:** every item in the release checklist ticked with evidence; all Maestro flows green on both
platforms; NF-01 and NF-02 measured and recorded; Play internal build smoke-tested on the Android phone;
TestFlight or internal-distribution build smoke-tested on the borrowed real iPhone, including
every item doc 04 §4.12 lists as "cannot be proven in the simulator".

## 9.3 Module Definition of Done (reference)

| Module             | Done when                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks              | T-01–T-17 work offline and online; undo paths work; recurring completion is guard-protected; all task screens have the states in doc 02 §2.8                                    |
| Quick add          | Opens in one tap from every primary screen, keyboard up, focus set; parser highlights and chips match the test table; context pre-fill correct per screen; continuous add works |
| Organisation       | O-01–O-08; deleting a project/section/tag/category follows the specified outcome for its tasks; board has a non-drag alternative                                                |
| Calendar           | C-01–C-06; no row is created for virtual recurring occurrences; conflict hatch + Resolve entry                                                                                  |
| Sync               | Doc 08 §8.2 scenarios; indicator states correct; quarantine and recovery UIs exist                                                                                              |
| Habits             | H-01–H-06; streak maths tested; reminders scheduled and cancelled with habit state                                                                                              |
| Goals              | G-01–G-06; progress rules tested; history chart loads and degrades offline                                                                                                      |
| Notifications      | N-01–N-06; defaults as specified; quiet hours respected locally and server-side; no duplicate delivery across local + push                                                      |
| Analytics          | A-01–A-03; numbers verified against fixtures; each chart has a takeaway sentence                                                                                                |
| AI                 | AI-01–AI-12, AI-14; all changes pass through proposals; destructive items unchecked by default; usage, quota and fallback observable in `ai_usage_events`                       |
| Settings & account | S-01–S-06; theme switch is instant and persisted; export and delete verified end to end                                                                                         |
| Design system      | Tokens only in screens (lint rule); both themes; contrast tests; gallery current                                                                                                |

## 9.4 Later releases

| Release | Items                                                                                                                                                                                                    | Notes for when the time comes                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| R2      | Subscriptions (RevenueCat, server-verified entitlements → `profiles.plan`), calendar integrations, timeline view, time tracking and focus timer, spoken assistant replies, widgets, accent colour choice | Tables reserved in doc 05; `getBusyIntervals` is the calendar seam |
| R3      | Shared projects, web app, email-to-inbox, public API                                                                                                                                                     | Requires RLS redesign for membership and a sync scope change       |

## 9.5 Open questions for the product owner

Answering these before Phase 0 removes the remaining guesswork (current assumptions in `README.md`):

1. Who holds the Apple/Google developer accounts, and the final bundle identifier (see the name note below).
2. Which two LLM providers, and the monthly AI budget that sets the free-tier quotas.
3. Data residency: which Supabase region; any regulatory scope (GDPR and similar) to design consent for.
4. Free vs Pro split for R2 (which AI limits and features sit behind Pro).

Decided by the product owner (17 Nov 2026):

- Email verification **is required** before first use (doc 03, screen 3).
- The on-device database is **not encrypted** in R1 (doc 04 §4.7).
- **Product name is deferred.** Build with the working name "Cadence". To make the later rename a
  one-line change: define the display name, URL scheme and bundle identifier once in
  `packages/mobile/app.config.ts` (read from env), and reference the name in UI copy only through a
  single `APP_NAME` constant — never as a literal string in screens, prompts or notifications. Use a
  placeholder bundle identifier (`com.example.cadence`) for development builds. The final name and
  bundle identifier **must be set before the first store submission in Phase 10**, because a bundle
  identifier cannot be changed once an app is published.
