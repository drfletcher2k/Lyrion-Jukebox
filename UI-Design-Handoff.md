# Lyrion Jukebox — UI Design Handoff (v2)

> Last updated: 2026-05-29  
> Covers the redesign landed in PRs #2 and #4 on `main`.

---

## 1. Architecture Overview

```
client/
├── index.html                  ← Inter font preconnect + link tags
├── src/
│   ├── index.css               ← Global design tokens + utility classes (no framework)
│   ├── main.jsx                ← ReactDOM root, BrowserRouter
│   ├── App.jsx                 ← Routes: /guest → GuestPage, /kiosk → KioskPage
│   ├── pages/
│   │   ├── Kiosk.jsx           ← Tablet-facing full kiosk (adminMode=true)
│   │   ├── Kiosk.module.css
│   │   ├── Guest.jsx           ← Mobile guest song request page
│   │   └── Guest.module.css
│   └── components/
│       ├── NowPlaying.jsx / .module.css
│       ├── QueueList.jsx / .module.css
│       ├── SearchBar.jsx / .module.css
│       ├── SearchResults.jsx / .module.css
│       ├── ErrorDisplay.jsx / .module.css
│       └── QRCodeDisplay.jsx / .module.css
```

**Styling rules:**
- Zero external UI frameworks. No Tailwind, MUI, Bootstrap.
- All component styles live in a paired `.module.css` file (CSS Modules, scoped hashes).
- Global design tokens and utility classes live exclusively in `index.css`.
- Inline styles are forbidden — every component now uses its module.

---

## 2. Design Token Reference (`index.css`)

### Palette

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0c0c0f` | Page background |
| `--surface` | `#111116` | Card/row background |
| `--surface2` | `#17171e` | Input background, QR bg |
| `--surface3` | `#1e1e28` | Hover state background |
| `--surface-raised` | `#24242f` | Ghost button hover |
| `--border` | `rgba(255,255,255,0.07)` | Subtle dividers |
| `--border-strong` | `rgba(255,255,255,0.12)` | Card borders, input borders |
| `--border-accent` | `rgba(29,185,84,0.4)` | Focused/hovered accent borders |
| `--text` | `#ededf5` | Primary text |
| `--text-secondary` | `#9898aa` | Artist names, secondary labels |
| `--text-muted` | `#60607a` | Section labels, timestamps |
| `--accent` | `#1DB954` | Spotify green — CTA, live dot, progress |
| `--accent-hover` | `#22cf60` | Accent hover state |
| `--accent-dim` | `rgba(29,185,84,0.12)` | Confirmation toast bg, inserted badge bg |
| `--accent-glow` | `rgba(29,185,84,0.22)` | Box-shadow glows |
| `--danger` | `#e74c3c` | Error/destructive |
| `--danger-hover` | `#f05545` | Danger hover |
| `--danger-dim` | `rgba(231,76,60,0.10)` | Danger button resting bg |

### Shadow System

Multi-layer shadows simulate physical depth with an inset 1px top-light:

| Token | Usage |
|---|---|
| `--shadow-sm` | Buttons, inputs at rest |
| `--shadow-md` | Cards, hovered rows |
| `--shadow-lg` | Top bar, NowPlaying card |
| `--shadow-accent` | Primary button hover glow |
| `--shadow-focus` | Keyboard focus ring (`0 0 0 3px`) |

### Spacing (8pt Grid)

`--space-1` (4px) → `--space-10` (40px) in 4px increments. Use these everywhere — no raw `px` values in component CSS except for sub-4px details (e.g. `2px`, `3px` border radii or heights).

### Typography Scale

| Token | Value |
|---|---|
| `--text-xs` | 11px |
| `--text-sm` | 13px |
| `--text-base` | 15px |
| `--text-lg` | 17px |
| `--text-xl` | 21px |
| `--text-2xl` | 26px |
| `--text-3xl` | 34px |

Font stack: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
Inter is loaded via Google Fonts preconnect in `index.html`.

### Easing & Duration

| Token | Curve | Use case |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Button transforms, entrance animations |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Color/opacity transitions |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Slide-in / fade-up entrances |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--dur-fast` | `110ms` | Hover color changes |
| `--dur-base` | `200ms` | Most transitions |
| `--dur-slow` | `360ms` | Entrance animations |

### Global Utility Classes

| Class | Effect |
|---|---|
| `.btn-primary` | Green filled CTA button with hover lift + glow |
| `.btn-danger` | Subtle red resting state, fills solid on hover |
| `.btn-ghost` | Dark filled, border, hover lifts |
| `.card` | Surface + border + shadow-md + radius |
| `.page` | Centered, padded page shell (max-width 900px) |
| `.section-title` | 11px / 700 / uppercase / muted / 0.12em tracking |
| `.spinner` | 16px spinning border-top accent indicator |
| `.fade-in` | `fadeUp` entrance (opacity + translateY, 360ms ease-out) |

---

## 3. Pages

### `/kiosk` — `Kiosk.jsx`

**Purpose:** Permanent tablet display in the venue. Shows everything: now playing, queue, search, and QR code.

**State:**
| State var | Initial | Meaning |
|---|---|---|
| `nowPlaying` | `null` | Current track object from `/api/queue/status` |
| `queue` | `null` | `null` = loading, `[]` = empty, `[...]` = items |
| `tracks` | `[]` | Current search results |
| `isSearching` | `false` | Search in-flight → drives `SearchResults` skeleton |
| `requesting` | `null` | `spotify_track_id` of track being submitted |
| `confirmation` | `null` | `{ track, position }` shown for 5s after request |
| `error` | `null` | Error string shown in `ErrorDisplay` |
| `qrUrl` | `''` | Guest URL derived from `VITE_PUBLIC_BASE_URL` or `window.location.origin` |

**Polling:** `fetchStatus` runs every 5 000ms via `setInterval`. On success: sets `nowPlaying` and `queue`. Failures are silent (no state update) to avoid disrupting the display.

**Critical API fields — do not change:**
- `handleRequest` sends `source: 'tablet'`
- `adminMode` is hardcoded `true` on this page's `<QueueList>`

**Layout — CSS Grid:**
```
┌─────────────────────────────────────────────────┐
│  [glass top bar: logo + title        QR code]   │  ← sticky, z-index 20
├────────────────────┬────────────────────────────┤
│  NOW PLAYING       │  SEARCH & REQUEST           │
│  [NowPlaying card] │  [ErrorDisplay?]            │
│                    │  [confirmation toast?]       │
│  REQUEST QUEUE     │  [SearchBar]                │
│  [QueueList]       │  [SearchResults]            │
└────────────────────┴────────────────────────────┘
  .left (sticky)           .right
```

**Responsive breakpoints:**
- `≤ 960px` — two columns kept, left column un-stickied, padding reduced
- `≤ 700px` — single column, `right` (search) moves **above** `left` (queue), QR visible
- `≤ 420px` — tighter padding, QR area hidden (`display: none`)

---

### `/guest` — `Guest.jsx`

**Purpose:** Mobile song request page reached by scanning the QR code.

**State:** Same shape as Kiosk minus `queue`, `nowPlaying`, `qrUrl`. Adds `guestName` string.

**Critical API fields — do not change:**
- `handleRequest` sends `source: 'phone'` and `guest_name: guestName.trim() || null`

**Layout:** Single `flex-direction: column` with `gap: var(--space-4)` between: header → name input → search bar → error/confirmation → results.

---

## 4. Components

### `NowPlaying`

**Props:** `nowPlaying: object | null`

When `null`: renders a muted empty state with a music note icon.

When populated:
- Glass card with radial-gradient ambient glow (accent color, top-left origin)
- Pulsing green live dot + "NOW PLAYING" label (uppercase, 11px, 700)
- Album art 88×88px with deep shadow; `onError` falls back to a styled placeholder div
- Progress bar: 3px track, gradient fill (`--accent` → `--accent-hover`), 8px glowing thumb via `::after` pseudo-element
- Times use `font-variant-numeric: tabular-nums` to prevent layout shift

---

### `QueueList`

**Props:** `queue: array | null`, `isLoading: bool`, `adminMode: bool`, `onRemove`, `onMove`, `onSkip`

**Skeleton state:** When `isLoading` is true, renders 3 shimmer skeleton rows. The shimmer uses a `linear-gradient` sweeping animation defined locally (`@keyframes shimmer` in the module file).

**Real rows:** Staggered entrance via `:nth-child(1–6+)` animation delays (0–175ms).

**Status badges:**
| Status | Style |
|---|---|
| `pending` | `--surface3` bg, `--text-muted` text, `--border` border |
| `inserted` | `--accent-dim` bg, `--accent` text, `--border-accent` border |
| `playing` | `--accent` bg, black text, accent glow shadow |

**Admin buttons** (only when `adminMode === true`):
- `pending` items: ↑ move up, ↓ move down, ✕ remove (`.btn-ghost` / `.btn-danger`)
- `inserted` / `playing` items: Skip (`.btn-danger`)
- Move-up disabled when `idx === 0`; move-down disabled when `idx === pendingItems.length - 1`

---

### `SearchBar`

**Props:** `onResults: fn`, `onLoading: fn`

Debounces 400ms. Calls `onLoading(true)` before fetch, `onLoading(false)` in finally (and immediately when query is cleared). The parent pages use this to drive `SearchResults`'s `isLoading` prop. No state is held in the parent for the query string itself — SearchBar owns it.

---

### `SearchResults`

**Props:** `tracks: array`, `onRequest: fn`, `requesting: string | null`, `isLoading: bool`

**Skeleton state:** When `isLoading` is true, renders 5 shimmer skeleton rows.

**Real rows:** Staggered entrance (0–200ms). Hover: accent border, `--surface2` bg, `shadow-md`, `translateY(-1px)`.

Returns `null` when not loading and `tracks` is empty (no empty state shown — search bar is the affordance).

---

### `SearchBar`

Wrapper div with `position: relative`. Spinner (`.spinner` global class) absolutely positioned at right edge when `loading` is true. Input uses global `input[type="text"]` styles.

---

### `ErrorDisplay`

**Props:** `message: string | null`, `onDismiss: fn`

Returns `null` when `message` is falsy. Slides in from top (`@keyframes slideIn` in module). Dismiss button has spring scale on hover/active.

---

### `QRCodeDisplay`

**Props:** `url: string`

Returns `null` until the data URL is ready. Uses `QRCode.toDataURL()` (not `toCanvas`) — this reliably applies custom colors:
- `dark: '#ededf5'` (dots — matches `--text`)
- `light: '#17171e'` (background — matches `--surface2`)

Renders as a dark-on-dark QR: off-white dots on a near-black background, making it visually integrated with the design system while remaining scannable. Wrapped in a `--surface2` rounded container with `--border-strong` border.

---

## 5. State Flow Diagram

```
SearchBar
  ├── onResults(tracks[]) ──────────────────► SearchResults (tracks prop)
  └── onLoading(bool) → parent setState
                              └─────────────► SearchResults (isLoading prop)

Kiosk fetchStatus (polling)
  ├── setNowPlaying() ──────────────────────► NowPlaying
  └── setQueue()  (null → [] → [...])
          └── queue === null ───────────────► QueueList (isLoading prop)
              queue array ─────────────────► QueueList (queue prop)
```

---

## 6. API Contract (unchanged)

| Endpoint | Method | Key fields |
|---|---|---|
| `/api/queue/status` | GET | Returns `{ nowPlaying, queue }` |
| `/api/queue/request` | POST | Body: `{ ...track, source: 'tablet'\|'phone', guest_name? }` |
| `/api/spotify/search?query=` | GET | Returns `{ tracks: [...] }` |
| `/api/admin/queue/:id` | DELETE | Remove from queue (adminMode only) |
| `/api/admin/queue/:id/move` | PUT | Body: `{ direction: 'up'\|'down' }` |
| `/api/admin/queue/:id/skip` | POST | Skip inserted/playing track |

---

## 7. Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `client/.env` | API base URL (empty = same origin) |
| `VITE_PUBLIC_BASE_URL` | `client/.env` | Base URL for guest QR link (falls back to `window.location.origin`) |

---

## 8. Build & Deploy

```bash
# Development (client only, requires separate server)
cd client && npm run dev        # Vite dev server on :3200

# Production Docker (builds client + serves via Express)
docker compose build --no-cache
docker compose up -d
# App available on :3200
```

The Dockerfile is a two-stage build: Stage 1 runs `vite build` inside `node:24-alpine`; Stage 2 copies the `dist/` output into the production server image. **Any frontend change requires a Docker rebuild** — there is no hot-reload in production.
