# TorrentBay

TorrentBay is a React Native + Expo Android app for searching and browsing publicly available torrent metadata. It uses Apibay as the metadata provider, displays normalized torrent information, and supports local favorites, search history, and magnet-link actions.

TorrentBay does not host, store, stream, or download torrent content.

## Features

- Search torrent metadata by keyword with category and sort controls.
- Browse normalized result metadata including name, category, size, upload date, uploader, seeders, leechers, magnet link, provider details URL, and trusted/VIP status when available.
- Copy, share, or open magnet links with confirmation controls.
- Open provider/details pages externally.
- Save favorites locally and sort them by recent, name, seeders, or category.
- Keep local search history and replay previous searches with their selected category and sort.
- Configure local preferences, including mature-content category visibility and magnet-link confirmation.
- Handle loading, empty, retry, offline/provider error, and unsupported-action states.

## Tech Stack

- React Native 0.86 with React 19.
- Expo 57 and Expo Router.
- TypeScript with strict mode.
- NativeWind and Tailwind CSS for styling.
- Zustand for local state and persisted stores.
- Expo SQLite KV store for persisted local preferences, favorites, and history, with an in-memory fallback in tests.
- Apibay JSON metadata provider, plus parser utilities and provider URL helpers.
- Bun for dependency management, scripts, and tests.

## Prerequisites

- Bun installed and available on your PATH.
- Expo tooling via `bunx expo`.
- EAS CLI access via the GitHub Actions Expo setup or local `bunx eas` usage if you build manually.
- Android Studio, an Android emulator, or a physical Android device for Android development.
- An Expo account and valid `EXPO_TOKEN` for release builds.

## Installation

From the project root:

```sh
bun install
```

For CI-style installs, use the lockfile:

```sh
bun install --frozen-lockfile
```

## Development

Run the Expo development server:

```sh
bun run start
```

Launch platform targets:

```sh
bun run android
bun run ios
bun run web
```

This project is primarily scoped for Android. iOS and web scripts exist through Expo, but Android is the documented release target.

## Testing And Quality

Run unit/store/service tests:

```sh
bun test
```

Run quality checks:

```sh
bun run format:check
bun run lint
bun run typecheck
```

Run Expo dependency checks before release:

```sh
bunx expo install --check
bunx expo-doctor
```

The release readiness checklist in `docs/ReleaseReadiness.md` also documents manual QA areas for launch, search, details, favorites, history, settings, accessibility, and performance.

## Android APK Releases

Android APK releases are automated by `.github/workflows/android-apk-release.yml`.

- Push a numeric version tag matching `vX.Y.Z`, such as `v0.1.0`, to trigger the workflow.
- The tag version must match `package.json` `version` and `app.json` `expo.version`.
- The workflow installs dependencies with `bun install --frozen-lockfile`.
- It runs formatting, linting, type checking, tests, `bunx expo install --check`, and `bunx expo-doctor`.
- It builds Android with EAS using the `apk` profile from `eas.json`.
- The `apk` profile sets `android.buildType` to `apk`.
- If all checks, the EAS build, and artifact download succeed, the workflow publishes a non-draft GitHub Release and attaches `TorrentBay-<tag>.apk`.
- The workflow requires the `EXPO_TOKEN` GitHub repository secret.

See `docs/ApkGithubReleasePlan.md` for the full release runbook.

## Project Structure

```text
src/
  app/                 Expo Router screens and routes
  assets/              App icon and splash assets
  components/          Shared UI, navigation, and brand components
  constants/           App, theme, and provider constants
  features/            Search, torrent, favorites, and settings feature modules
  hooks/               Shared React hooks
  models/              Domain models and search parameter types
  services/            Networking, provider URL, parser, and storage services
  store/               Zustand stores and store tests
  styles/              Global NativeWind styles
  types/               Shared app-state types
  utils/               Shared utility functions
docs/                  Product, task, release, and APK release documentation
.github/workflows/    GitHub Actions release workflow
```

## Safety And Legal Disclaimer

TorrentBay is a metadata browser only. It does not host files, store torrent payloads, download torrent files, stream media, or provide copyrighted content. Users are responsible for complying with applicable laws, provider terms, and rights-holder requirements in their jurisdiction. Only search for and access content you are legally permitted to use.
