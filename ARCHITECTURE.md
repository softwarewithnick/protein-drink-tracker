# Architecture Guide

> Comprehensive technical reference for the **Protein Drink Tracker** PWA.
> For contribution instructions see [README.md](README.md).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Data Flow](#data-flow)
4. [Key Constants](#key-constants)
5. [Module Breakdown](#module-breakdown)
   - [app.js](#appjs--main-application-logic)
   - [sw.js](#swjs--service-worker)
   - [translations.js](#translationsjs--i18n-dictionary)
   - [styles.css](#stylescss--design-system)
   - [index.html](#indexhtml--main-page-shell)
   - [protein-food.html](#protein-foodhtml--protein-chart-page)
6. [Extending the App](#extending-the-app)

---

## Project Overview

A **Progressive Web App** (PWA) that lets users track whether they drank their daily protein drink. It works fully offline via a service worker, persists data in `localStorage`, and features gamification (streaks, badges, heatmaps), multi-language support (7 languages), and theme switching (dark/light).

**Live app:** [protein-shake-tracker.netlify.app](https://protein-shake-tracker.netlify.app/)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla HTML / CSS / JavaScript |
| Charting | [Chart.js](https://www.chartjs.org/) (CDN) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) (CDN) |
| Offline | Service Worker (Cache API) |
| Hosting | Netlify (static) |

No build step, no bundler, no framework -- just static files served directly.

---

## File Structure

```
protein-drink-tracker/
|-- index.html              # Main PWA shell (tracker + dashboard)
|-- protein-food.html       # Protein food chart page (Chart.js)
|-- app.js                  # Core application logic (1200+ lines, 14 sections)
|-- sw.js                   # Service worker (caching, reminders, notifications)
|-- translations.js         # i18n dictionary (7 languages)
|-- styles.css              # Design system (CSS variables, 17 sections)
|-- manifest.json           # PWA manifest (name, icons, theme)
|-- package-lock.json       # npm lock file (no runtime deps)
|-- what i have done.txt    # Developer notes
|
|-- icons/
|   |-- icon.svg            # Original app icon
|   +-- icon2.svg           # Current app icon (used in manifest)
|
|-- images/
|   |-- drank.png           # "Protein done" illustration
|   |-- not-drank.png       # "Not yet" illustration
|   +-- README.md           # Image credits / notes
|
+-- README.md               # Project overview & contribution guide
```

---

## Data Flow

```
 +--------------+   toggle   +--------------+   save    +--------------+
 | User clicks  | ---------> |   app.js     | -------> | localStorage |
 | "I drank"    |            |  setDrank()  |          | (JSON blob)  |
 +--------------+            +------+-------+          +--------------+
                                    |
                           updateUI()|
                                    v
                  +---------------------------------+
                  |  DOM updates:                    |
                  |  - status text & image swap      |
                  |  - streak badge & confetti       |
                  |  - progress ring animation       |
                  |  - 7-day history strip           |
                  |  - heatmap, badges, stats        |
                  |  - history table                 |
                  +---------------------------------+
```

### localStorage Schema

All tracker state lives under a single key:

```jsonc
// Key: "proteinDrinkTracker"
{
  "dateKey": "2026-04-09",          // current app-day (YYYY-MM-DD)
  "drank": true,                    // did the user drink today?
  "history": ["2026-04-08", "..."], // up to 365 date-keys
  "drinkTimestamps": [              // when each drink was logged
    { "date": "2026-04-09", "time": "9:32:15 AM" }
  ]
}
```

Other keys:

| Key | Value | Purpose |
|-----|-------|---------|
| `proteinTheme` | `"light"` or `"dark"` | Persisted theme preference |
| `proteinTrackerLang` | `"en"`, `"fr"`, etc. | Active language code |
| `proteinReminder` | `{ enabled, time, lastNotified }` | Notification reminder settings |

---

## Key Constants

Defined at the top of `app.js`:

| Constant | Value | Purpose |
|----------|-------|---------|
| `STORAGE_KEY` | `"proteinDrinkTracker"` | localStorage key for main state |
| `THEME_KEY` | `"proteinTheme"` | localStorage key for theme |
| `LANG_KEY` | `"proteinTrackerLang"` | localStorage key for language |
| `REMINDER_KEY` | `"proteinReminder"` | localStorage key for reminders |
| `RESET_HOUR` | `2` | Hour (0-23) when the "app day" rolls over |
| `HISTORY_MAX_DAYS` | `365` | Max entries kept in history array |
| `RING_CIRCUMFERENCE` | `2 * pi * 52 = 326.73` | SVG progress ring circumference |
| `STREAK_MILESTONES` | `[100, 30, 14, 7]` | Tier thresholds for streak badges |
| `WORLD_CITIES` | 7 cities | Footer world-clock strip |

---

## Module Breakdown

### `app.js` -- Main Application Logic

Wrapped in an IIFE (`(function () { "use strict"; ... })()`) to avoid global leaks. Organized into **14 sections**:

#### Section 1 -- Constants & Configuration
Storage keys, reset hour, ring circumference, streak milestones, world cities.

#### Section 2 -- Confetti Animation System
Canvas-based particle effect. Key methods:

| Method | Description |
|--------|-------------|
| `confetti.init()` | Grab canvas element and attach resize listener |
| `confetti.launch(count)` | Spawn `count` particles (default 80) from screen center |
| `confetti.animate()` | RAF loop -- apply gravity, rotation, fade, then draw |

#### Section 3 -- State Management (localStorage CRUD)

| Function | Signature | Returns | Description |
|----------|-----------|---------|-------------|
| `loadState()` | `() -> object` | `{ dateKey, drank, drinkTimestamps, history }` | Read & parse localStorage |
| `saveState()` | `(dateKey, drank, history, drinkTimestamps)` | void | Stringify & persist, trim to 365 |
| `getCurrentDrank()` | `() -> boolean` | `true/false` | Check if today is marked |
| `getHistory()` | `() -> string[]` | array of date-keys | Auto-correct inconsistencies |
| `setDrank()` | `(drank: boolean)` | void | Mark/unmark today + update timestamps |

#### Section 4 -- Date / Time Helpers

| Function | Description |
|----------|-------------|
| `getDateKey()` | Build YYYY-MM-DD for the current "app day" (respects `RESET_HOUR`) |
| `parseDateKey(key)` | Convert YYYY-MM-DD to `Date` object |
| `formatDisplayDate(key)` | Localized human-readable date (e.g. "Monday, Apr 7") |

#### Section 5 -- Streak Calculation

| Function | Description |
|----------|-------------|
| `getStreak()` | Count consecutive days ending today; 0 if today not marked |
| `toggleDrank()` | Flip today's state and persist; returns the new value |

#### Section 6 -- Notification Reminder

| Function | Description |
|----------|-------------|
| `initReminder()` | Ensure default settings in localStorage; request permission; sync with SW |

#### Section 7 -- Location & World Clocks

| Function | Description |
|----------|-------------|
| `fetchCityName(lat, lon)` | Reverse-geocode via BigDataCloud (free, no key) |
| `initLocation()` | Request GPS; update main clock label |
| `initWorldClocks()` | Render city list DOM |
| `updateClock()` | Tick handler -- refresh main clock + world clocks every second |

#### Section 8 -- Theme Management

| Function | Description |
|----------|-------------|
| `loadTheme()` | Read from localStorage or OS preference |
| `setTheme(theme)` | Apply to `<html data-theme>` and persist |
| `toggleTheme()` | Flip light / dark |

#### Section 9 -- Stats, Badges & Heatmap

| Function | Description |
|----------|-------------|
| `updateMonthlyStats()` | Calculate current-month completion percentage; update progress bar |
| `updateBadges()` | Show/unlock badge emojis based on total history count |
| `updateHeatmap()` | Render a 365-day GitHub-style grid; scroll to today |

#### Section 10 -- Motivational Quotes

| Function | Description |
|----------|-------------|
| `getDailyQuote()` | Pick one quote per day (seeded by date); cache in `sessionStorage` |

#### Section 11 -- UI Rendering

| Function | Description |
|----------|-------------|
| `updateProgressRing(count)` | Animate SVG stroke-dashoffset for weekly progress (0-7) |
| `getWeeklyCount()` | Count how many of the last 7 app-days are in history |
| `updateStreakBadge(streak)` | Show/hide streak badge with milestone class |
| `updateUI()` | Master render -- calls all other UI functions |
| `updateHistoryLog()` | Build the 7-day emoji strip |

#### Section 12 -- History Table & Export

| Function | Description |
|----------|-------------|
| `updateHistoryTable()` | Populate the full-history `<table>` sorted newest-first |
| `exportCSV()` | Generate and download a CSV file |
| `exportPDF()` | Generate a branded PDF via jsPDF |

#### Section 13 -- Notification Helpers

| Function | Description |
|----------|-------------|
| `handleToggle()` | Button click handler -- toggle, confetti, notify, re-render |
| `showNotificationAlert(msg)` | Slide-in toast + SW push notification |

#### Section 14 -- Initialization & Event Binding
The `init()` function: registers the service worker, binds button/select/toggle events, starts the clock interval, calls `updateUI()`, and initializes reminders + location.

---

### `sw.js` -- Service Worker

Organized into **6 sections**:

| Section | Purpose |
|---------|---------|
| 1. Cache Configuration | `CACHE_NAME = 'protein-tracker-v3'`; list of URLs to pre-cache |
| 2. Reminder State | In-memory `reminderSettings` + interval handle |
| 3. Lifecycle | `install` (pre-cache + skipWaiting), `activate` (purge old caches + claim) |
| 4. Message Handling | `SET_REMINDER` -> restart check loop; `SHOW_DRINK_NOTIFICATION` -> instant push |
| 5. Reminder Check Loop | 60 s poll; fire notification if HH:MM matches and not already notified today |
| 6. Notification Click | Close notification and open the app |

**Fetch strategy:** Network-first with cache fallback (GET requests only).

---

### `translations.js` -- i18n Dictionary

A single `const translations` object with language-code keys:

| Code | Language | Notes |
|------|----------|-------|
| `en` | English | Reference locale (all keys defined here) |
| `fr` | French | |
| `nl` | Dutch | |
| `ar` | Arabic | RTL language |
| `tr` | Turkish | Some quotes marked TODO for verification |
| `es` | Spanish | |
| `sv` | Swedish | |

Each locale contains: UI strings, `foods` sub-object (chart labels), `motivationalQuotes` array, and `filters` sub-object (chart category buttons).

---

### `styles.css` -- Design System

Built on CSS custom properties with a `[data-theme]` attribute toggle. Organized into **17 sections**:

| # | Section | Key Classes |
|---|---------|-------------|
| 1 | Theme Variables & Reset | `:root`, `[data-theme="light"]` |
| 2 | App Shell | `body`, `.app-header` |
| 3 | Hero & Progress Ring | `.progress-ring`, `.progress-ring__fill` |
| 4 | Streak Badge | `.streak-badge`, `.milestone-*` |
| 5 | Language & Theme Toggle | `.lang-select`, `.theme-toggle` |
| 6 | Main Content Layout | `.main-content`, `.content-wrapper` |
| 7 | Tracker Card Elements | `.graphic-container`, `.graphic-img` |
| 8 | History Log (7-day strip) | `.history-log`, `.history-day` |
| 9 | Motivational Quote | `.motivational-quote` |
| 10 | Toggle / Action Buttons | `.toggle-btn`, `.secondary-btn` |
| 11 | Footer World Clocks | `.footer-clocks`, `.world-clock-item` |
| 12 | Badges & Monthly Stats | `.badge`, `.collapsible-section` |
| 13 | Heatmap (365-day grid) | `.heatmap-grid`, `.heatmap-cell` |
| 14 | Responsive Breakpoints | `@media (min-width: 900px)`, `(max-width: 600px)` |
| 15 | Animations | `@keyframes fadeIn`, `pulse`, `prefers-reduced-motion` |
| 16 | History Table & Export | `.history-table-section`, `.export-btn` |
| 17 | Notification Toasts | `@keyframes slideIn`, `slideOut` |

---

### `index.html` -- Main Page Shell

Static skeleton providing element IDs that `app.js` hooks into at runtime. Key regions:

- **Header** -- logo, live clock, language `<select>`, theme toggle button
- **Tracker Core** (left card) -- 7-day strip, image, drink button, status, quote
- **Dashboard** (right card) -- badges, progress ring, streak badge, monthly stats, heatmap
- **History Table** -- full sortable history with CSV/PDF export buttons

---

### `protein-food.html` -- Protein Chart Page

Standalone page with an inline `<script>` that renders a Chart.js bar chart of protein-rich foods. Features:

- **Category filters**: All / Vegan / Vegetarian / Meat
- **Language switching**: shares the same `translations.js` dictionary
- **Theme-aware**: chart colours adapt to dark/light mode

---

## Extending the App

### Adding a New Language

1. Copy the `en` block in `translations.js` as a template.
2. Add a new key using the [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) code (e.g. `"de"` for German).
3. Translate every string value (keep `{placeholder}` tokens intact).
4. Add a `<option value="de">DE</option>` to the `<select id="lang-select">` in **both** `index.html` and `protein-food.html`.
5. If the language is RTL, add corresponding CSS rules in `styles.css`.

### Adding a New Badge

Badges are defined in `updateBadges()` inside `app.js` (Section 9). Each badge has:
- An emoji icon
- A threshold (total days in history)

Add a new entry to the `badges` array and it will appear automatically.

### Adding a New Food to the Chart

1. Add the food's internal ID, protein amount, and category to `baseProteinData` in `protein-food.html`.
2. Add the localized name under `foods.{id}` in every language block in `translations.js`.

### Changing the Day Reset Hour

Edit `RESET_HOUR` in `app.js` (Section 1). The value is the hour (0-23) at which the app considers it a new day.

### Updating Cached Assets

When you change any file listed in `urlsToCache` inside `sw.js`, bump the `CACHE_NAME` version suffix (e.g. `'protein-tracker-v3'` to `'protein-tracker-v4'`). The activate handler will automatically purge the old cache.
