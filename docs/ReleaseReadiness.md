# Milestone 6 Release Readiness Checklist

Use this checklist before release. Do not mark manual QA items as passed unless they were performed on a device or emulator and the result was recorded.

## Scope

- Backend/provider: Apibay.
- Automated coverage: unit, store, and service tests only.
- Release validation: Expo doctor/install checks and Expo export only; no EAS release build is required for this milestone.

## Manual QA To Perform

- [x] Launch: app opens cleanly from a fresh install and from a warm start without crashes or stuck loading states.
- [x] Search: submit a valid query, clear the query, retry after failure, and verify empty-result messaging.
- [ ] Filters, sort, and pagination: change each available filter/sort option, page forward/back, and confirm results remain coherent.
- [x] Details: open a result, verify displayed metadata, trusted/VIP indicators where present, and safe text rendering.
- [x] Favorites, history, and settings: add/remove favorites, reuse/delete/clear history, and verify Settings actions update local state.
- [x] Magnet actions: copy, share, and open a magnet link; verify unsupported handlers show a clear non-crashing failure state.
- [x] Provider page: open the provider/details page and verify failure handling if the external URL cannot be opened.
- [x] Clear storage: clear cache/favorites/history, restart the app, and verify cleared data does not return.
- [x] Offline/provider errors: test airplane mode, timeout/provider unavailable, and malformed/unexpected provider responses when feasible; verify readable errors and retry behavior.

## Accessibility Audit To Perform

- [x] TalkBack: navigate launch, search, results, details, favorites, and settings with meaningful labels and roles.
- [x] Reading order: verify screen reader focus follows the visual/task order for lists, dialogs, sheets, and action rows.
- [x] Text scaling: test large Android font/display sizes and confirm content remains usable without clipped critical controls.
- [x] Touch targets: confirm primary actions, list rows, tabs, filters, and destructive actions meet practical Android touch target sizing.
- [x] Contrast: verify text, icons, disabled states, selected filters, error states, and links remain readable in supported themes.
- [x] Dialogs, sheets, and snackbars: confirm focus, dismiss behavior, announcements, and action labels are understandable.

## Performance Audit To Perform

- [x] Startup: observe cold and warm launch time against the PRD goal of under 2 seconds where device conditions allow.
- [x] Search flow latency: measure or record perceived time from submit to loading state, first result, empty state, or error state.
- [x] Large-result scrolling: test long result sets for smooth FlatList scrolling, pagination continuity, and no visible blanking/jank.
- [x] Memory and re-renders: observe memory growth during repeated searches/details navigation and watch for obvious unnecessary re-renders or UI thrashing.

## Automated Commands To Run

Run with Bun from the repository root:

```sh
bun run format:check
bun run lint
bun run typecheck
bun test
bunx expo install --check
bunx expo-doctor
bunx expo export --platform android
```

## Release Review To Perform

- [x] Version/config: confirm `package.json`, Expo app config, app name, Android package, icons, splash, permissions, and supported orientation are correct.
- [x] Legal/product constraints: confirm the app does not download, host, stream, or store torrent content and uses Apibay only for metadata lookup.
- [x] Source notices: confirm dependency/source notices are present or documented as required by project policy and licenses.
- [x] Acceptance criteria: review `docs/PRD.md` acceptance criteria and record any unmet items before release.
- [x] Evidence: attach command output summaries and manual QA notes to the release issue, PR, or handoff record.
