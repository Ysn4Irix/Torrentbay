# TorrentBay Tasks

## Milestone 1: Project Foundation

- Initialize Expo React Native project with TypeScript.
- Configure NativeWind, Expo Router, Zustand, MMKV, Cheerio, and Lucide icons.
- Create the clean architecture folder structure under `src/`.
- Enable strict TypeScript and baseline lint/build scripts.

## Milestone 2: Scraping & Parsing Core

- Define the `Torrent` model and parser result types.
- Build search URL generation for provider categories and pagination.
- Implement HTML fetching with timeout and network error handling.
- Parse torrent metadata with Cheerio using strict selectors.
- Strip ignored ad/tracking elements and validate extracted values.

## Milestone 3: Search Experience

- Build search input with submit, clear, loading, retry, and instant search behavior.
- Render torrent results with performant list virtualization.
- Add category filters and optional sort controls.
- Implement pagination or load-more behavior.
- Add copy magnet, open magnet, share magnet, view details, and open provider page actions.

## Milestone 4: Local Data Features

- Persist recent searches and search history locally.
- Support clearing history and deleting individual entries.
- Add local favorites with add/remove behavior.
- Cache last successful search results only when useful.

## Milestone 5: App Screens & Navigation

- Build Splash, Home, Search Results, Torrent Details, Favorites, and Settings screens.
- Wire navigation between search results, details, favorites, and settings.
- Add settings actions for clearing cache, favorites, and history.
- Add app version and about content.

## Milestone 6: Quality, Accessibility & Performance

- Add readable error states for offline, timeout, rate limit, invalid HTML, and provider changes.
- Add TalkBack labels, scalable text support, and accessible touch targets.
- Optimize startup, FlatList rendering, state updates, and memory usage.
- Add unit tests for parser, models, and utilities.
- Add integration tests for scraping pipeline and state management.

## Milestone 7: Release Readiness

- Run lint, type check, tests, and Expo build verification.
- Review acceptance criteria against the PRD.
- Confirm out-of-scope boundaries are not implemented.
- Polish UI states and prepare Android release build.
