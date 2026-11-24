# Cadence — AI-powered productivity app

"Cadence" is a working name (not trademark-checked). This repo is built from the blueprint in `docs/`.
The blueprint is the source of truth: do not make product or architecture decisions that contradict it.
If the blueprint is silent or self-contradictory on something that matters, stop and ask the user.

## Read before writing code

| When you are working on                      | Read                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| Anything (first session)                     | `docs/README.md`, `docs/09-implementation-plan.md`              |
| A screen or component                        | `docs/02-design-system.md`, `docs/03-navigation-and-screens.md` |
| Local DB, sync, notifications, folder layout | `docs/04-architecture.md`                                       |
| Migrations, RLS, queries                     | `docs/05-database.md`                                           |
| Edge Functions, RPCs, error codes            | `docs/06-api.md`                                                |
| Any AI feature                               | `docs/07-ai-system.md`                                          |
| Tests, CI, env vars, failure handling        | `docs/08-quality.md`                                            |

## Non-negotiable rules

1. **One write path.** UI never writes to Supabase tables directly. Every change to synced data goes
   through a repository in `packages/mobile/src/data/repositories`, which writes local SQLite and the
   outbox in one transaction.
2. **AI never writes.** AI tools are read-only or produce a _proposal_. Only an explicit user approval
   applies a proposal, and it is applied through the same repositories as a manual edit.
3. **No secrets in the app.** The mobile bundle contains only the Supabase URL, the anon key, and public
   DSNs. LLM keys, the service-role key and push credentials exist only in Edge Function secrets.
4. **Every table has RLS** and a pgTAP test proving user A cannot read or write user B's rows.
5. **Tokens only.** No hex colours, font sizes, spacing numbers or durations in screen code — use
   `theme` from `src/design`.
6. **Validate at every boundary** with the Zod schemas in `packages/shared`. LLM output is untrusted input.
7. **Verify library APIs against current docs.** The blueprint names libraries and describes behaviour;
   it was written without checking each library's current API. `docs/04-architecture.md` §4.11 lists what
   to confirm. Never invent a function name — look it up.
8. **Android and iOS are equal targets.** Every feature must work on both. Platform-specific code goes
   only in `src/services` or `*.ios.ts` / `*.android.ts` files behind a shared interface — never
   `Platform.OS` branches in screens. See `docs/04-architecture.md` §4.12.
9. Work one phase at a time in the order of `docs/09-implementation-plan.md`. A phase is done only when
   its Definition of Done passes; report failures plainly instead of moving on.

## Commands

Run from the repo root unless stated. Package manager is pnpm (version pinned in `packageManager`).

| Task                            | Command                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Install                         | `pnpm install`                                                                                         |
| Typecheck all packages          | `pnpm typecheck`                                                                                       |
| Lint / auto-fix                 | `pnpm lint` / `pnpm lint:fix`                                                                          |
| Format check / write            | `pnpm format:check` / `pnpm format`                                                                    |
| Unit + component tests          | `pnpm test` (shared: Vitest, mobile: Jest via jest-expo)                                               |
| Everything CI runs, in one go   | `pnpm run ci`                                                                                          |
| Start the app (dev server)      | `pnpm mobile` (then open on the Android phone or an emulator)                                          |
| Check Expo/SDK consistency      | `cd packages/mobile && npx expo-doctor`                                                                |
| Bundle for both platforms       | `cd packages/mobile && npx expo export --platform android --platform ios --output-dir dist`            |
| Local Supabase up / down        | `pnpm db:start` / `pnpm db:stop` (needs Docker Desktop; first start downloads several GB of images)    |
| Reset local DB (apply migrations) | `pnpm db:reset`                                                                                      |
| Serve Edge Functions            | `pnpm functions:serve`                                                                                 |
| E2E smoke flow (Maestro)        | `packages/mobile/e2e/smoke.yaml`; run in CI by `.github/workflows/ios-smoke.yml` (iOS Simulator)       |
| Design gallery flow (Maestro)   | `packages/mobile/e2e/gallery.yaml` (light + dark screenshots); also run by `ios-smoke.yml`              |
| Design gallery (dev builds)     | Open the deep link `<scheme>://_dev/gallery`; the theme control at the top switches System/Light/Dark |

Notes that save time:

- Add Expo-managed libraries with `npx expo install <pkg>` from `packages/mobile` (it picks the version
  pinned for the installed SDK). Use `-- --save-dev` for dev dependencies. `pnpm exec expo install`
  does not forward that flag.
- pnpm blocks dependency install scripts unless reviewed. Decisions live in `allowBuilds` in
  `pnpm-workspace.yaml`. Do not use `dangerouslyAllowAllBuilds`. Add an entry only after checking what
  the script does.
- pnpm enforces a minimum release age on new package versions. Do not exempt packages to get around it;
  pin an older stable version instead.
- Testing Library (v14): `render` is async, so `await render(...)`.
- App identity (name, scheme, bundle id) comes from env via `packages/mobile/app.config.ts`.
  Never write the product name as a literal in UI copy; use `APP_NAME` from `src/lib/appInfo.ts`.
- Docs and this file are excluded from Prettier on purpose.
- `expo start` rewrites `packages/mobile/tsconfig.json` (reformats it and drops the `.expo/types` and
  `expo-env.d.ts` includes). Run `git status` before committing and revert it with
  `git checkout packages/mobile/tsconfig.json`.
- Android phone over USB: run `adb reverse tcp:8081 tcp:8081` so the development build reaches Metro.
  The mapping is lost when the phone restarts or USB reconnects. Open the app with
  `adb shell am start -a android.intent.action.VIEW -d "exp+cadence://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"`.
- iOS: `.github/workflows/ios-smoke.yml` is started by hand (Actions, Run workflow) or nightly; a push
  does not trigger it. Maestro taps tabs by `id` (`tab-<name>`), not by text.
- Design system (Phase 1): tokens, `ThemeProvider` and `useTheme()` live in `src/design`; primitives in
  `src/components/ui`. Import icons through `src/design/icons/lucide.ts` (add the icon there), never from
  the `lucide-react-native` barrel: Metro does not tree-shake and the barrel adds about 2.5 MB. Jest maps
  only the per-icon paths, so a barrel import fails loudly in tests.
- Lint enforces rule 5 beyond hex colours: raw `fontSize`, `gap`, `padding*`, `margin*`, `border*Radius`
  and `duration` numbers are errors in `app/`, `features/` and `components/` (not `components/ui`).
- Phase 1 added native modules (reanimated, worklets, gesture-handler, svg, MMKV, menu, slider, haptics),
  and `userInterfaceStyle` became `automatic`. A development build made before that does not contain
  these modules, so expect it to fail at start-up until rebuilt (not yet confirmed on the phone). Rebuild
  from the `development` profile in `packages/mobile/eas.json` (Android) and `ios-simulator` (iOS).
  `src/services/storage.ts` falls back to memory if only MMKV is missing.
- Jest mocks live in `packages/mobile/jest.setup.ts` (reanimated, gesture-handler, bottom-sheet, haptics,
  MMKV). The first `renderRouter` in `__tests__/navigation.test.tsx` imports the whole route tree, hence its
  60 s timeout. Use `renderThemed(ui, scheme)` from `src/test/renderThemed.tsx` for themed components.
- Windows: a Python script that rewrites a file writes CRLF and reads UTF-8 as cp1252. Use the editor
  tools, or pass `newline=''` and `encoding='utf-8'`.
