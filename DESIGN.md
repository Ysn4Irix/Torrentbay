# TorrentBay — Product Design Specification

> AI-agent-friendly UI/UX design document
> Version: 1.0
> Platform: Android
> Framework: React Native + Expo
> Styling: NativeWind
> Icon library: Lucide React Native
> Source requirements: `PRD.md`

---

# 1. Design Purpose

This document defines the complete product design direction for TorrentBay. It translates the product requirements into a consistent, accessible, and implementation-ready Android interface.

TorrentBay is a utility application for searching publicly available torrent metadata. The design must feel fast, neutral, trustworthy, and information-dense without becoming visually overwhelming.

The interface must not imply that TorrentBay hosts, downloads, streams, or owns any listed content.

---

# 2. Design Goals

The interface must be:

- Fast to understand within the first few seconds.
- Optimized for one-handed Android use.
- Lightweight and free of decorative clutter.
- Suitable for long result lists and metadata-heavy content.
- Clear about loading, offline, empty, and failure states.
- Accessible with TalkBack and large system text.
- Consistent across compact phones, large phones, and tablets.
- Easy for AI coding agents to reproduce accurately.

Primary experience priorities:

1. Search speed.
2. Result readability.
3. Clear seed/leech health signals.
4. Safe, explicit magnet-link actions.
5. Reliable local history and favorites.

---

# 3. Product Personality

TorrentBay should feel:

- Technical but approachable.
- Modern but not flashy.
- Compact but not cramped.
- Neutral and utility-focused.
- Transparent about data source and limitations.

Avoid:

- Pirate-themed visual clichés.
- Skulls, weapons, treasure maps, or aggressive imagery.
- Excessive neon effects.
- Heavy gradients.
- Large poster artwork that reduces metadata visibility.
- Visual patterns resembling a media-streaming service.

---

# 4. Visual Direction

## 4.1 Core Concept

Use a **Material-inspired utility interface** with dark surfaces, crisp typography, restrained teal accents, rounded containers, and strong metadata hierarchy.

The application should resemble a high-quality search and diagnostics tool rather than an entertainment catalog.

## 4.2 Default Theme

The initial release should use a dark-first theme.

Visual characteristics:

- Deep navy application background.
- Slightly lighter elevated cards.
- Electric teal primary actions.
- Green seed indicators.
- Amber warning states.
- Red destructive and error states.
- Thin, low-contrast borders.
- Minimal shadows.

A light-theme token set should be defined for future activation, but implementation may initially ship with the dark theme only.

---

# 5. Brand System

## 5.1 Product Name

**TorrentBay**

Use title case in user-facing UI.

## 5.2 Logo Concept

Create a simple abstract mark using:

- A rounded search lens.
- Three horizontal metadata lines.
- A subtle downward directional notch.

The mark should communicate “search + indexed data,” not downloading.

Logo constraints:

- Must remain recognizable at 24 dp.
- Must work in one color.
- Must not use copyrighted provider branding.
- Must not use a pirate ship, skull, or torrent provider logo.

## 5.3 App Icon

Recommended composition:

- Rounded-square dark navy background.
- Centered teal search-and-lines symbol.
- No text.
- Safe margins suitable for Android adaptive icons.

---

# 6. Design Tokens

All values below are implementation targets. Minor platform adjustments are acceptable when required for accessibility or Android behavior.

## 6.1 Color Tokens — Dark Theme

| Token                   |              Value | Usage                               |
| ----------------------- | -----------------: | ----------------------------------- |
| `color.background`      |          `#08111F` | App background                      |
| `color.surface`         |          `#0E1A2B` | Cards and sections                  |
| `color.surfaceElevated` |          `#142238` | Modals, sheets, selected cards      |
| `color.surfaceMuted`    |          `#192A42` | Chips, secondary containers         |
| `color.border`          |          `#263A55` | Dividers and outlines               |
| `color.primary`         |          `#2DD4BF` | Primary actions and active controls |
| `color.primaryPressed`  |          `#14B8A6` | Pressed primary state               |
| `color.primarySoft`     |          `#123D3B` | Selected chip/background            |
| `color.textPrimary`     |          `#F4F7FB` | Main text                           |
| `color.textSecondary`   |          `#AAB8CC` | Supporting text                     |
| `color.textMuted`       |          `#71819A` | Low-emphasis metadata               |
| `color.success`         |          `#4ADE80` | Seeders, success feedback           |
| `color.warning`         |          `#FBBF24` | Warnings, low health                |
| `color.error`           |          `#FB7185` | Errors and destructive actions      |
| `color.info`            |          `#60A5FA` | Informational status                |
| `color.vip`             |          `#C084FC` | VIP uploader badge                  |
| `color.scrim`           | `rgba(0,0,0,0.64)` | Modal backdrop                      |

## 6.2 Color Tokens — Light Theme

| Token                   |     Value |
| ----------------------- | --------: |
| `color.background`      | `#F5F7FA` |
| `color.surface`         | `#FFFFFF` |
| `color.surfaceElevated` | `#FFFFFF` |
| `color.surfaceMuted`    | `#EAF0F5` |
| `color.border`          | `#D5DEE9` |
| `color.primary`         | `#0F766E` |
| `color.primaryPressed`  | `#115E59` |
| `color.primarySoft`     | `#CCFBF1` |
| `color.textPrimary`     | `#102033` |
| `color.textSecondary`   | `#475569` |
| `color.textMuted`       | `#718096` |
| `color.success`         | `#15803D` |
| `color.warning`         | `#B45309` |
| `color.error`           | `#BE123C` |
| `color.info`            | `#1D4ED8` |
| `color.vip`             | `#7E22CE` |

## 6.3 Typography

Use the Android system font through React Native defaults. Do not add a custom font dependency for the first release.

| Style       | Size | Line height | Weight | Usage                          |
| ----------- | ---: | ----------: | -----: | ------------------------------ |
| Display     |   32 |          38 |    700 | Splash or rare hero text       |
| H1          |   24 |          30 |    700 | Screen titles                  |
| H2          |   20 |          26 |    700 | Section titles                 |
| H3          |   17 |          23 |    600 | Card titles                    |
| Body        |   15 |          21 |    400 | General content                |
| Body Strong |   15 |          21 |    600 | Labels and emphasized metadata |
| Small       |   13 |          18 |    400 | Supporting metadata            |
| Caption     |   11 |          15 |    500 | Badges and compact labels      |
| Metric      |   14 |          18 |    700 | Seeder/leecher counts          |

Typography rules:

- Torrent names may use a maximum of two lines in result cards.
- Never use all caps for full sentences.
- Badge labels may use uppercase only when four characters or fewer, such as `VIP`.
- Respect Android font scaling up to at least 200%.
- Use tabular numbers where supported for seeder, leecher, size, and date metrics.

## 6.4 Spacing Scale

Use a 4 dp base grid.

| Token      | Value |
| ---------- | ----: |
| `space.1`  |     4 |
| `space.2`  |     8 |
| `space.3`  |    12 |
| `space.4`  |    16 |
| `space.5`  |    20 |
| `space.6`  |    24 |
| `space.8`  |    32 |
| `space.10` |    40 |
| `space.12` |    48 |

## 6.5 Corner Radius

| Token         | Value | Usage                            |
| ------------- | ----: | -------------------------------- |
| `radius.sm`   |     8 | Badges and compact chips         |
| `radius.md`   |    12 | Inputs and buttons               |
| `radius.lg`   |    16 | Cards and sections               |
| `radius.xl`   |    24 | Bottom sheets and large surfaces |
| `radius.full` |   999 | Circular icons and pills         |

## 6.6 Elevation

Use borders before shadows.

- Level 0: background only.
- Level 1: `surface` with 1 dp border.
- Level 2: `surfaceElevated` with subtle Android elevation.
- Level 3: modal or bottom sheet with scrim.

Avoid strong or decorative shadows.

## 6.7 Iconography

Use Lucide React Native with rounded line icons.

Standard sizes:

- 18 dp inside compact controls.
- 20 dp for list actions.
- 24 dp for navigation.
- 28–32 dp for empty states.

Default stroke width: 2.

---

# 7. Layout System

## 7.1 Screen Container

- Respect Android safe areas and gesture navigation insets.
- Horizontal padding: 16 dp on phones.
- Horizontal padding: 24 dp on large phones.
- Maximum content width on tablets: 760 dp for single-column content.
- Use 12–16 dp vertical spacing between primary sections.

## 7.2 Compact Phone

Target width: 320–399 dp.

- Single-column layout.
- Bottom navigation remains visible.
- Search result cards use compact metadata rows.
- Secondary card actions move into an overflow menu.

## 7.3 Standard and Large Phone

Target width: 400–599 dp.

- Single-column layout.
- Search filters use a horizontal scroll row.
- Result cards may show one primary inline action and overflow for others.

## 7.4 Tablet

Target width: 600 dp and above.

- Replace bottom navigation with a navigation rail when practical.
- Results may use a master-detail layout.
- Search result list occupies 40–48% of available width.
- Selected torrent details occupy the remaining width.
- Do not stretch text cards edge-to-edge beyond readable widths.

---

# 8. Information Architecture

Primary destinations:

1. Home
2. Favorites
3. Settings

Contextual destinations:

- Search Results
- Torrent Details
- Search History
- Filter and Sort Sheet
- Provider Page Confirmation

Recommended Expo Router structure:

```text
app/
  _layout
  index                 Home
  search
    index               Search Results
    filters             Filter Sheet route or modal
  torrent
    [id]                Torrent Details
  favorites             Favorites
  settings              Settings
  history               Full Search History
```

---

# 9. Navigation Model

## 9.1 Bottom Navigation

Use three destinations:

- Home — `Search`
- Favorites — `Bookmark`
- Settings — `Settings`

Behavior:

- Height: 64–72 dp plus bottom inset.
- Active icon and label use `color.primary`.
- Inactive items use `color.textMuted`.
- Preserve screen state when switching tabs.
- Hide the bottom bar on details screens when it improves focus.

## 9.2 Top App Bar

Use a compact app bar for child screens.

Contents:

- Back button.
- Screen title.
- Optional single action, such as share or overflow.

Height: 56 dp plus status inset.

## 9.3 Android Back Behavior

- Back closes menus, dialogs, and sheets first.
- Back from details returns to the previous result position.
- Back from results returns to the originating query state on Home.
- Back on Home follows standard Android app behavior.

---

# 10. Core User Flows

## 10.1 First Search

```text
Launch
→ Splash
→ Home
→ Enter query
→ Optional category selection
→ Submit search
→ Results loading skeleton
→ Search Results
→ Select result
→ Torrent Details
→ Choose explicit action
```

## 10.2 Repeat Search

```text
Home
→ Tap recent search
→ Results
```

## 10.3 Favorite Flow

```text
Result card or Details
→ Tap bookmark
→ Local confirmation feedback
→ Favorites tab
→ Open saved result
```

## 10.4 Error Recovery

```text
Search
→ Network or provider error
→ Human-readable error state
→ Retry
→ Preserve query and filters
```

---

# 11. Screen Specifications

# 11.1 Splash Screen

## Purpose

Provide immediate brand recognition while local state initializes.

## Layout

- Full-screen `color.background`.
- Centered logo mark, 72–88 dp.
- Product name below the mark.
- Optional small indeterminate progress indicator near the bottom.

## Behavior

- Do not show for longer than necessary.
- Avoid animated video or large assets.
- Use a simple 200–300 ms fade transition.
- Route to Home after initialization.

---

# 11.2 Home Screen

## Purpose

Enable the fastest possible path to a new or repeated search.

## Structure

1. Brand header.
2. Primary search field.
3. Category chips.
4. Recent searches.
5. Favorite preview.
6. Data-source notice.

## Header

- Small logo mark and `TorrentBay` wordmark.
- Optional overflow or help action.
- Avoid a large hero title that pushes search below the fold.

## Search Field

Recommended height: 56 dp.

Elements:

- Search icon.
- Placeholder: `Search torrents`.
- Clear button when text exists.
- Submit arrow or button.

Behavior:

- Autofocus only when the user explicitly taps the field.
- Keyboard submit triggers search.
- Disable submission for trimmed empty input.
- Show a compact progress indicator inside the trailing area during submission.
- Debounced suggestions may be added later; do not trigger network search on every keystroke in the first release.

## Category Chips

Default order:

- All
- Movies
- TV
- Games
- Apps
- Music
- Anime
- Books
- Other

Adult content handling:

- Hide the Adult category by default.
- Provide an explicit setting to reveal mature-content categories.
- Do not place mature content in default recent or suggested content areas.

Chip states:

- Default: muted surface and secondary text.
- Selected: primary-soft background, primary border, primary text.
- Pressed: slightly reduced opacity.
- Minimum height: 40 dp.

## Recent Searches Section

Section header:

- Title: `Recent searches`.
- Action: `See all` when more than five entries exist.

Each row contains:

- History icon.
- Query.
- Category or `All` label.
- Relative date where useful.
- Remove action through swipe or overflow menu.

Show no more than five entries on Home.

## Favorite Preview

Show up to three favorites.

Each compact row contains:

- Torrent name.
- Category.
- Size.
- Seeder count.
- Chevron.

When empty, show a small supportive message rather than a full-screen empty state.

## Source Notice

Use a compact information card:

`TorrentBay indexes public metadata from an external provider. It does not host or download files.`

Do not repeat this notice on every result card.

## Empty Home State

When there is no history and no favorites:

- Keep search prominent.
- Show a small neutral illustration or icon.
- Message: `Search by title, software name, artist, or keyword.`

---

# 11.3 Search Results Screen

## Purpose

Display large quantities of torrent metadata with high scanability and reliable actions.

## Top Area

Use a sticky search header containing:

- Back button.
- Editable query field.
- Clear action.
- Search/submit action.

Below it, show a sticky filter toolbar:

- Selected category chip.
- Sort control.
- Filter button.
- Result count when known.

## Results Summary

Example:

`128 results for “Ubuntu”`

When exact result count is not available:

`Results for “Ubuntu”`

## Result List

Use `FlatList` with:

- 8–12 dp gap between cards.
- 12–16 dp bottom content inset above navigation or floating controls.
- Stable keys.
- Skeleton placeholders during initial load.
- Compact inline loading indicator for pagination.

## Torrent Result Card

Recommended minimum height: 148 dp.

### Card hierarchy

1. Category and status badges.
2. Torrent name.
3. Metadata line.
4. Health metrics.
5. Primary actions.

### Header row

Left:

- Category badge.
- Optional subcategory badge.

Right:

- Trusted badge.
- VIP badge.
- Favorite button.

### Title

- Maximum two lines.
- Use H3 style.
- Preserve meaningful release text.
- Do not visually decode or alter the original title beyond whitespace sanitization.

### Metadata

Show the most useful values first:

- Size.
- Upload date.
- Uploader.

Use icons only when they improve scanning. Avoid placing an icon before every value.

### Health row

- Seeder icon or upward arrow with green count.
- Leecher icon or downward arrow with muted or amber count.
- Optional health label derived only from explicit rules.

Suggested health states:

| Condition     | Label    | Treatment      |
| ------------- | -------- | -------------- |
| Seeders ≥ 50  | Healthy  | Green          |
| Seeders 10–49 | Active   | Primary/teal   |
| Seeders 1–9   | Low      | Amber          |
| Seeders 0     | Inactive | Muted or error |
| Missing data  | Unknown  | Muted          |

Do not represent these labels as guarantees of safety, legitimacy, or content quality.

### Actions

Primary inline actions:

- `Details`
- Magnet action icon

Overflow menu:

- Copy magnet link.
- Share magnet link.
- Open provider page.
- Add or remove favorite.

The magnet action must not look like a generic download button. Use a magnet icon and label it clearly for accessibility.

## Compact Card Variant

Used on narrow phones or favorites preview.

Show:

- Title.
- Category.
- Size.
- Seeder/leecher counts.
- Favorite state.
- Tap entire card for details.

## Pagination

Preferred pattern:

- Automatic load-more near the end of the list.
- Show `Loading more results…` inline.
- On pagination failure, show an inline retry row without replacing existing results.

If provider pagination must be explicit, use `Previous` and `Next` controls at the bottom.

## Loading State

Use 5–7 result skeleton cards.

Skeleton rules:

- Match final card dimensions.
- Avoid continuous shimmer when Reduce Motion is enabled.
- Preserve the query and filters.

## Empty State

Icon: `SearchX`.

Title: `No results found`

Body: `Try another keyword, remove a filter, or search all categories.`

Actions:

- `Edit search`
- `Clear filters`

## Offline State

Icon: `WifiOff`.

Title: `You’re offline`

Body: `Reconnect to search the provider. Saved favorites and history are still available.`

Primary action: `Retry`

## Provider Failure State

Title: `Provider unavailable`

Body: `The external search provider did not respond. Your query has been preserved.`

Actions:

- `Retry`
- `Back to Home`

## Parser/Layout Change State

Title: `Results could not be read`

Body: `The provider page may have changed. Try again later.`

Do not expose parser selectors, stack traces, or internal implementation details.

---

# 11.4 Filter and Sort Sheet

## Presentation

Use a modal bottom sheet with rounded top corners.

## Sections

1. Category.
2. Sort by.
3. Sort direction.
4. Optional numeric filters.

## Category

Use a single-select list or wrapping chip group.

## Sort Options

- Relevance or provider default.
- Seeders.
- Leechers.
- Upload date.
- Size.

## Sort Direction

- Descending.
- Ascending.

## Footer Actions

- Secondary: `Reset`.
- Primary: `Apply filters`.

Preserve draft filter changes until Apply is tapped. Android back dismisses without applying.

---

# 11.5 Torrent Details Screen

## Purpose

Present complete metadata and explicit actions without visual overload.

## Structure

1. Top app bar.
2. Status badges.
3. Torrent title.
4. Health summary.
5. Metadata table.
6. Description.
7. Action area.
8. External-source disclaimer.

## Header

Top app bar actions:

- Back.
- Favorite.
- Share.
- Overflow.

## Title Area

- Category and subcategory badges.
- Full torrent name with no artificial line limit.
- Trusted/VIP badges when supplied by the provider.

## Health Summary Card

Display:

- Seeders.
- Leechers.
- Calculated ratio when both values are valid.
- Neutral health label.

Never label a torrent as safe, verified, legal, malware-free, or authentic unless such information is explicitly and reliably available.

## Metadata Table

Use label/value rows:

- Category.
- Subcategory.
- Uploaded.
- Size.
- Uploader.
- Source.

Labels use small secondary text. Values use body strong.

Long values must wrap and remain selectable when useful.

## Description

- Show sanitized plain text only.
- Preserve paragraph breaks.
- Collapse after approximately 8 lines with `Show more` when long.
- Never render scraped HTML.

## Primary Action Area

Use one high-emphasis button:

- `Open magnet link`

Secondary actions:

- `Copy magnet link`
- `Share magnet link`
- `Open provider page`

For the first magnet action in a session, show an informational confirmation dialog:

Title: `Open magnet link?`

Body: `This will pass the magnet link to another app installed on your device. TorrentBay does not download the content.`

Actions:

- `Cancel`
- `Continue`

Do not show the dialog repeatedly after the user has acknowledged it, unless required by future settings.

## External Provider Action

Before opening the browser, show or include a clear external-link indicator.

Label: `Open provider page`

Accessibility hint: `Opens an external website in your browser.`

---

# 11.6 Favorites Screen

## Purpose

Provide quick access to locally bookmarked metadata.

## Header

- Title: `Favorites`.
- Optional search action when the collection is non-empty.
- Overflow action with `Clear favorites`.

## Content

Use the same result-card family as Search Results to avoid duplicate component logic.

Possible local sorting:

- Recently added.
- Name.
- Seeders from last stored result.
- Category.

Clearly mark data as cached when it may be stale:

`Saved metadata may differ from the current provider listing.`

## Empty State

Icon: `Bookmark`.

Title: `No favorites yet`

Body: `Bookmark a result to keep its metadata available here.`

Action: `Start searching`

## Remove Interaction

- Tapping the filled bookmark removes the item.
- Show a snackbar: `Removed from favorites` with `Undo`.
- Bulk clear requires a destructive confirmation dialog.

---

# 11.7 Search History Screen

## Purpose

Manage all locally stored search terms.

## Layout

- Title: `Search history`.
- Search/filter history field when the list is long.
- History rows grouped by recency when useful.

Suggested groups:

- Today.
- Previous 7 days.
- Older.

Row actions:

- Tap to search again.
- Swipe or overflow to delete.

Bulk action:

- `Clear search history` with confirmation.

## Empty State

Title: `No search history`

Body: `Your recent searches will appear here.`

---

# 11.8 Settings Screen

## Structure

Use grouped list sections.

### Content Preferences

- Show mature-content categories — switch, off by default.
- Default category — optional future control.
- Default sort — optional future control.

### Storage

- Clear cache.
- Clear search history.
- Clear favorites.

### Behavior

- Confirm before opening magnet links — switch.
- Open provider pages in external browser — informational row or future control.

### Accessibility

- Reduce motion — follow system by default.
- High-contrast mode — future option; do not override Android system without user intent.

### About

- App version.
- Data-source explanation.
- Privacy statement.
- Open-source licenses.
- Terms and legal notice.

## Destructive Actions

Use `color.error` only for destructive text and confirmation buttons.

Never place all destructive actions directly adjacent without section spacing.

---

# 12. Reusable Component Specifications

# 12.1 `SearchInput`

Props should support:

- Value.
- Placeholder.
- Loading state.
- Clear action.
- Submit action.
- Accessibility label.
- Compact and standard variants.

States:

- Resting.
- Focused.
- Filled.
- Loading.
- Disabled.
- Error.

# 12.2 `CategoryChip`

Variants:

- Default.
- Selected.
- Disabled.

Minimum target size: 48 × 40 dp, with 48 dp effective touch area.

# 12.3 `TorrentCard`

Variants:

- Standard.
- Compact.
- Favorite.
- Skeleton.

The component must not own scraping or domain logic. It receives a normalized torrent model and emits UI events.

# 12.4 `StatusBadge`

Supported types:

- Category.
- Subcategory.
- Trusted.
- VIP.
- Health.
- Cached.

Badges must combine text with color; never communicate state by color alone.

# 12.5 `MetricPill`

Used for seeders, leechers, size, or date.

Contents:

- Optional icon.
- Label or count.
- Accessible combined text.

# 12.6 `PrimaryButton`

- Minimum height: 52 dp.
- Radius: 12 dp.
- Full-width on details screens.
- Supports icon, loading, disabled, and destructive variants.

# 12.7 `IconButton`

- Visible icon: 20–24 dp.
- Touch target: minimum 48 × 48 dp.
- Requires an accessibility label.

# 12.8 `EmptyState`

Props:

- Icon.
- Title.
- Body.
- Primary action.
- Optional secondary action.

Do not use oversized illustrations.

# 12.9 `ErrorState`

Variants:

- Offline.
- Timeout.
- Provider unavailable.
- Parsing failure.
- Rate limited.
- Unknown.

# 12.10 `ConfirmDialog`

- Clear title.
- Concise consequence text.
- Cancel action first.
- Destructive or primary action second.
- Never rely on vague labels such as `Yes` and `No`.

# 12.11 `Snackbar`

Used for:

- Copied magnet link.
- Added to favorites.
- Removed from favorites.
- History entry removed.
- Cache cleared.

Duration: approximately 3–4 seconds.

Include Undo where state restoration is possible.

---

# 13. Interaction Design

## 13.1 Press Feedback

- Use Android ripple where supported.
- Reduce opacity slightly for custom pressables.
- Do not scale large containers dramatically.

## 13.2 Haptics

Optional light haptic feedback for:

- Favorite added or removed.
- Filter applied.
- Long-press copy action.

Do not use haptics for ordinary scrolling or every tap.

## 13.3 Gestures

Permitted:

- Swipe to remove history item.
- Swipe to remove favorite with Undo.
- Pull to refresh current results.

Every gesture action must also have a visible non-gesture alternative.

## 13.4 Long Press

Long press on torrent title may show a small menu:

- Copy title.
- Copy magnet link.

Do not hide essential actions exclusively behind long press.

---

# 14. Motion Guidelines

Motion should be functional and brief.

Recommended transitions:

- Screen navigation: native Android/Expo Router transition.
- Card insertion/removal: 150–200 ms fade and position animation.
- Filter sheet: native bottom-sheet motion.
- Favorite icon: subtle 120–160 ms fill transition.
- Snackbar: slide/fade.

Avoid:

- Continuous decorative animation.
- Large parallax effects.
- Animated backgrounds.
- Heavy shared-element transitions.

Respect the system Reduce Motion preference.

---

# 15. Accessibility Requirements

## 15.1 Touch Targets

- Minimum visible or effective target: 48 × 48 dp.
- Maintain at least 8 dp separation between adjacent icon actions where possible.

## 15.2 TalkBack

Examples:

- Favorite button: `Add Ubuntu 26.04 torrent to favorites`.
- Seeder metric: `124 seeders`.
- Leecher metric: `8 leechers`.
- Trusted badge: `Uploader marked trusted by provider`.
- External link: `Open provider page, opens in browser`.

Result cards should expose a logical reading order:

1. Torrent title.
2. Category and status.
3. Size and upload date.
4. Seeder and leecher counts.
5. Actions.

## 15.3 Contrast

- Body text should meet WCAG AA contrast.
- Do not use muted text for essential information if contrast becomes insufficient.
- Selected chips must remain distinguishable in grayscale.

## 15.4 Text Scaling

At large font sizes:

- Allow titles and metadata to wrap.
- Move horizontal action rows into vertical or overflow layouts.
- Avoid fixed card heights.
- Keep dialogs scrollable.

## 15.5 Color Independence

All success, warning, error, trusted, VIP, and health states require a text label or recognizable icon in addition to color.

---

# 16. Content Design

## 16.1 Voice and Tone

Use direct, calm, neutral language.

Preferred:

- `No results found`
- `Provider unavailable`
- `Copied magnet link`
- `Removed from favorites`

Avoid:

- `Oops!`
- `Awesome!`
- `Grab this torrent`
- `Download now`
- Legal or safety claims that the application cannot verify.

## 16.2 Button Labels

Use explicit verbs:

- Search.
- Retry.
- Apply filters.
- Copy magnet link.
- Open magnet link.
- Open provider page.
- Clear history.

Avoid generic labels:

- OK.
- Go.
- Yes.
- Submit.

## 16.3 Dates and Sizes

- Display file sizes using readable binary or provider-supplied units consistently.
- Preserve exact uploaded date when available.
- Relative dates may supplement, but should not replace, exact dates on Details.
- Use locale-aware formatting.

## 16.4 Missing Metadata

Use an em dash or `Not available` depending on context.

Never display:

- `undefined`.
- `null`.
- Empty badge shells.
- Raw parser errors.

---

# 17. Privacy, Safety, and Legal UX

TorrentBay should clearly communicate its role without repeatedly interrupting the user.

Required principles:

- State that the app indexes external metadata and does not host or download content.
- Keep provider-page and magnet actions explicit.
- Never imply that a result is legal, safe, verified, or malware-free.
- Hide mature-content categories by default.
- Avoid displaying scraped advertising, scripts, or untrusted HTML.
- Treat all scraped descriptions as untrusted plain text.
- Make clear when users are leaving the app or handing a link to another application.

Recommended About copy:

`TorrentBay is a search interface for publicly available metadata from an external provider. TorrentBay does not host files, download content, or verify the legality, safety, or accuracy of individual listings.`

---

# 18. Performance-Oriented Design Rules

- Prefer flat colors and simple vector icons.
- Do not require remote images for primary screen rendering.
- Avoid large hero images and image grids.
- Use skeletons rather than blocking spinners for result lists.
- Reuse `TorrentCard` across Results and Favorites.
- Keep chip lists virtualized or horizontally scrollable when necessary.
- Avoid nested scroll views around `FlatList`.
- Keep list items visually stable during async updates.
- Preserve scroll position when opening and closing details.

---

# 19. NativeWind Implementation Guidance

Use semantic design tokens rather than scattering literal color values across components.

Recommended token naming:

```text
bg-background
bg-surface
bg-surface-elevated
bg-primary-soft
border-border
text-content-primary
text-content-secondary
text-content-muted
text-primary
text-success
text-warning
text-error
```

Recommended component styling pattern:

```text
Base classes
+ size variant
+ visual variant
+ interaction state
+ accessibility state
```

Example conceptual composition:

```text
TorrentCard
= base card
+ compact/standard layout
+ selected state
+ pressed state
```

Implementation rules:

- Do not duplicate long class strings across screens.
- Centralize reusable variants.
- Keep conditional class composition readable.
- Use `StyleSheet` only when required for dynamic values or performance-sensitive styles.
- Keep business logic out of styling helpers.

---

# 20. Screen Wireframes

These wireframes describe hierarchy, not final pixel styling.

## 20.1 Home

```text
┌─────────────────────────────────────┐
│  ◉ TorrentBay                    ⋮  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔍 Search torrents       ✕  → │  │
│  └───────────────────────────────┘  │
│                                     │
│  [All] [Movies] [TV] [Games] ...   │
│                                     │
│  Recent searches            See all │
│  🕘 Ubuntu ISO                  ›   │
│  🕘 Blender                     ›   │
│                                     │
│  Favorites                         │
│  ┌───────────────────────────────┐  │
│  │ Example result        S 128   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ℹ Indexes external metadata only  │
│                                     │
│  Home        Favorites    Settings  │
└─────────────────────────────────────┘
```

## 20.2 Search Results

```text
┌─────────────────────────────────────┐
│  ‹  [ Ubuntu ISO              ✕ → ] │
│  [All] [Sort: Seeders] [Filters]    │
│  128 results for “Ubuntu ISO”       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Apps] [Trusted]          ☆   │  │
│  │ Ubuntu 26.04 Desktop amd64    │  │
│  │ 5.8 GB • Today • uploader     │  │
│  │ ↑ 128 seeders   ↓ 8 leechers │  │
│  │ Details          🧲        ⋮  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [Other]                   ★   │  │
│  │ Another result title...       │  │
│  │ 2.1 GB • 2 days ago           │  │
│  │ ↑ 14            ↓ 2           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 20.3 Details

```text
┌─────────────────────────────────────┐
│  ‹  Torrent details        ☆  ↗  ⋮ │
│                                     │
│  [Apps] [Trusted]                   │
│  Ubuntu 26.04 Desktop amd64         │
│                                     │
│  ┌──────────────┬───────────────┐   │
│  │ ↑ 128        │ ↓ 8           │   │
│  │ Seeders      │ Leechers      │   │
│  └──────────────┴───────────────┘   │
│                                     │
│  Size             5.8 GB            │
│  Uploaded         July 12, 2026     │
│  Uploader         example_user      │
│  Source           External provider │
│                                     │
│  Description                        │
│  Sanitized plain-text description…  │
│                                     │
│  [      Open magnet link       ]    │
│  [ Copy link ]  [ Share link ]      │
│  Open provider page ↗               │
└─────────────────────────────────────┘
```

---

# 21. UI State Matrix

| Screen    | Initial         | Loading                | Success           | Empty                  | Offline                     | Error                     |
| --------- | --------------- | ---------------------- | ----------------- | ---------------------- | --------------------------- | ------------------------- |
| Splash    | Logo            | Small progress         | Navigate          | N/A                    | Navigate with offline state | Safe fallback             |
| Home      | Search ready    | Local-state loading    | History/favorites | Guidance content       | Local content available     | Local-state error message |
| Results   | Query preserved | Skeleton cards         | Result list       | No-results state       | Offline state               | Provider/parser state     |
| Details   | Metadata shell  | Optional local loading | Full metadata     | Missing fields handled | Saved metadata shown        | Readable error            |
| Favorites | Section shell   | Local skeleton         | Saved list        | Empty state            | Fully available             | Storage error             |
| Settings  | Grouped list    | Local loading          | Values shown      | N/A                    | Fully available             | Settings error            |

---

# 22. Design Acceptance Criteria

The design is ready for implementation when all of the following are true:

- Every PRD screen has a defined layout and state behavior.
- Search is visually dominant on Home.
- Result cards expose name, category, size, date, uploader, seeders, and leechers when available.
- Magnet actions are clearly labeled and visually distinct from generic downloads.
- Favorites and history reuse shared components.
- Offline, empty, timeout, provider, parser, and pagination states are specified.
- Mature-content categories are hidden by default.
- All touch targets meet Android accessibility guidance.
- Color is never the only indicator of status.
- Layout supports large fonts without fixed-height clipping.
- Tablet behavior is defined.
- NativeWind tokens and reusable variants are used consistently.
- The UI does not render scraped HTML or external advertising.
- The app clearly states that it indexes external metadata and does not host or download files.

---

# 23. AI Agent Implementation Rules

Any AI agent implementing this design must:

1. Treat this document as the visual and interaction source of truth.
2. Reuse components instead of creating screen-specific duplicates.
3. Preserve the defined hierarchy even when exact pixel values require minor adjustment.
4. Keep screens functional with missing or unusually long metadata.
5. Implement all loading, empty, offline, and error states before considering a screen complete.
6. Use Lucide React Native icons only unless an approved asset is provided.
7. Use NativeWind consistently for reusable visual styling.
8. Keep scraper, domain, storage, and networking logic outside UI components.
9. Avoid remote images and decorative dependencies in the initial release.
10. Preserve Android-native interaction patterns and back behavior.
11. Add accessibility labels to every icon-only control.
12. Never render untrusted provider HTML directly.
13. Never describe a listing as safe, legal, verified, or malware-free without reliable source data.
14. Avoid language or visuals that imply TorrentBay itself downloads content.

---

# 24. Final Design Summary

TorrentBay should be delivered as a dark-first, Material-inspired Android utility with a focused search experience, highly readable metadata cards, restrained teal accents, explicit external-link actions, and complete handling of local and network states.

The design should prioritize speed, clarity, accessibility, and maintainability over decorative media presentation.
