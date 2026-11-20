# 1. Product Specification

## 1.1 Vision

Cadence is a calm, fast personal productivity app. It holds everything a person has to do (tasks),
keeps doing (habits) and is working toward (goals), and uses AI to turn that pile into a realistic plan
for today. The AI is a capable assistant that proposes; the user always decides.

## 1.2 Product principles

Use these to settle any design question the blueprint does not answer.

1. **Capture in under three seconds.** From any primary screen: tap +, type, done. No required fields but a title.
2. **Local first.** Every tap responds from the on-device database. The network is never in the way of a tap.
3. **One obvious home.** The Today tab answers "what now?". Everything else is one tap from it.
4. **AI proposes, the user disposes.** No AI change lands without an explicit approval the user can inspect.
5. **AI is quiet.** No chat bubbles popping up, no unrequested rewrites. AI appears where it is asked for,
   plus at most one dismissible suggestion card on Today.
6. **Deadlines are sacred.** Planning tools move _when the user intends to work_ (`planned_date`, time
   blocks), never the deadline (`due_date`), unless the user explicitly asks.
7. **Earn every notification.** Default is the minimum; the user opts into more.
8. **Restraint.** One accent colour, one type family for UI, one elevation style. Colour carries meaning
   (priority, project) and is not decoration.

## 1.3 Domain model

```
Workspace  (life area: Personal, Work, Study …)
 └─ Project  (a body of work; has a view preference: list | board)
     └─ Section  (group inside a project; also the board column)
         └─ Task
             └─ Subtask (a Task whose parent_task_id is set; one level deep)

Task ── 0..1 Category   (kind of work: Deep work, Errand, Call … drives analytics and scheduling)
Task ── 0..n Tag        (free-form labels)
Task ── 0..n Reminder, Attachment, Comment, TimeBlock
Task ── 0..1 Goal, 0..1 Milestone

Goal └─ Milestone
Habit └─ HabitLog (one per completion per day)
```

Definitions that the rest of the blueprint relies on:

| Term                    | Meaning                                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Inbox                   | Tasks with no project. The default destination for quick capture.                                                                   |
| `due_date` / `due_time` | The deadline. `due_time` is optional.                                                                                               |
| `planned_date`          | The day the user intends to work on it. Set by the user or by an approved AI plan.                                                  |
| Today                   | Open tasks where `planned_date = today`, or `due_date = today`, plus Overdue.                                                       |
| Overdue                 | Open tasks with a deadline in the past (`due_date < today`, or today with a `due_time` already passed).                             |
| Upcoming                | Open tasks with `due_date` or `planned_date` after today, grouped by day.                                                           |
| Subtask vs checklist    | One mechanism. A checklist is simply subtasks shown without dates; a subtask can be given a date, priority or reminder when needed. |
| Time block              | A scheduled interval on the calendar, optionally linked to a task.                                                                  |
| Smart list              | A built-in filter (Today, Upcoming, Overdue, High priority, No date, Recently completed).                                           |
| Saved view              | A user-defined filter + sort + grouping, pinned in Browse.                                                                          |
| Priority                | 0 none, 1 low, 2 medium, 3 high, 4 urgent. New tasks default to 0.                                                                  |

## 1.4 Functional requirements

Tags: **R1** initial release, **R2**/**R3** later. IDs are referenced from other documents and tests.

### A. Tasks

| ID   | Requirement                                                                                                                                                                                                                                                                                                       | Rel |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| T-01 | Create a task with only a title. Optional: notes (Markdown subset: bold, italic, lists, links), priority, due date, due time, planned date, estimated duration, project, section, category, tags, goal/milestone, reminders, recurrence, subtasks, attachments                                                    | R1  |
| T-02 | Edit any field inline from Task Details; full form available via Edit                                                                                                                                                                                                                                             | R1  |
| T-03 | Complete / reopen. Completion is undoable for 5 s via snackbar                                                                                                                                                                                                                                                    | R1  |
| T-04 | Delete (soft; undoable 5 s; recoverable for 30 days from Settings → Recently deleted)                                                                                                                                                                                                                             | R1  |
| T-05 | Duplicate (copies fields, subtasks, tags; not comments, attachments, completion state)                                                                                                                                                                                                                            | R1  |
| T-06 | Archive / unarchive. Archived tasks leave all views except Completed → Archived and search with the "include archived" filter                                                                                                                                                                                     | R1  |
| T-07 | Recurrence: daily, weekdays, weekly on chosen days, monthly by date or by nth weekday, yearly, every N units, with optional end date or count. Stored as an RFC 5545 RRULE. Two modes: _fixed schedule_ (next occurrence from the rule) and _after completion_ (next occurrence counted from the completion date) | R1  |
| T-08 | Completing a recurring task records a completion and advances the same task to the next occurrence; the last occurrence completes the task                                                                                                                                                                        | R1  |
| T-09 | Subtasks: add, reorder by drag, complete, promote to task, convert task to subtask. Parent shows `done/total`. Completing a parent with open subtasks asks: complete all / keep open                                                                                                                              | R1  |
| T-10 | Reminders: multiple per task; absolute time, or relative to the due time (at time, 5 m, 15 m, 30 m, 1 h, 1 day before, custom)                                                                                                                                                                                    | R1  |
| T-11 | Attachments: images (camera or library) and documents, max 25 MB each, 10 per task. Queued offline, uploaded when online. Image thumbnail preview, documents open in the system viewer                                                                                                                            | R1  |
| T-12 | Comments: timestamped notes on a task, editable and deletable                                                                                                                                                                                                                                                     | R1  |
| T-13 | Quick add: bottom sheet from the FAB on every primary screen; natural-language parsing of date, time, priority (`!1`–`!4` or words), project (`#name`), tag (`@name`), recurrence ("every Monday"); recognised tokens are highlighted as chips and can be dismissed                                               | R1  |
| T-14 | Bulk mode (long-press a row): multi-select, then complete, move, set date, set priority, add tag, archive, delete                                                                                                                                                                                                 | R1  |
| T-15 | Search across title, notes, comments; filter by status, date range, priority, project, category, tag, has-attachment, recurring; sort by manual, due date, priority, created, title                                                                                                                               | R1  |
| T-16 | Swipe right to complete; swipe left reveals Schedule and Delete                                                                                                                                                                                                                                                   | R1  |
| T-17 | Manual ordering by drag-and-drop inside a list, section or board column                                                                                                                                                                                                                                           | R1  |
| T-18 | Time tracking: start/stop timer on a task, logged entries                                                                                                                                                                                                                                                         | R2  |

### B. Organisation

| ID   | Requirement                                                                                                                                                                                       | Rel |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| O-01 | Workspaces: create, rename, recolour, reorder, archive. Three are seeded at onboarding from the user's choices. A workspace switcher filters Browse, Calendar and Analytics; "All" is the default | R1  |
| O-02 | Projects: name, colour, icon, workspace, optional description, optional target date, default view (list/board), archive, delete (choose: delete tasks or move to Inbox)                           | R1  |
| O-03 | Sections inside a project: create, rename, reorder, delete (tasks move to "No section")                                                                                                           | R1  |
| O-04 | Project views: List (grouped by section), Board (sections as columns, drag between columns), Calendar (project-filtered)                                                                          | R1  |
| O-05 | Project progress: completed / total non-archived tasks, shown as a ring and a count                                                                                                               | R1  |
| O-06 | Categories: name, colour, icon. One per task. Six seeded: Deep work, Admin, Errand, Call/Meeting, Learning, Personal                                                                              | R1  |
| O-07 | Tags: name, colour. Many per task. Created inline while typing                                                                                                                                    | R1  |
| O-08 | Smart lists (built in) and Saved views (user-defined filter + sort + group), pinned in Browse                                                                                                     | R1  |
| O-09 | Timeline view of a project (tasks as bars between planned and due dates)                                                                                                                          | R2  |
| O-10 | Shared projects with roles (owner, editor, viewer)                                                                                                                                                | R3  |

### C. AI assistant

Detailed behaviour is in `07-ai-system.md`.

| ID    | Requirement                                                                                                                                                                | Rel |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| AI-01 | Natural-language task creation, typed or dictated; result populates the quick-add sheet for review, never saves by itself                                                  | R1  |
| AI-02 | Task breakdown: objective → tasks and subtasks with estimates and suggested dates; user edits and selects before applying                                                  | R1  |
| AI-03 | Smart scheduling: propose time blocks for chosen tasks inside working hours, around existing blocks                                                                        | R1  |
| AI-04 | Daily planner: propose today's ordered plan and time blocks; shows what was left out and why                                                                               | R1  |
| AI-05 | Prioritisation: ranked list with a one-line reason per task                                                                                                                | R1  |
| AI-06 | Productivity insights: plain-language observations backed by the user's own numbers                                                                                        | R1  |
| AI-07 | Chat assistant with access to the user's data through tools; streams replies                                                                                               | R1  |
| AI-08 | Context controls: Full / Titles only / Off; memory on/off; view and delete what the assistant remembers                                                                    | R1  |
| AI-09 | Smart suggestions: conflicts, overloaded days, unrealistic deadlines, stale tasks. Shown as at most one card on Today; each can be dismissed or muted by type              | R1  |
| AI-10 | Voice input in quick add and chat (on-device speech recognition)                                                                                                           | R1  |
| AI-11 | Every AI change is a proposal shown in the AI Action Confirmation interface with per-item accept/reject; destructive items are visually separated and unchecked by default | R1  |
| AI-12 | Applied proposals can be undone as one unit for 10 minutes                                                                                                                 | R1  |
| AI-13 | Spoken assistant replies                                                                                                                                                   | R2  |
| AI-14 | Goal recommendations: suggested next milestones and tasks for a goal                                                                                                       | R1  |

### D. Calendar and scheduling

| ID   | Requirement                                                                                                                                             | Rel |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| C-01 | Month, week, day views. Month shows up to three task dots per day plus an agenda for the selected day; week and day show a time grid with all-day strip | R1  |
| C-02 | Tasks with a due time or time block appear on the grid; date-only tasks in the all-day strip                                                            | R1  |
| C-03 | Time blocking: drag an unscheduled task onto the grid, or long-press an empty slot to create a block; resize by dragging the bottom edge                | R1  |
| C-04 | Drag to reschedule (week/day: move block; month agenda: "Move to…" date picker)                                                                         | R1  |
| C-05 | Conflict detection: overlapping blocks get a warning stripe and a "Resolve" action offering AI scheduling                                               | R1  |
| C-06 | Recurring tasks render future occurrences (virtual, expanded on device from the RRULE)                                                                  | R1  |
| C-07 | External calendars (Google, Apple/EventKit): read busy times, then two-way sync                                                                         | R2  |

### E. Habits

| ID   | Requirement                                                                                                                                                                                | Rel |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| H-01 | Create a habit: name, icon, colour, schedule (daily / chosen weekdays / N times per week / every N days), target per day (count, default 1) with optional unit, reminder times, start date | R1  |
| H-02 | Log completion for today or any of the past 7 days; undo                                                                                                                                   | R1  |
| H-03 | Streaks: current and best. A day counts if the target is met. Non-scheduled days neither break nor extend a streak. "N times per week" streaks count weeks                                 | R1  |
| H-04 | Statistics: completion rate (30/90 days), calendar heatmap, weekday distribution                                                                                                           | R1  |
| H-05 | Pause / archive a habit (paused days do not break streaks)                                                                                                                                 | R1  |
| H-06 | Weekly and monthly habit summary inside reports                                                                                                                                            | R1  |

### F. Goals

| ID   | Requirement                                                                                                                                                                                              | Rel |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| G-01 | Create a goal: title, why (description), workspace, target date, colour, type (short-term / long-term)                                                                                                   | R1  |
| G-02 | Milestones: title, target date, order, done                                                                                                                                                              | R1  |
| G-03 | Link tasks to a goal and optionally a milestone                                                                                                                                                          | R1  |
| G-04 | Progress: milestones weighted equally; a milestone's progress is its done state or, if it has linked tasks, the fraction completed. A goal with no milestones uses linked tasks. Manual override allowed | R1  |
| G-05 | Progress history chart (weekly snapshots)                                                                                                                                                                | R1  |
| G-06 | Complete / archive / reopen goal                                                                                                                                                                         | R1  |

### G. Notifications

| ID   | Requirement                                                                                                                                               | Rel |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| N-01 | Types: task reminder, due soon, overdue digest (once daily), habit reminder, daily plan prompt, evening review prompt, weekly report ready, AI suggestion | R1  |
| N-02 | Defaults on: task reminders, habit reminders, daily plan prompt, weekly report. Defaults off: due soon, overdue digest, evening review, AI suggestion     | R1  |
| N-03 | Per-type toggles, quiet hours, daily plan time, review time                                                                                               | R1  |
| N-04 | Notification actions: Complete, Snooze (10 min / 1 h / tomorrow 9:00)                                                                                     | R1  |
| N-05 | In-app Notifications Center listing the last 30 days, with read state                                                                                     | R1  |
| N-06 | App works fully if notification permission is denied; reminders screen shows a non-blocking banner linking to system settings                             | R1  |

### H. Analytics

| ID   | Requirement                                                                                                                                                                                       | Rel |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| A-01 | Dashboard with range selector (7 d, 30 d, 90 d): completed, completion rate, on-time rate, current overdue, completion trend, priority distribution, by project, habit consistency, best day/time | R1  |
| A-02 | Weekly report (generated Monday for the previous week): numbers, comparison with the prior week, highlights, AI-written summary, suggested focus                                                  | R1  |
| A-03 | All dashboard numbers compute on device and work offline                                                                                                                                          | R1  |
| A-04 | Time-spent charts                                                                                                                                                                                 | R2  |

### I. Account and settings

| ID   | Requirement                                                                              | Rel                   |
| ---- | ---------------------------------------------------------------------------------------- | --------------------- |
| S-01 | Sign up, sign in, sign out, password reset, email verification                           | R1                    |
| S-02 | Profile: name, avatar, time zone (auto-detected, editable)                               | R1                    |
| S-03 | Preferences: week start, working hours and days, default reminder, default view, haptics | R1                    |
| S-04 | Appearance: light, dark, system; accent stays fixed in R1                                | R1                    |
| S-05 | Data: export all data as JSON, delete account (irreversible, typed confirmation)         | R1                    |
| S-06 | Subscription screen: current plan, AI usage this month. Purchase flow                    | R1 view / R2 purchase |

## 1.5 Non-functional requirements

| ID    | Requirement                                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| NF-01 | Cold start to interactive Today screen under 2 s on a mid-range Android device, with data from the local DB (target; measure in Phase 10)      |
| NF-02 | List scrolling holds 60 fps with 5,000 tasks in the local DB                                                                                   |
| NF-03 | Any local mutation is reflected in the UI within one frame budget of the DB write returning; no spinner for local actions                      |
| NF-04 | Changes made offline survive app kill and sync on reconnect without user action                                                                |
| NF-05 | A change made on one device appears on another online device within 5 s (target)                                                               |
| NF-06 | WCAG 2.1 AA contrast for text, 44×44 pt minimum touch targets, full screen-reader labelling, Dynamic Type up to 200 % without loss of function |
| NF-07 | No secret or privileged credential in the app bundle                                                                                           |
| NF-08 | AI features degrade gracefully: when offline, over quota or erroring, the manual path is always available                                      |
