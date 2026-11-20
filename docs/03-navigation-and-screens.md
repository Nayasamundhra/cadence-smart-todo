# 3. Navigation and Screens

## 3.1 Structure

```
Root stack
├─ index                    gate: decides auth / onboarding / app
├─ (auth)        stack      welcome, sign-up, sign-in, forgot-password, reset-password
├─ (onboarding)  stack      intro, preferences, notifications
└─ (app)         stack      everything below is pushed above the tabs
   ├─ (tabs)
   │   ├─ today             Today dashboard
   │   ├─ browse            Inbox, smart lists, saved views, projects
   │   ├─ calendar          Month / week / day
   │   ├─ progress          Habits | Goals | Insights (segmented)
   │   └─ assistant         AI chat
   └─ pushed and modal routes (table in 3.2)
```

Tab bar: five items, icon + label, 56 high. Active = accent icon and label; inactive = textTertiary.
Labels: Today, Browse, Calendar, Progress, Assistant.

Global entry points:

- **Avatar** (top-left of Today) → Profile → Settings.
- **Bell** (top-right of Today) → Notifications Center. Shows a dot when unread.
- **Search** icon (top-right of Browse, and of any list) → Search.
- **FAB** → Quick add, pre-filled with the context of the current screen (project, date, section).

## 3.2 Route map (Expo Router)

`P` = pushed screen, `M` = modal presentation, `S` = bottom sheet (a component, not a route, unless noted).

| #   | Screen                    | Route                                                                          | Type    |
| --- | ------------------------- | ------------------------------------------------------------------------------ | ------- |
| 1   | Splash                    | `/` (`app/index.tsx`)                                                          | gate    |
| 2   | Welcome                   | `/(auth)/welcome`                                                              | P       |
| 3   | Sign up                   | `/(auth)/sign-up`                                                              | P       |
| 4   | Login                     | `/(auth)/sign-in`                                                              | P       |
| 5   | Forgot password           | `/(auth)/forgot-password`, `/(auth)/reset-password`                            | P       |
| 6   | Onboarding                | `/(onboarding)/intro`                                                          | P       |
| 7   | Productivity preferences  | `/(onboarding)/preferences`                                                    | P       |
| 8   | Notification permission   | `/(onboarding)/notifications`                                                  | P       |
| 9   | Today                     | `/(app)/(tabs)/today`                                                          | tab     |
| 10  | Inbox                     | `/(app)/inbox`                                                                 | P       |
| 11  | All tasks                 | `/(app)/tasks/all`                                                             | P       |
| 12  | Upcoming                  | `/(app)/tasks/upcoming`                                                        | P       |
| 13  | Completed                 | `/(app)/tasks/completed`                                                       | P       |
| 14  | Task creation             | `QuickAddSheet` (S) and `/(app)/task/new` (M, full form)                       | S / M   |
| 15  | Task details              | `/(app)/task/[id]`                                                             | P       |
| 16  | Edit task                 | `/(app)/task/[id]/edit`                                                        | M       |
| 17  | Subtask management        | `/(app)/task/[id]/subtasks`                                                    | P       |
| 18  | Projects dashboard        | `/(app)/projects`                                                              | P       |
| 19  | Project details           | `/(app)/project/[id]`                                                          | P       |
| 20  | Create / edit project     | `/(app)/project/new`, `/(app)/project/[id]/edit`                               | M       |
| 21  | Categories and tags       | `/(app)/organize`                                                              | P       |
| 22  | Kanban board              | `/(app)/project/[id]?view=board` (same route as 19, board mode)                | P       |
| 23  | Calendar                  | `/(app)/(tabs)/calendar`                                                       | tab     |
| 24  | Search and filters        | `/(app)/search`, `/(app)/view/[id]` (saved view)                               | P       |
| 25  | AI chat                   | `/(app)/(tabs)/assistant`, `/(app)/assistant/history`                          | tab / P |
| 26  | AI daily planner          | `/(app)/ai/planner`                                                            | M       |
| 27  | AI task breakdown         | `/(app)/ai/breakdown`                                                          | M       |
| 28  | AI scheduling suggestions | `/(app)/ai/schedule`                                                           | M       |
| 29  | AI productivity insights  | `/(app)/ai/insights`                                                           | P       |
| 30  | AI action confirmation    | `/(app)/ai/proposal/[id]`                                                      | M       |
| 31  | Habits dashboard          | `/(app)/(tabs)/progress` (segment Habits)                                      | tab     |
| 32  | Create / edit habit       | `/(app)/habit/new`, `/(app)/habit/[id]/edit`                                   | M       |
| 33  | Habit details             | `/(app)/habit/[id]`                                                            | P       |
| 34  | Goals dashboard           | `/(app)/(tabs)/progress` (segment Goals)                                       | tab     |
| 35  | Goal details              | `/(app)/goal/[id]`; create/edit `/(app)/goal/new`, `/(app)/goal/[id]/edit` (M) | P       |
| 36  | Milestone management      | `/(app)/goal/[id]/milestones`                                                  | P       |
| 37  | Analytics dashboard       | `/(app)/(tabs)/progress` (segment Insights) and `/(app)/analytics` (full)      | tab / P |
| 38  | Weekly report             | `/(app)/report/[weekStart]`                                                    | P       |
| 39  | Notifications center      | `/(app)/notifications`                                                         | P       |
| 40  | Profile                   | `/(app)/profile`                                                               | P       |
| 41  | General settings          | `/(app)/settings`                                                              | P       |
| 42  | Appearance                | `/(app)/settings/appearance`                                                   | P       |
| 43  | Notification preferences  | `/(app)/settings/notifications`                                                | P       |
| 44  | AI preferences            | `/(app)/settings/ai`                                                           | P       |
| 45  | Subscription              | `/(app)/settings/subscription`                                                 | P       |

Deep links (scheme `cadence://`, also used by notifications): `task/<id>`, `habit/<id>`, `goal/<id>`,
`report/<weekStart>`, `ai/planner`, `ai/proposal/<id>`, `today`.

## 3.3 Authentication and onboarding

**1. Splash (`/`)** — Shows the wordmark on `bg` while: fonts load, local DB migrates, session is read
from secure storage. Then redirects: no session → Welcome; session but `onboarding_completed_at` null →
Onboarding; else → Today. Never waits on the network. If the stored session is expired and offline, enter
the app in offline mode with local data; refresh when online (§ 08 failure table).

**2. Welcome** — Wordmark, display-serif line "Plan less. Do more of what matters.", three-line value
list (capture, plan, keep going). Buttons: "Create account" (primary) → 3, "I already have an account"
(ghost) → 4, "Continue with Apple", "Continue with Google". Footer: Terms, Privacy links.

**3. Sign up** — Fields: name, email, password (min 10 chars; strength hint; show/hide). Inline
validation on blur. Submit → "Check your email" state with resend (60 s cooldown) and "Open mail app".
After verification deep link → Onboarding. Errors: email in use → message with "Sign in instead".
**Verification is required (decided):** an unverified account cannot enter onboarding or the app;
signing in with an unverified email returns to this "Check your email" state. Apple and Google
sign-ins count as verified.

**4. Login** — Email, password, "Forgot password?" → 5. Apple / Google buttons. Errors are generic
("Email or password is incorrect"). After 5 failures show a cooldown message (Supabase Auth rate limit).
Success → gate logic of Splash; first sign-in on a device triggers initial sync with a progress screen
("Getting your tasks…") that blocks only until the first pull page arrives.

**5. Forgot password** — Email field → "If an account exists, we've sent a link." Link opens
`reset-password`: new password + confirm → signs in → Today.

**6. Onboarding intro** — Three swipeable pages, each one headline (serif) and one illustration made of
real UI components (a task row being completed, a plan card, a habit ring). Skip is always visible.
"Get started" → 7.

**7. Productivity preferences** — One screen, four short questions, all pre-filled so "Continue" works
untouched:

1. "What do you want to organise?" multi-select chips: Personal, Work, Study, Side projects, Health,
   Home → creates workspaces (max 3 selected become workspaces; others become projects in Personal).
2. "When do you usually work?" start and end time (default 09:00–18:00) and weekdays (Mon–Fri).
3. "When are you sharpest?" Morning / Afternoon / Evening.
4. "Let the assistant use your tasks to help plan?" switch, on by default, with a "What this means"
   link to a sheet summarising doc 07 §9 in plain words.
   Writes `user_preferences` and seeds workspaces, categories and three sample tasks in Inbox (deletable).

**8. Notification permission** — Explains the two default notification types with a mock notification.
"Turn on notifications" triggers the OS prompt; "Not now" skips. Either way → set
`onboarding_completed_at` → Today. Denial is recorded locally; never re-prompt automatically.

## 3.4 Main application

**9. Today (`/today`)** — The home screen.

- Header: avatar (left), `SyncIndicator`, bell (right). Below: date in display serif ("Monday, 16
  November"), and a caption summary ("6 tasks · 2 habits · about 4 h planned").
- `SuggestionCard` slot (zero or one). In the morning with no plan for today: "Plan my day" → 26.
- Sections, in order, each hidden when empty: **Overdue** (collapsible, with "Reschedule all" → 28
  pre-filled), **Plan** (tasks with time blocks today, in time order, showing time range),
  **Today** (remaining tasks; manual order by drag), **Habits** (horizontal row of compact habit
  checks; tap = log; "See all" → Progress), **Done today** (collapsed count; expands).
- FAB → quick add with planned date = today.
- Empty: "Nothing planned for today." action "Add a task" plus secondary "Plan from my backlog" → 26.
- Pull to refresh triggers a sync.

**10. Inbox** — Flat manually-ordered list of tasks without a project. Header ⋯: sort, select, "Organise
with AI" (opens chat with that prompt). Empty: "Inbox zero. Captured tasks land here."

**11. All tasks** — Every open task. Sticky filter bar: workspace chip, group by (project | due date |
priority | category), sort. Uses the same filter model as Search. Empty: "No open tasks."

**12. Upcoming** — `WeekStrip` at top (scrolls weeks), then a list grouped by day for the next 30 days
then by month. Each day header has "+" (quick add for that day). Recurring occurrences are shown.
Dragging a task onto another day header reschedules it. Empty day rows are omitted.

**13. Completed** — Grouped by completion day, newest first, paginated 50 at a time from the local DB.
Segments: Completed | Archived. Row tap → details; swipe right = reopen. Header ⋯: "Archive completed
older than 30 days".

**14. Task creation**

- _QuickAddSheet_ (default), top to bottom, over the dimmed current screen:
  1. Header row: destination chip (project colour dot + name, or "Inbox"; tap → `ProjectPicker`) on the
     left; expand icon on the right opens the full form with the current draft.
  2. Title input: 19 pt medium, multi-line (max 3 lines), auto-focused, keyboard up. As the user types,
     the local parser marks recognised phrases as inline tokens (accentSoft background, accent text);
     tapping a token un-parses it back to plain title text.
  3. "Add notes" placeholder line (14 pt, textTertiary); tapping it expands a notes field.
  4. Value chips: only values that are set appear (date/time, priority, tags, reminder, repeat), each
     with an icon and ✕ to clear. The project is not repeated here because the destination chip shows
     it. The row is hidden when nothing is set.
  5. Toolbar above the keyboard, separated by a hairline: icon buttons for Tags, Reminder, Repeat and
     the mic `VoiceButton` on the left (Date and Priority icons appear here too while unset, and move
     to the chip row once set); pill "Add task" button on the right, disabled until a title exists.
     After submit the sheet stays open and clears for the next task (destination persists); swipe down to
     close. When the text looks complex (multi-clause or > 12 words) and the device is online, a spark
     chip "Parse with AI" appears at the start of the chip row → fills the values from the AI-01 result.
- _Full form_ (`/task/new`): same fields as Edit (16).

**15. Task details (`/task/[id]`)** — Top bar: back, project breadcrumb (tap → project picker), ⋯ menu
(Edit, Duplicate, Break down with AI → 27, Convert to project, Archive, Delete). Body, in order:
large checkbox + title (inline editable, multi-line); property rows with icons, each opening its picker
sheet: Due, Planned, Reminder, Repeat, Priority, Duration, Category, Tags, Goal; Notes (inline editor);
Subtasks (list with inline "Add subtask", progress `2/5`, "Manage" → 17, spark "Suggest subtasks");
Attachments (thumbnail grid + add); Comments (list + composer pinned at the bottom); footer caption:
created / completed dates. Unset property rows collapse into an "Add…" chip row to keep the screen short.

**16. Edit task (`/task/[id]/edit`, also `/task/new`)** — Modal form with all fields in grouped cards:
Basics (title, notes), When (due, planned, duration, repeat, reminders), Where (project, section),
Labels (priority, category, tags), Links (goal, milestone). Top bar: Cancel / Save. Save is disabled
until valid and dirty. Leaving with unsaved changes asks to discard. Validation: title 1–500 chars;
due time requires due date; reminder relative type requires a due time; recurrence requires a due date.

**17. Subtask management** — Full-screen reorderable list. Each row: drag handle, checkbox, inline
title, ⋯ (set date, set priority, promote to task, delete). Bottom input adds continuously (Return adds
another). Header action: "Suggest with AI" → 27 scoped to this task. Paste of multi-line text creates
one subtask per line.

## 3.5 Organisation

**Browse tab** (hosts the entry points for 10–13, 18, 21, 24) — Workspace switcher (chip row: All +
workspaces). Then: Inbox (count), Today, Upcoming, All tasks, Completed; "Saved views" list;
"Projects" grouped by workspace with progress rings and a "See all" → 18; footer rows: Categories &
tags → 21. Search icon in header → 24.

**18. Projects dashboard** — Grid (2 columns) or list toggle of `ProjectCard`s grouped by workspace.
Header "+" → 20. Long-press → reorder, edit, archive. Segment: Active | Archived. Empty: "Projects group
tasks that belong together." action "Create project".

**19. Project details** — Header: colour dot + name, progress ring, ⋯ (Edit → 20, Add section, Sort,
Show completed, Archive, Delete). `SegmentedControl`: List | Board | Calendar. _List_: sections as
collapsible groups with counts; drag tasks within and across sections; "Add section" at the end.
FAB → quick add with project (and section, if a section is focused) pre-filled. Empty: "No tasks in
this project yet." with "Add task" and "Break down a goal with AI" → 27.

**20. Create / edit project** — Fields: name (required, ≤ 120), workspace, colour (swatch row), icon
(grid of ~40 Lucide icons), description, target date, default view. Edit adds Archive and Delete
(dialog: "Delete tasks too" / "Move tasks to Inbox").

**21. Categories and tags** — Two segments. Each: reorderable list with colour, name, usage count;
"+" adds; row tap → edit sheet (name, colour, icon for categories); swipe to delete (tasks keep
existing but lose the label; confirm shows the affected count). Tapping the count opens a filtered list.

**22. Kanban board** — Horizontal paging columns (one section per column, plus "No section" first if
non-empty). Long-press a card to drag: within a column to reorder, to the screen edge to auto-scroll to
neighbouring columns. Dropping into a section flagged _done section_ completes the task. Column ⋯:
rename, move left/right, mark as done section, delete. Trailing ghost column "Add section".
Accessibility alternative: card ⋯ → "Move to section…".

**23. Calendar tab** — Header: month title (tap → jump-to-date), Today button, view switch
(Month | Week | Day), workspace filter.

- _Month_: grid with up to 3 coloured dots + "+n"; selected day's agenda list below (resizable split).
- _Week_: 7-column time grid, all-day strip on top, current-time line.
- _Day_: single-column grid with an "Unscheduled" drawer at the bottom listing today's tasks without
  blocks; drag from the drawer onto the grid to time-block.
- Long-press empty slot → new block sheet (title or pick task, start, end). Tap block → sheet: open
  task, edit times, remove block. Conflicts hatched with a "Resolve" chip → 28.
- Header spark → "Suggest a schedule" → 28 for the visible day.

**24. Search and filters** — Search field auto-focused; recent searches; as-you-type results grouped
Tasks / Projects / Tags / Habits / Goals (local full-text). Filter button opens the filter sheet:
status, date range, priority, workspace, project, category, tags (any/all), has reminder, recurring,
has attachment, include archived. Active filters show as removable chips. "Save as view" stores the
filter + sort + group with a name and icon → appears in Browse; `/view/[id]` renders it with an Edit action.

## 3.6 AI features

**25. AI chat (Assistant tab)** — Header: "Assistant", history icon → `/assistant/history` (list of past
conversations: title, date, swipe to delete), new-chat icon. Empty conversation shows a greeting and
six prompt chips (the examples from the brief, e.g. "What should I focus on today?"). Composer: text
input, mic, send; while streaming, send becomes Stop. Assistant replies stream as plain text with
Markdown; task references render as tappable inline task chips; tool activity appears as a caption
line. When the assistant wants to change anything it emits a `ProposalCard` → 30. Offline: banner, and
composer disabled. Over quota: banner with usage and reset date. AI disabled in settings: empty state
with "Turn on in AI preferences".

**26. AI daily planner** — Step 1 (inputs, pre-filled): date, available window (from working hours,
editable), "anything fixed today?" free text, energy peak. "Create plan". Step 2 (result): timeline of
proposed blocks (task, time, duration) with a reason caption per block; "Left for later" list with
reasons (e.g. "Not enough time today; due Thursday"); controls: drag to reorder, tap block to edit
time/remove, "Regenerate" with an optional instruction field. Primary: "Apply plan" → creates a
proposal and goes straight to its confirm step inline (same component as 30, embedded). Result: time
blocks and `planned_date` set. Deadlines are never changed by the planner.

**27. AI task breakdown** — Input: objective text (pre-filled when opened from a task or project),
optional deadline, optional detail level (Brief / Standard / Detailed). Result: editable tree of tasks
with subtasks; each node has a checkbox (include), inline-editable title, estimate chip, suggested due
date chip. "Add to": existing project / new project (name suggested) / as subtasks of the source task.
"Regenerate" keeps user-edited nodes. Primary "Add 8 tasks" → applies through a proposal (already
reviewed here, so applied directly with an Undo snackbar).

**28. AI scheduling suggestions** — Opened with a scope: a set of tasks (overdue, a selection, a day's
conflicts) or "this week". Shows before/after per task: current date/time → suggested, with reason.
Per-row accept toggle and manual override (tap suggested time → picker). Summary line: "Moves 5 tasks,
no deadlines changed" or, if a deadline would change, a warning group requiring separate opt-in.
Primary "Apply 5 changes".

**29. AI productivity insights** — Range (week / month). Three to five insight cards: each a headline
sentence, the supporting number or mini-chart computed from real data, and an optional action
("Move deep work to mornings" → opens chat with that request). Footer: "Based on your activity from
2–8 Nov." and a thumbs up/down per card. Skeleton while generating; cached per range for 24 h.

**30. AI action confirmation (`/ai/proposal/[id]`)** — The single approval surface for every AI change.

- Header: proposal title ("Reschedule 5 overdue tasks") and the assistant's one-paragraph rationale.
- Groups: **Create**, **Update** (field-level before → after), **Schedule**, and **Remove** (dangerSoft
  background, unchecked by default, labelled "Needs your OK").
- Each `ProposalItem` has a checkbox; tap the item to edit the proposed values before applying.
- Sticky footer: "Apply 4 changes" (count follows the selection; disabled at 0) and "Dismiss".
- On apply: operations run through repositories in one local transaction; snackbar "Applied 4 changes ·
  Undo"; proposal marked applied/partially applied; returns to the origin screen.
- Stale check: if an item's target changed since the proposal was created, the item shows "Changed
  since suggested" with current values and is unchecked.
- Expired proposals (older than 24 h) are read-only with "Ask again".

## 3.7 Habits and goals

**31. Habits dashboard (Progress → Habits)** — Today's date strip (last 7 days, tap a day to log
retroactively). List of `HabitCard`s scheduled for the selected day, then "Not scheduled today"
(collapsed). Header "+" → 32. Summary line: "3 of 5 done today". Empty: "Habits are things you want to
keep doing." action "Create a habit" with four one-tap suggestions (Read, Exercise, Meditate, Drink water).

**32. Create / edit habit** — Name, icon, colour, schedule type and its parameters, daily target (count +
optional unit), reminders (list of times, default none), start date. Edit adds Pause, Archive, Delete.

**33. Habit details** — Header: icon, name, schedule summary. Stats row: current streak, best streak,
30-day rate. `Heatmap` (last 26 weeks, horizontally scrollable). Weekday bar chart. Month list of logs
(tap a past-7-days entry to edit). ⋯: Edit → 32, Pause, Archive.

**34. Goals dashboard (Progress → Goals)** — Segments Active | Completed. `GoalCard` list grouped
Short-term / Long-term. Header "+" → goal form. Empty: "A goal gives your tasks a direction." action
"Set a goal".

**35. Goal details** — Title, why, target date with days remaining, large `ProgressRing` (120).
Milestones list (inline check, progress per milestone; "Manage" → 36). Linked tasks grouped by
milestone, with "Add task" (quick add pre-linked). Progress history line chart. Spark card
"Suggested next steps" (AI-14): up to three suggestions → add as tasks/milestones via proposal.
⋯: Edit, Complete goal, Archive, Delete.

**36. Milestone management** — Reorderable list; each: title, target date, done toggle, linked task
count; add row at the bottom; swipe to delete (linked tasks stay linked to the goal).

## 3.8 Insights and settings

**37. Analytics dashboard (Progress → Insights)** — Range control 7 d / 30 d / 90 d; workspace filter.
`StatTile` row: Completed, Completion rate, On time, Overdue now. Charts (each a `ChartCard` with a
takeaway sentence): completions per day (bars) with 7-day average line; priority distribution
(horizontal stacked bar, not a pie); by project (top 5 horizontal bars); habit consistency (% per
habit); most productive weekday and time-of-day (heat strip). Links: "This week's report" → 38,
"AI insights" → 29. Empty (fewer than 5 completions): "Complete a few tasks and your trends will show here."

**38. Weekly report** — Title in serif ("Week of 9 November"). AI-written summary paragraph (falls back
to a templated summary if AI is off or failed). Numbers vs previous week, highlights (longest streak,
busiest day, a goal milestone reached), "Carried over" list of unfinished planned tasks with
"Reschedule" → 28, suggested focus for next week. Previous/next week arrows. Share exports an image.

**39. Notifications center** — Reverse-chronological list grouped Today / Earlier, 30 days. Each: type
icon, title, body, time; unread dot. Tap → deep link target and marks read. "Mark all read". Banner
when OS permission is denied. Empty: "You're all caught up."

**40. Profile** — Avatar (change photo), name, email (read-only; "Change email" flow via Supabase
Auth), time zone, plan badge. Rows: Settings → 41, Subscription → 45, Export data, Recently deleted,
Help, Sign out. "Delete account" at the bottom (danger) → typed confirmation.

**41. General settings** — Groups: General (week starts on, default list for new tasks, default
reminder, working hours and days, haptics), Appearance → 42, Notifications → 43, Assistant → 44,
Data (sync status + "Sync now", last synced time, storage used, clear local cache & resync),
About (version, licences, privacy, terms).

**42. Appearance** — Theme: System / Light / Dark, with a live preview card containing a task row, a
chip and a button. Text size note pointing to OS settings. Reduce motion toggle (overrides OS to on).

**43. Notification preferences** — OS permission status row. Per-type switches (N-01) with one-line
descriptions; time pickers for Daily plan and Evening review; Quiet hours (start, end; reminders in
quiet hours are delivered silently); Weekly report day.

**44. AI preferences and model settings** — Master switch "Assistant". Context level: Full / Titles
only / Off (explained in one line each). Memory switch + "What the assistant remembers" list with
per-item delete and "Forget everything". Model: Automatic (recommended) / Faster / More capable — these
are _tiers_; provider and model names are shown as secondary text from server config, never chosen
from a hard-coded list. Suggestions: per-type mute switches. Voice input switch and language.
"Delete all AI conversations". Usage this month (requests, with the quota bar).

**45. Subscription** — R1: current plan (Free), what each plan includes, AI usage bar, "Pro is coming
soon" note. R2: purchase, restore, manage.

## 3.9 Tablet layouts

At width ≥ 768 the tab bar becomes a left rail and four screens become two-pane:
Browse (lists | selected list), Project (list or board | task details), Calendar (grid | agenda or
task details), Assistant (history | conversation). All other screens centre at max width 640.

## 3.10 Key flows

1. **First run:** Welcome → Sign up → verify email → Onboarding intro → Preferences → Notification
   permission → Today (with three sample tasks and a "Plan my day" suggestion).
2. **Capture:** any tab → FAB → type "Submit project report next Friday 5pm !3 #Work" → chips fill
   (Fri date, 17:00, High, Work) → send → sheet clears → swipe down. Task is in the Work project and Upcoming.
3. **Plan the day:** Today → "Plan my day" → Planner inputs → result → adjust → Apply → confirm →
   Today now shows the Plan section; Calendar day view shows the blocks.
4. **Break down work:** Project → ⋯ or empty state → Breakdown → edit tree → "Add 8 tasks" → project
   list shows them with an Undo snackbar.
5. **Rescue overdue:** Today → Overdue "Reschedule all" → Scheduling suggestions → toggle rows →
   Apply → Overdue section disappears.
6. **Chat-driven change:** Assistant → "Move everything from tomorrow to Thursday" → tool caption →
   `ProposalCard` → Review (30) → Apply 6 changes → back in chat, card shows "Applied 6 of 6".
7. **Reminder → done:** notification "Submit project report · 17:00" → action Complete → task
   completes in the background (local write + outbox) → next open shows it under Done today.
8. **Habit loop:** habit reminder → tap → Habits dashboard → check → ring fills, streak increments.
9. **Goal:** Progress → Goals → + → goal form → Goal details → add milestones → "Suggested next steps"
   → accept two → tasks appear linked to the goal and in Inbox/project.
10. **Offline:** airplane mode → add, edit, complete tasks (cloud-off icon in header) → reconnect →
    icon shows syncing then disappears; second device reflects the changes.
