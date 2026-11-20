# 6. API

Two surfaces:

1. **Database RPC** (PostgREST, `POST /rest/v1/rpc/<fn>`): `sync_push`, `sync_pull`. Called with the
   Supabase client. The app performs no other direct table access except: read/update own `profiles`
   row, Realtime subscription to own `user_sync_state` row, Storage upload/download in its own prefix.
2. **Edge Function `api`**: `https://<project>.supabase.co/functions/v1/api/v1/...`. Everything that
   needs secrets, an LLM, or server computation.

All request and response bodies have Zod schemas in `packages/shared/src/api`; the app's API client and
the function handlers import the same schema. Field names are camelCase in the API and snake_case in the
database; the mapping lives in one place (`shared/sync/tables.ts` for rows).

## 6.1 Conventions

- **Auth:** `Authorization: Bearer <supabase access token>` on every route. Missing/invalid → 401.
- **Versioning:** path prefix `/v1`. Breaking changes ship as `/v2` beside `/v1`; the app sends
  `X-App-Version`, and the server may answer `426` with `code: "upgrade_required"` for retired versions.
- **Idempotency:** every non-GET accepts `Idempotency-Key: <uuid>`; the server stores the response for
  24 h and replays it for a repeated key. The client generates the key once per user action and reuses
  it on retries.
- **Request id:** server returns `X-Request-Id`; the client attaches it to Sentry breadcrumbs.
- **Errors:**

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests.",
    "retryAfterSeconds": 30,
    "details": {}
  }
}
```

| HTTP | `code`                        | Client behaviour                                             |
| ---- | ----------------------------- | ------------------------------------------------------------ |
| 400  | `validation_failed`           | Bug or stale client; show generic error, report              |
| 401  | `unauthorized`                | Refresh session, retry once, else sign-in                    |
| 402  | `quota_exceeded`              | Show quota banner with reset date                            |
| 403  | `ai_disabled` / `forbidden`   | Show the relevant settings prompt                            |
| 404  | `not_found`                   | Treat as gone; refresh                                       |
| 409  | `conflict` / `proposal_stale` | Refresh and show current state                               |
| 422  | `ai_invalid_output`           | "The assistant couldn't produce a usable answer. Try again." |
| 426  | `upgrade_required`            | Blocking "Update the app" screen                             |
| 429  | `rate_limited`                | Disable the action until `retryAfterSeconds`                 |
| 500  | `internal`                    | Retry with backoff (max 2), then error state                 |
| 503  | `ai_unavailable`              | All providers failed; show retry                             |

## 6.2 Sync RPCs

```ts
// sync_push
type PushRequest = { mutations: Mutation[] }; // ≤ 100; Mutation in doc 04 §4.5
type PushResponse = {
  results: {
    id: string;
    status: 'applied' | 'duplicate' | 'missing' | 'ignored_deleted' | 'guard_failed' | 'rejected';
    code?: string;
  }[];
};

// sync_pull
type PullRequest = {
  cursors: Partial<Record<SyncedTable, string>>;
  limit?: number;
  deviceId?: string;
};
type PullResponse = {
  changes: Partial<Record<SyncedTable, Row[]>>;
  cursors: Record<SyncedTable, string>;
  hasMore: boolean;
  serverTime: string;
};
```

`SyncedTable` = `user_preferences | workspaces | projects | sections | categories | tags | saved_filters |
goals | milestones | tasks | task_tags | task_completions | reminders | attachments | task_comments |
time_blocks | habits | habit_logs | habit_pauses`.

## 6.3 AI endpoints

Shared request envelope fields: `clientContext: { now: string /* ISO with offset */, timezone: string, locale: string }`.
All require `ai_enabled`; all are metered and rate limited. The app flushes the outbox before calling so
the server sees current data.

| Method & path                                                                   | Request (beyond envelope)                                                                                                                             | Response                                                                                                     |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `POST /v1/ai/parse-task`                                                        | `{ text }` (≤ 1000 chars)                                                                                                                             | `{ draft: TaskDraft, confidence: number, unparsed?: string }`                                                |
| `POST /v1/ai/breakdown`                                                         | `{ objective, deadline?, detail: 'brief'\|'standard'\|'detailed', sourceTaskId?, projectId?, keep?: BreakdownNode[], instruction? }`                  | `{ title, nodes: BreakdownNode[] }`                                                                          |
| `POST /v1/ai/plan-day`                                                          | `{ date, windowStart, windowEnd, fixedNotes?, instruction? }`                                                                                         | `{ blocks: PlannedBlock[], deferred: { taskId, reason }[], summary }`                                        |
| `POST /v1/ai/schedule`                                                          | `{ scope: { taskIds } \| { date } \| { week: weekStart }, instruction? }`                                                                             | `{ changes: ScheduleChange[], warnings: string[] }`                                                          |
| `POST /v1/ai/prioritize`                                                        | `{ scope: 'today' \| 'week' \| { projectId } }`                                                                                                       | `{ ranked: { taskId, rank, reason }[] }`                                                                     |
| `GET /v1/ai/insights?range=week\|month`                                         | —                                                                                                                                                     | `{ generatedAt, range, insights: Insight[] }` (cached 24 h)                                                  |
| `POST /v1/ai/insights/:id/feedback`                                             | `{ helpful: boolean }`                                                                                                                                | `204`                                                                                                        |
| `POST /v1/ai/goals/:goalId/recommendations`                                     | —                                                                                                                                                     | `{ suggestions: { kind: 'task'\|'milestone', title, reason, dueDate? }[] }`                                  |
| `POST /v1/ai/proposals`                                                         | `{ capability, title, rationale?, operations: Operation[] }` — used by planner/schedule/breakdown screens to register what the user is about to apply | `{ proposal: Proposal }`                                                                                     |
| `GET /v1/ai/proposals/:id`                                                      | —                                                                                                                                                     | `{ proposal: Proposal }`                                                                                     |
| `POST /v1/ai/proposals/:id/resolve`                                             | `{ status: 'applied'\|'partially_applied'\|'dismissed'\|'undone', appliedOpIds, editedOps?, mutationIds }`                                            | `{ proposal: Proposal }`; `409 proposal_stale` if not pending (except `undone` from applied)                 |
| `POST /v1/ai/chat`                                                              | `{ conversationId?, message }` (≤ 4000 chars)                                                                                                         | **SSE stream**, below                                                                                        |
| `GET /v1/ai/conversations?cursor=`                                              | —                                                                                                                                                     | `{ items: ConversationSummary[], nextCursor? }`                                                              |
| `GET /v1/ai/conversations/:id/messages?cursor=`                                 | —                                                                                                                                                     | `{ items: ChatMessage[], nextCursor? }`                                                                      |
| `DELETE /v1/ai/conversations/:id` · `DELETE /v1/ai/conversations`               | —                                                                                                                                                     | `204`                                                                                                        |
| `GET /v1/ai/memories` · `DELETE /v1/ai/memories/:id` · `DELETE /v1/ai/memories` | —                                                                                                                                                     | list / `204`                                                                                                 |
| `GET /v1/ai/usage`                                                              | —                                                                                                                                                     | `{ periodStart, periodEnd, used: Record<Capability, number>, limits: Record<Capability, number>, tier }`     |
| `GET /v1/ai/config`                                                             | —                                                                                                                                                     | `{ tiers: { fast: { label }, smart: { label } }, capabilities: Capability[] }` (labels shown in AI settings) |
| `GET /v1/ai/suggestions` · `POST /v1/ai/suggestions/:id`                        | — · `{ status }`                                                                                                                                      | list of `new`/`shown` · `204`                                                                                |
| `POST /v1/ai/transcribe`                                                        | multipart audio ≤ 60 s (fallback when on-device speech is unavailable)                                                                                | `{ text }`                                                                                                   |

Key types (full definitions in `shared`):

```ts
type TaskDraft = {
  title: string;
  notes?: string;
  priority?: 0 | 1 | 2 | 3 | 4;
  dueDate?: string;
  dueTime?: string;
  plannedDate?: string;
  durationMin?: number;
  rrule?: string;
  projectId?: string;
  newProjectName?: string;
  tagNames?: string[];
  reminderOffsetMin?: number;
};
type BreakdownNode = {
  ref: string;
  title: string;
  durationMin?: number;
  dueDate?: string;
  priority?: 0 | 1 | 2 | 3 | 4;
  children?: BreakdownNode[];
}; // depth ≤ 2
type PlannedBlock = { taskId: string; startAt: string; endAt: string; reason: string };
type ScheduleChange = {
  taskId: string;
  field: 'plannedDate' | 'dueDate' | 'timeBlock';
  from: unknown;
  to: unknown;
  reason: string;
  changesDeadline: boolean;
};
type Insight = {
  id: string;
  headline: string;
  detail: string;
  metric?: { label: string; value: string; series?: number[] };
  action?: { label: string; prompt: string };
};
type Proposal = {
  id: string;
  capability: string;
  title: string;
  rationale?: string;
  operations: Operation[];
  status: string;
  createdAt: string;
  expiresAt: string;
};
// Operation: doc 07 §5
```

### Chat stream (`POST /v1/ai/chat`, `text/event-stream`)

| Event       | Data                                       | Meaning                                                    |
| ----------- | ------------------------------------------ | ---------------------------------------------------------- |
| `meta`      | `{ conversationId, messageId, requestId }` | First event                                                |
| `text`      | `{ delta }`                                | Append to the assistant message                            |
| `tool`      | `{ name, label, state: 'start'\|'end' }`   | Show/replace the tool caption line (`label` is human text) |
| `proposal`  | `{ proposal: Proposal }`                   | Render a `ProposalCard`                                    |
| `task_refs` | `{ tasks: { id, title }[] }`               | Lets the client render inline task chips                   |
| `error`     | `{ code, message }`                        | Terminal error; keep partial text, show retry              |
| `done`      | `{ usage: { remaining: number } }`         | End of turn                                                |

Client: closing the connection cancels generation server-side. On network drop mid-stream, keep partial
text, mark the message "interrupted", offer Retry (same `Idempotency-Key` returns the stored completed
message if the server finished).

## 6.4 Other endpoints

| Method & path                        | Request                                                                        | Response                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `POST /v1/devices`                   | `{ expoPushToken, platform, deviceName?, appVersion }`                         | `{ deviceId }` (upsert by token)                                                    |
| `DELETE /v1/devices/:id`             | — (on sign-out)                                                                | `204`                                                                               |
| `GET /v1/notifications?cursor=`      | —                                                                              | `{ items: NotificationItem[], unreadCount, nextCursor? }`                           |
| `POST /v1/notifications/read`        | `{ ids?: string[], all?: boolean }`                                            | `204`                                                                               |
| `POST /v1/notifications/record`      | `{ items: { type, title, body, data, dedupeKey, firedAt }[] }` (locally fired) | `204`                                                                               |
| `GET /v1/reports/weekly/:weekStart`  | —                                                                              | `{ report: WeeklyReport }`; generates on demand if missing and the week is complete |
| `GET /v1/goals/:id/progress-history` | —                                                                              | `{ points: { date, progress }[] }`                                                  |
| `POST /v1/account/export`            | —                                                                              | `{ downloadUrl, expiresAt }` (JSON archive in Storage, signed URL)                  |
| `DELETE /v1/account`                 | `{ confirm: "DELETE" }`                                                        | `204`; client then wipes local data                                                 |
| `GET /v1/health`                     | no auth                                                                        | `{ ok: true, version }`                                                             |

## 6.5 Jobs function

`POST /functions/v1/jobs/<name>` with header `X-Cron-Secret`. Names and behaviour: doc 04 §4.8. Not
callable with a user token. Each returns `{ processed, failed }` and logs per-user failures.

## 6.6 Rate limits and quotas

Rate limits protect the service; quotas are product limits. Both are config (`_shared/limits.ts`), keyed
by plan. Starting values — tune after launch:

| Bucket                                                                           | Limit                |
| -------------------------------------------------------------------------------- | -------------------- |
| `ai:chat`                                                                        | 20 / minute per user |
| `ai:generate` (breakdown, plan, schedule, prioritize, insights, recommendations) | 10 / minute          |
| `ai:parse`                                                                       | 30 / minute          |
| `api:default`                                                                    | 120 / minute         |
| `account:export`                                                                 | 2 / day              |

| Monthly quota (free plan, placeholder numbers to be set from real cost data) |     |
| ---------------------------------------------------------------------------- | --- |
| Chat messages                                                                | 100 |
| Generations                                                                  | 60  |
| AI parses                                                                    | 300 |

Quota is counted from `ai_usage_events` (one count per user-visible request, not per provider call).
Additionally a global daily spend ceiling (`AI_DAILY_BUDGET_USD`) switches all AI endpoints to
`503 ai_unavailable` and alerts, as a circuit breaker against runaway cost.

## 6.7 Storage

Bucket `attachments` (private) and `avatars` (private; signed URLs). Upload path
`<userId>/<taskId>/<attachmentId>-<sanitisedFileName>`. Policies: authenticated users may
insert/select/delete only where the first path segment equals `auth.uid()`. Bucket limits: 25 MB,
allowed MIME types image/*, application/pdf, text/plain, and common office document types.
