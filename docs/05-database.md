# 5. Database

PostgreSQL (Supabase). All tables are in `public`. Migrations are plain SQL files in
`supabase/migrations`, applied with the Supabase CLI. The SQL below is the design; it has not been
executed, so treat the first `supabase db reset` as the test and fix syntax there.

## 5.1 Conventions

**Synced tables** are mirrored on device. Each one starts with exactly these columns, written below as
`SYNC_COLS`:

```sql
id                uuid primary key,                       -- generated on device
user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
created_at        timestamptz not null default now(),     -- client clock
updated_at        timestamptz not null default now(),     -- client clock, informational
server_updated_at timestamptz not null default clock_timestamp(),  -- set by trigger; pull cursor
deleted_at        timestamptz,                            -- tombstone
unique (id, user_id)                                      -- target for composite FKs
```

Every synced table also gets (written below as `SYNC_SETUP('<table>')`):

```sql
create index <table>_pull_idx on <table> (user_id, server_updated_at, id);
create trigger <table>_server_ts before insert or update on <table>
  for each row execute function tg_set_server_updated_at();
alter table <table> enable row level security;
create policy <table>_owner on <table> for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
```

```sql
create or replace function tg_set_server_updated_at() returns trigger language plpgsql as $$
begin new.server_updated_at := clock_timestamp(); return new; end $$;
```

Other rules:

- **Ownership across rows:** references between user-owned tables are composite,
  `foreign key (x_id, user_id) references x (id, user_id)`, so a row cannot point at another user's row.
- **Deletion:** the app only soft-deletes (`deleted_at`). Hard deletes happen in the purge job and on
  account deletion (cascade from `auth.users`). The `on delete` clauses below define what the purge does.
- **Colours** are swatch keys (`'moss'`), validated by the app, stored as `text`.
- **Positions** are fractional-index strings (`text`), sorted with `COLLATE "C"`.
- **Dates:** `date` for calendar days in the user's time zone; `timestamptz` for instants.
- Check constraints are the last line of defence; the same limits live in the Zod schemas.

## 5.2 Schema

### Identity and preferences

```sql
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text check (char_length(display_name) <= 80),
  avatar_path   text,
  timezone      text not null default 'UTC',          -- IANA name
  locale        text not null default 'en',
  plan          text not null default 'free' check (plan in ('free','pro')),
  onboarding_completed_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- RLS: select/update own row (id = auth.uid()); `plan` is not updatable by clients
-- (column-level grant: revoke update(plan)). Row is created by a trigger on auth.users insert.

create table user_preferences (            -- synced; id = user_id
  SYNC_COLS,
  theme               text not null default 'system' check (theme in ('system','light','dark')),
  reduce_motion       boolean not null default false,
  haptics_enabled     boolean not null default true,
  week_start          smallint not null default 1 check (week_start in (0,1,6)),   -- 0 Sun, 1 Mon, 6 Sat
  work_start          time not null default '09:00',
  work_end            time not null default '18:00',
  work_days           smallint[] not null default '{1,2,3,4,5}',                   -- ISO weekday 1–7
  energy_peak         text not null default 'morning' check (energy_peak in ('morning','afternoon','evening')),
  default_reminder_offset_min int,                                                 -- null = none
  default_project_id  uuid,                                                        -- null = Inbox
  daily_plan_time     time not null default '08:00',
  evening_review_time time not null default '20:00',
  weekly_report_dow   smallint not null default 1,
  quiet_start         time, quiet_end time,
  notif               jsonb not null default '{"task_reminder":true,"habit_reminder":true,"daily_plan":true,"weekly_report":true,"due_soon":false,"overdue_digest":false,"evening_review":false,"ai_suggestion":false}',
  ai_enabled          boolean not null default true,
  ai_context_level    text not null default 'full' check (ai_context_level in ('full','titles','off')),
  ai_memory_enabled   boolean not null default true,
  ai_model_tier       text not null default 'auto' check (ai_model_tier in ('auto','fast','smart')),
  ai_muted_suggestions text[] not null default '{}',
  voice_enabled       boolean not null default true,
  voice_locale        text not null default 'en-US',
  check (id = user_id), check (work_end > work_start)
);
SYNC_SETUP('user_preferences');
```

### Organisation

```sql
create table workspaces (
  SYNC_COLS,
  name text not null check (char_length(name) between 1 and 60),
  color text not null default 'slate', icon text not null default 'layers',
  position text not null, archived_at timestamptz
);
SYNC_SETUP('workspaces');

create table projects (
  SYNC_COLS,
  workspace_id uuid not null,
  name text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 2000),
  color text not null default 'teal', icon text not null default 'folder',
  default_view text not null default 'list' check (default_view in ('list','board')),
  target_date date, position text not null, archived_at timestamptz,
  foreign key (workspace_id, user_id) references workspaces (id, user_id) on delete cascade
);
SYNC_SETUP('projects');
create index projects_ws_idx on projects (user_id, workspace_id) where deleted_at is null;

create table sections (
  SYNC_COLS,
  project_id uuid not null,
  name text not null check (char_length(name) between 1 and 80),
  position text not null, is_done_section boolean not null default false,
  foreign key (project_id, user_id) references projects (id, user_id) on delete cascade
);
SYNC_SETUP('sections');

create table categories (
  SYNC_COLS,
  name text not null check (char_length(name) between 1 and 40),
  color text not null default 'slate', icon text not null default 'tag', position text not null
);
SYNC_SETUP('categories');

create table tags (
  SYNC_COLS,
  name text not null check (char_length(name) between 1 and 40),
  color text not null default 'slate'
);
SYNC_SETUP('tags');
create unique index tags_name_uq on tags (user_id, lower(name)) where deleted_at is null;
-- same partial unique index pattern for categories(name) and workspaces(name)

create table saved_filters (
  SYNC_COLS,
  name text not null check (char_length(name) between 1 and 60),
  icon text not null default 'filter',
  definition jsonb not null,           -- shared/schemas/filter.ts: { where, sort, groupBy }
  position text not null
);
SYNC_SETUP('saved_filters');
```

### Goals (declared before tasks because tasks reference them)

```sql
create table goals (
  SYNC_COLS,
  workspace_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 4000),
  horizon text not null default 'short' check (horizon in ('short','long')),
  color text not null default 'indigo',
  target_date date,
  manual_progress smallint check (manual_progress between 0 and 100),   -- null = computed
  position text not null, completed_at timestamptz, archived_at timestamptz,
  foreign key (workspace_id, user_id) references workspaces (id, user_id) on delete set null (workspace_id)
);
SYNC_SETUP('goals');

create table milestones (
  SYNC_COLS,
  goal_id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  target_date date, position text not null, completed_at timestamptz,
  foreign key (goal_id, user_id) references goals (id, user_id) on delete cascade
);
SYNC_SETUP('milestones');
```

### Tasks

```sql
create table tasks (
  SYNC_COLS,
  title          text not null check (char_length(title) between 1 and 500),
  notes          text check (char_length(notes) <= 20000),
  priority       smallint not null default 0 check (priority between 0 and 4),
  project_id     uuid,                    -- null = Inbox
  section_id     uuid,
  parent_task_id uuid,                    -- set = subtask
  category_id    uuid,
  goal_id        uuid,
  milestone_id   uuid,
  position       text not null,
  due_date       date,
  due_time       time,                    -- local wall-clock time
  due_at         timestamptz,             -- client-computed instant from due_date/due_time + profile tz; null if no due_date
  planned_date   date,
  duration_min   int check (duration_min between 1 and 1440),
  rrule          text check (char_length(rrule) <= 500),
  recurrence_mode text check (recurrence_mode in ('schedule','completion')),
  completed_at   timestamptz,
  archived_at    timestamptz,
  source         text not null default 'manual' check (source in ('manual','quick_add','ai','import')),
  check (due_time is null or due_date is not null),
  check (rrule is null or due_date is not null),
  check ((rrule is null) = (recurrence_mode is null)),
  check (parent_task_id is null or parent_task_id <> id),
  foreign key (project_id, user_id)     references projects (id, user_id)   on delete set null (project_id),
  foreign key (section_id, user_id)     references sections (id, user_id)   on delete set null (section_id),
  foreign key (parent_task_id, user_id) references tasks (id, user_id)      on delete cascade,
  foreign key (category_id, user_id)    references categories (id, user_id) on delete set null (category_id),
  foreign key (goal_id, user_id)        references goals (id, user_id)      on delete set null (goal_id),
  foreign key (milestone_id, user_id)   references milestones (id, user_id) on delete set null (milestone_id)
);
SYNC_SETUP('tasks');
create index tasks_due_idx     on tasks (user_id, due_date)     where completed_at is null and deleted_at is null;
create index tasks_planned_idx on tasks (user_id, planned_date) where completed_at is null and deleted_at is null;
create index tasks_project_idx on tasks (user_id, project_id, position) where deleted_at is null;
create index tasks_parent_idx  on tasks (parent_task_id) where parent_task_id is not null;
create index tasks_done_idx    on tasks (user_id, completed_at desc) where completed_at is not null;
create index tasks_goal_idx    on tasks (user_id, goal_id) where goal_id is not null;

-- One level of nesting: a trigger rejects a row whose parent itself has a parent,
-- and rejects giving a parent to a task that has children.
-- A subtask inherits project_id/section_id from its parent (the repository writes them; a trigger keeps them equal).

create table task_tags (
  SYNC_COLS,                               -- id = uuidv5(task_id || tag_id)
  task_id uuid not null, tag_id uuid not null,
  unique (task_id, tag_id),
  foreign key (task_id, user_id) references tasks (id, user_id) on delete cascade,
  foreign key (tag_id, user_id)  references tags (id, user_id)  on delete cascade
);
SYNC_SETUP('task_tags');
create index task_tags_tag_idx on task_tags (tag_id);

create table task_completions (            -- one row per completion; recurring tasks get many
  SYNC_COLS,                               -- id = uuidv5(task_id || occurrence_date)
  task_id uuid not null,
  occurrence_date date not null,           -- due_date of the completed occurrence, else local completion date
  completed_at timestamptz not null,
  was_on_time boolean,                     -- null when the task had no deadline
  priority smallint not null, project_id uuid, category_id uuid,   -- denormalised snapshot for analytics
  unique (task_id, occurrence_date),
  foreign key (task_id, user_id) references tasks (id, user_id) on delete cascade
);
SYNC_SETUP('task_completions');
create index task_completions_time_idx on task_completions (user_id, completed_at) where deleted_at is null;
-- Reopening a task tombstones its latest completion row.

create table reminders (
  SYNC_COLS,
  task_id uuid not null,
  kind text not null check (kind in ('absolute','relative')),
  offset_min int check (offset_min >= 0),  -- relative: minutes before due_at
  remind_at timestamptz not null,          -- client-computed for both kinds; recomputed when due changes
  safety_sent_at timestamptz,              -- server-only; not in the sync_push whitelist
  check ((kind = 'relative') = (offset_min is not null)),
  foreign key (task_id, user_id) references tasks (id, user_id) on delete cascade
);
SYNC_SETUP('reminders');
create index reminders_due_idx on reminders (remind_at) where deleted_at is null and safety_sent_at is null;

create table attachments (
  SYNC_COLS,
  task_id uuid not null,
  storage_path text not null, file_name text not null check (char_length(file_name) <= 255),
  mime_type text not null, size_bytes bigint not null check (size_bytes between 1 and 26214400),
  width int, height int, uploaded_at timestamptz,
  foreign key (task_id, user_id) references tasks (id, user_id) on delete cascade
);
SYNC_SETUP('attachments');

create table task_comments (
  SYNC_COLS,
  task_id uuid not null,
  body text not null check (char_length(body) between 1 and 5000),
  foreign key (task_id, user_id) references tasks (id, user_id) on delete cascade
);
SYNC_SETUP('task_comments');

create table time_blocks (
  SYNC_COLS,
  task_id uuid,                            -- null = free-standing block
  title text check (char_length(title) <= 200),
  start_at timestamptz not null, end_at timestamptz not null,
  source text not null default 'manual' check (source in ('manual','ai','external')),
  external_event_id text,                  -- R2
  check (end_at > start_at), check (task_id is not null or title is not null),
  foreign key (task_id, user_id) references tasks (id, user_id) on delete cascade
);
SYNC_SETUP('time_blocks');
create index time_blocks_range_idx on time_blocks (user_id, start_at) where deleted_at is null;
```

### Habits

```sql
create table habits (
  SYNC_COLS,
  name text not null check (char_length(name) between 1 and 80),
  icon text not null default 'circle-check', color text not null default 'moss',
  schedule_type text not null check (schedule_type in ('daily','weekdays','times_per_week','interval')),
  weekdays smallint[],                     -- for 'weekdays': ISO 1–7
  times_per_week smallint check (times_per_week between 1 and 7),
  interval_days smallint check (interval_days between 2 and 365),
  target_count int not null default 1 check (target_count between 1 and 1000),
  unit text check (char_length(unit) <= 20),
  reminder_times time[] not null default '{}',
  start_date date not null,
  position text not null, paused_at timestamptz, archived_at timestamptz,
  check (schedule_type <> 'weekdays' or (weekdays is not null and cardinality(weekdays) between 1 and 7)),
  check (schedule_type <> 'times_per_week' or times_per_week is not null),
  check (schedule_type <> 'interval' or interval_days is not null)
);
SYNC_SETUP('habits');

create table habit_logs (
  SYNC_COLS,                               -- id = uuidv5(habit_id || log_date)
  habit_id uuid not null,
  log_date date not null,
  count int not null default 1 check (count between 0 and 100000),
  note text check (char_length(note) <= 500),
  unique (habit_id, log_date),
  foreign key (habit_id, user_id) references habits (id, user_id) on delete cascade
);
SYNC_SETUP('habit_logs');
create index habit_logs_date_idx on habit_logs (user_id, log_date) where deleted_at is null;
-- Pauses: habit_pauses(habit_id, start_date, end_date) synced table, same pattern, so paused ranges
-- are excluded from streak maths.
```

### Server-side tables (not synced; RLS: owner may select unless noted, writes by service role)

```sql
create table user_sync_state (             -- Realtime "pull now" signal; in publication supabase_realtime
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_change_at timestamptz not null default now()
);

create table processed_mutations (         -- idempotency for sync_push; owner may insert/select
  mutation_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  processed_at timestamptz not null default now()
);
create index processed_mutations_age_idx on processed_mutations (processed_at);

create table push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios','android')),
  device_name text, app_version text,
  last_synced_at timestamptz, last_seen_at timestamptz not null default now(), disabled_at timestamptz
);
create index push_devices_user_idx on push_devices (user_id) where disabled_at is null;

create table notifications (               -- owner may update read_at
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('task_reminder','due_soon','overdue_digest','habit_reminder','daily_plan','evening_review','weekly_report','ai_suggestion')),
  title text not null, body text not null,
  data jsonb not null default '{}',        -- { deepLink, taskId?, ... }
  dedupe_key text not null,
  read_at timestamptz, created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);
create index notifications_feed_idx on notifications (user_id, created_at desc);
-- Locally-fired notifications are also recorded here by the app (POST /v1/notifications/record,
-- deduped) so the Notifications center is complete across devices.

create table ai_models (                   -- config; readable by authenticated, managed by migration/admin
  id text primary key,                     -- e.g. 'anthropic:<model-id>'
  provider text not null, model_id text not null,
  tier text not null check (tier in ('fast','smart')),
  enabled boolean not null default true,
  priority int not null default 100,       -- lower = preferred within a tier
  supports_tools boolean not null default true, supports_json_schema boolean not null default true,
  input_price_per_mtok numeric(10,4), output_price_per_mtok numeric(10,4),   -- fill from provider pricing pages
  max_output_tokens int not null default 4096
);

create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text, summary text,                -- rolling summary of older turns
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index ai_conversations_user_idx on ai_conversations (user_id, updated_at desc) where deleted_at is null;

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content jsonb not null,                  -- provider-neutral parts: text | tool_call | tool_result | proposal_ref
  model text, created_at timestamptz not null default now()
);
create index ai_messages_conv_idx on ai_messages (conversation_id, created_at);

create table ai_proposals (                -- owner may select; resolution written via API
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references ai_conversations(id) on delete set null,
  capability text not null,
  title text not null, rationale text,
  operations jsonb not null,               -- validated against shared/ai/operations.ts
  status text not null default 'pending' check (status in ('pending','applied','partially_applied','dismissed','expired','undone')),
  resolution jsonb,                        -- { appliedOpIds: [], editedOps: {}, mutationIds: [] }
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  resolved_at timestamptz
);
create index ai_proposals_user_idx on ai_proposals (user_id, created_at desc);

create table ai_usage_events (             -- "AI interaction history": one row per provider call
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null, capability text not null,
  provider text not null, model text not null,
  input_tokens int not null default 0, output_tokens int not null default 0, cached_tokens int not null default 0,
  cost_usd numeric(12,6), latency_ms int,
  status text not null check (status in ('ok','error','fallback','invalid_output','cancelled')),
  error_code text, created_at timestamptz not null default now()
);
create index ai_usage_user_month_idx on ai_usage_events (user_id, created_at);

create table ai_memories (                 -- owner may select/delete
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('preference','fact','pattern')),
  content text not null check (char_length(content) <= 300),
  source_conversation_id uuid references ai_conversations(id) on delete set null,
  created_at timestamptz not null default now(), last_used_at timestamptz
);

create table ai_suggestions (              -- smart suggestions shown on Today; owner may update status
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                      -- 'overloaded_day' | 'conflict' | 'stale_tasks' | 'unrealistic_deadline' | 'plan_day'
  payload jsonb not null, dedupe_key text not null,
  status text not null default 'new' check (status in ('new','shown','acted','dismissed')),
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create table daily_stats (                 -- "productivity statistics" rollup
  user_id uuid not null references auth.users(id) on delete cascade,
  stat_date date not null,
  tasks_created int not null default 0, tasks_completed int not null default 0,
  completed_on_time int not null default 0, completed_late int not null default 0,
  overdue_open int not null default 0, planned_count int not null default 0, planned_done int not null default 0,
  habits_due int not null default 0, habits_done int not null default 0,
  by_priority jsonb not null default '{}', by_project jsonb not null default '{}', by_hour jsonb not null default '{}',
  primary key (user_id, stat_date)
);

create table weekly_reports (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  data jsonb not null, summary text, summary_source text check (summary_source in ('ai','template')),
  generated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

create table goal_progress_snapshots (
  goal_id uuid not null references goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null, progress smallint not null check (progress between 0 and 100),
  primary key (goal_id, snapshot_date)
);

create table rate_limit_counters (         -- no client access
  user_id uuid not null, bucket text not null, window_start timestamptz not null, count int not null default 0,
  primary key (user_id, bucket, window_start)
);
```

R2 additions (not created in R1): `time_entries`, `calendar_connections`, `external_events`,
`subscriptions`. R3: `project_members`.

## 5.3 Functions

| Function                                                                 | Security                            | Purpose                                                                                                                                                                                                               |
| ------------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync_push(mutations jsonb) returns jsonb`                               | invoker                             | Behaviour in doc 04 §4.5. Per-table column whitelist held in a constant map inside the function; unknown table or column → `rejected`. Never accepts `user_id`, `server_updated_at`, `safety_sent_at` from the client |
| `sync_pull(cursors jsonb, lim int) returns jsonb`                        | invoker                             | Doc 04 §4.5. Also stamps `push_devices.last_synced_at` when a device id is passed                                                                                                                                     |
| `touch_sync_state(uid uuid)`                                             | definer, service role only          | For server code that writes synced tables                                                                                                                                                                             |
| `handle_new_user()` trigger on `auth.users`                              | definer                             | Creates `profiles`, `user_preferences`, `user_sync_state` rows                                                                                                                                                        |
| `consume_rate_limit(uid, bucket, limit, window_seconds) returns boolean` | definer, service role only          | Atomic counter upsert                                                                                                                                                                                                 |
| `delete_account()`                                                       | called by the API with service role | Deletes the auth user (cascades) after the storage prefix is purged                                                                                                                                                   |

## 5.4 Local SQLite mirror

Defined with Drizzle in `packages/mobile/src/data/db/schema.ts`. One table per synced table, same
column names. Type mapping: `uuid`/`text`/`date`/`time`/`timestamptz` → `TEXT` (ISO 8601; instants in
UTC with `Z`), `boolean` → `INTEGER`, arrays and `jsonb` → `TEXT` (JSON), `server_updated_at` kept for
debugging. Local-only columns are prefixed with `_` (for example `attachments._local_uri`). A table
registry in `shared/sync/tables.ts` lists each synced table, its columns and their types; the Drizzle
schema, the `sync_push` whitelist and a CI test are all checked against it so the three cannot drift.

Local indexes: `tasks(due_date)`, `tasks(planned_date)`, `tasks(project_id, position)`,
`tasks(parent_task_id)`, `tasks(completed_at)`, `task_tags(tag_id)`, `task_completions(completed_at)`,
`habit_logs(habit_id, log_date)`, `time_blocks(start_at)`, `reminders(remind_at)`.
Full-text search: an FTS5 virtual table over `tasks(title, notes)` and `task_comments(body)` maintained
by triggers, if available (doc 04 §4.11).

## 5.5 Data isolation tests (pgTAP, required)

For every table: as user A insert a row; as user B assert select returns zero rows, and update, delete
and insert-with-A's-`user_id` all fail or affect zero rows. For every composite FK: as B, inserting a
row that references A's parent id fails. For `sync_push`: a mutation naming a non-whitelisted column or
another user's row id is `rejected`/`missing` and changes nothing.
