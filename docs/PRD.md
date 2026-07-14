````markdown
# TorrentBay – Product Requirements Document (PRD)

> Version: 1.0
> Platform: Android
> Framework: React Native + Expo
> Language: TypeScript
> Styling: NativeWind
> Data Provider: Apibay (accepted provider backend for The Pirate Bay metadata)
> Architecture: Clean Architecture

---

# 1. Project Overview

## Project Name

TorrentBay

## Goal

TorrentBay is an Android application that allows users to search torrent metadata sourced from **The Pirate Bay** through the accepted **Apibay** provider backend and display it in a clean, fast, and modern interface.

The application **does not host torrents**, **does not store torrents**, and **does not download torrent files**.

It only indexes publicly available torrent metadata from the accepted provider pipeline.

## Accepted Scope Alignment

- Apibay is an intentional accepted deviation from the original HTML-only scraper PRD, not a bug.
- Automated coverage is unit/store/service focused; UI and navigation validation are handled through manual QA.
- Release readiness means Expo doctor/install checks and Expo export. EAS build setup is out of scope.

---

# 2. Objectives

Primary objectives:

- Fast torrent searching
- Lightweight UI
- Clean Material-inspired design
- Reliable provider metadata retrieval
- Minimal battery consumption
- High performance
- Native Android experience
- AI-agent-friendly architecture
- Easy maintenance

---

# 3. Tech Stack

## Mobile

- React Native
- Expo
- TypeScript

## Styling

- NativeWind
- TailwindCSS

## Networking

- Fetch API

## Provider Metadata Parsing

- JSON parsing and normalization

## State Management

- Zustand

## Navigation

- Expo Router

## Local Storage

- MMKV

## Icons

- Lucide React Native

---

# 4. Project Principles

The application must:

- remain lightweight
- have zero unnecessary dependencies
- be modular
- follow SOLID principles
- be AI-agent friendly
- separate business logic from UI
- avoid duplicated logic

---

# 5. Functional Requirements

## Search Torrents

Users can search:

- Movies
- TV Shows
- Games
- Applications
- Music
- Books
- Anime
- Adult
- Other categories available from The Pirate Bay

---

## Search Input

Features

- instant search
- search button
- clear search
- loading state
- retry state

---

## Torrent Results

Every result should include when available:

- Name
- Category
- Subcategory
- Uploaded Date
- Size
- Uploader
- Seeders
- Leechers
- Magnet URL
- Torrent Details URL
- Trusted/VIP status (if available)
- Description snippet (if available)

---

## Result Actions

Each result should support:

- Copy Magnet Link
- Open Magnet
- Share Magnet
- View Details
- Open Torrent Page

---

## Search History

Store locally.

User can

- clear history
- delete single entry
- tap to search again

---

## Favorites

Allow bookmarking torrents locally.

---

## Recent Searches

Display previous searches.

---

# 6. Non Functional Requirements

Application startup:

- under 2 seconds

Search response:

- as fast as network allows

Scrolling:

- 60 FPS

Memory usage:

- optimized

Offline:

- graceful handling

---

# 7. Provider Metadata Requirements

The application uses Apibay as the accepted backend for The Pirate Bay torrent metadata. This replaces the original HTML-only/no-public-API requirement by explicit scope decision.

Pipeline:

User Search

↓

Generate Provider Request

↓

Fetch Provider Metadata

↓

Validate Response

↓

Normalize Provider Fields

↓

Extract Torrent Metadata

↓

Return Clean Model

↓

Display UI

---

# 8. Provider Data Hygiene Strategy

The provider pipeline should minimize unnecessary processing while remaining compliant with applicable laws and the target service's terms of use.

Goals:

- Fetch only the required provider metadata.
- Ignore unrelated provider fields during normalization.
- Do not process advertising, tracking, or unrelated payload fields when present.
- Do not execute JavaScript.
- Do not load external assets such as images, scripts, stylesheets, analytics, or advertising resources.
- Extract only fields required for torrent metadata.
- Use strict mapping from provider fields to the app `Torrent` model.
- Validate extracted data before returning it.

Performance practices:

- Parse only the relevant provider response fields.
- Remove unrelated fields before model creation.
- Avoid processing hidden or decorative elements.
- Reuse parsing utilities where possible.
- Fail gracefully if the provider response structure changes.

---

# 9. Data Model

## Torrent

```text
id
name
category
subcategory
uploaded
size
seeders
leechers
uploader
magnet
detailsUrl
trusted
vip
description
```

---

# 10. Application Screens

## Splash

Displays logo.

---

## Home

Contains

- search bar
- recent searches
- favorites
- search button

---

## Search Results

Contains

- search header
- filters
- torrent list
- pagination
- loading
- empty state

---

## Torrent Details

Displays

- complete metadata
- magnet button
- copy button
- share button
- open provider page

---

## Favorites

Bookmarked torrents.

---

## Settings

Contains

- Clear Cache
- Clear Favorites
- Clear History
- About
- App Version

---

# 11. Filters

Support filtering by provider categories where available.

Examples:

- Movies
- TV
- Games
- Music
- Applications
- Anime
- Books
- Other

Optional sort options:

- Seeders
- Leechers
- Size
- Upload Date

---

# 12. Error Handling

Possible failures:

No Internet

↓

Provider unavailable

↓

Invalid provider response

↓

Provider response changed

↓

Rate limited

↓

Timeout

↓

Unknown error

Each error should present:

- readable message
- retry action
- no application crash

---

# 13. Caching

Cache:

- recent searches
- favorites
- last successful search results (optional)

Do not cache raw provider responses long-term.

---

# 14. Security

Never execute provider-sourced JavaScript.

Never inject HTML into the UI.

Sanitize all provider-sourced values.

Validate every extracted field.

Never expose internal parser errors to users.

---

# 15. Accessibility

Support:

- TalkBack
- scalable text
- accessible touch targets
- screen reader labels
- high contrast compatibility

---

# 16. Performance Goals

- Lazy rendering
- FlatList virtualization
- Memoized components
- Cached images when applicable
- Efficient state updates
- Minimal re-renders

---

# 17. Project Folder Structure

```text
src/
    app/
    components/
    features/
        search/
        torrents/
        favorites/
        settings/
    services/
        provider/
        parser/
        networking/
    hooks/
    store/
    models/
    utils/
    constants/
    types/
    assets/
```

---

# 18. Coding Standards

- TypeScript strict mode
- Functional components only
- Hooks only
- No duplicated logic
- Small reusable components
- Consistent naming
- Modular architecture
- Strong typing throughout
- Clear separation of UI, domain, and data layers

---

# 19. Testing Strategy

Automated coverage is unit-only and does not require UI test dependencies.

Unit/store/service tests:

- parser
- models
- utilities
- state management
- provider metadata services
- favorites and persistence stores

Manual QA checklist:

- search flow
- favorites
- navigation
- accessibility labels, scalable text, touch targets, and high contrast compatibility

---

# 20. Future Enhancements

- Multiple torrent providers
- Advanced filters
- Search suggestions
- Dark/Light theme customization
- Multi-language support
- Export favorites
- Backup & restore
- Tablet optimization
- Android widgets
- Torrent health indicators
- User-defined default sort/filter preferences

---

# 21. Out of Scope

The application will **not**:

- Download torrent files
- Host torrent content
- Store copyrighted media
- Stream media
- Include user accounts
- Include cloud synchronization
- Require authentication
- Execute JavaScript from provider data

---

# 22. Acceptance Criteria

The application is considered complete when:

- Users can search The Pirate Bay metadata successfully through Apibay.
- Torrent metadata is extracted accurately.
- Search results are displayed quickly.
- Favorites work locally.
- Search history functions correctly.
- The provider pipeline ignores unrelated content and extracts only relevant torrent metadata.
- The application handles provider response changes gracefully.
- The UI is responsive and performant.
- NativeWind is used consistently for styling.
- Expo doctor/install checks and Expo export complete successfully.
- EAS build setup is not required for this milestone.
- The architecture remains modular, maintainable, and AI-agent-friendly.
````
