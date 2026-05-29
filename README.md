# Lyrion Jukebox

A local-network guest jukebox web app for [Lyrion Music Server (LMS)](https://lyrion.org/). Guests can search Spotify, request songs, and see what's playing — all without accessing the LMS web UI directly.

## Features

- **Guest UI** — phone-friendly page (accessible via QR code) for searching Spotify and requesting tracks
- **Kiosk UI** — tablet-first display showing Now Playing, the request queue, a QR code, and basic admin controls
- **Queue management** — SQLite-backed request queue; tracks are inserted into LMS "play next" without interrupting current playback
- **Duplicate prevention** — a track already pending/inserted/playing cannot be requested again
- **Admin controls** — remove, reorder, or skip requests from the kiosk

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Database | SQLite (via `better-sqlite3`) |
| Music search | Spotify Web API (Client Credentials) |
| Music server | Lyrion Music Server JSON-RPC |
| QR code | `qrcode` npm package |

## Prerequisites

- Node.js ≥ 18
- A running [Lyrion Music Server](https://lyrion.org/) instance on your LAN
- A [Spotify Developer](https://developer.spotify.com/dashboard) app (for Client ID & Secret)
- The MAC address / player ID of the LMS player you want to control

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/drfletcher2k/lyrion-jukebox.git
cd lyrion-jukebox
```

### 2. Configure environment variables

**Server:**

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the backend runs on (default `3001`) |
| `LMS_HOST` | IP or hostname of your LMS instance |
| `LMS_PORT` | LMS HTTP port (default `9000`) |
| `LMS_PLAYER_ID` | Player MAC address, e.g. `aa:bb:cc:dd:ee:ff`. Find it in LMS → Settings → Player. |
| `SPOTIFY_CLIENT_ID` | From your Spotify Developer app |
| `SPOTIFY_CLIENT_SECRET` | From your Spotify Developer app |
| `PUBLIC_BASE_URL` | The URL guests use to reach the frontend, e.g. `http://192.168.1.10:3200` |
| `DB_PATH` | Path for the SQLite file (default `./data/jukebox.db`) |
| `POLLING_INTERVAL_MS` | How often (ms) the worker polls LMS (default `5000`) |

**Client:**

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL of the backend server, e.g. `http://192.168.1.10:3001` |

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run (development)

In two separate terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

### 5. Build & run (production)

```bash
cd client && npm run build
cd ../server && npm start
```

The Express server will serve the built client from `../client/dist` on `http://<your-host>:<PORT>`.

## Usage

| URL | Description |
|---|---|
| `http://<host>:<PORT>/kiosk` | Tablet/kiosk display |
| `http://<host>:<PORT>/guest` | Phone guest UI (also shown as QR code on kiosk) |
| `http://<host>:<PORT>/api/health` | Health check |

## LMS notes

- Tracks are inserted using the Spotify URI format `spotify:track:<id>` via the LMS `playlist insert` command.
- Lyrion Music Server must have a Spotify plugin installed and configured for this to work (e.g. [Spotty](https://github.com/michaelherger/Spotty)).

## Test script

```bash
cd server && npm run test:lms
```

Runs a connectivity test against your configured LMS instance.
