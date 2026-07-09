````markdown
# TorrentBay – Product Requirements Document (PRD)

> Version: 1.0
> Platform: Android
> Framework: React Native + Expo
> Language: TypeScript
> Styling: NativeWind
> Data Provider: The Pirate Bay (HTML Scraper)
> Architecture: Clean Architecture

---

# 1. Project Overview

## Project Name

TorrentBay

## Goal

TorrentBay is an Android application that allows users to search torrents from **The Pirate Bay** and display their metadata in a clean, fast, and modern interface.

The application **does not host torrents**, **does not store torrents**, and **does not download torrent files**.

It only indexes publicly available information by scraping search result pages from The Pirate Bay.

---

# 2. Objectives

Primary objectives:

- Fast torrent searching
- Lightweight UI
- Clean Material-inspired design
- Reliable HTML scraping
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

## HTML Parsing

- Cheerio

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

# 7. HTML Scraper Requirements

The application **must not use any public API**.

Only scrape publicly accessible HTML pages.

Pipeline:

User Search

↓

Generate Search URL

↓

Download HTML

↓

Remove unnecessary elements

↓

Parse HTML

↓

Extract Metadata

↓

Return Clean Model

↓

Display UI

---

# 8. Anti-Ad Scraping Strategy

The scraper should minimize unnecessary content and avoid processing advertisements while remaining compliant with applicable laws and the target site's terms of use.

Goals:

- Fetch only the required HTML.
- Ignore ad-related DOM elements during parsing.
- Skip known advertisement containers, banners, iframes, sponsored sections, and tracking elements.
- Do not execute JavaScript.
- Do not load external assets such as images, scripts, stylesheets, analytics, or advertising resources.
- Extract only the HTML nodes required for torrent metadata.
- Use strict CSS selectors targeting torrent result tables/lists.
- Validate extracted data before returning it.

Performance practices:

- Parse only the relevant HTML subtree.
- Remove unrelated nodes before extraction.
- Avoid processing hidden or decorative elements.
- Reuse parsing utilities where possible.
- Fail gracefully if page structure changes.

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

Invalid HTML

↓

HTML layout changed

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

Do not cache HTML pages long-term.

---

# 14. Security

Never execute scraped JavaScript.

Never inject HTML into the UI.

Sanitize all scraped values.

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
        scraper/
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

Unit tests:

- parser
- models
- utilities

Integration tests:

- scraping pipeline
- state management

UI tests:

- search flow
- favorites
- navigation

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
- Execute JavaScript from scraped pages

---

# 22. Acceptance Criteria

The application is considered complete when:

- Users can search The Pirate Bay successfully.
- Torrent metadata is extracted accurately.
- Search results are displayed quickly.
- Favorites work locally.
- Search history functions correctly.
- The scraper ignores advertisement-related content and extracts only relevant torrent metadata.
- The application handles provider layout changes gracefully.
- The UI is responsive and performant.
- NativeWind is used consistently for styling.
- The project builds successfully with Expo.
- The architecture remains modular, maintainable, and AI-agent-friendly.
````
